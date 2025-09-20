using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecipeDetailController : ControllerBase
    {
        private readonly DBContext _context;

        public RecipeDetailController(DBContext context)
        {
            _context = context;
        }

        // GET: api/RecipeDetail
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRecipeDetails()
        {
            var recipeDetails = await _context.RecipeDetails
                .Include(rd => rd.Recipe)
                .Include(rd => rd.Ingre)
                .ToListAsync();

            // Return clean data without circular references
            var result = recipeDetails.Select(rd => new
            {
                recipeId = rd.RecipeId,
                ingredientId = rd.IngreId,
                ingredientName = rd.Ingre?.IngreName,
                quantity = rd.Quantity,
                unitMeasurement = rd.UnitMeasurement
            }).ToList();

            return Ok(result);
        }

        // GET: api/RecipeDetail/recipe/5
        [HttpGet("recipe/{recipeId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecipeDetailsByRecipe(string recipeId)
        {
            var recipeDetails = await _context.RecipeDetails
                .Include(rd => rd.Recipe)
                .Include(rd => rd.Ingre)
                .Where(rd => rd.RecipeId == recipeId)
                .ToListAsync();

            // Return clean data without circular references
            var result = recipeDetails.Select(rd => new
            {
                recipeId = rd.RecipeId,
                ingredientId = rd.IngreId,
                ingredientName = rd.Ingre?.IngreName,
                quantity = rd.Quantity,
                unitMeasurement = rd.UnitMeasurement
            }).ToList();

            return Ok(result);
        }

        // GET: api/RecipeDetail/5/5
        [HttpGet("{recipeId}/{ingredientId}")]
        public async Task<ActionResult<object>> GetRecipeDetail(string recipeId, string ingredientId)
        {
            var recipeDetail = await _context.RecipeDetails
                .Include(rd => rd.Recipe)
                .Include(rd => rd.Ingre)
                .FirstOrDefaultAsync(rd => rd.RecipeId == recipeId && rd.IngreId == ingredientId);

            if (recipeDetail == null)
            {
                return NotFound();
            }

            // Return clean data without circular references
            var result = new
            {
                recipeId = recipeDetail.RecipeId,
                ingredientId = recipeDetail.IngreId,
                ingredientName = recipeDetail.Ingre?.IngreName,
                quantity = recipeDetail.Quantity,
                unitMeasurement = recipeDetail.UnitMeasurement
            };

            return Ok(result);
        }

        // PUT: api/RecipeDetail/5/5
        [HttpPut("{recipeId}/{ingredientId}")]
        public async Task<IActionResult> PutRecipeDetail(string recipeId, string ingredientId, RecipeDetail recipeDetail)
        {
            if (recipeId != recipeDetail.RecipeId || ingredientId != recipeDetail.IngreId)
            {
                return BadRequest();
            }

            _context.Entry(recipeDetail).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RecipeDetailExists(recipeId, ingredientId))
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

        // POST: api/RecipeDetail
        [HttpPost]
        public async Task<ActionResult<RecipeDetail>> PostRecipeDetail(RecipeDetail recipeDetail)
        {
            _context.RecipeDetails.Add(recipeDetail);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RecipeDetailExists(recipeDetail.RecipeId, recipeDetail.IngreId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetRecipeDetail", new { recipeId = recipeDetail.RecipeId, ingredientId = recipeDetail.IngreId }, recipeDetail);
        }

        // DELETE: api/RecipeDetail/5/5
        [HttpDelete("{recipeId}/{ingredientId}")]
        public async Task<IActionResult> DeleteRecipeDetail(string recipeId, string ingredientId)
        {
            var recipeDetail = await _context.RecipeDetails.FindAsync(recipeId, ingredientId);
            if (recipeDetail == null)
            {
                return NotFound();
            }

            _context.RecipeDetails.Remove(recipeDetail);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RecipeDetailExists(string recipeId, string ingredientId)
        {
            return _context.RecipeDetails.Any(e => e.RecipeId == recipeId && e.IngreId == ingredientId);
        }
    }
}
