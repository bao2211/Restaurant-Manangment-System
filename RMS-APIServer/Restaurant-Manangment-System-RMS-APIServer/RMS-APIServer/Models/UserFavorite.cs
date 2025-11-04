using System;
using System.Collections.Generic;

namespace RMS_APIServer.Models;

public partial class UserFavorite
{
    public string UserFavoriteId { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public string FoodId { get; set; } = null!;

    public DateTime CreatedTime { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;

    public virtual FoodInfo Food { get; set; } = null!;
}