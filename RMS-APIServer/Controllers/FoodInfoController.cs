using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FoodInfoController : ControllerBase
    {
        private readonly DBContext _context;

        public FoodInfoController(DBContext context)
        {
            _context = context;
        }

        // GET: api/FoodInfo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FoodInfo>>> GetFoodInfos()
        {
            return await _context.FoodInfos.Include(f => f.Cate).ToListAsync();
        }

        // GET: api/FoodInfo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FoodInfo>> GetFoodInfo(string id)
        {
            var foodInfo = await _context.FoodInfos
                .Include(f => f.Cate)
                .FirstOrDefaultAsync(f => f.FoodId == id);

            if (foodInfo == null)
            {
                return NotFound();
            }

            return foodInfo;
        }

        // GET: api/FoodInfo/category/5
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<FoodInfo>>> GetFoodInfosByCategory(string categoryId)
        {
            return await _context.FoodInfos
                .Include(f => f.Cate)
                .Where(f => f.CateId == categoryId)
                .ToListAsync();
        }

        // PUT: api/FoodInfo/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutFoodInfo(string id, FoodInfo foodInfo)
        {
            if (id != foodInfo.FoodId)
            {
                return BadRequest();
            }

            _context.Entry(foodInfo).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FoodInfoExists(id))
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

        // POST: api/FoodInfo
        [HttpPost]
        public async Task<ActionResult<FoodInfo>> PostFoodInfo(FoodInfo foodInfo)
        {
            _context.FoodInfos.Add(foodInfo);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (FoodInfoExists(foodInfo.FoodId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetFoodInfo", new { id = foodInfo.FoodId }, foodInfo);
        }

        // DELETE: api/FoodInfo/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFoodInfo(string id)
        {
            var foodInfo = await _context.FoodInfos.FindAsync(id);
            if (foodInfo == null)
            {
                return NotFound();
            }

            _context.FoodInfos.Remove(foodInfo);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FoodInfoExists(string id)
        {
            return _context.FoodInfos.Any(e => e.FoodId == id);
        }
    }
}
