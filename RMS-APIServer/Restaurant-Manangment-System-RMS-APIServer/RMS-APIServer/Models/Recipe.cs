using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class Recipe
{
    public string RecipeId { get; set; } = null!;

    public string? RecipeDescription { get; set; }

    public string? FoodId { get; set; }

    public virtual FoodInfo? Food { get; set; }

    public virtual ICollection<RecipeDetail> RecipeDetails { get; set; } = new List<RecipeDetail>();
}
