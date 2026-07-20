using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;
using RMS_APIServer.Services;

namespace RMS_APIServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayOSController : ControllerBase
    {
        private readonly IPayOSService _payOSService;
        private readonly DBContext _context;
        private readonly ILogger<PayOSController> _logger;

        public PayOSController(IPayOSService payOSService, DBContext context, ILogger<PayOSController> logger)
        {
            _payOSService = payOSService;
            _context = context;
            _logger = logger;
        }

        [HttpPost("create-payment")]
        public async Task<ActionResult> CreatePayment([FromBody] CreatePaymentRequest request)
        {
            try
            {
                var order = await _context.Orders.FindAsync(request.OrderId);
                if (order == null)
                    return NotFound(new { message = "Order not found" });

                var orderDetails = await _context.OrderDetails
                    .Include(od => od.Food)
                    .Where(od => od.OrderId == request.OrderId)
                    .ToListAsync();

                if (!orderDetails.Any())
                    return BadRequest(new { message = "Order has no items" });

                var items = orderDetails.Select(od => new PayOSItem
                {
                    Name = od.Food?.FoodName ?? "Món ăn",
                    Quantity = od.Quantity ?? 1,
                    Price = (int)(od.UnitPrice ?? 0)
                }).ToList();

                var totalAmount = (int)(order.Total ?? 0);
                if (totalAmount <= 0)
                {
                    totalAmount = orderDetails.Sum(od => (int)((od.UnitPrice ?? 0) * (od.Quantity ?? 1)));
                }
                if (totalAmount <= 0)
                {
                    return BadRequest(new { message = "Order total amount must be greater than 0" });
                }
                var orderCode = GenerateOrderCode();

                var description = $"DH {request.OrderId}";
                if (description.Length > 25) description = description.Substring(0, 25);

                var buyerEmail = request.BuyerEmail;
                if (string.IsNullOrEmpty(buyerEmail) || !buyerEmail.Contains("@"))
                {
                    buyerEmail = "guest@payos.vn";
                }

                var paymentRequest = new PayOSPaymentRequest
                {
                    OrderCode = orderCode,
                    Amount = totalAmount,
                    Description = description,
                    BuyerName = request.BuyerName,
                    BuyerPhone = request.BuyerPhone,
                    BuyerEmail = buyerEmail,
                    CancelUrl = request.CancelUrl ?? "https://payos.vn",
                    ReturnUrl = request.ReturnUrl ?? "https://payos.vn",
                    Items = items
                };

                var result = await _payOSService.CreatePaymentLink(paymentRequest);

                _logger.LogInformation("Created PayOS payment link for order {OrderId}, orderCode={OrderCode}, amount={Amount}",
                    request.OrderId, orderCode, totalAmount);

                return Ok(new
                {
                    checkoutUrl = result.CheckoutUrl,
                    qrCode = result.QrCode,
                    orderCode = orderCode,
                    paymentLinkId = result.PaymentLinkId,
                    amount = totalAmount,
                    status = result.Status
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating PayOS payment for order {OrderId}", request.OrderId);
                return StatusCode(500, new { message = "Error creating payment", error = ex.Message });
            }
        }

        [HttpGet("status/{orderCode}")]
        public async Task<ActionResult> GetPaymentStatus(long orderCode)
        {
            try
            {
                var result = await _payOSService.GetPaymentInfo(orderCode);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PayOS payment status for orderCode {OrderCode}", orderCode);
                return StatusCode(500, new { message = "Error getting payment status", error = ex.Message });
            }
        }

        [HttpPost("cancel/{orderCode}")]
        public async Task<ActionResult> CancelPayment(long orderCode, [FromBody] CancelPaymentRequest? request = null)
        {
            try
            {
                var result = await _payOSService.CancelPayment(orderCode, request?.Reason);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error canceling PayOS payment for orderCode {OrderCode}", orderCode);
                return StatusCode(500, new { message = "Error canceling payment", error = ex.Message });
            }
        }

        [HttpPost("webhook")]
        public async Task<ActionResult> Webhook([FromBody] PayOSWebhookData webhookData)
        {
            try
            {
                _logger.LogInformation("Received PayOS webhook: {Data}", System.Text.Json.JsonSerializer.Serialize(webhookData));

                if (!_payOSService.VerifyWebhookSignature(webhookData))
                {
                    _logger.LogWarning("Invalid PayOS webhook signature");
                    return Ok(new { code = "00", desc = "success" });
                }

                if (webhookData.Success && webhookData.Data != null)
                {
                    var data = webhookData.Data;
                    _logger.LogInformation("Payment success: orderCode={OrderCode}, amount={Amount}, description={Description}",
                        data.OrderCode, data.Amount, data.Description);

                    _logger.LogInformation("PayOS webhook processed successfully for orderCode={OrderCode}", data.OrderCode);
                }

                return Ok(new { code = "00", desc = "success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayOS webhook");
                return Ok(new { code = "00", desc = "success" });
            }
        }

        [HttpPost("confirm/{orderCode}")]
        public async Task<ActionResult> ConfirmPayment(long orderCode, [FromBody] ConfirmPaymentRequest request)
        {
            try
            {
                var paymentInfo = await _payOSService.GetPaymentInfo(orderCode);

                if (paymentInfo.Status == "PAID")
                {
                    var orderId = request.OrderId;
                    if (!string.IsNullOrEmpty(orderId))
                    {
                        var bill = await _context.Bills.FirstOrDefaultAsync(b => b.OrderId == orderId);
                        if (bill != null)
                        {
                            bill.Payment = "PayOS - Online";
                        }

                        var order = await _context.Orders.FindAsync(orderId);
                        if (order != null && order.Status != "Hoàn tất")
                        {
                            order.Status = "Hoàn tất";
                        }

                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Updated bill and order status for PayOS payment, order {OrderId}", orderId);
                    }

                    return Ok(new
                    {
                        success = true,
                        status = paymentInfo.Status,
                        message = "Payment confirmed successfully"
                    });
                }

                return Ok(new
                {
                    success = false,
                    status = paymentInfo.Status,
                    message = $"Payment not completed. Status: {paymentInfo.Status}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming PayOS payment for orderCode {OrderCode}", orderCode);
                return StatusCode(500, new { message = "Error confirming payment", error = ex.Message });
            }
        }

        private static long GenerateOrderCode()
        {
            return long.Parse(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()[^10..]);
        }
    }

    public class CreatePaymentRequest
    {
        public string OrderId { get; set; } = "";
        public string? BuyerName { get; set; }
        public string? BuyerPhone { get; set; }
        public string? BuyerEmail { get; set; }
        public string? CancelUrl { get; set; }
        public string? ReturnUrl { get; set; }
    }

    public class CancelPaymentRequest
    {
        public string? Reason { get; set; }
    }

    public class ConfirmPaymentRequest
    {
        public string? OrderId { get; set; }
    }
}
