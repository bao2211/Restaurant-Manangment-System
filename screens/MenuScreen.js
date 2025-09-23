import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, getCategoryIcon, formatPrice } from '../services/apiService';

export default function MenuScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [imageErrors, setImageErrors] = useState({}); // Track failed image loads
  
  // Order form state
  const [orderItems, setOrderItems] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);

  // Fetch categories on component mount and initialize order
  useEffect(() => {
    fetchCategories();
    
    // Initialize order if coming from table selection
    if (route?.params?.selectedTable) {
      const table = route.params.selectedTable;
      const validOrderId = generateValidOrderId();
      console.log('Generated valid OrderID:', validOrderId);
      setOrderId(validOrderId);
      setSelectedTable(table);
    }
  }, []);

  // Fetch food items when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchFoodItemsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Test both connection methods
      console.log('=== STARTING CONNECTION TESTS ===');
      
      // Test 1: Axios
      console.log('Testing with axios...');
      const axiosTest = await apiService.testConnection();
      console.log('Axios test result:', axiosTest);
      
      // Test 2: Fetch
      console.log('Testing with fetch...');
      const fetchTest = await apiService.testWithFetch();
      console.log('Fetch test result:', fetchTest);
      
      // If fetch works but axios doesn't, use fetch data
      if (!axiosTest && fetchTest.success) {
        console.log('Using fetch data since axios failed');
        const categoriesData = fetchTest.data.$values || fetchTest.data;
        
        const transformedCategories = categoriesData.map((category, index) => ({
          id: category.cateId?.trim() || `category-${index}`,
          name: category.cateName?.trim() || 'Unknown Category',
          description: category.description,
          icon: getCategoryIcon(category.cateName)
        }));
        
        // Add "Tất cả" (All) category at the beginning
        const allCategory = {
          id: 'all',
          name: 'Tất cả',
          description: 'View all menu items',
          icon: 'food-variant'
        };
        
        const finalCategories = [allCategory, ...transformedCategories];
        
        setCategories(finalCategories);
        if (finalCategories.length > 0) {
          setSelectedCategory(finalCategories[0].id);
        }
        return;
      }
      
      // If axios test failed completely
      if (!axiosTest) {
        throw new Error('Cannot connect to server with either method');
      }
      
      // Proceed with normal axios flow
      const categoriesData = await apiService.getCategories();
      console.log('Categories fetched:', categoriesData);
      
      if (!categoriesData || categoriesData.length === 0) {
        console.log('No categories returned from API');
        setCategories([]);
        return;
      }
      
      const transformedCategories = categoriesData.map((category, index) => ({
        id: category.cateId?.trim() || `category-${index}`,
        name: category.cateName?.trim() || 'Unknown Category',
        description: category.description,
        icon: getCategoryIcon(category.cateName)
      }));
      
      // Add "Tất cả" (All) category at the beginning
      const allCategory = {
        id: 'all',
        name: 'Tất cả',
        description: 'View all menu items',
        icon: 'food-variant'
      };
      
      const finalCategories = [allCategory, ...transformedCategories];
      
      console.log('Transformed categories:', finalCategories);
      setCategories(finalCategories);
      
      if (finalCategories.length > 0) {
        console.log('Setting selected category to:', finalCategories[0].id);
        setSelectedCategory(finalCategories[0].id);
      }
      
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      Alert.alert(
        'Connection Error', 
        `Unable to load menu categories.\n\nError: ${error.message}\n\nDetails:\n- Server URL: http://46.250.231.129:8080/\n- Check if server is running\n- Check internet connection\n- Try restarting the app`,
        [
          { text: 'Retry', onPress: fetchCategories },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItemsByCategory = async (categoryId) => {
    try {
      setLoadingItems(true);
      setImageErrors({}); // Reset image errors when fetching new category
      
      let foodData;
      
      if (categoryId === 'all') {
        // Fetch all food items from all categories
        console.log('Fetching all food items from all categories');
        const allFoodItems = [];
        
        // Get all categories except 'all'
        const realCategories = categories.filter(cat => cat.id !== 'all');
        
        for (const category of realCategories) {
          try {
            const categoryFoodData = await apiService.getFoodItemsByCategory(category.id);
            allFoodItems.push(...categoryFoodData);
          } catch (error) {
            console.error(`Error fetching items for category ${category.name}:`, error);
            // Continue with other categories even if one fails
          }
        }
        
        foodData = allFoodItems;
      } else {
        // Fetch specific category
        foodData = await apiService.getFoodItemsByCategory(categoryId);
      }
      
      console.log('Food items fetched:', foodData);
      
      // Transform API data to match our component format
      const transformedFoodItems = foodData.map((food, index) => ({
        id: food.foodId?.trim() || `food-${index}`, // Ensure unique ID
        name: food.foodName?.trim() || 'Unknown Dish',
        description: food.description || 'Delicious dish prepared with care',
        price: formatPrice(food.unitPrice || 0),
        imageUrl: food.foodImage, // Use actual food image URL
        emojiFallback: getEmojiFallback(food.foodName), // Keep emoji as fallback
        categoryId: food.cateId?.trim(),
        unitPrice: food.unitPrice || 0
      }));
      
      setFoodItems(transformedFoodItems);
      
    } catch (error) {
      console.error('Error fetching food items:', error);
      Alert.alert(
        'Loading Error', 
        'Unable to load menu items for this category.',
        [{ text: 'OK' }]
      );
      setFoodItems([]); // Show empty state
    } finally {
      setLoadingItems(false);
    }
  };

  // Helper function to generate emoji fallbacks based on food names
  const getEmojiFallback = (foodName) => {
    const name = foodName?.toLowerCase() || '';
    
    // Vietnamese food mappings
    if (name.includes('cơm')) return '🍚'; // Rice dishes
    if (name.includes('gà')) return '🍗'; // Chicken
    if (name.includes('cá')) return '🐟'; // Fish
    if (name.includes('tôm')) return '🍤'; // Shrimp
    if (name.includes('bò')) return '🥩'; // Beef
    if (name.includes('heo') || name.includes('thịt')) return '🥓'; // Pork/Meat
    if (name.includes('canh') || name.includes('súp')) return '🍲'; // Soup
    if (name.includes('mì') || name.includes('bún') || name.includes('phở')) return '🍜'; // Noodles
    if (name.includes('rau')) return '🥬'; // Vegetables
    if (name.includes('nước') || name.includes('trà') || name.includes('cà phê')) return '🥤'; // Drinks
    if (name.includes('bánh')) return '🥧'; // Cakes/Pastries
    
    // English food mappings (fallback)
    if (name.includes('salad')) return '🥗';
    if (name.includes('chicken')) return '�';
    if (name.includes('beef') || name.includes('steak')) return '🥩';
    if (name.includes('fish') || name.includes('salmon')) return '🐟';
    if (name.includes('pasta') || name.includes('noodle')) return '🍝';
    if (name.includes('pizza')) return '�';
    if (name.includes('burger')) return '🍔';
    if (name.includes('cake')) return '🍰';
    if (name.includes('ice cream')) return '🍨';
    if (name.includes('coffee')) return '☕';
    if (name.includes('juice')) return '🧃';
    if (name.includes('soup')) return '🍲';
    if (name.includes('rice')) return '🍚';
    if (name.includes('bread')) return '🍞';
    if (name.includes('wine')) return '🍷';
    
    return '🍽️'; // Default food emoji
  };

  const renderMenuItem = (item) => {
    const hasImageError = imageErrors[item.id];
    const shouldShowImage = item.imageUrl && !hasImageError;

    return (
      <TouchableOpacity key={item.id} style={styles.menuItem}>
        <View style={styles.menuItemImage}>
          {shouldShowImage ? (
            <Image 
              source={{ uri: item.imageUrl }}
              style={styles.foodImage}
              onError={() => {
                console.log(`Failed to load image for ${item.name}: ${item.imageUrl}`);
                setImageErrors(prev => ({ ...prev, [item.id]: true }));
              }}
              onLoad={() => {
                // Reset error state if image loads successfully
                setImageErrors(prev => ({ ...prev, [item.id]: false }));
              }}
            />
          ) : (
            <View style={styles.fallbackImageContainer}>
              <Text style={styles.emojiImage}>{item.emojiFallback}</Text>
            </View>
          )}
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription}>{item.description}</Text>
          <View style={styles.menuItemFooter}>
            <Text style={styles.menuItemPrice}>{item.price}</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddToCart = (item) => {
    console.log('=== ADD TO CART DEBUG ===');
    console.log('Adding item:', item);
    
    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(orderItem => orderItem.id === item.id);
    
    if (existingItemIndex !== -1) {
      // If item exists, increase quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += 1;
      console.log('Item already exists, increased quantity:', updatedItems[existingItemIndex]);
      setOrderItems(updatedItems);
    } else {
      // If item doesn't exist, add new item
      const newOrderItem = {
        id: item.id,
        name: item.name,
        price: item.unitPrice,
        quantity: 1,
        formattedPrice: item.price
      };
      console.log('Adding new item to order:', newOrderItem);
      setOrderItems([...orderItems, newOrderItem]);
    }
    
    console.log('Current order items after addition:', [...orderItems]);
    Alert.alert('Success', `${item.name} added to order!`);
  };

  const updateQuantity = (itemId, change) => {
    console.log('=== UPDATE QUANTITY DEBUG ===');
    console.log('Item ID:', itemId);
    console.log('Change:', change);
    console.log('Current order items before update:', orderItems);
    
    const updatedItems = orderItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        console.log(`Updating item ${item.name} quantity from ${item.quantity} to ${newQuantity}`);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0); // Remove items with 0 quantity
    
    console.log('Updated order items:', updatedItems);
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Generate a valid OrderID (10 characters, starts with "HD")
  const generateValidOrderId = () => {
    const timestamp = Date.now();
    // Take last 8 digits of timestamp to ensure 10 total characters with "HD" prefix
    const orderNumber = timestamp.toString().slice(-8);
    return `HD${orderNumber}`;
  };

  // Validate OrderID format (10 characters, starts with "HD")
  const validateOrderId = (orderIdToValidate) => {
    if (!orderIdToValidate) {
      console.log('OrderID validation failed: OrderID is empty');
      return false;
    }
    
    if (orderIdToValidate.length !== 10) {
      console.log(`OrderID validation failed: Length is ${orderIdToValidate.length}, expected 10`);
      return false;
    }
    
    if (!orderIdToValidate.startsWith('HD')) {
      console.log(`OrderID validation failed: Does not start with "HD", starts with "${orderIdToValidate.substring(0, 2)}"`);
      return false;
    }
    
    console.log(`OrderID validation passed: ${orderIdToValidate}`);
    return true;
  };

  const submitOrder = async () => {
    console.log('=== SUBMIT ORDER DEBUG ===');
    console.log('Order ID:', orderId);
    console.log('Selected Table:', selectedTable);
    console.log('Order Items:', orderItems);
    console.log('Order Items Length:', orderItems.length);
    
    // Add detailed debugging for each order item
    orderItems.forEach((item, index) => {
      console.log(`Order Item ${index + 1}:`, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity
      });
    });
    
    if (orderItems.length === 0) {
      console.log('ERROR: No items in order');
      Alert.alert('Error', 'Please add items to the order');
      return;
    }

    if (!selectedTable) {
      console.log('ERROR: No table selected');
      Alert.alert('Error', 'No table selected');
      return;
    }

    // Validate OrderID format
    if (!validateOrderId(orderId)) {
      console.log('ERROR: Invalid OrderID format');
      Alert.alert('Error', 'Invalid Order ID format. Order ID must be 10 characters and start with "HD"');
      return;
    }

    try {
      const total = calculateTotal();
      console.log('Calculated Total:', total);

      // Test API connection first
      console.log('=== TESTING API CONNECTION ===');
      const connectionTest = await apiService.testConnection();
      console.log('Connection test result:', connectionTest);
      
      if (!connectionTest) {
        Alert.alert('Connection Error', 'Cannot connect to the API server. Please check your internet connection and try again.');
        return;
      }

      // Try alternative fetch test
      console.log('=== TESTING WITH FETCH ===');
      const fetchTest = await apiService.testWithFetch();
      console.log('Fetch test result:', fetchTest);

      // Prepare order data for API with validated format
      // Based on API documentation, using the full Order object format
      const orderData = {
        orderId: orderId, // Already validated to be 10 chars starting with "HD"
        status: 'Pending',
        total: total,
        note: `Order for ${selectedTable.tableName || selectedTable.tableId}`,
        discount: 0,
        tableId: (selectedTable.tableId || selectedTable.id || '').trim(), // Clean up extra spaces
        userId: 1 // User specifically requested number 1
      };

      console.log('=== ORDER DATA VALIDATION ===');
      console.log('OrderID:', orderData.orderId, '(Length:', orderData.orderId.length, ', Starts with HD:', orderData.orderId.startsWith('HD'), ')');
      console.log('UserID:', orderData.userId, '(Type:', typeof orderData.userId, ')');
      console.log('TableID:', orderData.tableId, '(Type:', typeof orderData.tableId, ')');
      console.log('Total:', orderData.total, '(Type:', typeof orderData.total, ')');
      console.log('Selected Table Object:', selectedTable);
      console.log('Order Data to send:', JSON.stringify(orderData, null, 2));

      // Create the main order
      console.log('Creating order via API...');
      
      // Try creating order with our current format first
      let createdOrder;
      try {
        createdOrder = await apiService.createOrderWithCorsHandling(orderData);
        console.log('Order created successfully with primary format:', createdOrder);
      } catch (primaryError) {
        console.log('Primary format failed, trying alternative formats...');
        console.error('Primary error:', primaryError.message);
        
        // Try alternative format based on OrderDto structure
        const alternativeOrderData = {
          orderId: orderId, // Keep our HD format for the string version
          status: 'Pending',
          total: parseFloat(total), // Ensure it's a proper decimal
          note: `Order for ${selectedTable.tableName || selectedTable.tableId}`,
          discount: 0.0, // Explicit decimal format
          tableId: (selectedTable.tableId || selectedTable.id || '').trim(),
          userId: "1" // Try string format as shown in API examples
        };
        
        console.log('Trying alternative order format:', JSON.stringify(alternativeOrderData, null, 2));
        
        try {
          createdOrder = await apiService.createOrderWithCorsHandling(alternativeOrderData);
          console.log('Order created successfully with alternative format:', createdOrder);
        } catch (alternativeError) {
          console.error('Alternative format also failed:', alternativeError.message);
          throw primaryError; // Throw the original error
        }
      }

      // Create order details for each item
      console.log('Creating order details...');
      // Use the order ID from the created order response, or fall back to our original ID
      const createdOrderId = createdOrder?.orderId || createdOrder?.id || orderId;
      console.log('Using order ID for details:', createdOrderId);
      
      // Check if order creation was actually successful
      if (createdOrder && !createdOrder.type && !createdOrder.title) {
        // Order was created successfully, now create details
        for (const item of orderItems) {
          const orderDetailData = {
            foodId: (item.id || '').trim(), // Clean up any extra spaces
            orderId: createdOrderId,
            quantity: item.quantity
          };
          
          console.log('Creating order detail:', orderDetailData);
          
          try {
            const createdDetail = await apiService.createOrderDetail(orderDetailData);
            console.log('Order detail created:', createdDetail);
          } catch (detailError) {
            console.error('Error creating order detail:', detailError);
            console.error('Order detail error response:', detailError.response?.data);
            console.error('Order detail error status:', detailError.response?.status);
            
            // Log validation errors for order details
            if (detailError.response?.status === 400 && detailError.response?.data?.errors) {
              console.log('=== ORDER DETAIL VALIDATION ERRORS ===');
              console.log('Detail validation errors:', detailError.response.data.errors);
              Object.keys(detailError.response.data.errors).forEach(field => {
                console.log(`${field}:`, detailError.response.data.errors[field]);
              });
            }
            // Continue with other items even if one fails
          }
        }
      } else {
        console.error('Order creation failed, skipping order details creation');
        console.error('Order response indicates error:', createdOrder);
        throw new Error('Order creation failed with validation errors');
      }

      console.log('=== ORDER SUBMISSION COMPLETE ===');
      
      // Show success message
      Alert.alert(
        'Order Submitted Successfully!',
        `Order ${orderId} has been created with ${orderItems.length} items.\nTotal: ${formatPrice(total)}`,
        [
          {
            text: 'Create New Order',
            onPress: () => {
              // Reset the order form
              setOrderItems([]);
              const newValidOrderId = generateValidOrderId();
              setOrderId(newValidOrderId);
              console.log('New order initialized with valid ID:', newValidOrderId);
            }
          },
          {
            text: 'Back to Tables',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('=== ORDER SUBMISSION ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'Failed to submit order';
      
      // Handle specific error types
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Network connection failed. This might be due to:\n• CORS policy blocking the request\n• Server is not running\n• Network connectivity issues\n\nTry using a native mobile device or configure CORS on the server.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server internal error. Please check the server logs and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid order data. Please check all required fields.';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      Alert.alert(
        'Order Submission Failed',
        errorMessage,
        [
          { text: 'Retry', onPress: submitOrder },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const renderOrderForm = () => {
    const total = calculateTotal();
    
    return (
      <View style={styles.orderFormContainer}>
        <Text style={styles.orderFormTitle}>Order Details</Text>
        
        {/* Order Info */}
        <View style={styles.orderInfoSection}>
          <Text style={styles.orderInfoLabel}>Order ID:</Text>
          <Text style={styles.orderInfoValue}>{orderId || 'No Order'}</Text>
          
          <Text style={styles.orderInfoLabel}>Table:</Text>
          <Text style={styles.orderInfoValue}>
            {selectedTable ? `${selectedTable.tableName || selectedTable.tableId}` : 'No Table'}
          </Text>
        </View>
        
        {/* Order Items */}
        <Text style={styles.orderItemsTitle}>Items:</Text>
        <ScrollView style={styles.orderItemsList}>
          {orderItems.length === 0 ? (
            <Text style={styles.emptyOrderText}>No items added yet</Text>
          ) : (
            orderItems.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemPrice}>{formatPrice(item.price)}</Text>
                </View>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        
        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setOrderItems([])}
          >
            <Text style={styles.clearButtonText}>Clear Order</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={submitOrder}
          >
            <Text style={styles.submitButtonText}>Submit Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Loading state for categories
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading menu categories...</Text>
      </View>
    );
  }

  // Empty state if no categories
  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="food-off" size={80} color="#BDC3C7" />
        <Text style={styles.emptyTitle}>No Menu Available</Text>
        <Text style={styles.emptySubtitle}>
          Please check your connection and try again
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Left Side - Menu */}
        <View style={styles.menuSection}>
          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.categoryContentContainer}
              style={styles.categoryScrollView}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTab,
                    selectedCategory === category.id && styles.activeCategoryTab
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialCommunityIcons 
                    name={category.icon} 
                    size={18} 
                    color={selectedCategory === category.id ? 'white' : '#FF6B35'} 
                  />
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.id && styles.activeCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuContainer}>
            <Text style={styles.categoryTitle}>
              {selectedCategory === 'all' ? 'Tất cả món ăn' : (categories.find(cat => cat.id === selectedCategory)?.name || 'Menu Items')}
            </Text>
            {loadingItems ? (
              <View style={styles.itemsLoadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Loading menu items...</Text>
              </View>
            ) : foodItems.length === 0 ? (
              <View style={styles.emptyItemsContainer}>
                <MaterialCommunityIcons name="food-off" size={60} color="#BDC3C7" />
                <Text style={styles.emptyItemsText}>No items in this category</Text>
              </View>
            ) : (
              foodItems.map(renderMenuItem)
            )}
          </ScrollView>
        </View>
        
        {/* Right Side - Order Form */}
        {renderOrderForm()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  menuSection: {
    flex: 2,
    backgroundColor: '#F5F5F5',
  },
  orderFormContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  orderFormTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  orderInfoSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  orderInfoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34495E',
    marginTop: 5,
  },
  orderInfoValue: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 5,
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  orderItemsList: {
    flex: 1,
    maxHeight: 300,
  },
  emptyOrderText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 20,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  orderItemPrice: {
    fontSize: 12,
    color: '#FF6B35',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    minWidth: 20,
    textAlign: 'center',
  },
  totalSection: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#E8F6F3',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#E74C3C',
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 0,
    paddingHorizontal: 10,
    height: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  categoryContentContainer: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  categoryScrollView: {
    flexGrow: 0,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 15,
    marginHorizontal: 4,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#FF6B35',
    height: 30,
  },
  activeCategoryTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B35',
  },
  activeCategoryText: {
    color: 'white',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 0,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    marginTop: 5,
  },
  itemsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyItemsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyItemsText: {
    fontSize: 18,
    color: '#7F8C8D',
    marginTop: 15,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden', // Ensure images don't overflow the rounded corners
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  fallbackImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  emojiImage: {
    fontSize: 40,
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 10,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});