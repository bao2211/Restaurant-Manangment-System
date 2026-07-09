import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

// Configuration
const API_CONFIGS = {
  local: 'http://localhost:5181/api',
  production: 'http://46.250.231.129:8080/api'
};

const APITestScreen = () => {
  const [currentAPI, setCurrentAPI] = useState('production');
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, skipped: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const API_BASE_URL = API_CONFIGS[currentAPI];

  // Test endpoints configuration
  const TEST_ENDPOINTS = [
    // CORS Tests (High Priority)
    { 
      group: 'CORS Tests', 
      name: 'CORS GET Test', 
      method: 'GET', 
      endpoint: '/Test',
      description: 'Test basic CORS with GET request',
      priority: 'high'
    },
    { 
      group: 'CORS Tests', 
      name: 'CORS POST Test', 
      method: 'POST', 
      endpoint: '/Test',
      body: { test: 'CORS Test Data', timestamp: new Date().toISOString() },
      description: 'Test CORS preflight with POST request',
      priority: 'high'
    },
    { 
      group: 'CORS Tests', 
      name: 'CORS Order Creation', 
      method: 'POST', 
      endpoint: '/Order',
      body: {
        orderId: 'HDCORSTEST',
        status: 'Pending',
        total: 1000,
        note: 'CORS Test Order',
        discount: 0,
        tableId: '1',
        userId: 'USER000001'
      },
      description: 'Test CORS with actual order creation',
      priority: 'high'
    },
    
    // Connection Test
    { 
      group: 'Connection', 
      name: 'API Connection', 
      method: 'GET', 
      endpoint: '/Category',
      description: 'Basic connectivity test'
    },
    
    // User Management
    { 
      group: 'User Management', 
      name: 'List Users', 
      method: 'GET', 
      endpoint: '/User',
      description: 'Get all users'
    },
    { 
      group: 'User Management', 
      name: 'User Login Test', 
      method: 'POST', 
      endpoint: '/User/login',
      body: { userName: 'admin', password: 'admin123' },
      description: 'Test login endpoint',
      expectedFail: true
    },

    // Category Management
    { 
      group: 'Category Management', 
      name: 'List Categories', 
      method: 'GET', 
      endpoint: '/Category',
      description: 'Get all categories'
    },

    // Food Information
    { 
      group: 'Food Information', 
      name: 'List Food Items', 
      method: 'GET', 
      endpoint: '/FoodInfo',
      description: 'Get all food items'
    },

    // Table Management
    { 
      group: 'Table Management', 
      name: 'List Tables', 
      method: 'GET', 
      endpoint: '/Table',
      description: 'Get all tables'
    },
    { 
      group: 'Table Management', 
      name: 'Available Tables', 
      method: 'GET', 
      endpoint: '/Table/available',
      description: 'Get available tables'
    },

    // Order Management
    { 
      group: 'Order Management', 
      name: 'List Orders', 
      method: 'GET', 
      endpoint: '/Order',
      description: 'Get all orders'
    },

    // Order Detail Management (Focus area)
    { 
      group: 'Order Detail Management', 
      name: 'List Order Details', 
      method: 'GET', 
      endpoint: '/OrderDetail',
      description: 'Get all order details - CHECK STATUS FIELD',
      priority: 'high'
    },
    { 
      group: 'Order Detail Management', 
      name: 'Order HD16D450CE Details', 
      method: 'GET', 
      endpoint: '/OrderDetail/order/HD16D450CE',
      description: 'Test specific problematic order',
      priority: 'high'
    },

    // Bill Management
    { 
      group: 'Bill Management', 
      name: 'List Bills', 
      method: 'GET', 
      endpoint: '/Bill',
      description: 'Get all bills'
    },
    { 
      group: 'Bill Management', 
      name: 'List Bill Details', 
      method: 'GET', 
      endpoint: '/BillDetail',
      description: 'Get all bill details'
    },

    // Recipe & Ingredients
    { 
      group: 'Recipe & Ingredients', 
      name: 'List Recipes', 
      method: 'GET', 
      endpoint: '/Recipe',
      description: 'Get all recipes'
    },
    { 
      group: 'Recipe & Ingredients', 
      name: 'List Ingredients', 
      method: 'GET', 
      endpoint: '/Ingredient',
      description: 'Get all ingredients'
    },
    { 
      group: 'Recipe & Ingredients', 
      name: 'List Recipe Details', 
      method: 'GET', 
      endpoint: '/RecipeDetail',
      description: 'Get all recipe details'
    }
  ];

  // HTTP Client
  const createApiClient = () => {
    return axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  };

  // Individual test execution
  const runSingleTest = async (testConfig) => {
    const client = createApiClient();
    const startTime = Date.now();
    
    try {
      let response;
      
      if (testConfig.method === 'GET') {
        response = await client.get(testConfig.endpoint);
      } else if (testConfig.method === 'POST') {
        response = await client.post(testConfig.endpoint, testConfig.body);
      }
      
      const duration = Date.now() - startTime;
      
      // Special handling for Order Detail endpoints to check status field
      let statusFieldInfo = null;
      if (testConfig.endpoint.includes('OrderDetail') && response.data && Array.isArray(response.data)) {
        const sampleItem = response.data[0];
        if (sampleItem) {
          statusFieldInfo = {
            hasStatusField: sampleItem.status !== undefined,
            statusValue: sampleItem.status,
            allKeys: Object.keys(sampleItem)
          };
        }
      }
      
      return {
        status: 'PASSED',
        statusCode: response.status,
        duration,
        dataCount: Array.isArray(response.data) ? response.data.length : 1,
        statusFieldInfo,
        response: response.data
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Handle expected failures (like login with wrong credentials)
      if (testConfig.expectedFail && error.response?.status === 401) {
        return {
          status: 'PASSED',
          statusCode: 401,
          duration,
          message: 'Expected failure (invalid credentials)'
        };
      }
      
      return {
        status: 'FAILED',
        statusCode: error.response?.status || 0,
        duration,
        error: error.message,
        errorDetails: error.response?.data
      };
    }
  };

  // Run CORS tests only
  const runCorsTestsOnly = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    setSummary({ total: 0, passed: 0, failed: 0, skipped: 0 });
    
    const corsTests = TEST_ENDPOINTS.filter(test => test.group === 'CORS Tests');
    const results = [];
    let passed = 0, failed = 0, skipped = 0;
    
    console.log('=== STARTING CORS-SPECIFIC TESTS ===');
    
    for (const testConfig of corsTests) {
      console.log(`Running CORS test: ${testConfig.name}`);
      const result = await runSingleTest(testConfig);
      
      const testResult = {
        ...testConfig,
        ...result,
        timestamp: new Date().toLocaleTimeString()
      };
      
      results.push(testResult);
      
      if (result.status === 'PASSED') {
        console.log(`✅ ${testConfig.name} - PASSED`);
        passed++;
      } else if (result.status === 'FAILED') {
        console.log(`❌ ${testConfig.name} - FAILED: ${result.error}`);
        failed++;
      } else {
        skipped++;
      }
      
      // Update state progressively
      setTestResults([...results]);
      setSummary({
        total: results.length,
        passed,
        failed,
        skipped
      });
    }
    
    console.log('=== CORS TESTS COMPLETED ===');
    console.log(`Results: ${passed} passed, ${failed} failed, ${skipped} skipped`);
    
    // Show alert with CORS results
    const corsStatus = failed === 0 ? 'CORS is working! ✅' : 'CORS is blocked! ❌';
    Alert.alert(
      'CORS Test Results',
      `${corsStatus}\n\nPassed: ${passed}\nFailed: ${failed}\nSkipped: ${skipped}\n\nCheck console for detailed logs.`,
      [{ text: 'OK' }]
    );
    
    setIsTestingAll(false);
  };

  // Run all tests
  const runAllTests = async () => {
    setIsTestingAll(true);
    setTestResults([]);
    setSummary({ total: 0, passed: 0, failed: 0, skipped: 0 });
    
    const results = [];
    let passed = 0, failed = 0, skipped = 0;
    
    for (const testConfig of TEST_ENDPOINTS) {
      const result = await runSingleTest(testConfig);
      
      const testResult = {
        ...testConfig,
        ...result,
        timestamp: new Date().toLocaleTimeString()
      };
      
      results.push(testResult);
      
      if (result.status === 'PASSED') passed++;
      else if (result.status === 'FAILED') failed++;
      else skipped++;
      
      // Update state progressively
      setTestResults([...results]);
      setSummary({
        total: results.length,
        passed,
        failed,
        skipped
      });
    }
    
    setIsTestingAll(false);
  };

  // Run single test
  const runIndividualTest = async (testConfig) => {
    const updatedResults = testResults.map(result => 
      result.name === testConfig.name 
        ? { ...result, status: 'RUNNING' }
        : result
    );
    setTestResults(updatedResults);
    
    const result = await runSingleTest(testConfig);
    
    const finalResults = testResults.map(result => 
      result.name === testConfig.name 
        ? { ...testConfig, ...result, timestamp: new Date().toLocaleTimeString() }
        : result
    );
    
    setTestResults(finalResults);
    
    // Update summary
    const newSummary = finalResults.reduce((acc, result) => {
      if (result.status === 'PASSED') acc.passed++;
      else if (result.status === 'FAILED') acc.failed++;
      else if (result.status === 'SKIPPED') acc.skipped++;
      return acc;
    }, { total: finalResults.length, passed: 0, failed: 0, skipped: 0 });
    
    setSummary(newSummary);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PASSED': return '#4CAF50';
      case 'FAILED': return '#F44336';
      case 'RUNNING': return '#FF9800';
      case 'SKIPPED': return '#9E9E9E';
      default: return '#757575';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'PASSED': return 'check-circle';
      case 'FAILED': return 'close-circle';
      case 'RUNNING': return 'loading';
      case 'SKIPPED': return 'minus-circle';
      default: return 'help-circle';
    }
  };

  // Toggle API endpoint
  const toggleAPI = () => {
    setCurrentAPI(currentAPI === 'production' ? 'local' : 'production');
    setTestResults([]);
    setSummary({ total: 0, passed: 0, failed: 0, skipped: 0 });
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    setTestResults([]);
    setSummary({ total: 0, passed: 0, failed: 0, skipped: 0 });
    setRefreshing(false);
  };

  // Group tests by category
  const groupedTests = TEST_ENDPOINTS.reduce((groups, test) => {
    if (!groups[test.group]) {
      groups[test.group] = [];
    }
    groups[test.group].push(test);
    return groups;
  }, {});

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>API Endpoint Tests</Text>
        <Text style={styles.subtitle}>Restaurant Management System</Text>
      </View>

      {/* API Configuration */}
      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <TouchableOpacity style={styles.configItem} onPress={toggleAPI}>
          <Text style={styles.configLabel}>Current API:</Text>
          <Text style={[styles.configValue, { color: currentAPI === 'local' ? '#4CAF50' : '#2196F3' }]}>
            {currentAPI.toUpperCase()}
          </Text>
        </TouchableOpacity>
        <Text style={styles.configUrl}>{API_BASE_URL}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsSection}>
        <TouchableOpacity 
          style={[styles.button, styles.corsButton]} 
          onPress={runCorsTestsOnly}
          disabled={isTestingAll}
        >
          <MaterialCommunityIcons name="shield-check" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Test CORS Only</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={runAllTests}
          disabled={isTestingAll}
        >
          {isTestingAll ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <MaterialCommunityIcons name="play-circle" size={20} color="#FFFFFF" />
          )}
          <Text style={styles.buttonText}>
            {isTestingAll ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {summary.total > 0 && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Test Results Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{summary.total}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#4CAF50' }]}>{summary.passed}</Text>
              <Text style={styles.summaryLabel}>Passed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#F44336' }]}>{summary.failed}</Text>
              <Text style={styles.summaryLabel}>Failed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#9E9E9E' }]}>{summary.skipped}</Text>
              <Text style={styles.summaryLabel}>Skipped</Text>
            </View>
          </View>
          
          {summary.total > 0 && (
            <View style={styles.passRateContainer}>
              <Text style={styles.passRateText}>
                Pass Rate: {((summary.passed / summary.total) * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Test Results */}
      {Object.keys(groupedTests).map(groupName => (
        <View key={groupName} style={styles.testGroup}>
          <Text style={styles.groupTitle}>{groupName}</Text>
          
          {groupedTests[groupName].map((test, index) => {
            const result = testResults.find(r => r.name === test.name);
            
            return (
              <View key={`${groupName}-${index}`} style={styles.testItem}>
                <TouchableOpacity 
                  style={styles.testHeader}
                  onPress={() => runIndividualTest(test)}
                  disabled={isTestingAll}
                >
                  <View style={styles.testInfo}>
                    <View style={styles.testTitleRow}>
                      <Text style={[
                        styles.testName,
                        test.priority === 'high' && styles.highPriorityTest
                      ]}>
                        {test.name}
                        {test.priority === 'high' && ' ⭐'}
                      </Text>
                      <MaterialCommunityIcons 
                        name={getStatusIcon(result?.status || 'help-circle')} 
                        size={20} 
                        color={getStatusColor(result?.status || 'default')} 
                      />
                    </View>
                    <Text style={styles.testDescription}>{test.description}</Text>
                    <Text style={styles.testMethod}>
                      {test.method} {test.endpoint}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {result && result.status !== 'RUNNING' && (
                  <View style={styles.testResult}>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>Status:</Text>
                      <Text style={[styles.resultValue, { color: getStatusColor(result.status) }]}>
                        {result.status}
                      </Text>
                    </View>
                    
                    {result.statusCode && (
                      <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>HTTP:</Text>
                        <Text style={styles.resultValue}>{result.statusCode}</Text>
                      </View>
                    )}
                    
                    {result.duration && (
                      <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Duration:</Text>
                        <Text style={styles.resultValue}>{result.duration}ms</Text>
                      </View>
                    )}
                    
                    {result.dataCount !== undefined && (
                      <View style={styles.resultRow}>
                        <Text style={styles.resultLabel}>Records:</Text>
                        <Text style={styles.resultValue}>{result.dataCount}</Text>
                      </View>
                    )}
                    
                    {/* Special Order Detail Status Field Info */}
                    {result.statusFieldInfo && (
                      <View style={styles.statusFieldInfo}>
                        <Text style={styles.statusFieldTitle}>Status Field Analysis:</Text>
                        <View style={styles.resultRow}>
                          <Text style={styles.resultLabel}>Has Status Field:</Text>
                          <Text style={[
                            styles.resultValue, 
                            { color: result.statusFieldInfo.hasStatusField ? '#4CAF50' : '#F44336' }
                          ]}>
                            {result.statusFieldInfo.hasStatusField ? 'YES ✓' : 'NO ✗'}
                          </Text>
                        </View>
                        {result.statusFieldInfo.statusValue && (
                          <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Status Value:</Text>
                            <Text style={styles.resultValue}>"{result.statusFieldInfo.statusValue}"</Text>
                          </View>
                        )}
                        <View style={styles.resultRow}>
                          <Text style={styles.resultLabel}>All Keys:</Text>
                          <Text style={styles.resultValue}>
                            {result.statusFieldInfo.allKeys?.join(', ')}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {result.error && (
                      <View style={styles.errorInfo}>
                        <Text style={styles.errorText}>Error: {result.error}</Text>
                      </View>
                    )}
                    
                    {result.message && (
                      <Text style={styles.messageText}>{result.message}</Text>
                    )}
                    
                    {result.timestamp && (
                      <Text style={styles.timestampText}>Tested at: {result.timestamp}</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  configSection: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  configLabel: {
    fontSize: 16,
    color: '#666',
  },
  configValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  configUrl: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  controlsSection: {
    margin: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  corsButton: {
    backgroundColor: '#FF5722',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  passRateContainer: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  passRateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  testGroup: {
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#607D8B',
    padding: 15,
  },
  testItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  testHeader: {
    padding: 15,
  },
  testInfo: {
    flex: 1,
  },
  testTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  testName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  highPriorityTest: {
    color: '#FF5722',
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  testMethod: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  testResult: {
    backgroundColor: '#F5F5F5',
    padding: 15,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusFieldInfo: {
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  statusFieldTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  errorInfo: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
  },
  messageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  timestampText: {
    fontSize: 10,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
});

export default APITestScreen;