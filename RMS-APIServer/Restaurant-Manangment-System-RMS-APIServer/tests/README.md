# Test Files

This folder contains all testing resources for the RMS API Server, including Postman collections, HTML tests, and automated test scripts.

## 📁 Folder Structure

```
tests/
├── postman/                      # Postman API test collections
│   ├── Auxiliary_Features_API_Tests.postman_collection.json
│   ├── BillManager_API_Tests.postman_collection.json
│   └── Quick_API_Tests.postman_collection.json
├── api-test.html                 # Generic API test page
├── api-test-jwt-fix.html         # JWT authentication test
├── test-fixed-api.html           # Fixed API endpoints test
├── cors-test.html                # Basic CORS test
├── cors-test-comprehensive.html  # Comprehensive CORS test
├── cors-test-enhanced.html       # Enhanced CORS test
├── cors-test-local.html          # Local CORS test
├── cors-test-orders.html         # Orders endpoint CORS test
└── README.md                     # This file
```

## 🎯 Test Suite Components

### 1. Postman Collections (in `postman/` folder)

- **Purpose**: Professional API testing and documentation
- **Features**: Organized test suites, environment variables, automated test scripts
- **Best for**: API documentation, team collaboration, regression testing

### 2. HTML Browser Test Pages

- **Purpose**: Quick browser-based endpoint testing
- **Features**: Real-time results in browser console, easy debugging
- **Best for**: Development testing, CORS verification, quick checks

### 3. Original Test Suite (below)

- **Purpose**: Browser-based testing with visual interface
- **Features**: Interactive UI, real-time updates, export functionality
- **Best for**: Manual testing, demonstrations, cross-platform compatibility

## 🚀 Quick Start

### Option 1: Command Line Testing (Recommended)

```bash
# Navigate to the tests directory
cd tests

# Install dependencies
npm install

# Run all tests against production API
npm test

# Run tests against local API
npm run test:local

# Run tests against production API
npm run test:production
```

### Option 2: Browser Testing

1. Open `tests/api-test.html` in any modern web browser
2. Select your API environment (Production/Local/Custom)
3. Click "Run All Tests"
4. Monitor results in real-time

### Option 3: React Native Integration

1. Import the test screen:

```javascript
import APITestScreen from "./screens/APITestScreen";
```

2. Add to your navigation or tab system:

```javascript
// In your navigator
<Tab.Screen
  name="APITests"
  component={APITestScreen}
  options={{ title: "API Tests" }}
/>
```

## 📊 Test Coverage

### Core Endpoints Tested

| Category                    | Endpoints                                     | Priority        |
| --------------------------- | --------------------------------------------- | --------------- |
| **Connection**              | Basic connectivity                            | High            |
| **User Management**         | List users, Login test                        | Medium          |
| **Category Management**     | List categories, Get by ID                    | Medium          |
| **Food Information**        | List foods, Get by ID, By category            | Medium          |
| **Table Management**        | List tables, Available tables, Get by ID      | Medium          |
| **Order Management**        | List orders, Get by ID, By table, By status   | High            |
| **Order Detail Management** | **List details, Specific order (HD16D450CE)** | **🔥 Critical** |
| **Bill Management**         | List bills, Get by ID, Bill details           | Medium          |
| **Recipe & Ingredients**    | List recipes, ingredients, recipe details     | Low             |

### 🎯 Status Field Testing Focus

The test suite pays special attention to Order Detail endpoints:

- **Bulk Order Details** (`GET /api/OrderDetail`)

  - ✅ Checks if status field is present
  - ✅ Validates status field values
  - ✅ Reports missing status fields

- **Specific Order Details** (`GET /api/OrderDetail/order/{orderId}`)
  - ✅ Tests the problematic HD16D450CE order
  - ✅ Compares bulk vs specific endpoint responses
  - ✅ Validates status field consistency

## 🔧 Configuration Options

### API Endpoints

- **Production**: `http://46.250.231.129:8080/api`
- **Local**: `http://localhost:5181/api`
- **Custom**: Configure your own endpoint

### Test Parameters

- **Timeout**: 10 seconds (configurable)
- **Retry Logic**: Built-in error handling
- **Logging**: Detailed success/failure reporting

## 📈 Understanding Results

### Status Field Analysis

When testing Order Detail endpoints, the suite provides:

```javascript
{
  "hasStatusField": true,          // ✅ Status field exists
  "statusValue": "Hoàn tất",      // ✅ Actual status value
  "allKeys": ["foodId", "foodName", "orderId", "quantity", "unitPrice", "status"]
}
```

### Test Result Status

- **✅ PASSED**: Endpoint works correctly
- **❌ FAILED**: Endpoint returned error
- **⚠️ SKIPPED**: Test was skipped (no data available)
- **🔄 RUNNING**: Test in progress

### Pass Rate Interpretation

- **80%+**: Excellent - API is stable
- **60-79%**: Good - Minor issues exist
- **<60%**: Needs attention - Multiple endpoints failing

## 🐛 Troubleshooting

### Common Issues

#### 1. Connection Refused

```
Error: connect ECONNREFUSED
```

**Solution**: Check if API server is running and accessible

#### 2. CORS Errors (Browser)

```
Access to fetch blocked by CORS policy
```

**Solution**: Ensure API server allows cross-origin requests

#### 3. Timeout Errors

```
Error: timeout of 10000ms exceeded
```

**Solution**: Increase timeout or check network connectivity

#### 4. Missing Status Field

```
hasStatusField: false
```

**Solution**: Verify backend fix is deployed and status field is not NULL

### Debug Mode

Enable detailed logging:

```javascript
// In Node.js test
CONFIG.LOG_RESPONSES = true;
CONFIG.LOG_ERRORS = true;

// In browser test
// Check browser console for detailed logs
```

## 📋 Test Checklist

Before considering the status field issue resolved:

- [ ] **Connection Test**: Basic API connectivity works
- [ ] **Bulk Order Details**: `/api/OrderDetail` returns status field
- [ ] **Specific Order Details**: `/api/OrderDetail/order/{orderId}` returns status field
- [ ] **HD16D450CE Test**: Specific problematic order shows correct status
- [ ] **Status Values**: Status field contains valid Vietnamese values
- [ ] **Consistency**: Both endpoints return same status for same order

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "16"
      - run: cd tests && npm install
      - run: cd tests && npm test
```

### Jenkins Example

```groovy
pipeline {
    agent any
    stages {
        stage('API Tests') {
            steps {
                dir('tests') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }
    }
}
```

## 📊 Reporting

### JSON Export Format

```json
{
  "timestamp": "2025-09-28T10:00:00.000Z",
  "apiUrl": "http://46.250.231.129:8080/api",
  "summary": {
    "total": 15,
    "passed": 13,
    "failed": 2
  },
  "results": [
    {
      "name": "List Order Details",
      "status": "PASSED",
      "statusCode": 200,
      "duration": 234,
      "statusFieldInfo": {
        "hasStatusField": true,
        "statusValue": "Hoàn tất",
        "allKeys": [
          "foodId",
          "foodName",
          "orderId",
          "quantity",
          "unitPrice",
          "status"
        ]
      }
    }
  ]
}
```

## 🤝 Contributing

To add new test cases:

1. Add endpoint configuration to `testEndpoints` array
2. Implement special handling if needed
3. Update documentation
4. Test with all three test methods

## 📞 Support

If tests fail consistently:

1. Check API server status
2. Verify network connectivity
3. Review backend logs
4. Confirm database status field values
5. Test with different environments

---

**Happy Testing! 🎉**

_This test suite was created to ensure the Restaurant Management System API is robust, reliable, and delivers the status field correctly for order management operations._
