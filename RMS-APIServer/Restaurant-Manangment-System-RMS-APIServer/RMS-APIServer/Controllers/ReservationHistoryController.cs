using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using RMS_APIServer.Services;
using System.Security.Claims;

namespace RMS_APIServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationHistoryController : ControllerBase
    {
        private readonly ITableReservationHistoryService _reservationService;

        public ReservationHistoryController(ITableReservationHistoryService reservationService)
        {
            _reservationService = reservationService;
        }

        private string GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) 
                ?? User.FindFirst("userId")
                ?? User.FindFirst("sub");
            
            return userIdClaim?.Value ?? throw new UnauthorizedAccessException("User ID not found in token");
        }

        /// <summary>
        /// Get current user's table reservation history with pagination
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetReservationHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var userId = GetCurrentUserId();
                var reservationHistory = await _reservationService.GetUserReservationHistoryAsync(userId, page, pageSize);
                
                var result = reservationHistory.Select(rh => new
                {
                    reservationId = rh.ReservationHistoryId,
                    tableId = rh.TableId,
                    tableName = rh.Table?.TableName,
                    tableSeats = rh.Table?.NumOfSeats,
                    reservationDate = rh.ReservationDate,
                    reservationTime = rh.ReservationTime,
                    createdTime = rh.CreatedTime,
                    status = rh.Status,
                    partySize = rh.PartySize,
                    note = rh.Note,
                    cancelledTime = rh.CancelledTime
                });

                return Ok(new
                {
                    page = page,
                    pageSize = pageSize,
                    data = result
                });
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
        /// Get specific reservation history by ID
        /// </summary>
        [HttpGet("{reservationId}")]
        public async Task<IActionResult> GetReservationHistoryById(string reservationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var reservation = await _reservationService.GetReservationHistoryByIdAsync(reservationId);
                
                if (reservation == null || reservation.UserId != userId)
                    return NotFound(new { message = "Reservation not found" });

                var result = new
                {
                    reservationId = reservation.ReservationHistoryId,
                    tableId = reservation.TableId,
                    tableName = reservation.Table?.TableName,
                    tableSeats = reservation.Table?.NumOfSeats,
                    reservationDate = reservation.ReservationDate,
                    reservationTime = reservation.ReservationTime,
                    createdTime = reservation.CreatedTime,
                    status = reservation.Status,
                    partySize = reservation.PartySize,
                    note = reservation.Note,
                    cancelledTime = reservation.CancelledTime
                };

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
        /// Create a new table reservation
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.TableId))
                    return BadRequest(new { message = "Table ID is required" });

                if (request.PartySize <= 0)
                    return BadRequest(new { message = "Party size must be greater than 0" });

                if (request.ReservationDate < DateTime.Today)
                    return BadRequest(new { message = "Reservation date cannot be in the past" });

                var userId = GetCurrentUserId();
                var success = await _reservationService.CreateReservationHistoryAsync(
                    userId, 
                    request.TableId, 
                    request.ReservationDate, 
                    request.ReservationTime, 
                    request.PartySize, 
                    request.Note
                );
                
                if (!success)
                    return BadRequest(new { message = "Table not found or party size exceeds table capacity" });

                return Ok(new { message = "Reservation created successfully" });
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
        /// Cancel a reservation
        /// </summary>
        [HttpPut("{reservationId}/cancel")]
        public async Task<IActionResult> CancelReservation(string reservationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var success = await _reservationService.CancelReservationAsync(reservationId, userId);
                
                if (!success)
                    return NotFound(new { message = "Reservation not found or already cancelled" });

                return Ok(new { message = "Reservation cancelled successfully" });
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

    public class CreateReservationRequest
    {
        public string TableId { get; set; } = string.Empty;
        public DateTime ReservationDate { get; set; }
        public TimeSpan ReservationTime { get; set; }
        public int PartySize { get; set; }
        public string? Note { get; set; }
    }
}