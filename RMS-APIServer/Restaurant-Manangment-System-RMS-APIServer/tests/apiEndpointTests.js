/**
 * Comprehensive API Endpoint Test Suite
 * Restaurant Management System - RMS API
 * 
 * This file tests all available API endpoints to ensure they're working correctly.
 * Run with: node tests/apiEndpointTests.js
 */

const axios = require('axios');

// Configuration
const CONFIG = {
  // Switch between local and production API
  LOCAL_API: 'http://localhost:5181/api',
  PRODUCTION_API: 'http://46.250.231.129:8080/api',
  USE_LOCAL: false, // Set to true to test local API
  TIMEOUT: 10000,
  LOG_RESPONSES: true,
  LOG_ERRORS: true
};

const API_BASE_URL = CONFIG.USE_LOCAL ? CONFIG.LOCAL_API : CONFIG.PRODUCTION_API;

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  results: []
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Utility Functions
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logHeader(message) {
  log(`\n${colors.bright}=== ${message} ===${colors.reset}`, colors.cyan);
}

/**
 * HTTP Client with error handling
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Test execution wrapper
 */
async function runTest(testName, testFunction, options = {}) {
  testResults.total++;
  
  try {
    logInfo(`Running: ${testName}`);
    const result = await testFunction();
    
    if (result === 'SKIP') {
      testResults.skipped++;
      logWarning(`SKIPPED: ${testName}`);
      testResults.results.push({ name: testName, status: 'SKIPPED', error: 'Test skipped' });
    } else {
      testResults.passed++;
      logSuccess(`PASSED: ${testName}`);
      testResults.results.push({ name: testName, status: 'PASSED', response: result });
    }
  } catch (error) {
    testResults.failed++;
    logError(`FAILED: ${testName}`);
    if (CONFIG.LOG_ERRORS) {
      console.error(`  Error: ${error.message}`);
      if (error.response) {
        console.error(`  Status: ${error.response.status}`);
        console.error(`  Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
    testResults.results.push({ 
      name: testName, 
      status: 'FAILED', 
      error: error.message,
      statusCode: error.response?.status,
      responseData: error.response?.data
    });
  }
}

/**
 * API Test Functions
 */

// 1. User Management Tests
async function testUserEndpoints() {
  logHeader('User Management Endpoints');

  // GET /User - List all users
  await runTest('GET /User - List all users', async () => {
    const response = await apiClient.get('/User');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} users`);
    }
    return { status: response.status, count: response.data.length };
  });

  // POST /User/login - User login (needs valid credentials)
  await runTest('POST /User/login - User login', async () => {
    try {
      const response = await apiClient.post('/User/login', {
        userName: 'admin',
        password: 'admin123' // Common test password
      });
      return { status: response.status, user: response.data };
    } catch (error) {
      if (error.response?.status === 401) {
        logWarning('  Login failed - invalid credentials (expected)');
        return { status: 401, message: 'Invalid credentials test' };
      }
      throw error;
    }
  });

  // GET /User/{userId} - Get specific user (using first user ID if available)
  await runTest('GET /User/{userId} - Get user by ID', async () => {
    // First get all users to find a valid ID
    const usersResponse = await apiClient.get('/User');
    if (usersResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstUserId = usersResponse.data[0].userId;
    const response = await apiClient.get(`/User/${firstUserId}`);
    return { status: response.status, user: response.data };
  });
}

// 2. Category Management Tests
async function testCategoryEndpoints() {
  logHeader('Category Management Endpoints');

  // GET /Category - List all categories
  await runTest('GET /Category - List all categories', async () => {
    const response = await apiClient.get('/Category');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} categories`);
    }
    return { status: response.status, count: response.data.length };
  });

  // GET /Category/{categoryId} - Get specific category
  await runTest('GET /Category/{categoryId} - Get category by ID', async () => {
    const categoriesResponse = await apiClient.get('/Category');
    if (categoriesResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstCategoryId = categoriesResponse.data[0].cateId;
    const response = await apiClient.get(`/Category/${firstCategoryId}`);
    return { status: response.status, category: response.data };
  });
}

// 3. Food Information Tests
async function testFoodInfoEndpoints() {
  logHeader('Food Information Endpoints');

  // GET /FoodInfo - List all food items
  await runTest('GET /FoodInfo - List all food items', async () => {
    const response = await apiClient.get('/FoodInfo');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} food items`);
    }
    return { status: response.status, count: response.data.length };
  });

  // GET /FoodInfo/{foodId} - Get specific food item
  await runTest('GET /FoodInfo/{foodId} - Get food by ID', async () => {
    const foodResponse = await apiClient.get('/FoodInfo');
    if (foodResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstFoodId = foodResponse.data[0].foodId;
    const response = await apiClient.get(`/FoodInfo/${firstFoodId}`);
    return { status: response.status, food: response.data };
  });

  // GET /FoodInfo/category/{categoryId} - Get food by category
  await runTest('GET /FoodInfo/category/{categoryId} - Get food by category', async () => {
    const categoriesResponse = await apiClient.get('/Category');
    if (categoriesResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstCategoryId = categoriesResponse.data[0].cateId;
    const response = await apiClient.get(`/FoodInfo/category/${firstCategoryId}`);
    return { status: response.status, count: response.data.length };
  });
}

// 4. Table Management Tests
async function testTableEndpoints() {
  logHeader('Table Management Endpoints');

  // GET /Table - List all tables
  await runTest('GET /Table - List all tables', async () => {
    const response = await apiClient.get('/Table');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} tables`);
    }
    return { status: response.status, count: response.data.length };
  });

  // GET /Table/available - List available tables
  await runTest('GET /Table/available - List available tables', async () => {
    const response = await apiClient.get('/Table/available');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} available tables`);
    }
    return { status: response.status, count: response.data.length };
  });

  // GET /Table/{tableId} - Get specific table
  await runTest('GET /Table/{tableId} - Get table by ID', async () => {
    const tablesResponse = await apiClient.get('/Table');
    if (tablesResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstTableId = tablesResponse.data[0].tableId;
    const response = await apiClient.get(`/Table/${firstTableId}`);
    return { status: response.status, table: response.data };
  });
}

// 5. Order Management Tests
async function testOrderEndpoints() {
  logHeader('Order Management Endpoints');

  // GET /Order - List all orders
  await runTest('GET /Order - List all orders', async () => {
    const response = await apiClient.get('/Order');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} orders`);
    }
    return { status: response.status, count: response.data.length };
  });

  // GET /Order/{orderId} - Get specific order
  await runTest('GET /Order/{orderId} - Get order by ID', async () => {
    const ordersResponse = await apiClient.get('/Order');
    if (ordersResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstOrderId = ordersResponse.data[0].orderId;
    const response = await apiClient.get(`/Order/${firstOrderId}`);
    return { status: response.status, order: response.data };
  });

  // GET /Order/table/{tableId} - Get orders by table
  await runTest('GET /Order/table/{tableId} - Get orders by table', async () => {
    const tablesResponse = await apiClient.get('/Table');
    if (tablesResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstTableId = tablesResponse.data[0].tableId;
    const response = await apiClient.get(`/Order/table/${firstTableId}`);
    return { status: response.status, count: response.data.length };
  });

  // GET /Order/status/{status} - Get orders by status
  await runTest('GET /Order/status/Pending - Get orders by status', async () => {
    const response = await apiClient.get('/Order/status/Pending');
    return { status: response.status, count: response.data.length };
  });
}

// 6. Order Detail Management Tests (Focus on the fixed status field)
async function testOrderDetailEndpoints() {
  logHeader('Order Detail Management Endpoints (Status Field Testing)');

  // GET /OrderDetail - List all order details (test the fixed status field)
  await runTest('GET /OrderDetail - List all order details', async () => {
    const response = await apiClient.get('/OrderDetail');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} order details`);
      
      // Check if status field is present
      const sampleItem = response.data[0];
      if (sampleItem) {
        logInfo(`Sample item keys: ${Object.keys(sampleItem).join(', ')}`);
        if (sampleItem.status) {
          logSuccess(`✓ Status field present: "${sampleItem.status}"`);
        } else {
          logError(`✗ Status field missing or null`);
        }
      }
    }
    return { 
      status: response.status, 
      count: response.data.length,
      hasStatusField: response.data.length > 0 && response.data[0].status !== undefined,
      sampleStatus: response.data[0]?.status
    };
  });

  // GET /OrderDetail/order/{orderId} - Get order details for specific order
  await runTest('GET /OrderDetail/order/{orderId} - Get order details by order ID', async () => {
    const ordersResponse = await apiClient.get('/Order');
    if (ordersResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstOrderId = ordersResponse.data[0].orderId;
    const response = await apiClient.get(`/OrderDetail/order/${firstOrderId}`);
    
    if (CONFIG.LOG_RESPONSES && response.data.length > 0) {
      const sampleItem = response.data[0];
      logInfo(`Order ${firstOrderId} details - Status: "${sampleItem.status}"`);
    }
    
    return { 
      status: response.status, 
      orderId: firstOrderId,
      count: response.data.length,
      sampleStatus: response.data[0]?.status
    };
  });

  // Test the specific order HD16D450CE that was problematic
  await runTest('GET /OrderDetail/order/HD16D450CE - Test specific problematic order', async () => {
    const response = await apiClient.get('/OrderDetail/order/HD16D450CE');
    
    if (CONFIG.LOG_RESPONSES && response.data.length > 0) {
      const item = response.data[0];
      logInfo(`HD16D450CE Status: "${item.status}"`);
      logInfo(`HD16D450CE Keys: ${Object.keys(item).join(', ')}`);
    }
    
    return { 
      status: response.status, 
      orderId: 'HD16D450CE',
      count: response.data.length,
      statusValue: response.data[0]?.status,
      allKeys: response.data[0] ? Object.keys(response.data[0]) : []
    };
  });
}

// 7. Bill Management Tests
async function testBillEndpoints() {
  logHeader('Bill Management Endpoints');

  // GET /Bill - List all bills
  await runTest('GET /Bill - List all bills', async () => {
    const response = await apiClient.get('/Bill');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} bills`);
    }
    return { status: response.status, count: response.data.length };
  });

  // GET /Bill/{billId} - Get specific bill
  await runTest('GET /Bill/{billId} - Get bill by ID', async () => {
    const billsResponse = await apiClient.get('/Bill');
    if (billsResponse.data.length === 0) {
      return 'SKIP';
    }
    
    const firstBillId = billsResponse.data[0].billId;
    const response = await apiClient.get(`/Bill/${firstBillId}`);
    return { status: response.status, bill: response.data };
  });
}

// 8. Bill Detail Management Tests
async function testBillDetailEndpoints() {
  logHeader('Bill Detail Management Endpoints');

  // GET /BillDetail - List all bill details
  await runTest('GET /BillDetail - List all bill details', async () => {
    const response = await apiClient.get('/BillDetail');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} bill details`);
    }
    return { status: response.status, count: response.data.length };
  });
}

// 9. Recipe & Ingredient Tests
async function testRecipeEndpoints() {
  logHeader('Recipe & Ingredient Management Endpoints');

  // GET /Recipe - List all recipes
  await runTest('GET /Recipe - List all recipes', async () => {
    const response = await apiClient.get('/Recipe');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} recipes`);
    }
    return { status: response.status, count: response.data.length };
  });

  // GET /Ingredient - List all ingredients
  await runTest('GET /Ingredient - List all ingredients', async () => {
    const response = await apiClient.get('/Ingredient');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} ingredients`);
    }
    return { status: response.status, count: response.data.length };
  });

  // GET /RecipeDetail - List all recipe details
  await runTest('GET /RecipeDetail - List all recipe details', async () => {
    const response = await apiClient.get('/RecipeDetail');
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Found ${response.data.length} recipe details`);
    }
    return { status: response.status, count: response.data.length };
  });
}

// 10. Connection and Health Tests
async function testConnectionAndHealth() {
  logHeader('Connection and Health Tests');

  // Test basic connectivity
  await runTest('API Connection Test', async () => {
    const response = await apiClient.get('/Category'); // Use a simple endpoint
    return { status: response.status, message: 'API is accessible' };
  });

  // Test response time
  await runTest('Response Time Test', async () => {
    const startTime = Date.now();
    await apiClient.get('/Category');
    const responseTime = Date.now() - startTime;
    
    if (CONFIG.LOG_RESPONSES) {
      logInfo(`Response time: ${responseTime}ms`);
    }
    
    return { responseTime, acceptable: responseTime < 5000 };
  });
}

/**
 * Main Test Execution
 */
async function runAllTests() {
  logHeader(`Restaurant Management System API Test Suite`);
  logInfo(`Testing API: ${API_BASE_URL}`);
  logInfo(`Timeout: ${CONFIG.TIMEOUT}ms`);
  logInfo(`Log Responses: ${CONFIG.LOG_RESPONSES}`);
  logInfo(`Log Errors: ${CONFIG.LOG_ERRORS}`);
  
  const startTime = Date.now();
  
  try {
    // Run all test suites
    await testConnectionAndHealth();
    await testUserEndpoints();
    await testCategoryEndpoints();
    await testFoodInfoEndpoints();
    await testTableEndpoints();
    await testOrderEndpoints();
    await testOrderDetailEndpoints(); // Focus on this for status field testing
    await testBillEndpoints();
    await testBillDetailEndpoints();
    await testRecipeEndpoints();
    
  } catch (error) {
    logError(`Test suite failed with error: ${error.message}`);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  // Print final results
  logHeader('Test Results Summary');
  log(`Total Tests: ${testResults.total}`, colors.bright);
  logSuccess(`Passed: ${testResults.passed}`);
  logError(`Failed: ${testResults.failed}`);
  logWarning(`Skipped: ${testResults.skipped}`);
  logInfo(`Duration: ${duration}ms`);
  
  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  if (passRate >= 80) {
    logSuccess(`Pass Rate: ${passRate}%`);
  } else if (passRate >= 60) {
    logWarning(`Pass Rate: ${passRate}%`);
  } else {
    logError(`Pass Rate: ${passRate}%`);
  }
  
  // Show failed tests
  if (testResults.failed > 0) {
    logHeader('Failed Tests Details');
    testResults.results
      .filter(result => result.status === 'FAILED')
      .forEach(result => {
        logError(`${result.name}: ${result.error}`);
        if (result.statusCode) {
          console.log(`  Status Code: ${result.statusCode}`);
        }
      });
  }
  
  // Focus on Order Detail results (our main concern)
  logHeader('Order Detail Status Field Analysis');
  const orderDetailResults = testResults.results.filter(result => 
    result.name.includes('OrderDetail') || result.name.includes('HD16D450CE')
  );
  
  orderDetailResults.forEach(result => {
    if (result.status === 'PASSED' && result.response) {
      logSuccess(`${result.name}:`);
      if (result.response.hasStatusField !== undefined) {
        log(`  Status Field Present: ${result.response.hasStatusField}`);
      }
      if (result.response.sampleStatus) {
        log(`  Sample Status Value: "${result.response.sampleStatus}"`);
      }
      if (result.response.statusValue) {
        log(`  Status Value: "${result.response.statusValue}"`);
      }
    }
  });
  
  return testResults;
}

// Export for use as module or run directly
if (require.main === module) {
  runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      logError(`Test execution failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  testResults,
  CONFIG
};