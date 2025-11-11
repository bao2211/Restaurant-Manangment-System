// Test script to check if Recipe API is working
const axios = require('axios');

const API_BASE_URL = 'http://46.250.231.129:8080';

async function testRecipeAPI() {
  console.log('🧪 Testing Recipe Manager APIs...\n');
  
  const tests = [
    {
      name: 'Get All Foods',
      url: '/api/FoodInfo',
      method: 'GET'
    },
    {
      name: 'Get All Ingredients',
      url: '/api/Ingredient',
      method: 'GET'
    },
    {
      name: 'Get All Recipes',
      url: '/api/Recipe',
      method: 'GET'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testing: ${test.name}`);
      console.log(`   URL: ${API_BASE_URL}${test.url}`);
      
      const response = await axios({
        method: test.method,
        url: `${API_BASE_URL}${test.url}`,
        timeout: 10000
      });
      
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data.$values || response.data.data || []);
      
      console.log(`   ✅ Success: ${response.status}`);
      console.log(`   📦 Data count: ${data.length}`);
      
      if (data.length > 0) {
        console.log(`   🔍 First item keys:`, Object.keys(data[0]));
        console.log(`   📄 Sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...');
      }
      console.log('');
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data:`, error.response.data);
      }
      console.log('');
    }
  }
}

testRecipeAPI();
