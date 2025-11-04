using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using RMS_APIServer.Services;
using System.Security.Claims;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderHistoryController : ControllerBase
    {
        private readonly IOrderHistoryService _orderHistoryService;

        public OrderHistoryController(IOrderHistoryService orderHistoryService)
        {
            _orderHistoryService = orderHistoryService;
        }

        private string GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst("userId")
                ?? User.FindFirst("sub");
            
            return userIdClaim?.Value ?? throw new UnauthorizedAccessException("User ID not found in token");
        }

        /// <summary>
        /// Get current user's order history with pagination
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetOrderHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var userId = GetCurrentUserId();
                var orderHistory = await _orderHistoryService.GetUserOrderHistoryAsync(userId, page, pageSize);
                
                var result = orderHistory.Select(oh => new
                {
                    historyId = oh.OrderHistoryId,
                    orderId = oh.OrderId,
                    createdTime = oh.CreatedTime,
                    status = oh.Status,
                    total = oh.Total,
                    note = oh.Note,
                    table = oh.Table != null ? new
                    {
                        tableId = oh.Table.TableId,
                        tableName = oh.Table.TableName,
                        numOfSeats = oh.Table.NumOfSeats
                    } : null,
                    order = oh.Order != null ? new
                    {
                        orderId = oh.Order.OrderId,
                        originalCreatedTime = oh.Order.CreatedTime,
                        items = oh.Order.OrderDetails?.Select(od => new
                        {
                            foodId = od.FoodId,
                            foodName = od.Food?.FoodName,
                            quantity = od.Quantity,
                            unitPrice = od.UnitPrice,
                            status = od.Status
                        })
                    } : null
                });

                return Ok(new
                {
                    page = page,
                    pageSize = pageSize,
                    data = result
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Get specific order history by ID
        /// </summary>
        [HttpGet("{historyId}")]
        public async Task<IActionResult> GetOrderHistoryById(string historyId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var orderHistory = await _orderHistoryService.GetOrderHistoryByIdAsync(historyId);
                
                if (orderHistory == null || orderHistory.UserId != userId)
                    return NotFound(new { message = "Order history not found" });

                var result = new
                {
                    historyId = orderHistory.OrderHistoryId,
                    orderId = orderHistory.OrderId,
                    createdTime = orderHistory.CreatedTime,
                    status = orderHistory.Status,
                    total = orderHistory.Total,
                    note = orderHistory.Note,
                    table = orderHistory.Table != null ? new
                    {
                        tableId = orderHistory.Table.TableId,
                        tableName = orderHistory.Table.TableName,
                        numOfSeats = orderHistory.Table.NumOfSeats
                    } : null,
                    order = orderHistory.Order != null ? new
                    {
                        orderId = orderHistory.Order.OrderId,
                        originalCreatedTime = orderHistory.Order.CreatedTime,
                        items = orderHistory.Order.OrderDetails?.Select(od => new
                        {
                            foodId = od.FoodId,
                            foodName = od.Food?.FoodName,
                            quantity = od.Quantity,
                            unitPrice = od.UnitPrice,
                            status = od.Status
                        })
                    } : null
                };

                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Create order history entry for completed order
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateOrderHistory([FromBody] CreateOrderHistoryRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.OrderId))
                    return BadRequest(new { message = "Order ID is required" });

                var userId = GetCurrentUserId();
                var success = await _orderHistoryService.CreateOrderHistoryAsync(userId, request.OrderId);
                
                if (!success)
                    return BadRequest(new { message = "Order not found or unable to create history entry" });

                return Ok(new { message = "Order history created successfully" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }

    public class CreateOrderHistoryRequest
    {
        public string OrderId { get; set; } = string.Empty;
    }
}