using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class Bill
{
    public string BillId { get; set; } = null!;

    public decimal? Total { get; set; }

    public decimal? Discount { get; set; }

    public decimal? TotalFinal { get; set; }

    public string? Payment { get; set; }

    public DateTime? CreatedTime { get; set; }

    public string? OrderId { get; set; }

    public string? UserId { get; set; }

    public virtual ICollection<BillDetail> BillDetails { get; set; } = new List<BillDetail>();

    public virtual Order? Order { get; set; }

    public virtual User? User { get; set; }
}
