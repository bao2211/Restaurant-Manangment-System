using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecipeController : ControllerBase
    {
        private readonly DBContext _context;

        public RecipeController(DBContext context)
        {
            _context = context;
        }

        // GET: api/Recipe
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRecipes()
        {
            var recipes = await _context.Recipes
                .Include(r => r.Food)
                .Include(r => r.RecipeDetails)
                    .ThenInclude(rd => rd.Ingre)
                .ToListAsync();

            // Return clean data without circular references
            var result = recipes.Select(recipe => new
            {
                recipeId = recipe.RecipeId,
                foodId = recipe.FoodId,
                foodName = recipe.Food?.FoodName,
                recipeDescription = recipe.RecipeDescription,
                recipeDetails = recipe.RecipeDetails?.Select(rd => new
                {
                    ingredientId = rd.IngreId,
                    ingredientName = rd.Ingre?.IngreName,
                    quantity = rd.Quantity,
                    unitMeasurement = rd.UnitMeasurement
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        // GET: api/Recipe/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetRecipe(string id)
        {
            var recipe = await _context.Recipes
                .Include(r => r.Food)
                .Include(r => r.RecipeDetails)
                    .ThenInclude(rd => rd.Ingre)
                .FirstOrDefaultAsync(r => r.RecipeId == id);

            if (recipe == null)
            {
                return NotFound();
            }

            // Return clean data without circular references
            var result = new
            {
                recipeId = recipe.RecipeId,
                foodId = recipe.FoodId,
                foodName = recipe.Food?.FoodName,
                recipeDescription = recipe.RecipeDescription,
                recipeDetails = recipe.RecipeDetails?.Select(rd => new
                {
                    ingredientId = rd.IngreId,
                    ingredientName = rd.Ingre?.IngreName,
                    quantity = rd.Quantity,
                    unitMeasurement = rd.UnitMeasurement
                }).ToList()
            };

            return Ok(result);
        }

        // GET: api/Recipe/food/5
        [HttpGet("food/{foodId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecipesByFood(string foodId)
        {
            var recipes = await _context.Recipes
                .Include(r => r.Food)
                .Include(r => r.RecipeDetails)
                    .ThenInclude(rd => rd.Ingre)
                .Where(r => r.FoodId == foodId)
                .ToListAsync();

            // Return clean data without circular references
            var result = recipes.Select(recipe => new
            {
                recipeId = recipe.RecipeId,
                foodId = recipe.FoodId,
                foodName = recipe.Food?.FoodName,
                recipeDescription = recipe.RecipeDescription,
                recipeDetails = recipe.RecipeDetails?.Select(rd => new
                {
                    ingredientId = rd.IngreId,
                    ingredientName = rd.Ingre?.IngreName,
                    quantity = rd.Quantity,
                    unitMeasurement = rd.UnitMeasurement
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        // PUT: api/Recipe/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRecipe(string id, Recipe recipe)
        {
            if (id != recipe.RecipeId)
            {
                return BadRequest();
            }

            _context.Entry(recipe).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RecipeExists(id))
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

        // POST: api/Recipe
        [HttpPost]
        public async Task<ActionResult<Recipe>> PostRecipe(Recipe recipe)
        {
            _context.Recipes.Add(recipe);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (RecipeExists(recipe.RecipeId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetRecipe", new { id = recipe.RecipeId }, recipe);
        }

        // DELETE: api/Recipe/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRecipe(string id)
        {
            var recipe = await _context.Recipes.FindAsync(id);
            if (recipe == null)
            {
                return NotFound();
            }

            _context.Recipes.Remove(recipe);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool RecipeExists(string id)
        {
            return _context.Recipes.Any(e => e.RecipeId == id);
        }
    }
}
