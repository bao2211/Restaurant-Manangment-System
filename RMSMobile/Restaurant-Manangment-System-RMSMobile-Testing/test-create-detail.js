const axios = require('axios');

async function testCreateRecipeDetail() {
  const API_BASE_URL = 'http://46.250.231.129:8080';
  
  console.log('🧪 Test tạo RecipeDetail...\n');
  
  // Test với data đơn giản
  const testData = {
    RecipeId: '1         ',  // 10 characters với spaces
    IngreId: '1         ',   // 10 characters với spaces  
    Quantity: 300,
    UnitMeasurement: 'g'
  };
  
  console.log('📤 Sending data:');
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/RecipeDetail`,
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('\n✅ Success!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('\n❌ Error:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testCreateRecipeDetail();
