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
        public async Task<ActionResult<IEnumerable<RecipeDetail>>> GetRecipeDetails()
        {
            return await _context.RecipeDetails
                .Include(rd => rd.Recipe)
                .Include(rd => rd.Ingre)
                .ToListAsync();
        }

        // GET: api/RecipeDetail/recipe/5
        [HttpGet("recipe/{recipeId}")]
        public async Task<ActionResult<IEnumerable<RecipeDetail>>> GetRecipeDetailsByRecipe(string recipeId)
        {
            return await _context.RecipeDetails
                .Include(rd => rd.Recipe)
                .Include(rd => rd.Ingre)
                .Where(rd => rd.RecipeId == recipeId)
                .ToListAsync();
        }

        // GET: api/RecipeDetail/recipe/5/ingredient/10
        [HttpGet("recipe/{recipeId}/ingredient/{ingredientId}")]
        public async Task<ActionResult<RecipeDetail>> GetRecipeDetail(string recipeId, string ingredientId)
        {
            var recipeDetail = await _context.RecipeDetails
                .Include(rd => rd.Recipe)
                .Include(rd => rd.Ingre)
                .FirstOrDefaultAsync(rd => rd.RecipeId == recipeId && rd.IngreId == ingredientId);

            if (recipeDetail == null)
            {
                return NotFound();
            }

            return recipeDetail;
        }

        // PUT: api/RecipeDetail/recipe/5/ingredient/10
        [HttpPut("recipe/{recipeId}/ingredient/{ingredientId}")]
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

        // DELETE: api/RecipeDetail/recipe/5/ingredient/10
        [HttpDelete("recipe/{recipeId}/ingredient/{ingredientId}")]
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
