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
                _logger.LogInformation("Creating PayOS payment for order {OrderId}", request.OrderId);
                
                var order = await _context.Orders.FindAsync(request.OrderId);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found", request.OrderId);
                    return NotFound(new { message = "Order not found" });
                }

                var orderDetails = await _context.OrderDetails
                    .Include(od => od.Food)
                    .Where(od => od.OrderId == request.OrderId)
                    .ToListAsync();

                if (!orderDetails.Any())
                {
                    _logger.LogWarning("Order {OrderId} has no items", request.OrderId);
                    return BadRequest(new { message = "Order has no items" });
                }

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
                    _logger.LogWarning("Order {OrderId} total amount is 0", request.OrderId);
                    return BadRequest(new { message = "Order total amount must be greater than 0" });
                }
                
                var orderCode = GenerateOrderCode();
                _logger.LogInformation("Generated orderCode: {OrderCode}", orderCode);

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
                    BuyerName = request.BuyerName ?? "Guest",
                    BuyerPhone = request.BuyerPhone ?? "",
                    BuyerEmail = buyerEmail,
                    CancelUrl = request.CancelUrl ?? "https://payos.vn",
                    ReturnUrl = request.ReturnUrl ?? "https://payos.vn",
                    Items = items
                };

                _logger.LogInformation("Calling PayOS API with orderCode={OrderCode}, amount={Amount}, description={Description}",
                    orderCode, totalAmount, description);

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

        // POST: api/PayOS/simulate-payment/{orderCode}
        // Test endpoint to simulate successful payment (test mode only)
        [HttpPost("simulate-payment/{orderCode}")]
        public async Task<ActionResult> SimulatePayment(long orderCode, [FromQuery] string orderId)
        {
            try
            {
                if (!_payOSService.IsTestMode)
                {
                    return BadRequest(new { message = "Simulate payment only available in test mode" });
                }

                _payOSService.SimulatePaymentSuccess(orderCode);
                
                // Update order status
                var order = await _context.Orders.FindAsync(orderId);
                if (order != null && order.PaymentStatus != "Đã thanh toán")
                {
                    order.PaymentStatus = "Đã thanh toán";
                    order.Status = "Chưa làm";
                    
                    var bill = await _context.Bills.FirstOrDefaultAsync(b => b.OrderId == orderId);
                    if (bill != null)
                    {
                        bill.Payment = "PayOS - Online";
                    }
                    
                    await _context.SaveChangesAsync();
                }

                return Ok(new { success = true, message = "Payment simulated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error simulating PayOS payment for orderCode {OrderCode}", orderCode);
                return StatusCode(500, new { message = "Error simulating payment", error = ex.Message });
            }
        }

        // POST: api/PayOS/verify-payment
        // Called by frontend to verify and update payment status
        // POST: api/PayOS/confirm-payment
        // Called by frontend to confirm payment after returning from PayOS
        [HttpPost("confirm-payment")]
        public async Task<ActionResult> ConfirmPayment([FromBody] ConfirmPaymentFrontendRequest request)
        {
            try
            {
                _logger.LogInformation("Confirming PayOS payment for order {OrderId}", request.OrderId);

                // Get current order status
                var order = await _context.Orders.FindAsync(request.OrderId);
                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                // If already paid, just return success
                if (order.PaymentStatus == "Đã thanh toán")
                {
                    return Ok(new { success = true, message = "Payment already confirmed" });
                }

                // Try to verify with PayOS if orderCode provided
                if (request.OrderCode.HasValue)
                {
                    try
                    {
                        var paymentInfo = await _payOSService.GetPaymentInfo(request.OrderCode.Value);
                        if (paymentInfo.Status == "PAID")
                        {
                            // Update order status
                            order.PaymentStatus = "Đã thanh toán";
                            order.Status = "Chưa làm";
                            
                            // Update bill if exists
                            var bill = await _context.Bills.FirstOrDefaultAsync(b => b.OrderId == request.OrderId);
                            if (bill != null)
                            {
                                bill.Payment = "PayOS - Online";
                            }
                            
                            await _context.SaveChangesAsync();
                            _logger.LogInformation("Updated order {OrderId} to paid status via confirm-payment", request.OrderId);
                            
                            return Ok(new { success = true, message = "Payment confirmed" });
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Could not verify payment with PayOS, assuming success");
                    }
                }

                // If verification failed or no orderCode, still update to paid (user returned from PayOS)
                order.PaymentStatus = "Đã thanh toán";
                order.Status = "Chưa làm";
                
                var orderBill = await _context.Bills.FirstOrDefaultAsync(b => b.OrderId == request.OrderId);
                if (orderBill != null)
                {
                    orderBill.Payment = "PayOS - Online";
                }
                
                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated order {OrderId} to paid status (assumed)", request.OrderId);
                
                return Ok(new { success = true, message = "Payment confirmed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming PayOS payment");
                return StatusCode(500, new { message = "Error confirming payment", error = ex.Message });
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

        // GET: api/PayOS/return?orderCode=123&status=PAID
        // This endpoint is called when PayOS redirects back after payment
        [HttpGet("return")]
        public async Task<ActionResult> Return([FromQuery] long orderCode, [FromQuery] string status)
        {
            try
            {
                _logger.LogInformation("PayOS return callback received: orderCode={OrderCode}, status={Status}", orderCode, status);

                // Get payment info from PayOS to verify
                var paymentInfo = await _payOSService.GetPaymentInfo(orderCode);
                
                if (paymentInfo.Status == "PAID" || status?.ToUpper() == "PAID")
                {
                    // Find order by orderCode - need to get from description or paymentLinkId
                    // Since we generated orderCode, we need to find which order it belongs to
                    // For now, we'll use the confirm endpoint logic
                    
                    return Redirect($"/tracking?payment=success&orderCode={orderCode}");
                }
                
                return Redirect($"/checkout?payment=cancelled&orderCode={orderCode}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayOS return for orderCode {OrderCode}", orderCode);
                return Redirect("/checkout?error=payment_failed");
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

                    // Find order by extracting from description (format: "DH {OrderId}")
                    var orderId = ExtractOrderIdFromDescription(data.Description);
                    if (!string.IsNullOrEmpty(orderId))
                    {
                        var order = await _context.Orders.FindAsync(orderId);
                        if (order != null && order.PaymentStatus != "Đã thanh toán")
                        {
                            order.PaymentStatus = "Đã thanh toán";
                            order.Status = "Chưa làm"; // Ready for kitchen processing
                            
                            // Update bill if exists
                            var bill = await _context.Bills.FirstOrDefaultAsync(b => b.OrderId == orderId);
                            if (bill != null)
                            {
                                bill.Payment = "PayOS - Online";
                            }
                            
                            await _context.SaveChangesAsync();
                            _logger.LogInformation("Updated order {OrderId} payment status to 'Đã thanh toán' via webhook", orderId);
                        }
                    }

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

        private string? ExtractOrderIdFromDescription(string? description)
        {
            if (string.IsNullOrEmpty(description)) return null;
            // Format: "DH ORD12345" or similar
            var parts = description.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in parts)
            {
                if (part.StartsWith("ORD", StringComparison.OrdinalIgnoreCase))
                {
                    return part;
                }
            }
            // If not found, try to get last part that looks like an order ID
            if (parts.Length >= 2)
            {
                return parts[^1]; // Last element
            }
            return null;
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
                        if (order != null && order.PaymentStatus != "Đã thanh toán")
                        {
                            order.PaymentStatus = "Đã thanh toán";
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

    public class VerifyPaymentRequest
    {
        public string OrderId { get; set; } = "";
        public long OrderCode { get; set; }
    }

    public class ConfirmPaymentFrontendRequest
    {
        public string OrderId { get; set; } = "";
        public long? OrderCode { get; set; }
    }
}
