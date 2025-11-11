# Quick HTTP server to serve the test HTML file
# PowerShell script to start a simple HTTP server

$port = 3000
$path = (Get-Location).Path

Write-Host "Starting HTTP server on port $port..." -ForegroundColor Green
Write-Host "Serving files from: $path" -ForegroundColor Blue
Write-Host "Open browser to: http://localhost:$port/api-test-jwt-fix.html" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop server" -ForegroundColor Red

# Use Python's built-in HTTP server
try {
    python -m http.server $port
} catch {
    Write-Host "Python not found, trying with Node.js..." -ForegroundColor Yellow
    
    # Alternative: Use Node.js http-server if available
    try {
        npx http-server . -p $port -c-1 --cors
    } catch {
        Write-Host "Neither Python nor Node.js http-server available." -ForegroundColor Red
        Write-Host "Please install Python or Node.js to run the test server." -ForegroundColor Red
        Write-Host "Or manually open the HTML file in your browser." -ForegroundColor Yellow
    }
}