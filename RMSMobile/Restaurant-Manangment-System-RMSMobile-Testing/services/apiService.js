import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://46.250.231.129:8080/'; // Remote server URL
// For local testing use: 'https://localhost:7127/' or 'http://localhost:8080/'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increase timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Remove client-side CORS headers as they can interfere
    // 'Access-Control-Allow-Origin': '*', // This should only be set by server
    // 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Server-side only
    // 'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization', // Server-side only
    
    // Add proper request headers
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache',
  },
  // CORS and network handling configuration
  withCredentials: false, // Set to false for wildcard CORS
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Only treat 2xx as success, not 400+ errors
  },
});

// Add request interceptor for better error handling
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for CORS error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received: ${response.status} ${response.statusText}`);
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Network/CORS Error - This might be a CORS issue');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        }
      });
    } else if (error.response) {
      console.error(`❌ HTTP Error: ${error.response.status} ${error.response.statusText}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error('❌ Unknown error:', error.message);
    }
    return Promise.reject(error);
  }
);

const ID_FIELDS = new Set([
  'billId',
  'cateId',
  'foodId',
  'ingreId',
  'orderDetailId',
  'orderId',
  'recipeId',
  'tableId',
  'userId',
]);

const STRING_FIELDS = new Set([
  ...ID_FIELDS,
  'billName',
  'cateName',
  'description',
  'foodImage',
  'foodName',
  'note',
  'payment',
  'role',
  'status',
  'tableName',
  'userName',
]);

const INTEGER_FIELDS = new Set([
  'numOfSeats',
  'quantity',
  'stock',
]);

const DECIMAL_FIELDS = new Set([
  'discount',
  'lineTotal',
  'price',
  'total',
  'totalFinal',
  'totalAmount',
  'unitPrice',
]);

const normalizeKeyName = (key) => {
  if (!key || typeof key !== 'string') {
    return key;
  }

  let normalized = key
    .replace(/\$+/g, '')
    .replace(/\[(.*?)]/g, '$1')
    .replace(/ID/g, 'Id')
    .replace(/URL/g, 'Url');

  normalized = normalized
    .replace(/[-_\s]+([a-zA-Z0-9])/g, (_, char) => char.toUpperCase());

  if (normalized.length === 0) {
    return key;
  }

  const result = normalized.charAt(0).toLowerCase() + normalized.slice(1);
  
  // Debug log for status field normalization
  if (key.toLowerCase().includes('status')) {
    console.log('normalizeKeyName:', key, '->', result);
  }
  
  return result;
};

const normalizeRecordKeys = (input) => {
  if (Array.isArray(input)) {
    return input.map(normalizeRecordKeys);
  }

  if (!input || typeof input !== 'object') {
    return input;
  }

  const normalized = {};

  Object.entries(input).forEach(([rawKey, rawValue]) => {
    if (rawKey === '$ref' || rawKey === '$id') {
      return;
    }

    const key = normalizeKeyName(rawKey);
    const value = normalizeRecordKeys(rawValue);

    if (normalized[key] === undefined || normalized[key] === null || normalized[key] === '') {
      normalized[key] = value;
    }
  });

  return normalized;
};

const coerceFieldValue = (key, value) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (ID_FIELDS.has(key)) {
    return value.toString().trim();
  }

  if (STRING_FIELDS.has(key) && typeof value === 'string') {
    return value.trim();
  }

  if (INTEGER_FIELDS.has(key)) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (DECIMAL_FIELDS.has(key)) {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (key === 'status' && typeof value === 'string') {
    // Debug log for status field processing
    console.log('coerceFieldValue processing status:', value, 'trimmed:', value.trim());
    return value.trim();
  }

  return value;
};

const sanitizeRecord = (record) => {
  if (Array.isArray(record)) {
    return record.map(sanitizeRecord);
  }

  if (!record || typeof record !== 'object') {
    return record;
  }

  const sanitized = {};

  Object.entries(record).forEach(([key, value]) => {
    const sanitizedValue = sanitizeRecord(value);
    sanitized[key] = coerceFieldValue(key, sanitizedValue);
  });

  return sanitized;
};

// Helper function to extract data from API response
// Helper function to normalize order detail status values
const normalizeOrderDetailStatus = (status) => {
  console.log('API normalizeOrderDetailStatus called with:', status, 'type:', typeof status);
  
  if (!status) {
    console.log('API: Status is falsy, returning Chưa làm');
    return 'Chưa làm';
  }
  
  // Handle various string cleaning issues
  let cleaned = status.toString()
    .trim()                           // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ')            // Normalize internal whitespace
    .replace(/[^\u0000-\u007F]/g, (char) => char.normalize('NFC')); // Normalize Unicode
  
  const normalized = cleaned.normalize('NFC').toLowerCase();
  console.log('API: Original:', status, 'Cleaned:', cleaned, 'Normalized:', normalized);
  
  // Map common API status variations to proper Vietnamese status
  const statusMap = {
    'chưa làm': 'Chưa làm',
    'chua lam': 'Chưa làm',
    'not started': 'Chưa làm',  
    'pending': 'Chưa làm',
    
    'đang chuẩn bị': 'Đang chuẩn bị',
    'dang chuan bi': 'Đang chuẩn bị',
    'preparing': 'Đang chuẩn bị',
    'in progress': 'Đang chuẩn bị',
    'đang xử lý': 'Đang chuẩn bị',
    'dang xu ly': 'Đang chuẩn bị',
    
    'sẵn sàng': 'Sẵn sàng',
    'san sang': 'Sẵn sàng',
    'ready': 'Sẵn sàng',
    
    'đã phục vụ': 'Đã phục vụ',
    'da phuc vu': 'Đã phục vụ',
    'served': 'Đã phục vụ',
    
    'hoàn tất': 'Hoàn tất',
    'hoan tat': 'Hoàn tất',
    'completed': 'Hoàn tất',
    'done': 'Hoàn tất',
    
    'hủy': 'Hủy',
    'huy': 'Hủy',
    'cancelled': 'Hủy',
    'canceled': 'Hủy'
  };
  
  // Check direct match first (preserve exact casing)
  const validStatuses = new Set([
    'Chưa làm', 'Đang chuẩn bị', 'Sẵn sàng', 
    'Đã phục vụ', 'Hoàn tất', 'Hủy'
  ]);
  
  if (validStatuses.has(cleaned)) {
    console.log('API: Direct match found:', cleaned);
    return cleaned;
  }
  
  // Try mapped status
  const mappedStatus = statusMap[normalized];
  console.log('API: Mapped status result:', mappedStatus);
  if (mappedStatus) {
    console.log('API: Returning mapped status:', mappedStatus);
    return mappedStatus;
  }
  
  // Default fallback
  console.warn('API: Unknown order detail status:', status, 'cleaned:', cleaned, 'normalized:', normalized, 'defaulting to Chưa làm');
  return 'Chưa làm';
};

const extractApiData = (data) => {
  console.log('extractApiData - Input data:', data);

  // Handle regular array responses (new clean API format)
  if (Array.isArray(data)) {
    console.log('Found direct array with length:', data.length);

    const processed = data
      .filter((item) => item && typeof item === 'object' && !item.$ref)
      .map(normalizeRecordKeys)
      .map(sanitizeRecord)
      .filter((item) => {
        const hasKnownId = Array.from(ID_FIELDS).some((field) => !!item[field]);
        const hasName = item.foodName || item.cateName || item.tableName || item.userName;
        const hasFallbackId = item.id || item.name;
        const isValid = hasKnownId || hasName || hasFallbackId;

        if (!isValid) {
          console.log('Filtering out invalid item after normalization:', item);
        }

        return isValid;
      });

    console.log('extractApiData - Processed items:', processed.length);
    console.log('extractApiData - Sample processed item:', processed[0]);
    return processed;
  }

  // Handle legacy cases where API returns data wrapped in $values (fallback)
  if (data && data.$values && Array.isArray(data.$values)) {
    console.log('Found legacy $values array with length:', data.$values.length);
    return extractApiData(data.$values); // Recursively process the $values array
  }

  // Handle single object responses
  if (data && typeof data === 'object' && !data.$ref) {
    console.log('extractApiData - Single object response');
    return sanitizeRecord(normalizeRecordKeys(data));
  }

  // Handle empty or invalid responses
  console.log('extractApiData - Invalid or empty response');
  return [];
};

// API service object containing all our API calls
export const apiService = {
  // Alternative test using fetch with CORS handling
  testWithFetch: async () => {
    try {
      console.log('Testing with native fetch API...');
      const url = `${API_BASE_URL}api/Category`;
      console.log('Fetch URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors', // Explicitly enable CORS
        credentials: 'omit', // Don't send credentials for CORS wildcard
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response ok:', response.ok);
      console.log('Fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch successful - data preview:', JSON.stringify(data).substring(0, 200));
        return { success: true, data };
      } else {
        const errorText = await response.text();
        console.error('Fetch failed with status:', response.status);
        console.error('Error response:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      console.error('Fetch test failed:', error);
      
      // Provide more specific error messages for CORS issues
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return { success: false, error: 'CORS or Network Error: Unable to connect to server' };
      }
      
      return { success: false, error: error.message };
    }
  },

  // Test connectivity
  testConnection: async () => {
    try {
      console.log('Testing API connection to:', API_BASE_URL);
      console.log('Full URL being tested:', `${API_BASE_URL}api/Category`);
      
      // Try a simple GET request
      const response = await api.get('/api/Category');
      console.log('Connection test successful - Status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data preview:', JSON.stringify(response.data).substring(0, 200));
      return true;
    } catch (error) {
      console.error('Connection test failed - Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.response?.status);
      console.error('Error response:', error.response?.data);
      
      // Try to provide more specific error information
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        console.error('This is a network connectivity issue');
      } else if (error.code === 'TIMEOUT') {
        console.error('Request timed out');
      } else if (error.response?.status) {
        console.error(`Server responded with status: ${error.response.status}`);
      }
      
      return false;
    }
  },

  // Test what endpoints are available for order details
  testOrderDetailEndpoints: async () => {
    const testEndpoints = [
      '/api/OrderDetail',                    // Current bulk endpoint
      '/api/OrderDetail?includeStatus=true', // Maybe status is optional
      '/api/OrderDetailWithStatus',          // Maybe different endpoint name
      '/api/OrderDetails',                   // Plural version
      '/api/Order/HD16D450CE/details',       // Nested under order
      '/api/OrderDetail/order/HD16D450CE',   // As documented
      '/api/OrderDetail/HD16D450CE',         // Direct by order ID
    ];

    console.log('=== TESTING AVAILABLE ORDER DETAIL ENDPOINTS ===');
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing: ${endpoint}`);
        const response = await api.get(endpoint);
        console.log(`✓ ${endpoint} - Status: ${response.status}, Items: ${Array.isArray(response.data) ? response.data.length : 'not array'}`);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          const sample = response.data[0];
          console.log(`  Sample keys: ${Object.keys(sample).join(', ')}`);
          if (sample.orderId === 'HD16D450CE' || sample.OrderID === 'HD16D450CE') {
            console.log(`  ✓ Found HD16D450CE in response!`);
            console.log(`  Sample item:`, sample);
          }
        }
      } catch (error) {
        console.log(`✗ ${endpoint} - ${error.response?.status || error.message}`);
      }
    }
  },

  // Categories
  getCategories: async () => {
    try {
      console.log('Fetching categories from API...');
      const response = await api.get('/api/Category');
      console.log('Raw categories response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted categories data:', extractedData);
      console.log('Number of categories:', extractedData.length);
      return extractedData;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getCategoryById: async (categoryId) => {
    try {
      const response = await api.get(`/api/Category/${categoryId}`);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Food Items
  getAllFoodItems: async () => {
    try {
      console.log('Fetching all food items from API...');
      const response = await api.get('/api/FoodInfo');
      console.log('Raw food items response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted food items:', extractedData);
      console.log('Number of food items:', extractedData?.length || 0);
      return extractedData;
    } catch (error) {
      console.error('Error fetching food items:', error);
      throw error;
    }
  },

  getFoodItemById: async (foodId) => {
    try {
      console.log('getFoodItemById - Fetching food item for ID:', foodId);
      const response = await api.get(`/api/FoodInfo/${foodId}`);
      console.log('getFoodItemById - Raw response:', response.data);
      
      // For single item requests, the API might return the object directly
      // or wrapped in the $values structure
      let foodItem = null;
      
      if (response.data) {
        if (response.data.$values && Array.isArray(response.data.$values)) {
          // If wrapped in $values array, take the first item
          foodItem = response.data.$values[0];
        } else if (Array.isArray(response.data)) {
          // If it's a direct array
          foodItem = response.data[0];
        } else if (typeof response.data === 'object') {
          // If it's a direct object
          foodItem = response.data;
        }
      }
      
      console.log('getFoodItemById - Processed food item:', foodItem);
      return foodItem;
    } catch (error) {
      console.error('Error fetching food item:', error);
      throw error;
    }
  },

  getFoodItemsByCategory: async (categoryId) => {
    try {
      console.log('Fetching food items for category:', categoryId);
      
      // Use the direct category endpoint that returns all items properly
      // Trim the category ID to match API format
      const trimmedCategoryId = categoryId.trim();
      const response = await api.get(`/api/FoodInfo/category/${trimmedCategoryId}`);
      console.log('Raw food items response for category:', response.data);
      
      const extractedMainItems = extractApiData(response.data);
      console.log('Main extracted items:', extractedMainItems);
      
      // Try to get nested items from category data
      if (response.data && response.data.$values && response.data.$values.length > 0) {
        const categoryData = response.data.$values[0]; // First item is the main category object
        
        if (categoryData && categoryData.cate && categoryData.cate.foodInfos && categoryData.cate.foodInfos.$values) {
          console.log('Found nested food items in category data');
          const nestedFoodItems = categoryData.cate.foodInfos.$values;
          
          // Filter out $ref objects and get actual food objects
          const actualNestedItems = nestedFoodItems.filter(item => 
            item && 
            typeof item === 'object' && 
            !item.$ref && 
            item.foodId
          );
          
          console.log('Extracted nested food items:', actualNestedItems);
          console.log('Number of nested food items:', actualNestedItems.length);
          
          // If we have actual nested items, use them
          if (actualNestedItems.length > 0) {
            return actualNestedItems;
          }
          
          // If nested items are only references, use the main extracted items
          console.log('Nested items are only references, using main extracted items');
        }
      }
      
      // Use the main extracted items (this handles single items or when nested approach fails)
      console.log('Using main extracted items:', extractedMainItems);
      console.log('Number of main extracted items:', extractedMainItems.length);
      
      return extractedMainItems;
      
    } catch (error) {
      console.error('Error fetching food items by category:', error);
      throw error;
    }
  },

  // Tables
  getAllTables: async () => {
    try {
      console.log('Fetching tables from API...');
      const response = await api.get('/api/Table');
      console.log('Raw tables response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted tables data:', extractedData);
      console.log('Number of tables:', extractedData?.length || 0);
      return extractedData;
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  },

  createTable: async (tableData) => {
    try {
      console.log('Creating new table with data:', tableData);
      
      // Test connection first
      const connectionTest = await apiService.testConnection();
      if (!connectionTest) {
        throw new Error('Cannot connect to API server');
      }
      
      const response = await api.post('/api/Table', tableData);
      console.log('Create table response status:', response.status);
      console.log('Create table response data:', response.data);
      
      // Return the created table data
      return response.data;
    } catch (error) {
      console.error('Error creating table - Full error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        throw new Error('Invalid table data. Please check all fields.');
      } else if (error.response?.status === 409) {
        throw new Error('Table ID already exists. Please use a different ID.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      } else {
        throw new Error(error.response?.data?.detail || error.message || 'Failed to create table');
      }
    }
  },

  updateTable: async (tableId, tableData) => {
    try {
      console.log('Updating table:', tableId, tableData);
      const response = await api.put(`/api/Table/${tableId}`, tableData);
      console.log('Update table response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating table:', error);
      throw error;
    }
  },

  getAvailableTables: async () => {
    try {
      console.log('Fetching available tables from API...');
      const response = await api.get('/api/Table/available');
      console.log('Raw available tables response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted available tables data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching available tables:', error);
      throw error;
    }
  },

  // Orders - with fallback for backend issues
  getAllOrders: async () => {
    try {
      console.log('Fetching all orders from API...');
      const response = await api.get('/api/Order');
      console.log('Raw orders response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted orders data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      
      // Check if it's a 500 server error (database issue)
      if (error.response?.status === 500) {
        console.warn('⚠️ Orders endpoint has a database issue (500 error). Returning empty array as fallback.');
        return []; // Return empty array instead of crashing the app
      }
      
      // For other errors (like CORS), still throw
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      console.log('Fetching order by ID:', orderId);
      const response = await api.get(`/api/Order/${orderId}`);
      console.log('Raw order response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  getOrdersByTable: async (tableId) => {
    try {
      console.log('Fetching orders for table:', tableId);
      const response = await api.get(`/api/Order/table/${tableId}`);
      console.log('Raw orders for table response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching orders for table:', error);
      throw error;
    }
  },

  getOrdersByUser: async (userId) => {
    try {
      console.log('Fetching orders for user:', userId);
      const response = await api.get(`/api/Order/user/${userId}`);
      console.log('Raw orders for user response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  getOrdersByStatus: async (status) => {
    try {
      console.log('Fetching orders by status:', status);
      const response = await api.get(`/api/Order/status/${status}`);
      console.log('Raw orders by status response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      console.log('Creating order:', orderData);
      const response = await api.post('/api/Order', orderData);
      console.log('Create order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  updateOrder: async (orderId, orderData) => {
    try {
      console.log('Updating order:', orderId, orderData);
      const response = await api.put(`/api/Order/${orderId}`, orderData);
      console.log('Update order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      console.log('Deleting order:', orderId);
      const response = await api.delete(`/api/Order/${orderId}`);
      console.log('Delete order response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  // CORS-aware order submission with fallback to fetch
  createOrderWithCorsHandling: async (orderData) => {
    console.log('=== ATTEMPTING CORS-AWARE ORDER SUBMISSION ===');
    console.log('Order data to submit:', orderData);
    
    // First try with axios
    try {
      console.log('Trying with axios...');
      const response = await api.post('/api/Order', orderData);
      console.log('Axios request successful:', response.data);
      return response.data;
    } catch (axiosError) {
      console.log('Axios failed, error:', axiosError.message);
      console.log('Axios error response:', axiosError.response?.data);
      console.log('Axios error status:', axiosError.response?.status);
      
      // If it's a validation error (400), log the specific errors
      if (axiosError.response?.status === 400 && axiosError.response?.data?.errors) {
        console.log('=== VALIDATION ERRORS ===');
        console.log('Validation errors:', axiosError.response.data.errors);
        Object.keys(axiosError.response.data.errors).forEach(field => {
          console.log(`${field}:`, axiosError.response.data.errors[field]);
        });
      }
      
      // If it's a CORS or network error, try with native fetch
      if (axiosError.message === 'Network Error' || axiosError.code === 'ERR_NETWORK') {
        console.log('Trying with native fetch API as fallback...');
        
        try {
          const fetchResponse = await fetch(`${API_BASE_URL}api/Order`, {
            method: 'POST',
            mode: 'cors', // Explicitly set CORS mode
            credentials: 'omit', // Don't send credentials for CORS wildcard
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
              // Remove client-side CORS headers
              // 'Access-Control-Allow-Origin': '*', // This should only be set by server
            },
            body: JSON.stringify(orderData),
          });
          
          console.log('Fetch response status:', fetchResponse.status);
          console.log('Fetch response headers:', fetchResponse.headers);
          
          if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            console.error('Fetch response not ok:', errorText);
            throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
          }
          
          const responseData = await fetchResponse.json();
          console.log('Fetch request successful:', responseData);
          return responseData;
          
        } catch (fetchError) {
          console.error('Fetch also failed:', fetchError.message);
          throw new Error(`Both axios and fetch failed. Original error: ${axiosError.message}. Fetch error: ${fetchError.message}`);
        }
      } else {
        // Re-throw non-CORS errors
        throw axiosError;
      }
    }
  },



  // Order Details - with fallback for backend issues
  getAllOrderDetails: async () => {
    try {
      console.log('Fetching all order details from API...');
      const response = await api.get('/api/OrderDetail');
      console.log('Raw order details response:', response.data);
      
      // Check raw response for specific order
      if (Array.isArray(response.data)) {
        const targetRaw = response.data.find(item => 
          item && (item.orderId === 'HD16D450CE' || item.OrderID === 'HD16D450CE' || 
                   (item.orderId && item.orderId.includes('HD16D450CE')) ||
                   (item.OrderID && item.OrderID.includes('HD16D450CE')))
        );
        if (targetRaw) {
          console.log('=== RAW API RESPONSE FOR HD16D450CE ===');
          console.log('Raw item:', targetRaw);
          console.log('All keys in raw item:', Object.keys(targetRaw));
          console.log('Values for status-like keys:');
          Object.keys(targetRaw).forEach(key => {
            if (key.toLowerCase().includes('status') || key.toLowerCase().includes('state')) {
              console.log(`  ${key}:`, targetRaw[key]);
            }
          });
        }
      }
      
      const extractedData = extractApiData(response.data);

      // Ensure all order details have required fields with defaults
      const processedData = extractedData.map(detail => {
        // Debug logging for specific order
        if (detail.orderId === 'HD16D450CE' || (detail.orderId && detail.orderId.includes('HD16D450CE'))) {
          console.log('=== API SERVICE DEBUG FOR ORDER HD16D450CE ===');
          console.log('Raw detail from API:', detail);
          console.log('detail.status:', detail.status);
          console.log('detail.Status:', detail.Status);
          console.log('Combined status:', detail.status || detail.Status);
        }
        
        // Try multiple possible status field names and variations
        const statusCandidates = [
          detail.status,
          detail.Status,
          detail.STATUS,
          detail.orderStatus,
          detail.orderDetailStatus,
          detail.state,
          detail.State
        ];
        
        let statusValue = null;
        for (const candidate of statusCandidates) {
          if (candidate && candidate !== '') {
            statusValue = candidate;
            break;
          }
        }
        
        // Additional debug for the target order
        if (detail.orderId === 'HD16D450CE' || (detail.orderId && detail.orderId.includes('HD16D450CE'))) {
          console.log('Status candidates for HD16D450CE:', statusCandidates);
          console.log('Selected status value:', statusValue);
        }

        return {
          ...detail,
          // Normalize status field with proper Vietnamese values
          status: normalizeOrderDetailStatus(statusValue),
          // Ensure other critical fields have proper defaults
          quantity: detail.quantity || 1,
          unitPrice: detail.unitPrice || detail.price || 0,
          // Ensure IDs are properly formatted
          foodId: detail.foodId ? detail.foodId.toString().trim() : '',
          orderId: detail.orderId ? detail.orderId.toString().trim() : '',
        };
      });
      
      console.log('Extracted order details data:', processedData);
      console.log('Sample order detail with status:', processedData[0]);
      
      // Additional debugging for HD16D450CE
      const targetOrder = processedData.find(detail => 
        detail.orderId === 'HD16D450CE' || 
        (detail.orderId && detail.orderId.includes('HD16D450CE'))
      );
      if (targetOrder) {
        console.log('=== FOUND TARGET ORDER HD16D450CE IN PROCESSED DATA ===');
        console.log('Final processed detail:', targetOrder);
        console.log('Final status value:', targetOrder.status);
      }
      
      return processedData;
    } catch (error) {
      console.error('Error fetching all order details:', error);
      
      // Check if it's a 500 server error (database issue)
      if (error.response?.status === 500) {
        console.warn('⚠️ OrderDetail endpoint has a database issue (500 error). Returning empty array as fallback.');
        return []; // Return empty array instead of crashing the app
      }
      
      throw error;
    }
  },

  // Get order details for a specific order (includes completed items that bulk endpoint might omit)
  getOrderDetailsByOrderId: async (orderId) => {
    try {
      const trimmedOrderId = orderId.trim();
      console.log(`Fetching order details for order ${trimmedOrderId}...`);
      
      // Test multiple possible endpoint formats
      const endpointVariations = [
        `/api/OrderDetail/order/${trimmedOrderId}`,
        `/api/OrderDetail/${trimmedOrderId}`,
        `/api/Order/${trimmedOrderId}/details`,
        `/api/Order/${trimmedOrderId}/orderdetails`
      ];
      
      let response = null;
      let workingEndpoint = null;
      
      for (const endpoint of endpointVariations) {
        try {
          console.log(`Testing endpoint: ${endpoint}`);
          response = await api.get(endpoint);
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            workingEndpoint = endpoint;
            console.log(`✓ Working endpoint found: ${endpoint}`);
            break;
          } else if (response.data && Array.isArray(response.data)) {
            console.log(`✓ Endpoint responds but returns empty array: ${endpoint}`);
          }
        } catch (endpointError) {
          console.log(`✗ Endpoint failed: ${endpoint}`, endpointError.response?.status || endpointError.message);
        }
      }
      
      if (!response) {
        console.log(`No working endpoint found for order ${trimmedOrderId}`);
        return [];
      }
      
      console.log(`Raw order details response for ${trimmedOrderId}:`, response.data);
      console.log(`Used working endpoint: ${workingEndpoint}`);
      
      const extractedData = extractApiData(response.data);
      
      const processedData = extractedData.map(detail => {
        // Debug logging for specific order
        if (detail.orderId === trimmedOrderId || (detail.orderId && detail.orderId.includes(trimmedOrderId))) {
          console.log(`=== API SERVICE DEBUG FOR ORDER ${trimmedOrderId} (SPECIFIC ENDPOINT) ===`);
          console.log('Raw detail from specific API:', detail);
          console.log('All keys in detail:', Object.keys(detail));
          console.log('detail.status:', detail.status);
          console.log('detail.Status:', detail.Status);
        }
        
        // Try multiple possible status field names and variations
        const statusCandidates = [
          detail.status,
          detail.Status,
          detail.STATUS,
          detail.orderStatus,
          detail.orderDetailStatus,
          detail.state,
          detail.State
        ];
        
        let statusValue = null;
        for (const candidate of statusCandidates) {
          if (candidate && candidate !== '') {
            statusValue = candidate;
            break;
          }
        }
        
        if (detail.orderId === trimmedOrderId || (detail.orderId && detail.orderId.includes(trimmedOrderId))) {
          console.log(`Status candidates for ${trimmedOrderId}:`, statusCandidates);
          console.log('Selected status value:', statusValue);
        }

        return {
          ...detail,
          status: normalizeOrderDetailStatus(statusValue),
          quantity: detail.quantity || 1,
          unitPrice: detail.unitPrice || detail.price || 0,
          foodId: detail.foodId ? detail.foodId.toString().trim() : '',
          orderId: detail.orderId ? detail.orderId.toString().trim() : '',
        };
      });
      
      console.log(`Processed order details for ${trimmedOrderId}:`, processedData);
      return processedData;
    } catch (error) {
      console.error(`Error fetching order details for ${orderId}:`, error);
      throw error;
    }
  },

  createOrderDetail: async (orderDetailData) => {
    try {
      console.log('Creating order detail:', orderDetailData);
      
      // Simple DTO format that matches the API's CreateOrderDetailDto
      const createData = {
        FoodId: orderDetailData.foodId?.toString().trim() || orderDetailData.FoodId?.toString().trim() || '',
        OrderId: orderDetailData.orderId?.toString().trim() || orderDetailData.OrderId?.toString().trim() || '',
        Quantity: parseInt(orderDetailData.quantity) || 1,
        UnitPrice: orderDetailData.unitPrice || null, // Optional - API will use food's price if not provided
        // Status is optional - API defaults to "Chưa làm" if not provided
      };
      
      console.log('Sending simplified create data:', createData);
      const response = await api.post('/api/OrderDetail', createData);
      console.log('Create order detail response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating order detail:', error);
      console.error('Order detail error response:', error.response?.data);
      console.error('Order detail error status:', error.response?.status);
      throw error;
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      console.log('Fetching order details for orderId:', orderId);
      const response = await api.get(`/api/OrderDetail/order/${orderId}`);
      console.log('Raw order details API response:', response.data);
      const extractedData = extractApiData(response.data);

      // Ensure all order details have required fields with defaults
      const processedData = extractedData.map(detail => ({
        ...detail,
        // Normalize status field with proper Vietnamese values
        status: normalizeOrderDetailStatus(detail.status || detail.Status),
        // Ensure other critical fields have proper defaults
        quantity: detail.quantity || 1,
        unitPrice: detail.unitPrice || detail.price || 0,
        // Ensure IDs are properly formatted
        foodId: detail.foodId ? detail.foodId.toString().trim() : '',
        orderId: detail.orderId ? detail.orderId.toString().trim() : '',
      }));
      
      console.log('Extracted order details:', processedData);
      console.log('Sample order detail with status:', processedData[0]);
      return processedData;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // Update order detail status
  updateOrderDetail: async (foodId, orderId, orderDetailData) => {
    try {
      console.log('Updating order detail:', { foodId, orderId, orderDetailData });
      const cleanFoodId = foodId.toString().trim();
      const cleanOrderId = orderId.toString().trim();
      
      // The API requires complete Food and Order objects, so fetch them first
      const [foodResponse, orderResponse] = await Promise.all([
        api.get(`/api/FoodInfo/${cleanFoodId}`).catch(error => {
          console.warn('Could not fetch food info:', error.message);
          return { data: { foodId: cleanFoodId, foodName: `Food ${cleanFoodId}`, unitPrice: 0 } };
        }),
        api.get(`/api/Order/${cleanOrderId}`).catch(error => {
          console.warn('Could not fetch order info:', error.message);
          return { data: { orderId: cleanOrderId, tableId: 'N/A', userId: 'N/A', status: 'Pending', total: 0 } };
        })
      ]);
      
      const updateData = {
        foodId: cleanFoodId,
        orderId: cleanOrderId,
        quantity: orderDetailData.quantity || 1,
        unitPrice: orderDetailData.unitPrice || foodResponse.data.unitPrice || 0,
        status: orderDetailData.status || 'Chưa làm',
        food: {
          foodId: cleanFoodId,
          foodName: foodResponse.data.foodName || `Food ${cleanFoodId}`,
          unitPrice: foodResponse.data.unitPrice || 0,
          description: foodResponse.data.description || '',
          cateId: foodResponse.data.cateId || ''
        },
        order: {
          orderId: cleanOrderId,
          tableId: orderResponse.data.tableId || 'N/A',
          userId: orderResponse.data.userId || 'N/A',
          status: orderResponse.data.status || 'Pending',
          total: orderResponse.data.total || 0
        }
      };
      
      console.log('Sending complete update data:', updateData);
      const response = await api.put(`/api/OrderDetail/food/${cleanFoodId}/order/${cleanOrderId}`, updateData);
      console.log('Update order detail response status:', response.status);
      return { success: true, status: response.status };
    } catch (error) {
      console.error('Error updating order detail:', error);
      throw error;
    }
  },

  // Get specific order detail by foodId and orderId
  getOrderDetail: async (foodId, orderId) => {
    try {
      console.log('Fetching specific order detail:', { foodId, orderId });
      const cleanFoodId = foodId.toString().trim();
      const cleanOrderId = orderId.toString().trim();
      
      const response = await api.get(`/api/OrderDetail/food/${cleanFoodId}/order/${cleanOrderId}`);
      console.log('Get order detail response:', response.data);
      
      // Process single order detail with defaults
      const detail = response.data;
      const processedDetail = {
        ...detail,
        status: normalizeOrderDetailStatus(detail.status || detail.Status),
        quantity: detail.quantity || 1,
        unitPrice: detail.unitPrice || detail.price || 0,
        foodId: detail.foodId ? detail.foodId.toString().trim() : '',
        orderId: detail.orderId ? detail.orderId.toString().trim() : '',
      };
      
      return processedDetail;
    } catch (error) {
      console.error('Error fetching order detail:', error);
      throw error;
    }
  },

  // User Management
  getAllUsers: async () => {
    try {
      console.log('Fetching all users from API...');
      const response = await api.get('/api/User');
      console.log('Raw users response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted users data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      console.log('Fetching user by ID:', userId);
      const response = await api.get(`/api/User/${userId}`);
      console.log('Raw user response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  getUserByUsername: async (username) => {
    try {
      console.log('Fetching user by username:', username);
      const response = await api.get(`/api/User/username/${username}`);
      console.log('Raw user by username response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw error;
    }
  },

  login: async (loginData) => {
    try {
      console.log('Attempting login:', { userName: loginData.userName });
      const response = await api.post('/api/User/login', loginData);
      console.log('Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      console.log('Creating user:', userData);
      const response = await api.post('/api/User', userData);
      console.log('Create user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      console.log('Updating user:', userId, userData);
      const response = await api.put(`/api/User/${userId}`, userData);
      console.log('Update user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      console.log('Deleting user:', userId);
      const response = await api.delete(`/api/User/${userId}`);
      console.log('Delete user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Bills
  getAllBills: async () => {
    try {
      console.log('Fetching all bills from API...');
      const response = await api.get('/api/Bill');
      console.log('Raw bills response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted bills data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching all bills:', error);
      throw error;
    }
  },

  getBillById: async (billId) => {
    try {
      console.log('Fetching bill by ID:', billId);
      const response = await api.get(`/api/Bill/${billId}`);
      console.log('Raw bill response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw error;
    }
  },

  getBillsByOrder: async (orderId) => {
    try {
      console.log('Fetching bills for order:', orderId);
      const response = await api.get(`/api/Bill/order/${orderId}`);
      console.log('Raw bills for order response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching bills for order:', error);
      throw error;
    }
  },

  getBillsByDate: async (date) => {
    try {
      console.log('Fetching bills for date:', date);
      const response = await api.get(`/api/Bill/date/${date}`);
      console.log('Raw bills for date response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching bills for date:', error);
      throw error;
    }
  },

  createBill: async (billData) => {
    try {
      console.log('Creating bill:', billData);
      const response = await api.post('/api/Bill', billData);
      console.log('Create bill response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
  },

  updateBill: async (billId, billData) => {
    try {
      console.log('Updating bill:', billId, billData);
      const response = await api.put(`/api/Bill/${billId}`, billData);
      console.log('Update bill response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  },

  deleteBill: async (billId) => {
    try {
      console.log('Deleting bill:', billId);
      const response = await api.delete(`/api/Bill/${billId}`);
      console.log('Delete bill response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  },

  getBillsByUser: async (userId) => {
    try {
      console.log('Fetching bills for user:', userId);
      const response = await api.get(`/api/Bill/user/${userId}`);
      console.log('Raw bills for user response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching user bills:', error);
      throw error;
    }
  },

  // Bill Details
  getAllBillDetails: async () => {
    try {
      console.log('Fetching all bill details from API...');
      const response = await api.get('/api/BillDetail');
      console.log('Raw bill details response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted bill details data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching all bill details:', error);
      throw error;
    }
  },

  getBillDetails: async (billId) => {
    try {
      console.log('Fetching bill details for billId:', billId);
      const response = await api.get(`/api/BillDetail/bill/${billId}`);
      console.log('Raw bill details response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching bill details:', error);
      throw error;
    }
  },

  getBillDetail: async (orderId, billId) => {
    try {
      console.log('Fetching specific bill detail:', { orderId, billId });
      const response = await api.get(`/api/BillDetail/order/${orderId}/bill/${billId}`);
      console.log('Raw bill detail response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching bill detail:', error);
      throw error;
    }
  },

  createBillDetail: async (billDetailData) => {
    try {
      console.log('Creating bill detail:', billDetailData);
      const response = await api.post('/api/BillDetail', billDetailData);
      console.log('Create bill detail response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating bill detail:', error);
      throw error;
    }
  },

  updateBillDetail: async (orderId, billId, billDetailData) => {
    try {
      console.log('Updating bill detail:', { orderId, billId, billDetailData });
      const response = await api.put(`/api/BillDetail/order/${orderId}/bill/${billId}`, billDetailData);
      console.log('Update bill detail response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating bill detail:', error);
      throw error;
    }
  },

  deleteBillDetail: async (orderId, billId) => {
    try {
      console.log('Deleting bill detail:', { orderId, billId });
      const response = await api.delete(`/api/BillDetail/order/${orderId}/bill/${billId}`);
      console.log('Delete bill detail response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting bill detail:', error);
      throw error;
    }
  },

  // Recipe Management
  getAllRecipes: async () => {
    try {
      console.log('Fetching all recipes from API...');
      const response = await api.get('/api/Recipe');
      console.log('Raw recipes response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted recipes data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching all recipes:', error);
      throw error;
    }
  },

  getRecipeById: async (recipeId) => {
    try {
      console.log('Fetching recipe by ID:', recipeId);
      const response = await api.get(`/api/Recipe/${recipeId}`);
      console.log('Raw recipe response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
  },

  getRecipesByFood: async (foodId) => {
    try {
      console.log('Fetching recipes for food:', foodId);
      const response = await api.get(`/api/Recipe/food/${foodId}`);
      console.log('Raw recipes for food response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching recipes for food:', error);
      throw error;
    }
  },

  createRecipe: async (recipeData) => {
    try {
      console.log('Creating recipe:', recipeData);
      const response = await api.post('/api/Recipe', recipeData);
      console.log('Create recipe response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  updateRecipe: async (recipeId, recipeData) => {
    try {
      console.log('Updating recipe:', recipeId, recipeData);
      const response = await api.put(`/api/Recipe/${recipeId}`, recipeData);
      console.log('Update recipe response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  deleteRecipe: async (recipeId) => {
    try {
      console.log('Deleting recipe:', recipeId);
      const response = await api.delete(`/api/Recipe/${recipeId}`);
      console.log('Delete recipe response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },

  // Recipe Detail Management
  getAllRecipeDetails: async () => {
    try {
      console.log('Fetching all recipe details from API...');
      const response = await api.get('/api/RecipeDetail');
      console.log('Raw recipe details response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted recipe details data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching all recipe details:', error);
      throw error;
    }
  },

  getRecipeDetails: async (recipeId) => {
    try {
      console.log('Fetching recipe details for recipeId:', recipeId);
      const response = await api.get(`/api/RecipeDetail/recipe/${recipeId}`);
      console.log('Raw recipe details response:', response.data);
      return extractApiData(response.data);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  },

  // Ingredient Management
  getAllIngredients: async () => {
    try {
      console.log('Fetching all ingredients from API...');
      const response = await api.get('/api/Ingredient');
      console.log('Raw ingredients response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted ingredients data:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching all ingredients:', error);
      throw error;
    }
  },

  // Food Items CRUD operations
  createFoodItem: async (foodData) => {
    try {
      console.log('Creating food item:', foodData);
      const response = await api.post('/api/FoodInfo', foodData);
      return response.data;
    } catch (error) {
      console.error('Error creating food item:', error);
      throw error;
    }
  },

  updateFoodItem: async (foodId, foodData) => {
    try {
      console.log('Updating food item:', foodId, foodData);
      const response = await api.put(`/api/FoodInfo/${foodId}`, foodData);
      return response.data;
    } catch (error) {
      console.error('Error updating food item:', error);
      throw error;
    }
  },

  deleteFoodItem: async (foodId) => {
    try {
      // Ensure foodId is trimmed and clean
      const cleanFoodId = foodId.toString().trim();
      console.log('=== API SERVICE DELETE START ===');
      console.log('Deleting food item - Clean ID:', cleanFoodId);
      console.log('Making DELETE request to:', `${API_BASE_URL}api/FoodInfo/${cleanFoodId}`);
      
      const response = await api.delete(`/api/FoodInfo/${cleanFoodId}`);
      console.log('Delete response status:', response.status);
      console.log('Delete response data:', response.data);
      console.log('=== API SERVICE DELETE SUCCESS ===');
      return response.data;
    } catch (error) {
      console.log('=== API SERVICE DELETE ERROR ===');
      console.error('Error deleting food item:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  },

  // Categories CRUD operations
  createCategory: async (categoryData) => {
    try {
      console.log('Creating category:', categoryData);
      const response = await api.post('/api/Category', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (categoryId, categoryData) => {
    try {
      console.log('Updating category:', categoryId, categoryData);
      const response = await api.put(`/api/Category/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (categoryId) => {
    try {
      console.log('Deleting category:', categoryId);
      const response = await api.delete(`/api/Category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};

// Helper function to generate category icons based on category name
export const getCategoryIcon = (categoryName) => {
  const name = categoryName?.toLowerCase() || '';
  
  // Vietnamese category mappings
  if (name.includes('cơm')) { // Rice
    return 'rice';
  } else if (name.includes('canh')) { // Soup
    return 'bowl-mix';
  } else if (name.includes('súp')) { // Soup
    return 'bowl-mix';
  } else if (name.includes('mì') || name.includes('xào')) { // Noodles/Stir-fry
    return 'noodles';
  } else if (name.includes('rau')) { // Vegetables
    return 'carrot';
  } else if (name.includes('gà')) { // Chicken
    return 'food-drumstick';
  } else if (name.includes('cá')) { // Fish
    return 'fish';
  } else if (name.includes('thức uống') || name.includes('drink') || name.includes('beverage')) { // Drinks
    return 'cup';
  } 
  // English category mappings (fallback)
  else if (name.includes('appetizer') || name.includes('starter')) {
    return 'food-apple';
  } else if (name.includes('main') || name.includes('course') || name.includes('entree')) {
    return 'food';
  } else if (name.includes('dessert') || name.includes('sweet')) {
    return 'cake';
  } else if (name.includes('salad')) {
    return 'food-variant';
  } else if (name.includes('soup')) {
    return 'bowl-mix';
  } else {
    return 'food-fork-drink'; // Default icon
  }
};

// Helper function to format price
export const formatPrice = (price) => {
  // Format Vietnamese Dong (VND)
  return `${parseFloat(price).toLocaleString('vi-VN')}₫`;
};

// Export API configuration for potential use
export { API_BASE_URL };