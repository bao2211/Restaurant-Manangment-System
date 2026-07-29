using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserFavoriteController : ControllerBase
    {
        private readonly DBContext _context;

        public UserFavoriteController(DBContext context)
        {
            _context = context;
        }

        // GET: api/UserFavorite/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUserFavorites(string userId)
        {
            try
            {
                var favorites = await _context.UserFavorites
                    .Include(uf => uf.Food)
                    .Where(uf => uf.UserId == userId)
                    .Select(uf => new
                    {
                        userFavoriteId = uf.UserFavoriteId,
                        userId = uf.UserId,
                        foodId = uf.FoodId,
                        foodName = uf.Food != null ? uf.Food.FoodName : null,
                        foodImage = uf.Food != null ? uf.Food.FoodImage : null,
                        unitPrice = uf.Food != null ? uf.Food.UnitPrice : null,
                        createdTime = uf.CreatedTime
                    })
                    .ToListAsync();

                return Ok(favorites);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // POST: api/UserFavorite
        [HttpPost]
        public async Task<ActionResult<UserFavorite>> PostUserFavorite(CreateUserFavoriteDto favoriteDto)
        {
            try
            {
                // Check if favorite already exists
                var existingFavorite = await _context.UserFavorites
                    .FirstOrDefaultAsync(uf => uf.UserId == favoriteDto.UserId && uf.FoodId == favoriteDto.FoodId);

                if (existingFavorite != null)
                {
                    return Conflict(new { message = "This food is already in favorites" });
                }

                // Verify user exists
                var userExists = await _context.Users.AnyAsync(u => u.UserId == favoriteDto.UserId);
                if (!userExists)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Verify food exists
                var foodExists = await _context.FoodInfos.AnyAsync(f => f.FoodId == favoriteDto.FoodId);
                if (!foodExists)
                {
                    return NotFound(new { message = "Food not found" });
                }

                // Generate new UserFavoriteId
                var newId = "UF" + DateTime.Now.Ticks.ToString().Substring(10);
                if (newId.Length < 10)
                {
                    newId = newId.PadRight(10, '0');
                }
                else if (newId.Length > 10)
                {
                    newId = newId.Substring(0, 10);
                }

                var userFavorite = new UserFavorite
                {
                    UserFavoriteId = newId,
                    UserId = favoriteDto.UserId,
                    FoodId = favoriteDto.FoodId,
                    CreatedTime = DateTime.Now
                };

                _context.UserFavorites.Add(userFavorite);
                await _context.SaveChangesAsync();

                // Load the food info for response
                await _context.Entry(userFavorite).Reference(uf => uf.Food).LoadAsync();

                var result = new
                {
                    userFavoriteId = userFavorite.UserFavoriteId,
                    userId = userFavorite.UserId,
                    foodId = userFavorite.FoodId,
                    foodName = userFavorite.Food?.FoodName,
                    createdTime = userFavorite.CreatedTime,
                    message = "Favorite added successfully"
                };

                return CreatedAtAction(nameof(GetUserFavorites), new { userId = userFavorite.UserId }, result);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new { message = "Database error", error = ex.InnerException?.Message ?? ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // DELETE: api/UserFavorite/user/{userId}/food/{foodId}
        [HttpDelete("user/{userId}/food/{foodId}")]
        public async Task<IActionResult> DeleteUserFavorite(string userId, string foodId)
        {
            try
            {
                var userFavorite = await _context.UserFavorites
                    .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.FoodId == foodId);

                if (userFavorite == null)
                {
                    return NotFound(new { message = "Favorite not found" });
                }

                _context.UserFavorites.Remove(userFavorite);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Favorite removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        // OPTIONS: api/UserFavorite (Handle preflight requests)
        [HttpOptions]
        public IActionResult PreflightRoute()
        {
            return Ok();
        }
    }

    // DTO for creating user favorites
    public class CreateUserFavoriteDto
    {
        public string UserId { get; set; } = null!;
        public string FoodId { get; set; } = null!;
    }
}
