using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderDetailController : ControllerBase
    {
        private readonly DBContext _context;

        public OrderDetailController(DBContext context)
        {
            _context = context;
        }

        // GET: api/OrderDetail
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetOrderDetails()
        {
            var orderDetails = await _context.OrderDetails
                .Include(od => od.Food)
                .Include(od => od.Order)
                .ToListAsync();

            // Return clean data without circular references
            var result = orderDetails.Select(od => new
            {
                foodId = od.FoodId,
                foodName = od.Food?.FoodName,
                orderId = od.OrderId,
                quantity = od.Quantity,
                unitPrice = od.UnitPrice ?? od.Food?.UnitPrice,
                status = od.Status
            }).ToList();

            return Ok(result);
        }

        // GET: api/OrderDetail/order/5
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetOrderDetailsByOrder(string orderId)
        {
            var orderDetails = await _context.OrderDetails
                .Include(od => od.Food)
                .Include(od => od.Order)
                .Where(od => od.OrderId == orderId)
                .ToListAsync();

            // Return clean data without circular references
            var result = orderDetails.Select(od => new
            {
                foodId = od.FoodId,
                foodName = od.Food?.FoodName,
                orderId = od.OrderId,
                quantity = od.Quantity,
                unitPrice = od.UnitPrice ?? od.Food?.UnitPrice,
                status = od.Status
            }).ToList();

            return Ok(result);
        }

        // GET: api/OrderDetail/food/5/order/10
        [HttpGet("food/{foodId}/order/{orderId}")]
        public async Task<ActionResult<object>> GetOrderDetail(string foodId, string orderId)
        {
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Food)
                .Include(od => od.Order)
                .FirstOrDefaultAsync(od => od.FoodId == foodId && od.OrderId == orderId);

            if (orderDetail == null)
            {
                return NotFound();
            }

            // Return clean data without circular references
            var result = new
            {
                foodId = orderDetail.FoodId,
                foodName = orderDetail.Food?.FoodName,
                orderId = orderDetail.OrderId,
                quantity = orderDetail.Quantity,
                unitPrice = orderDetail.UnitPrice ?? orderDetail.Food?.UnitPrice,
                status = orderDetail.Status
            };

            return Ok(result);
        }

        // PUT: api/OrderDetail/food/5/order/10
        [HttpPut("food/{foodId}/order/{orderId}")]
        public async Task<IActionResult> PutOrderDetail(string foodId, string orderId, OrderDetail orderDetail)
        {
            if (foodId != orderDetail.FoodId || orderId != orderDetail.OrderId)
            {
                return BadRequest();
            }

            _context.Entry(orderDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderDetailExists(foodId, orderId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/OrderDetail
        [HttpPost]
        public async Task<ActionResult<OrderDetail>> PostOrderDetail(OrderDetail orderDetail)
        {
            _context.OrderDetails.Add(orderDetail);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (OrderDetailExists(orderDetail.FoodId, orderDetail.OrderId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            await _context.Entry(orderDetail).Reference(od => od.Food).LoadAsync();

            var createdResult = new
            {
                foodId = orderDetail.FoodId,
                foodName = orderDetail.Food?.FoodName,
                orderId = orderDetail.OrderId,
                quantity = orderDetail.Quantity,
                unitPrice = orderDetail.UnitPrice,
                status = orderDetail.Status
            };

            return CreatedAtAction("GetOrderDetail", new { foodId = orderDetail.FoodId, orderId = orderDetail.OrderId }, createdResult);
        }

        // DELETE: api/OrderDetail/food/5/order/10
        [HttpDelete("food/{foodId}/order/{orderId}")]
        public async Task<IActionResult> DeleteOrderDetail(string foodId, string orderId)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(foodId, orderId);
            if (orderDetail == null)
            {
                return NotFound();
            }

            // Store order detail info before deletion for response
            var deletedOrderDetailInfo = new
            {
                foodId = orderDetail.FoodId,
                orderId = orderDetail.OrderId,
                unitPrice = orderDetail.UnitPrice,
                status = orderDetail.Status,
                quantity = orderDetail.Quantity
            };

            _context.OrderDetails.Remove(orderDetail);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Order detail deleted successfully.",
                deletedOrderDetail = deletedOrderDetailInfo,
                deletedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC")
            });
        }

        private bool OrderDetailExists(string foodId, string orderId)
        {
            return _context.OrderDetails.Any(e => e.FoodId == foodId && e.OrderId == orderId);
        }
    }
}
