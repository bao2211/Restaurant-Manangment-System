namespace RMS_APIServer.Models
{
    public class OrderDto
    {
        public string Id { get; set; } = string.Empty;
        public string TableId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal? Total { get; set; }
        public string? Note { get; set; }
        public decimal? Discount { get; set; }
        public string? ReservationId { get; set; }
        // Add other properties you want to expose
        public List<OrderDetailDto> OrderDetails { get; set; } = new List<OrderDetailDto>();
    }

    public class OrderDetailDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string FoodId { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? Status { get; set; }
        // Add other properties you want to expose
    }
}
