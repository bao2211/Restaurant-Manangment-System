using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace RMS_APIServer.Services
{
    public interface IPayOSService
    {
        Task<PayOSPaymentResponse> CreatePaymentLink(PayOSPaymentRequest request);
        Task<PayOSPaymentInfo> GetPaymentInfo(long orderCode);
        Task<PayOSPaymentInfo> CancelPayment(long orderCode, string? reason = null);
        bool VerifyWebhookSignature(PayOSWebhookData webhookData);
    }

    public class PayOSService : IPayOSService
    {
        private readonly HttpClient _httpClient;
        private readonly string _clientId;
        private readonly string _apiKey;
        private readonly string _checksumKey;
        private readonly ILogger<PayOSService> _logger;

        public PayOSService(IConfiguration configuration, HttpClient httpClient, ILogger<PayOSService> logger)
        {
            _httpClient = httpClient;
            _clientId = configuration["PayOS:ClientId"] ?? throw new ArgumentNullException("PayOS:ClientId");
            _apiKey = configuration["PayOS:ApiKey"] ?? throw new ArgumentNullException("PayOS:ApiKey");
            _checksumKey = configuration["PayOS:ChecksumKey"] ?? throw new ArgumentNullException("PayOS:ChecksumKey");
            _logger = logger;

            _httpClient.BaseAddress = new Uri("https://api-merchant.payos.vn");
            _httpClient.DefaultRequestHeaders.Add("x-client-id", _clientId);
            _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
        }

        public async Task<PayOSPaymentResponse> CreatePaymentLink(PayOSPaymentRequest request)
        {
            var signatureData = $"amount={request.Amount}&cancelUrl={request.CancelUrl}&description={request.Description}&orderCode={request.OrderCode}&returnUrl={request.ReturnUrl}";
            request.Signature = CreateSignature(signatureData);

            var json = JsonSerializer.Serialize(request, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/v2/payment-requests", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("PayOS create payment response: {Response}", responseBody);

            var result = JsonSerializer.Deserialize<PayOSApiResponse<PayOSPaymentResponseData>>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result?.Code != "00")
            {
                throw new Exception($"PayOS error: {result?.Desc ?? "Unknown error"}");
            }

            return new PayOSPaymentResponse
            {
                CheckoutUrl = result.Data?.CheckoutUrl ?? "",
                QrCode = result.Data?.QrCode ?? "",
                OrderCode = result.Data?.OrderCode ?? 0,
                PaymentLinkId = result.Data?.PaymentLinkId ?? "",
                Amount = result.Data?.Amount ?? 0,
                Status = result.Data?.Status ?? ""
            };
        }

        public async Task<PayOSPaymentInfo> GetPaymentInfo(long orderCode)
        {
            var response = await _httpClient.GetAsync($"/v2/payment-requests/{orderCode}");
            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("PayOS get payment info response: {Response}", responseBody);

            var result = JsonSerializer.Deserialize<PayOSApiResponse<PayOSPaymentInfoData>>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result?.Code != "00")
            {
                throw new Exception($"PayOS error: {result?.Desc ?? "Unknown error"}");
            }

            return new PayOSPaymentInfo
            {
                OrderCode = result.Data?.OrderCode ?? 0,
                Amount = result.Data?.Amount ?? 0,
                AmountPaid = result.Data?.AmountPaid ?? 0,
                AmountRemaining = result.Data?.AmountRemaining ?? 0,
                Status = result.Data?.Status ?? "",
                CreatedAt = result.Data?.CreatedAt ?? ""
            };
        }

        public async Task<PayOSPaymentInfo> CancelPayment(long orderCode, string? reason = null)
        {
            var body = new { cancellationReason = reason ?? "User cancelled" };
            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"/v2/payment-requests/{orderCode}/cancel", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<PayOSApiResponse<PayOSPaymentInfoData>>(responseBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result?.Code != "00")
            {
                throw new Exception($"PayOS error: {result?.Desc ?? "Unknown error"}");
            }

            return new PayOSPaymentInfo
            {
                OrderCode = result.Data?.OrderCode ?? 0,
                Amount = result.Data?.Amount ?? 0,
                Status = result.Data?.Status ?? ""
            };
        }

        public bool VerifyWebhookSignature(PayOSWebhookData webhookData)
        {
            if (webhookData.Data == null) return false;

            var data = webhookData.Data;
            var signatureData = $"amount={data.Amount}&code={data.Code}&description={data.Description}&orderCode={data.OrderCode}&status={data.Status}";
            var expectedSignature = CreateSignature(signatureData);

            return expectedSignature == webhookData.Signature;
        }

        private string CreateSignature(string data)
        {
            var keyBytes = Encoding.UTF8.GetBytes(_checksumKey);
            var dataBytes = Encoding.UTF8.GetBytes(data);
            using var hmac = new HMACSHA256(keyBytes);
            var hash = hmac.ComputeHash(dataBytes);
            return Convert.ToHexString(hash).ToLower();
        }
    }

    // Request/Response models
    public class PayOSPaymentRequest
    {
        public long OrderCode { get; set; }
        public int Amount { get; set; }
        public string Description { get; set; } = "";
        public string? BuyerName { get; set; }
        public string? BuyerPhone { get; set; }
        public string? BuyerEmail { get; set; }
        public string CancelUrl { get; set; } = "";
        public string ReturnUrl { get; set; } = "";
        public string Signature { get; set; } = "";
        public List<PayOSItem>? Items { get; set; }
    }

    public class PayOSItem
    {
        public string Name { get; set; } = "";
        public int Quantity { get; set; }
        public int Price { get; set; }
    }

    public class PayOSPaymentResponse
    {
        public string CheckoutUrl { get; set; } = "";
        public string QrCode { get; set; } = "";
        public long OrderCode { get; set; }
        public string PaymentLinkId { get; set; } = "";
        public int Amount { get; set; }
        public string Status { get; set; } = "";
    }

    public class PayOSPaymentInfo
    {
        public long OrderCode { get; set; }
        public int Amount { get; set; }
        public int AmountPaid { get; set; }
        public int AmountRemaining { get; set; }
        public string Status { get; set; } = "";
        public string CreatedAt { get; set; } = "";
    }

    public class PayOSApiResponse<T>
    {
        public string Code { get; set; } = "";
        public string Desc { get; set; } = "";
        public T? Data { get; set; }
        public string? Signature { get; set; }
    }

    public class PayOSPaymentResponseData
    {
        public string? CheckoutUrl { get; set; }
        public string? QrCode { get; set; }
        public long? OrderCode { get; set; }
        public string? PaymentLinkId { get; set; }
        public int? Amount { get; set; }
        public string? Status { get; set; }
    }

    public class PayOSPaymentInfoData
    {
        public long? OrderCode { get; set; }
        public int? Amount { get; set; }
        public int? AmountPaid { get; set; }
        public int? AmountRemaining { get; set; }
        public string? Status { get; set; }
        public string? CreatedAt { get; set; }
    }

    public class PayOSWebhookData
    {
        public string Code { get; set; } = "";
        public string Desc { get; set; } = "";
        public bool Success { get; set; }
        public PayOSWebhookDataDetail? Data { get; set; }
        public string? Signature { get; set; }
    }

    public class PayOSWebhookDataDetail
    {
        public long OrderCode { get; set; }
        public int Amount { get; set; }
        public string Description { get; set; } = "";
        public string? AccountNumber { get; set; }
        public string? Reference { get; set; }
        public string? TransactionDateTime { get; set; }
        public string? Code { get; set; }
        public string? Status { get; set; }
    }
}
