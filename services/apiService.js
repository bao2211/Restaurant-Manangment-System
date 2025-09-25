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
    // Add headers that might help with CORS
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, Authorization',
  },
  // CORS and network handling configuration
  withCredentials: false,
  crossdomain: true,
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Only treat 2xx as success, not 400+ errors
  },
});

// Helper function to extract data from API response
const extractApiData = (data) => {
  console.log('extractApiData - Input data:', data);
  
  // Handle regular array responses (new clean API format)
  if (Array.isArray(data)) {
    console.log('Found direct array with length:', data.length);
    
    // Clean and validate the data
    const processed = data
      .filter(item => {
        const isValid = item && 
          typeof item === 'object' && 
          !item.$ref && 
          (item.foodId || item.cateId || item.orderId || item.billId || item.tableId || item.userId || item.ingreId);
        
        if (!isValid) {
          console.log('Filtering out invalid item:', item);
        }
        return isValid;
      })
      .map(item => {
        // Clean up string fields by trimming whitespace
        const cleanedItem = { ...item };
        
        // Clean foodId and other ID fields
        if (cleanedItem.foodId) {
          cleanedItem.foodId = cleanedItem.foodId.toString().trim();
        }
        if (cleanedItem.cateId) {
          cleanedItem.cateId = cleanedItem.cateId.toString().trim();
        }
        if (cleanedItem.foodName) {
          cleanedItem.foodName = cleanedItem.foodName.trim();
        }
        if (cleanedItem.cateName) {
          cleanedItem.cateName = cleanedItem.cateName.trim();
        }
        if (cleanedItem.description && typeof cleanedItem.description === 'string') {
          cleanedItem.description = cleanedItem.description.trim();
        }
        if (cleanedItem.foodImage) {
          cleanedItem.foodImage = cleanedItem.foodImage.trim();
        }
        
        // Ensure unitPrice is a number
        if (cleanedItem.unitPrice) {
          cleanedItem.unitPrice = parseFloat(cleanedItem.unitPrice) || 0;
        }
        
        return cleanedItem;
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
    return data;
  }
  
  // Handle empty or invalid responses
  console.log('extractApiData - Invalid or empty response');
  return [];
};

// API service object containing all our API calls
export const apiService = {
  // Alternative test using fetch
  testWithFetch: async () => {
    try {
      console.log('Testing with native fetch API...');
      const url = `${API_BASE_URL}api/Category`;
      console.log('Fetch URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Fetch response status:', response.status);
      console.log('Fetch response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetch successful - data preview:', JSON.stringify(data).substring(0, 200));
        return { success: true, data };
      } else {
        console.error('Fetch failed with status:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('Fetch test failed:', error);
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

  // Orders
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
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      const response = await api.post('/api/Order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
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
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(orderData),
            mode: 'cors', // Explicitly set CORS mode
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

  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/Order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  getOrdersByUser: async (userId) => {
    try {
      const response = await api.get(`/api/Order/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Order Details
  createOrderDetail: async (orderDetailData) => {
    try {
      const response = await api.post('/api/OrderDetail', orderDetailData);
      return response.data;
    } catch (error) {
      console.error('Error creating order detail:', error);
      throw error;
    }
  },

  getOrderDetails: async (orderId) => {
    try {
      console.log('Fetching order details for orderId:', orderId);
      const response = await api.get(`/api/OrderDetail/order/${orderId}`);
      console.log('Raw order details API response:', response.data);
      const extractedData = extractApiData(response.data);
      console.log('Extracted order details:', extractedData);
      return extractedData;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // User Authentication
  login: async (loginData) => {
    try {
      const response = await api.post('/api/User/login', loginData);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/User/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Bills
  createBill: async (billData) => {
    try {
      const response = await api.post('/api/Bill', billData);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw error;
    }
  },

  getBillsByUser: async (userId) => {
    try {
      const response = await api.get(`/api/Bill/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user bills:', error);
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