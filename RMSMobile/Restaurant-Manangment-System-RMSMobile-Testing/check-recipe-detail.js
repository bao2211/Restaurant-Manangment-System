const axios = require('axios');

async function checkRecipeDetails() {
  try {
    console.log('🔍 Kiểm tra chi tiết Recipe_Detail...\n');
    
    // Get Recipe Detail directly
    const detailRes = await axios.get('http://46.250.231.129:8080/api/RecipeDetail/recipe/1');
    console.log('📦 Raw RecipeDetail response:');
    console.log(JSON.stringify(detailRes.data, null, 2));
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

checkRecipeDetails();
