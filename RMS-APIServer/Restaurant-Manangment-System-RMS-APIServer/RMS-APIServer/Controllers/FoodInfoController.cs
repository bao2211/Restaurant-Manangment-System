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
        public async Task<ActionResult<IEnumerable<object>>> GetFoodInfos()
        {
            var foodInfos = await _context.FoodInfos.Include(f => f.Cate).ToListAsync();

            // Return clean data without circular references
            var result = foodInfos.Select(f => new
            {
                foodId = f.FoodId,
                foodName = f.FoodName,
                unitPrice = f.UnitPrice,
                description = f.Description,
                cateId = f.CateId,
                foodImage = f.FoodImage,
                categoryName = f.Cate?.CateName
            }).ToList();

            return Ok(result);
        }

        // GET: api/FoodInfo/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetFoodInfo(string id)
        {
            var foodInfo = await _context.FoodInfos
                .Include(f => f.Cate)
                .FirstOrDefaultAsync(f => f.FoodId == id);

            if (foodInfo == null)
            {
                return NotFound();
            }

            // Return clean data without circular references
            var result = new
            {
                foodId = foodInfo.FoodId,
                foodName = foodInfo.FoodName,
                unitPrice = foodInfo.UnitPrice,
                description = foodInfo.Description,
                cateId = foodInfo.CateId,
                foodImage = foodInfo.FoodImage,
                categoryName = foodInfo.Cate?.CateName
            };

            return Ok(result);
        }

        // GET: api/FoodInfo/category/5
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetFoodInfosByCategory(string categoryId)
        {
            var foodInfos = await _context.FoodInfos
                .Include(f => f.Cate)
                .Where(f => f.CateId == categoryId)
                .ToListAsync();

            // Return clean data without circular references
            var result = foodInfos.Select(f => new
            {
                foodId = f.FoodId,
                foodName = f.FoodName,
                unitPrice = f.UnitPrice,
                description = f.Description,
                cateId = f.CateId,
                foodImage = f.FoodImage,
                categoryName = f.Cate?.CateName
            }).ToList();

            return Ok(result);
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

            try
            {
                // Check if the food item is used in any orders
                var orderDetails = await _context.OrderDetails.Where(od => od.FoodId == id).ToListAsync();
                if (orderDetails.Any())
                {
                    return Conflict(new
                    {
                        message = "Cannot delete food item. It is being used in existing orders.",
                        details = $"Food item is referenced in {orderDetails.Count} order(s)."
                    });
                }

                // Check if the food item has any recipes
                var recipes = await _context.Recipes.Where(r => r.FoodId == id).ToListAsync();
                if (recipes.Any())
                {
                    return Conflict(new
                    {
                        message = "Cannot delete food item. It has associated recipes.",
                        details = $"Food item has {recipes.Count} recipe(s). Please delete the recipes first."
                    });
                }

                // If no constraints, proceed with deletion
                _context.FoodInfos.Remove(foodInfo);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Food item deleted successfully.",
                    deletedItem = new
                    {
                        foodId = foodInfo.FoodId,
                        foodName = foodInfo.FoodName,
                        deletedAt = DateTime.Now
                    }
                });
            }
            catch (DbUpdateException ex)
            {
                // Handle any other database constraints
                return Conflict(new
                {
                    message = "Cannot delete food item due to database constraints.",
                    details = ex.InnerException?.Message ?? ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "An error occurred while deleting the food item.",
                    details = ex.Message
                });
            }
        }

        private bool FoodInfoExists(string id)
        {
            return _context.FoodInfos.Any(e => e.FoodId == id);
        }
    }
}
