using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class Category
{
    public string CateId { get; set; } = null!;

    public string? CateName { get; set; }

    public string? Description { get; set; }

    public virtual ICollection<FoodInfo> FoodInfos { get; set; } = new List<FoodInfo>();
}
