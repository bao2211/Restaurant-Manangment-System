using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace RMS_APIServer.Middleware
{
    public class CorsMiddleware
    {
        private readonly RequestDelegate _next;

        public CorsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Add CORS headers to all responses
            context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
            context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
            context.Response.Headers.Add("Access-Control-Max-Age", "86400"); // 24 hours

            // Handle preflight OPTIONS requests
            if (context.Request.Method == "OPTIONS")
            {
                context.Response.StatusCode = 200;
                await context.Response.WriteAsync("");
                return;
            }

            await _next(context);
        }
    }
}