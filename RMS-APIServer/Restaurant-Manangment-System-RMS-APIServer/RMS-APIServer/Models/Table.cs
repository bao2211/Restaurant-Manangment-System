using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class Table
{
    public string TableId { get; set; } = null!;

    public string? TableName { get; set; }

    public int? NumOfSeats { get; set; }

    public string? Status { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
