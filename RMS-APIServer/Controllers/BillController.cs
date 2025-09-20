using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillController : ControllerBase
    {
        private readonly DBContext _context;

        public BillController(DBContext context)
        {
            _context = context;
        }

        // GET: api/Bill
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBills()
        {
            var bills = await _context.Bills
                .Include(b => b.Order)
                .Include(b => b.User)
                .ToListAsync();

            // Return clean data without circular references
            var result = bills.Select(bill => new
            {
                billId = bill.BillId,
                orderId = bill.OrderId,
                userId = bill.UserId,
                userName = bill.User?.UserName,
                total = bill.Total,
                discount = bill.Discount,
                totalFinal = bill.TotalFinal,
                payment = bill.Payment,
                createdTime = bill.CreatedTime
            }).ToList();

            return Ok(result);
        }

        // GET: api/Bill/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetBill(string id)
        {
            var bill = await _context.Bills
                .Include(b => b.Order)
                .Include(b => b.User)
                .Include(b => b.BillDetails)
                .FirstOrDefaultAsync(b => b.BillId == id);

            if (bill == null)
            {
                return NotFound();
            }

            // Return clean data without circular references
            var result = new
            {
                billId = bill.BillId,
                orderId = bill.OrderId,
                userId = bill.UserId,
                userName = bill.User?.UserName,
                total = bill.Total,
                discount = bill.Discount,
                totalFinal = bill.TotalFinal,
                payment = bill.Payment,
                createdTime = bill.CreatedTime,
                billDetails = bill.BillDetails?.Select(bd => new
                {
                    billId = bd.BillId,
                    orderId = bd.OrderId,
                    quantity = bd.Quantity,
                    unitPrice = bd.UnitPrice
                }).ToList()
            };

            return Ok(result);
        }

        // GET: api/Bill/order/5
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBillsByOrder(string orderId)
        {
            var bills = await _context.Bills
                .Include(b => b.Order)
                .Include(b => b.User)
                .Where(b => b.OrderId == orderId)
                .ToListAsync();

            // Return clean data without circular references
            var result = bills.Select(bill => new
            {
                billId = bill.BillId,
                orderId = bill.OrderId,
                userId = bill.UserId,
                userName = bill.User?.UserName,
                total = bill.Total,
                discount = bill.Discount,
                totalFinal = bill.TotalFinal,
                payment = bill.Payment,
                createdTime = bill.CreatedTime
            }).ToList();

            return Ok(result);
        }

        // GET: api/Bill/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBillsByUser(string userId)
        {
            var bills = await _context.Bills
                .Include(b => b.Order)
                .Include(b => b.User)
                .Where(b => b.UserId == userId)
                .ToListAsync();

            // Return clean data without circular references
            var result = bills.Select(bill => new
            {
                billId = bill.BillId,
                orderId = bill.OrderId,
                userId = bill.UserId,
                userName = bill.User?.UserName,
                total = bill.Total,
                discount = bill.Discount,
                totalFinal = bill.TotalFinal,
                payment = bill.Payment,
                createdTime = bill.CreatedTime
            }).ToList();

            return Ok(result);
        }

        // GET: api/Bill/date/2025-09-10
        [HttpGet("date/{date}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBillsByDate(DateTime date)
        {
            var bills = await _context.Bills
                .Include(b => b.Order)
                .Include(b => b.User)
                .Where(b => b.CreatedTime.HasValue && b.CreatedTime.Value.Date == date.Date)
                .ToListAsync();

            // Return clean data without circular references
            var result = bills.Select(bill => new
            {
                billId = bill.BillId,
                orderId = bill.OrderId,
                userId = bill.UserId,
                userName = bill.User?.UserName,
                total = bill.Total,
                discount = bill.Discount,
                totalFinal = bill.TotalFinal,
                payment = bill.Payment,
                createdTime = bill.CreatedTime
            }).ToList();

            return Ok(result);
        }

        // PUT: api/Bill/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBill(string id, Bill bill)
        {
            if (id != bill.BillId)
            {
                return BadRequest();
            }

            _context.Entry(bill).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BillExists(id))
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

        // POST: api/Bill
        [HttpPost]
        public async Task<ActionResult<Bill>> PostBill(Bill bill)
        {
            bill.CreatedTime = DateTime.Now;
            _context.Bills.Add(bill);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (BillExists(bill.BillId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetBill", new { id = bill.BillId }, bill);
        }

        // DELETE: api/Bill/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBill(string id)
        {
            var bill = await _context.Bills.FindAsync(id);
            if (bill == null)
            {
                return NotFound();
            }

            _context.Bills.Remove(bill);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BillExists(string id)
        {
            return _context.Bills.Any(e => e.BillId == id);
        }
    }
}
