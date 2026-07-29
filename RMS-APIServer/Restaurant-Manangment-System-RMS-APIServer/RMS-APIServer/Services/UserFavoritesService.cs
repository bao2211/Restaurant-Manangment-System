using RMS_APIServer.Models;
using Microsoft.EntityFrameworkCore;

namespace RMS_APIServer.Services
{
    public interface IUserFavoritesService
    {
        Task<IEnumerable<UserFavorite>> GetUserFavoritesAsync(string userId);
        Task<bool> AddFavoriteAsync(string userId, string foodId);
        Task<bool> RemoveFavoriteAsync(string userId, string foodId);
        Task<bool> IsFavoriteAsync(string userId, string foodId);
    }

    public class UserFavoritesService : IUserFavoritesService
    {
        private readonly WebQlquanAnContext _context;

        public UserFavoritesService(WebQlquanAnContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserFavorite>> GetUserFavoritesAsync(string userId)
        {
            return await _context.UserFavorites
                .Where(uf => uf.UserId == userId)
                .Include(uf => uf.Food)
                .OrderByDescending(uf => uf.CreatedTime)
                .ToListAsync();
        }

        public async Task<bool> AddFavoriteAsync(string userId, string foodId)
        {
            // Check if already exists
            var existing = await _context.UserFavorites
                .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.FoodId == foodId);

            if (existing != null)
                return true; // Already favorited, return success

            // Check if food exists
            var foodExists = await _context.FoodInfos.AnyAsync(f => f.FoodId == foodId);
            if (!foodExists)
                return false;

            // Generate new ID (simple approach - use timestamp + random)
            var newId = GenerateId();

            var userFavorite = new UserFavorite
            {
                UserFavoriteId = newId,
                UserId = userId,
                FoodId = foodId,
                CreatedTime = DateTime.UtcNow
            };

            _context.UserFavorites.Add(userFavorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveFavoriteAsync(string userId, string foodId)
        {
            var favorite = await _context.UserFavorites
                .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.FoodId == foodId);

            if (favorite == null)
                return false;

            _context.UserFavorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> IsFavoriteAsync(string userId, string foodId)
        {
            return await _context.UserFavorites
                .AnyAsync(uf => uf.UserId == userId && uf.FoodId == foodId);
        }

        private string GenerateId()
        {
            // Simple ID generation - timestamp + random number, truncated to 10 chars
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            var random = new Random().Next(100, 999).ToString();
            return (timestamp + random).Substring(0, Math.Min(10, timestamp.Length + 3));
        }
    }
}