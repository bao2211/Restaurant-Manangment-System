const axios = require('axios');

const API_BASE = 'http://46.250.231.129:8080';

async function checkAndRestoreRecipe() {
  try {
    console.log('=== CHECKING MÌ XÀO HẢI SẢN RECIPE ===\n');
    
    // 1. Get all recipes
    console.log('1. Fetching all recipes...');
    const recipesResponse = await axios.get(`${API_BASE}/api/Recipe`);
    const recipes = recipesResponse.data.$values || recipesResponse.data;
    
    // Find Mì xào hải sản recipe
    const mihaisanRecipe = recipes.find(r => {
      const foodName = r.foodName || r.FoodName;
      return foodName && foodName.toLowerCase().includes('mì') && foodName.toLowerCase().includes('hải sản');
    });
    
    if (mihaisanRecipe) {
      console.log('✅ Found recipe:');
      console.log('   Recipe ID:', mihaisanRecipe.recipeId);
      console.log('   Food ID:', mihaisanRecipe.foodId);
      console.log('   Food Name:', mihaisanRecipe.foodName);
      console.log('   Description:', mihaisanRecipe.recipeDescription);
      
      // Check recipe details
      console.log('\n2. Checking recipe details...');
      try {
        const detailsResponse = await axios.get(`${API_BASE}/api/RecipeDetail/recipe/${mihaisanRecipe.recipeId}`);
        const details = detailsResponse.data.$values || detailsResponse.data;
        
        if (details && details.length > 0) {
          console.log(`✅ Recipe has ${details.length} ingredients:`);
          details.forEach((d, i) => {
            console.log(`   ${i + 1}. ${d.ingredientName}: ${d.quantity} ${d.unitMeasurement}`);
          });
          console.log('\n✅ Recipe is complete! No need to restore.');
        } else {
          console.log('❌ Recipe has NO ingredients!');
          console.log('\n3. Restoring ingredients...');
          await restoreIngredients(mihaisanRecipe.recipeId);
        }
      } catch (error) {
        console.log('❌ Failed to get recipe details:', error.response?.data || error.message);
        console.log('\n3. Restoring ingredients...');
        await restoreIngredients(mihaisanRecipe.recipeId);
      }
    } else {
      console.log('❌ Recipe NOT found in database!');
      console.log('\nAll recipes:');
      recipes.forEach(r => {
        console.log(`   - ${r.foodName} (ID: ${r.recipeId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

async function restoreIngredients(recipeId) {
  // Original ingredients for Mì xào hải sản
  const ingredients = [
    { ingreId: 'I002', name: 'Mì', quantity: 200, unit: 'g' },
    { ingreId: 'I006', name: 'Tôm', quantity: 150, unit: 'g' },
    { ingreId: 'I007', name: 'Mực', quantity: 100, unit: 'g' },
    { ingreId: 'I003', name: 'Cà rốt', quantity: 50, unit: 'g' }
  ];
  
  let successCount = 0;
  
  for (const ing of ingredients) {
    try {
      console.log(`   Creating: ${ing.name} ${ing.quantity}${ing.unit}...`);
      await axios.post(`${API_BASE}/api/RecipeDetail`, {
        recipeId: recipeId,
        ingreId: ing.ingreId,
        quantity: ing.quantity,
        unitMeasurement: ing.unit
      });
      console.log(`   ✅ Created: ${ing.name}`);
      successCount++;
    } catch (error) {
      console.log(`   ❌ Failed: ${ing.name}`);
      console.log('      Error:', error.message);
      console.log('      Status:', error.response?.status);
      console.log('      Data:', JSON.stringify(error.response?.data, null, 2));
    }
  }
  
  console.log(`\n✅ Restored ${successCount}/${ingredients.length} ingredients`);
  
  // Verify
  console.log('\n4. Verifying...');
  try {
    const detailsResponse = await axios.get(`${API_BASE}/api/RecipeDetail/recipe/${recipeId}`);
    const details = detailsResponse.data.$values || detailsResponse.data;
    console.log(`✅ Recipe now has ${details.length} ingredients!`);
  } catch (error) {
    console.log('❌ Failed to verify:', error.message);
  }
}

checkAndRestoreRecipe();
