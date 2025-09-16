namespace RMS_APIServer.Models
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int TableId { get; set; }
        public int UserId { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        // Add other properties you want to expose
        public List<OrderDetailDto> OrderDetails { get; set; }
    }

    public class OrderDetailDto
    {
        public int Id { get; set; }
        public int FoodId { get; set; }
        public int Quantity { get; set; }
        // Add other properties you want to expose
    }
}
