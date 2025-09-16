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
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetails()
        {
            return await _context.OrderDetails
                .Include(od => od.Food)
                .Include(od => od.Order)
                .ToListAsync();
        }

        // GET: api/OrderDetail/order/5
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<OrderDetail>>> GetOrderDetailsByOrder(string orderId)
        {
            return await _context.OrderDetails
                .Include(od => od.Food)
                .Include(od => od.Order)
                .Where(od => od.OrderId == orderId)
                .ToListAsync();
        }

        // GET: api/OrderDetail/food/5/order/10
        [HttpGet("food/{foodId}/order/{orderId}")]
        public async Task<ActionResult<OrderDetail>> GetOrderDetail(string foodId, string orderId)
        {
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Food)
                .Include(od => od.Order)
                .FirstOrDefaultAsync(od => od.FoodId == foodId && od.OrderId == orderId);

            if (orderDetail == null)
            {
                return NotFound();
            }

            return orderDetail;
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

            return CreatedAtAction("GetOrderDetail", new { foodId = orderDetail.FoodId, orderId = orderDetail.OrderId }, orderDetail);
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

            _context.OrderDetails.Remove(orderDetail);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderDetailExists(string foodId, string orderId)
        {
            return _context.OrderDetails.Any(e => e.FoodId == foodId && e.OrderId == orderId);
        }
    }
}
