using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly DBContext _context;

        public CategoryController(DBContext context)
        {
            _context = context;
        }

        // GET: api/Category
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        // GET: api/Category/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetCategory(string id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            return category;
        }

        // PUT: api/Category/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategory(string id, Category category)
        {
            if (id != category.CateId)
            {
                return BadRequest();
            }

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
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

        // POST: api/Category
        [HttpPost]
        public async Task<ActionResult<Category>> PostCategory(Category category)
        {
            _context.Categories.Add(category);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (CategoryExists(category.CateId))
                {
                    return Conflict();
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtAction("GetCategory", new { id = category.CateId }, category);
        }

        // DELETE: api/Category/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(string id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            try
            {
                // Check if the category is used by any food items
                var foodItems = await _context.FoodInfos.Where(f => f.CateId == id).ToListAsync();
                if (foodItems.Any())
                {
                    return Conflict(new
                    {
                        message = "Cannot delete category. It is being used by existing food items.",
                        details = $"Category is used by {foodItems.Count} food item(s). Please move or delete these food items first.",
                        foodItems = foodItems.Select(f => new { f.FoodId, f.FoodName }).ToList()
                    });
                }

                // Store category info before deletion for response
                var deletedCategoryInfo = new
                {
                    cateId = category.CateId,
                    cateName = category.CateName
                };

                // If no constraints, proceed with deletion
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Category deleted successfully.",
                    deletedCategory = deletedCategoryInfo,
                    deletedAt = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC")
                });
            }
            catch (DbUpdateException ex)
            {
                // Handle any other database constraints
                return Conflict(new
                {
                    message = "Cannot delete category due to database constraints.",
                    details = ex.InnerException?.Message ?? ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while deleting the category.",
                    details = ex.Message
                });
            }
        }

        private bool CategoryExists(string id)
        {
            return _context.Categories.Any(e => e.CateId == id);
        }
    }
}
