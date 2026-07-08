using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class Order
{
    public string OrderId { get; set; } = null!;

    public DateTime? CreatedTime { get; set; }

    public string? Status { get; set; }

    public decimal? Total { get; set; }

    public string? Note { get; set; }

    public decimal? Discount { get; set; }

    public string? TableId { get; set; }

    public string? ReservationId { get; set; }

    public string? UserId { get; set; }

    public string? PaymentStatus { get; set; }

    public string? OrderType { get; set; }

    public string? DeliveryAddress { get; set; }

    public string? DeliveryPhone { get; set; }

    public decimal? DeliveryFee { get; set; }

    public string? GhtkTrackingId { get; set; }

    public string? DeliveryStatus { get; set; }

    public virtual ICollection<BillDetail> BillDetails { get; set; } = new List<BillDetail>();

    public virtual ICollection<Bill> Bills { get; set; } = new List<Bill>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual Table? Table { get; set; }

    public virtual User? User { get; set; }
}
