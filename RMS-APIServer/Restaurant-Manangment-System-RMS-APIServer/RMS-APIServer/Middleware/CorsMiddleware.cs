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
            // Get the origin from the request
            string origin = context.Request.Headers["Origin"].FirstOrDefault() ?? "*";

            // For Docker deployments, be more permissive with origins
            bool isInContainer = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";

            // Add comprehensive CORS headers to all responses - ALWAYS set these first
            if (isInContainer || origin == "*" || string.IsNullOrEmpty(origin))
            {
                context.Response.Headers["Access-Control-Allow-Origin"] = "*";
                context.Response.Headers["Access-Control-Allow-Credentials"] = "false";
            }
            else
            {
                // Allow specific origins with credentials support
                context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
            }

            context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD";
            context.Response.Headers["Access-Control-Allow-Headers"] =
                "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name, " +
                "Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers, " +
                "X-HTTP-Method-Override, X-Forwarded-For, X-Real-IP";
            context.Response.Headers["Access-Control-Expose-Headers"] =
                "Content-Length, Content-Range, Content-Type, X-Content-Type-Options";
            context.Response.Headers["Access-Control-Max-Age"] = "86400"; // 24 hours

            // Additional headers for better browser compatibility
            context.Response.Headers["Vary"] = "Origin, Access-Control-Request-Method, Access-Control-Request-Headers";

            // Log CORS request for debugging
            Console.WriteLine($"🌐 CORS Request - Origin: {origin}, Method: {context.Request.Method}, Path: {context.Request.Path}");

            // Handle preflight OPTIONS requests immediately
            if (context.Request.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = 204; // No Content for OPTIONS
                context.Response.Headers["Content-Length"] = "0";
                Console.WriteLine("✅ CORS Preflight handled successfully");
                return;
            }

            // Wrap the next middleware in try-catch to ensure CORS headers are sent even on errors
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"❌ Error in request pipeline: {ex.Message}");

                // Make sure CORS headers are still present (re-add them if needed)
                if (!context.Response.Headers.ContainsKey("Access-Control-Allow-Origin"))
                {
                    if (isInContainer || origin == "*" || string.IsNullOrEmpty(origin))
                    {
                        context.Response.Headers["Access-Control-Allow-Origin"] = "*";
                        context.Response.Headers["Access-Control-Allow-Credentials"] = "false";
                    }
                    else
                    {
                        context.Response.Headers["Access-Control-Allow-Origin"] = origin;
                        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";
                    }

                    context.Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD";
                    context.Response.Headers["Access-Control-Allow-Headers"] =
                        "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name";
                }

                // Set 500 status if not already set
                if (context.Response.StatusCode == 200)
                {
                    context.Response.StatusCode = 500;
                }

                // Write error response with CORS headers
                context.Response.ContentType = "application/json";
                var errorResponse = "{\"error\":\"Internal server error\",\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}";
                await context.Response.WriteAsync(errorResponse);

                Console.WriteLine("🌐 CORS headers added to error response");
            }
        }
    }
}