using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly DBContext _context;

        public OrderController(DBContext context)
        {
            _context = context;
        }

        // GET: api/Order
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
        {
            var ordersRaw = await _context.Orders
                .Include(o => o.OrderDetails)
                .Select(o => new
                {
                    OrderId = o.OrderId,
                    TableId = o.TableId,
                    UserId = o.UserId,
                    CreatedTime = o.CreatedTime,
                    Status = o.Status,
                    OrderDetails = o.OrderDetails.Select(od => new
                    {
                        FoodId = od.FoodId,
                        Quantity = od.Quantity
                    }).ToList()
                })
                .ToListAsync();

            var orders = ordersRaw.Select(o => new OrderDto
            {
                Id = int.TryParse(o.OrderId, out var oid) ? oid : 0,
                TableId = int.TryParse(o.TableId, out var tid) ? tid : 0,
                UserId = int.TryParse(o.UserId, out var uid) ? uid : 0,
                OrderDate = o.CreatedTime ?? DateTime.MinValue,
                Status = o.Status ?? string.Empty,
                OrderDetails = o.OrderDetails.Select(od => new OrderDetailDto
                {
                    FoodId = int.TryParse(od.FoodId, out var fid) ? fid : 0,
                    Quantity = od.Quantity ?? 0
                }).ToList()
            }).ToList();
            return orders;
        }

        // GET: api/Order/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(string id)
        {
            var order = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Food)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // GET: api/Order/table/5
        [HttpGet("table/{tableId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByTable(string tableId)
        {
            return await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Food)
                .Where(o => o.TableId == tableId)
                .ToListAsync();
        }

        // GET: api/Order/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByUser(string userId)
        {
            return await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Food)
                .Where(o => o.UserId == userId)
                .ToListAsync();
        }

        // GET: api/Order/status/pending
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrdersByStatus(string status)
        {
            return await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Food)
                .Where(o => o.Status == status)
                .ToListAsync();
        }

        // PUT: api/Order/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutOrder(string id, Order order)
        {
            if (id != order.OrderId)
            {
                return BadRequest();
            }

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OrderExists(id))
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

        // POST: api/Order
        [HttpPost]
        public async Task<ActionResult<Order>> PostOrder(Order order)
        {
            order.CreatedTime = DateTime.Now;
            _context.Orders.Add(order);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (OrderExists(order.OrderId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetOrder", new { id = order.OrderId }, order);
        }

        // DELETE: api/Order/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(string id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool OrderExists(string id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}
