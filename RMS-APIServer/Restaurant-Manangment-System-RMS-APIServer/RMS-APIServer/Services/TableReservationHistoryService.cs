using RMS_APIServer.Models;
using Microsoft.EntityFrameworkCore;

namespace RMS_APIServer.Services
{
    public interface ITableReservationHistoryService
    {
        Task<IEnumerable<TableReservationHistory>> GetUserReservationHistoryAsync(string userId, int page = 1, int pageSize = 20);
        Task<TableReservationHistory?> GetReservationHistoryByIdAsync(string historyId);
        Task<bool> CreateReservationHistoryAsync(string userId, string tableId, DateTime reservationDate, TimeSpan reservationTime, int partySize, string? note = null);
        Task<bool> CancelReservationAsync(string historyId, string userId);
    }

    public class TableReservationHistoryService : ITableReservationHistoryService
    {
        private readonly WebQlquanAnContext _context;

        public TableReservationHistoryService(WebQlquanAnContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TableReservationHistory>> GetUserReservationHistoryAsync(string userId, int page = 1, int pageSize = 20)
        {
            return await _context.TableReservationHistories
                .Where(trh => trh.UserId == userId)
                .Include(trh => trh.Table)
                .OrderByDescending(trh => trh.CreatedTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<TableReservationHistory?> GetReservationHistoryByIdAsync(string historyId)
        {
            return await _context.TableReservationHistories
                .Include(trh => trh.Table)
                .FirstOrDefaultAsync(trh => trh.ReservationHistoryId == historyId);
        }

        public async Task<bool> CreateReservationHistoryAsync(string userId, string tableId, DateTime reservationDate, TimeSpan reservationTime, int partySize, string? note = null)
        {
            // Check if table exists
            var table = await _context.Tables.FirstOrDefaultAsync(t => t.TableId == tableId);
            if (table == null)
                return false;

            // Validate party size against table capacity
            if (table.NumOfSeats.HasValue && partySize > table.NumOfSeats.Value)
                return false;

            var reservation = new TableReservationHistory
            {
                ReservationHistoryId = GenerateId(),
                UserId = userId,
                TableId = tableId,
                ReservationDate = reservationDate,
                ReservationTime = reservationTime,
                CreatedTime = DateTime.UtcNow,
                Status = "Pending",
                PartySize = partySize,
                Note = note
            };

            _context.TableReservationHistories.Add(reservation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CancelReservationAsync(string historyId, string userId)
        {
            var reservation = await _context.TableReservationHistories
                .FirstOrDefaultAsync(trh => trh.ReservationHistoryId == historyId && trh.UserId == userId);

            if (reservation == null || reservation.Status == "Cancelled")
                return false;

            reservation.Status = "Cancelled";
            reservation.CancelledTime = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateId()
        {
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            var random = new Random().Next(100, 999).ToString();
            return (timestamp + random).Substring(0, Math.Min(10, timestamp.Length + 3));
        }
    }
}