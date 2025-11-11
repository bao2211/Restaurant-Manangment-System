# Quick Recipe API Test Script
# Usage: .\test-recipe-quick.ps1

$ErrorActionPreference = "Continue"

# Colors
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error-Custom { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning-Custom { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }

$API_URL = "http://localhost:5000"

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   🧪 Recipe API Quick Test Tool 🧪   ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Magenta

# Test 1: Check API Connection
Write-Info "Test 1: Checking API connection..."
try {
    $response = Invoke-WebRequest -Uri "$API_URL/api/Recipe" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Success "API is running on $API_URL"
    }
} catch {
    Write-Error-Custom "API is not running! Please start the API server first."
    Write-Warning-Custom "Run: cd RMS-APIServer\RMS-APIServer; dotnet run"
    exit 1
}

# Test 2: Get All Foods
Write-Info "`nTest 2: Getting all foods..."
try {
    $foods = Invoke-RestMethod -Uri "$API_URL/api/FoodInfo" -Method GET
    $foodCount = ($foods | Measure-Object).Count
    Write-Success "Found $foodCount foods"
    
    if ($foodCount -gt 0) {
        Write-Host "  First 3 foods:" -ForegroundColor Gray
        $foods | Select-Object -First 3 | ForEach-Object {
            Write-Host "    - $($_.foodId): $($_.foodName)" -ForegroundColor White
        }
    }
} catch {
    Write-Error-Custom "Failed to get foods: $($_.Exception.Message)"
}

# Test 3: Get All Ingredients
Write-Info "`nTest 3: Getting all ingredients..."
try {
    $ingredients = Invoke-RestMethod -Uri "$API_URL/api/Ingredient" -Method GET
    $ingreCount = ($ingredients | Measure-Object).Count
    Write-Success "Found $ingreCount ingredients"
    
    if ($ingreCount -gt 0) {
        Write-Host "  First 5 ingredients:" -ForegroundColor Gray
        $ingredients | Select-Object -First 5 | ForEach-Object {
            Write-Host "    - $($_.ingreId): $($_.ingreName)" -ForegroundColor White
        }
    }
} catch {
    Write-Error-Custom "Failed to get ingredients: $($_.Exception.Message)"
}

# Test 4: Get All Recipes
Write-Info "`nTest 4: Getting all recipes..."
try {
    $recipes = Invoke-RestMethod -Uri "$API_URL/api/Recipe" -Method GET
    $recipeCount = ($recipes | Measure-Object).Count
    Write-Success "Found $recipeCount recipes"
    
    if ($recipeCount -gt 0) {
        Write-Host "  Existing recipes:" -ForegroundColor Gray
        $recipes | ForEach-Object {
            $detailCount = ($_.recipeDetails | Measure-Object).Count
            Write-Host "    - $($_.recipeId): $($_.foodName) ($detailCount ingredients)" -ForegroundColor White
        }
    } else {
        Write-Warning-Custom "No recipes found in database"
    }
} catch {
    Write-Error-Custom "Failed to get recipes: $($_.Exception.Message)"
}

# Test 5: Create Test Recipe (if user agrees)
Write-Host "`n"
$createTest = Read-Host "Do you want to create a test recipe? (y/n)"
if ($createTest -eq "y") {
    Write-Info "`nTest 5: Creating test recipe..."
    
    # Generate unique ID
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $testRecipeId = "RCTEST$($timestamp.Substring(8))"
    
    # Get first available food
    $testFood = $foods | Select-Object -First 1
    if (-not $testFood) {
        Write-Error-Custom "No food available for testing"
    } else {
        Write-Info "Using food: $($testFood.foodName) ($($testFood.foodId))"
        
        # Create recipe
        $recipeData = @{
            recipeId = $testRecipeId
            foodId = $testFood.foodId
            recipeDescription = "Test recipe created by automated script at $(Get-Date)"
        } | ConvertTo-Json
        
        try {
            $headers = @{
                "Content-Type" = "application/json"
            }
            
            $recipeResponse = Invoke-RestMethod -Uri "$API_URL/api/Recipe" -Method POST -Body $recipeData -Headers $headers
            Write-Success "Recipe created: $testRecipeId"
            
            # Add recipe details
            Write-Info "Adding recipe details..."
            $successCount = 0
            $failCount = 0
            
            $testIngredients = $ingredients | Select-Object -First 3
            foreach ($ingre in $testIngredients) {
                $detailData = @{
                    recipeId = $testRecipeId
                    ingreId = $ingre.ingreId
                    quantity = Get-Random -Minimum 100 -Maximum 500
                    unitMeasurement = "g"
                } | ConvertTo-Json
                
                try {
                    $detailResponse = Invoke-RestMethod -Uri "$API_URL/api/RecipeDetail" -Method POST -Body $detailData -Headers $headers
                    Write-Success "  Added: $($ingre.ingreName) - $($detailData.quantity)g"
                    $successCount++
                } catch {
                    Write-Error-Custom "  Failed to add: $($ingre.ingreName)"
                    $failCount++
                }
            }
            
            Write-Host "`n  Summary:" -ForegroundColor Cyan
            Write-Host "    ✅ Success: $successCount" -ForegroundColor Green
            if ($failCount -gt 0) {
                Write-Host "    ❌ Failed: $failCount" -ForegroundColor Red
            }
            
            # Test reading the created recipe
            Write-Info "`nTest 6: Reading created recipe..."
            try {
                $createdRecipe = Invoke-RestMethod -Uri "$API_URL/api/Recipe/$testRecipeId" -Method GET
                Write-Success "Recipe retrieved successfully"
                Write-Host "  Recipe ID: $($createdRecipe.recipeId)" -ForegroundColor White
                Write-Host "  Food: $($createdRecipe.foodName)" -ForegroundColor White
                Write-Host "  Description: $($createdRecipe.recipeDescription)" -ForegroundColor White
                Write-Host "  Ingredients: $(($createdRecipe.recipeDetails | Measure-Object).Count)" -ForegroundColor White
            } catch {
                Write-Error-Custom "Failed to retrieve created recipe"
            }
            
            # Ask if user wants to delete test recipe
            Write-Host "`n"
            $deleteTest = Read-Host "Do you want to delete the test recipe? (y/n)"
            if ($deleteTest -eq "y") {
                Write-Info "`nTest 7: Deleting test recipe..."
                try {
                    # Delete details first
                    foreach ($detail in $createdRecipe.recipeDetails) {
                        try {
                            Invoke-RestMethod -Uri "$API_URL/api/RecipeDetail/$testRecipeId/$($detail.ingredientId)" -Method DELETE | Out-Null
                        } catch {
                            Write-Warning-Custom "Failed to delete detail: $($detail.ingredientId)"
                        }
                    }
                    
                    # Delete recipe
                    $deleteResponse = Invoke-RestMethod -Uri "$API_URL/api/Recipe/$testRecipeId" -Method DELETE
                    Write-Success "Test recipe deleted successfully"
                } catch {
                    Write-Error-Custom "Failed to delete test recipe: $($_.Exception.Message)"
                }
            } else {
                Write-Warning-Custom "Test recipe $testRecipeId kept in database"
            }
            
        } catch {
            Write-Error-Custom "Failed to create recipe: $($_.Exception.Message)"
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "  Response: $responseBody" -ForegroundColor Yellow
            }
        }
    }
}

# Summary
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║           📊 Test Summary 📊           ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Magenta

Write-Host "API Status:      " -NoNewline; Write-Success "Running"
Write-Host "Foods:           $foodCount"
Write-Host "Ingredients:     $ingreCount"
Write-Host "Recipes:         $recipeCount"

Write-Host "`n✅ All tests completed!`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open test-recipe-api.html in browser for detailed testing" -ForegroundColor White
Write-Host "  2. Test on mobile app via RecipeManagerScreen" -ForegroundColor White
Write-Host "  3. Check RECIPE_TESTING_GUIDE.md for full testing guide`n" -ForegroundColor White
