using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class TableReservationHistory
{
    public string ReservationHistoryId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string TableId { get; set; } = null!;

    public DateTime ReservationDate { get; set; }

    public TimeSpan ReservationTime { get; set; }

    public DateTime CreatedTime { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";

    public int PartySize { get; set; }

    public string? Note { get; set; }

    public DateTime? CancelledTime { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual Table Table { get; set; } = null!;
}