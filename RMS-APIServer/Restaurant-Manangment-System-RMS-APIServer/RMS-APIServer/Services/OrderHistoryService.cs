using RMS_APIServer.Models;
using Microsoft.EntityFrameworkCore;

namespace RMS_APIServer.Services
{
    public interface IOrderHistoryService
    {
        Task<IEnumerable<OrderHistory>> GetUserOrderHistoryAsync(string userId, int page = 1, int pageSize = 20);
        Task<OrderHistory?> GetOrderHistoryByIdAsync(string historyId);
        Task<bool> CreateOrderHistoryAsync(string userId, string orderId);
    }

    public class OrderHistoryService : IOrderHistoryService
    {
        private readonly WebQlquanAnContext _context;

        public OrderHistoryService(WebQlquanAnContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<OrderHistory>> GetUserOrderHistoryAsync(string userId, int page = 1, int pageSize = 20)
        {
            return await _context.OrderHistories
                .Where(oh => oh.UserId == userId)
                .Include(oh => oh.Order)
                .ThenInclude(o => o.OrderDetails)
                .ThenInclude(od => od.Food)
                .Include(oh => oh.Table)
                .OrderByDescending(oh => oh.CreatedTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<OrderHistory?> GetOrderHistoryByIdAsync(string historyId)
        {
            return await _context.OrderHistories
                .Include(oh => oh.Order)
                .ThenInclude(o => o.OrderDetails)
                .ThenInclude(od => od.Food)
                .Include(oh => oh.Table)
                .FirstOrDefaultAsync(oh => oh.OrderHistoryId == historyId);
        }

        public async Task<bool> CreateOrderHistoryAsync(string userId, string orderId)
        {
            try
            {
                // Check if history already exists
                var existingHistory = await _context.OrderHistories
                    .FirstOrDefaultAsync(oh => oh.OrderId == orderId && oh.UserId == userId);

                if (existingHistory != null)
                    return true; // Already exists

                // Try to find the order first - if it exists, use its data
                var order = await _context.Orders
                    .Include(o => o.OrderDetails)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                // Create order history entry
                var orderHistory = new OrderHistory
                {
                    OrderHistoryId = GenerateId(),
                    UserId = userId,
                    OrderId = orderId,
                    CreatedTime = DateTime.UtcNow,
                    Status = order?.Status ?? "Completed", // Default status if order not found
                    Total = order?.Total ?? 0,
                    Note = order?.Note ?? "Order history created for testing",
                    TableId = order?.TableId
                };

                _context.OrderHistories.Add(orderHistory);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        private string GenerateId()
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            var random = new Random().Next(100, 999).ToString();
            return (timestamp + random).Substring(0, Math.Min(10, timestamp.Length + 3));
        }
    }
}