using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class Ingredient
{
    public string IngreId { get; set; } = null!;

    public string IngreName { get; set; } = null!;

    public long? Stock { get; set; }

    public string? UnitMeasurement { get; set; }

    public virtual ICollection<RecipeDetail> RecipeDetails { get; set; } = new List<RecipeDetail>();
}
