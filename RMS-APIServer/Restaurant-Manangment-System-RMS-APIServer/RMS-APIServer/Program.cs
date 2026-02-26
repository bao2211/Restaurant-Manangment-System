using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using RMS_APIServer.Models;
using RMS_APIServer.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<DBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add WebQlquanAnContext for the new auxiliary tables - using same connection as DBContext
builder.Services.AddDbContext<WebQlquanAnContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register new services for auxiliary features
builder.Services.AddScoped<RMS_APIServer.Services.IUserFavoritesService, RMS_APIServer.Services.UserFavoritesService>();
builder.Services.AddScoped<RMS_APIServer.Services.IOrderHistoryService, RMS_APIServer.Services.OrderHistoryService>();
builder.Services.AddScoped<RMS_APIServer.Services.ITableReservationHistoryService, RMS_APIServer.Services.TableReservationHistoryService>();

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-security";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RMS-APIServer";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RMS-Users";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production with HTTPS
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero // Remove delay of token when expire
    };
});

builder.Services.AddAuthorization();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Remove reference handler to avoid $ref objects
        options.JsonSerializerOptions.ReferenceHandler = null;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.MaxDepth = 32;
    });

// Add CORS support with comprehensive configuration for Docker deployment
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .WithExposedHeaders("Content-Length", "Content-Range", "Content-Type");
        });

    // Add a specific policy for development (more permissive)
    options.AddPolicy("Development",
        policy =>
        {
            policy.SetIsOriginAllowed(_ => true) // Allow any origin
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .WithExposedHeaders("Content-Length", "Content-Range", "Content-Type");
        });

    // Add a specific policy for production with explicit origins
    options.AddPolicy("Production",
        policy =>
        {
            policy.WithOrigins(
                      "http://localhost:3000",      // React dev server
                      "http://localhost:19006",     // Expo web dev server
                      "http://localhost:8081",      // Metro bundler
                      "http://127.0.0.1:3000",      // React dev server localhost
                      "http://127.0.0.1:19006",     // Expo web localhost
                      "http://46.250.231.129",      // Your production IP
                      "http://46.250.231.129:3000", // React on production IP
                      "http://46.250.231.129:19006", // Expo on production IP
                      "https://46.250.231.129",     // HTTPS version if applicable
                      "file://",                    // For mobile app file protocol
                      "capacitor://localhost",      // For Capacitor apps
                      "ionic://localhost"           // For Ionic apps
                  )
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials()
                  .WithExposedHeaders("Content-Length", "Content-Range", "Content-Type");
        });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure URLs for Docker deployment - Force HTTP only in containers
if (app.Environment.IsDevelopment() || Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true")
{
    // Always use HTTP for Docker containers to avoid certificate issues
    app.Urls.Clear(); // Clear any existing URLs
    app.Urls.Add("http://0.0.0.0:8080");
    Console.WriteLine("🐳 Docker container detected - Using HTTP only on port 8080");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use custom CORS middleware first for maximum compatibility
app.UseMiddleware<CorsMiddleware>();

// Only use HTTPS redirection in production and NOT in Docker containers
if (!app.Environment.IsDevelopment() && Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") != "true")
{
    app.UseHttpsRedirection();
}

app.UseRouting();

// CRITICAL: Built-in CORS must be between UseRouting() and MapControllers()
string corsPolicy = app.Environment.IsDevelopment() ? "Development" :
                   Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true" ? "AllowAll" : "Production";
app.UseCors(corsPolicy);

Console.WriteLine($"🔧 CORS Policy Applied: {corsPolicy}");

// Add Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
