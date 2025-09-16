using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IngredientController : ControllerBase
    {
        private readonly DBContext _context;

        public IngredientController(DBContext context)
        {
            _context = context;
        }

        // GET: api/Ingredient
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ingredient>>> GetIngredients()
        {
            return await _context.Ingredients.ToListAsync();
        }

        // GET: api/Ingredient/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Ingredient>> GetIngredient(string id)
        {
            var ingredient = await _context.Ingredients.FindAsync(id);

            if (ingredient == null)
            {
                return NotFound();
            }

            return ingredient;
        }

        // GET: api/Ingredient/lowstock/100
        [HttpGet("lowstock/{threshold}")]
        public async Task<ActionResult<IEnumerable<Ingredient>>> GetLowStockIngredients(long threshold)
        {
            return await _context.Ingredients
                .Where(i => i.Stock <= threshold)
                .ToListAsync();
        }

        // PUT: api/Ingredient/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutIngredient(string id, Ingredient ingredient)
        {
            if (id != ingredient.IngreId)
            {
                return BadRequest();
            }

            _context.Entry(ingredient).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!IngredientExists(id))
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

        // PUT: api/Ingredient/5/stock/100
        [HttpPut("{id}/stock/{quantity}")]
        public async Task<IActionResult> UpdateStock(string id, long quantity)
        {
            var ingredient = await _context.Ingredients.FindAsync(id);
            if (ingredient == null)
            {
                return NotFound();
            }

            ingredient.Stock = quantity;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/Ingredient
        [HttpPost]
        public async Task<ActionResult<Ingredient>> PostIngredient(Ingredient ingredient)
        {
            _context.Ingredients.Add(ingredient);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (IngredientExists(ingredient.IngreId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetIngredient", new { id = ingredient.IngreId }, ingredient);
        }

        // DELETE: api/Ingredient/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIngredient(string id)
        {
            var ingredient = await _context.Ingredients.FindAsync(id);
            if (ingredient == null)
            {
                return NotFound();
            }

            _context.Ingredients.Remove(ingredient);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool IngredientExists(string id)
        {
            return _context.Ingredients.Any(e => e.IngreId == id);
        }
    }
}
