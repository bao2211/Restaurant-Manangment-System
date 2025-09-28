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
            // Add comprehensive CORS headers to all responses
            context.Response.Headers["Access-Control-Allow-Origin"] = "*";
            context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH";
            context.Response.Headers["Access-Control-Allow-Headers"] = 
                "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name";
            context.Response.Headers["Access-Control-Expose-Headers"] = 
                "Content-Length, Content-Range, Content-Type";
            context.Response.Headers["Access-Control-Max-Age"] = "86400"; // 24 hours
            context.Response.Headers["Access-Control-Allow-Credentials"] = "false";

            // Handle preflight OPTIONS requests immediately
            if (context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = 204; // No Content for OPTIONS
                context.Response.Headers["Content-Length"] = "0";
                return;
            }

            await _next(context);
        }
    }
}