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
        public async Task<ActionResult<IEnumerable<BillDetail>>> GetBillDetails()
        {
            return await _context.BillDetails
                .Include(bd => bd.Bill)
                .Include(bd => bd.Order)
                .ToListAsync();
        }

        // GET: api/BillDetail/bill/5
        [HttpGet("bill/{billId}")]
        public async Task<ActionResult<IEnumerable<BillDetail>>> GetBillDetailsByBill(string billId)
        {
            return await _context.BillDetails
                .Include(bd => bd.Bill)
                .Include(bd => bd.Order)
                .Where(bd => bd.BillId == billId)
                .ToListAsync();
        }

        // GET: api/BillDetail/order/5/bill/10
        [HttpGet("order/{orderId}/bill/{billId}")]
        public async Task<ActionResult<BillDetail>> GetBillDetail(string orderId, string billId)
        {
            var billDetail = await _context.BillDetails
                .Include(bd => bd.Bill)
                .Include(bd => bd.Order)
                .FirstOrDefaultAsync(bd => bd.OrderId == orderId && bd.BillId == billId);

            if (billDetail == null)
            {
                return NotFound();
            }

            return billDetail;
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
