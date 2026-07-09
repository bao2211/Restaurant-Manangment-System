using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class FoodInfo
{
    public string FoodId { get; set; } = null!;

    public string FoodName { get; set; } = null!;

    public string? FoodImage { get; set; }

    public decimal? UnitPrice { get; set; }

    public string? Description { get; set; }

    public string? CateId { get; set; }

    public virtual Category? Cate { get; set; }

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
}
