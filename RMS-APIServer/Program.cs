using Microsoft.EntityFrameworkCore;
using RMS_APIServer.Models;
using RMS_APIServer.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<DBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Remove reference handler to avoid $ref objects
        options.JsonSerializerOptions.ReferenceHandler = null;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.MaxDepth = 32;
    });

// Add CORS support with proper configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });

    // Add a specific policy for development (more permissive)
    options.AddPolicy("Development",
        policy =>
        {
            policy.SetIsOriginAllowed(_ => true) // Allow any origin
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
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

// Use custom CORS middleware first
app.UseMiddleware<CorsMiddleware>();

// Also use built-in CORS as backup
app.UseCors(app.Environment.IsDevelopment() ? "Development" : "AllowAll");

// Only use HTTPS redirection in production and NOT in Docker containers
if (!app.Environment.IsDevelopment() && Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") != "true")
{
    app.UseHttpsRedirection();
}

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.Run();
