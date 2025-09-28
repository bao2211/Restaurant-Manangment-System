using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class OrderDetail
{
    public string FoodId { get; set; } = null!;

    public string OrderId { get; set; } = null!;

    public decimal? UnitPrice { get; set; }

    public string? Status { get; set; }

    public int? Quantity { get; set; }

    public virtual FoodInfo Food { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}
