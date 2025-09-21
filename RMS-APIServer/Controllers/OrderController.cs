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
        public async Task<ActionResult<object>> GetOrder(string id)
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

            // Return clean data without circular references
            var result = new
            {
                orderId = order.OrderId,
                tableId = order.TableId,
                tableName = order.Table?.TableName,
                userId = order.UserId,
                userName = order.User?.UserName,
                createdTime = order.CreatedTime,
                status = order.Status,
                orderDetails = order.OrderDetails?.Select(od => new
                {
                    foodId = od.FoodId,
                    foodName = od.Food?.FoodName,
                    quantity = od.Quantity,
                    unitPrice = od.Food?.UnitPrice
                }).ToList()
            };

            return Ok(result);
        }

        // GET: api/Order/table/5
        [HttpGet("table/{tableId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetOrdersByTable(string tableId)
        {
            var orders = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Food)
                .Where(o => o.TableId == tableId)
                .ToListAsync();

            // Return clean data without circular references
            var result = orders.Select(order => new
            {
                orderId = order.OrderId,
                tableId = order.TableId,
                tableName = order.Table?.TableName,
                userId = order.UserId,
                userName = order.User?.UserName,
                createdTime = order.CreatedTime,
                status = order.Status,
                orderDetails = order.OrderDetails?.Select(od => new
                {
                    foodId = od.FoodId,
                    foodName = od.Food?.FoodName,
                    quantity = od.Quantity,
                    unitPrice = od.Food?.UnitPrice
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        // GET: api/Order/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetOrdersByUser(string userId)
        {
            var orders = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Food)
                .Where(o => o.UserId == userId)
                .ToListAsync();

            // Return clean data without circular references
            var result = orders.Select(order => new
            {
                orderId = order.OrderId,
                tableId = order.TableId,
                tableName = order.Table?.TableName,
                userId = order.UserId,
                userName = order.User?.UserName,
                createdTime = order.CreatedTime,
                status = order.Status,
                orderDetails = order.OrderDetails?.Select(od => new
                {
                    foodId = od.FoodId,
                    foodName = od.Food?.FoodName,
                    quantity = od.Quantity,
                    unitPrice = od.Food?.UnitPrice
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        // GET: api/Order/status/pending
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<object>>> GetOrdersByStatus(string status)
        {
            var orders = await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.User)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Food)
                .Where(o => o.Status == status)
                .ToListAsync();

            // Return clean data without circular references
            var result = orders.Select(order => new
            {
                orderId = order.OrderId,
                tableId = order.TableId,
                tableName = order.Table?.TableName,
                userId = order.UserId,
                userName = order.User?.UserName,
                createdTime = order.CreatedTime,
                status = order.Status,
                orderDetails = order.OrderDetails?.Select(od => new
                {
                    foodId = od.FoodId,
                    foodName = od.Food?.FoodName,
                    quantity = od.Quantity,
                    unitPrice = od.Food?.UnitPrice
                }).ToList()
            }).ToList();

            return Ok(result);
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

            // Store order info before deletion for response
            var deletedOrderInfo = new
            {
                orderId = order.OrderId,
                createdTime = order.CreatedTime,
                status = order.Status,
                total = order.Total,
                tableId = order.TableId
            };

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Order deleted successfully.",
                deletedOrder = deletedOrderInfo,
                deletedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC")
            });
        }

        private bool OrderExists(string id)
        {
            return _context.Orders.Any(e => e.OrderId == id);
        }
    }
}
