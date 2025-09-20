using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BillDetailController : ControllerBase
    {
        private readonly DBContext _context;

        public BillDetailController(DBContext context)
        {
            _context = context;
        }

        // GET: api/BillDetail
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetBillDetails()
        {
            var billDetails = await _context.BillDetails
                .Include(bd => bd.Bill)
                .Include(bd => bd.Order)
                .ToListAsync();

            // Return clean data without circular references
            var result = billDetails.Select(bd => new
            {
                billId = bd.BillId,
                orderId = bd.OrderId,
                quantity = bd.Quantity,
                unitPrice = bd.UnitPrice
            }).ToList();

            return Ok(result);
        }

        // GET: api/BillDetail/bill/5
        [HttpGet("bill/{billId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetBillDetailsByBill(string billId)
        {
            var billDetails = await _context.BillDetails
                .Include(bd => bd.Bill)
                .Include(bd => bd.Order)
                .Where(bd => bd.BillId == billId)
                .ToListAsync();

            // Return clean data without circular references
            var result = billDetails.Select(bd => new
            {
                billId = bd.BillId,
                orderId = bd.OrderId,
                quantity = bd.Quantity,
                unitPrice = bd.UnitPrice
            }).ToList();

            return Ok(result);
        }

        // GET: api/BillDetail/order/5/bill/10
        [HttpGet("order/{orderId}/bill/{billId}")]
        public async Task<ActionResult<object>> GetBillDetail(string orderId, string billId)
        {
            var billDetail = await _context.BillDetails
                .Include(bd => bd.Bill)
                .Include(bd => bd.Order)
                .FirstOrDefaultAsync(bd => bd.OrderId == orderId && bd.BillId == billId);

            if (billDetail == null)
            {
                return NotFound();
            }

            // Return clean data without circular references
            var result = new
            {
                billId = billDetail.BillId,
                orderId = billDetail.OrderId,
                quantity = billDetail.Quantity,
                unitPrice = billDetail.UnitPrice
            };

            return Ok(result);
        }

        // PUT: api/BillDetail/order/5/bill/10
        [HttpPut("order/{orderId}/bill/{billId}")]
        public async Task<IActionResult> PutBillDetail(string orderId, string billId, BillDetail billDetail)
        {
            if (orderId != billDetail.OrderId || billId != billDetail.BillId)
            {
                return BadRequest();
            }

            _context.Entry(billDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BillDetailExists(orderId, billId))
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

        // POST: api/BillDetail
        [HttpPost]
        public async Task<ActionResult<BillDetail>> PostBillDetail(BillDetail billDetail)
        {
            _context.BillDetails.Add(billDetail);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (BillDetailExists(billDetail.OrderId, billDetail.BillId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetBillDetail", new { orderId = billDetail.OrderId, billId = billDetail.BillId }, billDetail);
        }

        // DELETE: api/BillDetail/order/5/bill/10
        [HttpDelete("order/{orderId}/bill/{billId}")]
        public async Task<IActionResult> DeleteBillDetail(string orderId, string billId)
        {
            var billDetail = await _context.BillDetails.FindAsync(orderId, billId);
            if (billDetail == null)
            {
                return NotFound();
            }

            _context.BillDetails.Remove(billDetail);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BillDetailExists(string orderId, string billId)
        {
            return _context.BillDetails.Any(e => e.OrderId == orderId && e.BillId == billId);
        }
    }
}
