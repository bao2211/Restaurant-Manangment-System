using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class OrderHistory
{
    public string OrderHistoryId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string OrderId { get; set; } = null!;

    public DateTime CreatedTime { get; set; } = DateTime.UtcNow;

    public string? Status { get; set; }

    public decimal? Total { get; set; }

    public string? Note { get; set; }

    public string? TableId { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;

    public virtual Table? Table { get; set; }
}