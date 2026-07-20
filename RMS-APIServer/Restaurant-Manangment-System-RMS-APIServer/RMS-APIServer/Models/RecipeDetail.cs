using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class RecipeDetail
{
    public string RecipeId { get; set; } = null!;

    public string IngreId { get; set; } = null!;

    public string? UnitMeasurement { get; set; }

    public long? Quantity { get; set; }

    public virtual Ingredient Ingre { get; set; } = null!;

    public virtual Recipe Recipe { get; set; } = null!;
}
