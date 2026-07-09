using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class BillDetail
{
    public string BillId { get; set; } = null!;

    public string OrderId { get; set; } = null!;

    public int? Quantity { get; set; }

    public decimal? UnitPrice { get; set; }

    public virtual Bill Bill { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}
