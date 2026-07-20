using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using RMS_APIServer.Services;
using System.Security.Claims;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FavoritesController : ControllerBase
    {
        private readonly IUserFavoritesService _favoritesService;

        public FavoritesController(IUserFavoritesService favoritesService)
        {
            _favoritesService = favoritesService;
        }

        private string GetCurrentUserId()
        {
            // Get user ID from JWT token claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst("userId")
                ?? User.FindFirst("sub");
            
            return userIdClaim?.Value ?? throw new UnauthorizedAccessException("User ID not found in token");
        }

        /// <summary>
        /// Get current user's favorite foods
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            try
            {
                var userId = GetCurrentUserId();
                var favorites = await _favoritesService.GetUserFavoritesAsync(userId);
                
                var result = favorites.Select(f => new
                {
                    favoriteId = f.UserFavoriteId,
                    foodId = f.FoodId,
                    foodName = f.Food?.FoodName,
                    foodImage = f.Food?.FoodImage,
                    unitPrice = f.Food?.UnitPrice,
                    createdTime = f.CreatedTime
                });

                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Add food to favorites
        /// </summary>
        [HttpPost("{foodId}")]
        public async Task<IActionResult> AddFavorite(string foodId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _favoritesService.AddFavoriteAsync(userId, foodId);
                
                if (!success)
                    return BadRequest(new { message = "Food not found or unable to add favorite" });

                return Ok(new { message = "Food added to favorites successfully" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Remove food from favorites
        /// </summary>
        [HttpDelete("{foodId}")]
        public async Task<IActionResult> RemoveFavorite(string foodId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _favoritesService.RemoveFavoriteAsync(userId, foodId);
                
                if (!success)
                    return NotFound(new { message = "Favorite not found" });

                return Ok(new { message = "Food removed from favorites successfully" });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Check if food is favorited by current user
        /// </summary>
        [HttpGet("{foodId}/status")]
        public async Task<IActionResult> GetFavoriteStatus(string foodId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var isFavorite = await _favoritesService.IsFavoriteAsync(userId, foodId);
                
                return Ok(new { foodId = foodId, isFavorite = isFavorite });
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}