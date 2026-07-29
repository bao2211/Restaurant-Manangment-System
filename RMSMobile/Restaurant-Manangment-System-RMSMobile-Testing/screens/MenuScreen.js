import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image, TextInput, Modal, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService, getCategoryIcon, formatPrice } from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ScreenHeader from '../components/ScreenHeader';

export default function MenuScreen({ navigation, route }) {
  const { user, getUserRole } = useContext(AuthContext);
  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  
  // Memoize user role calculation to prevent unnecessary re-renders
  const userRole = useMemo(() => getUserRole(), [user]);
  const isCustomer = useMemo(() => {
    const role = userRole;
    return role === 'Customer' || role === 'customer' || role === 'CUSTOMER';
  }, [userRole]);
  
  console.log('MenuScreen - Current user role:', userRole, 'Is Customer:', isCustomer);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imageErrors, setImageErrors] = useState({}); // Track failed image loads
  const [userFavorites, setUserFavorites] = useState([]); // Track user's favorite items
  
  // Order form state - only initialize if not a customer
  const [orderItems, setOrderItems] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [selectedTable, setSelectedTable] = useState(null);
  // Order notification modal state
  const [showOrderNotification, setShowOrderNotification] = useState(false);
  const [createdOrderSummary, setCreatedOrderSummary] = useState(null);

  // Handlers for notification modal actions
  const handleCloseNotification = () => {
    console.log('[OrderNotification] Close pressed');
    setShowOrderNotification(false);
  };
  const handleGoToOrders = () => {
    console.log('[OrderNotification] Go To Orders pressed');
    setShowOrderNotification(false);
    
    // Navigate to orders screen - simplified approach
    try {
      console.log('Attempting to navigate to Orders');
      navigation.navigate('Orders');
      console.log('Successfully navigated to Orders');
    } catch (navError) {
      console.error('Navigation failed:', navError);
      // Show user-friendly message with instructions
      Alert.alert(
        'Navigation Issue', 
        'Unable to navigate to the orders screen automatically. Please navigate to the Orders tab manually to view your orders.',
        [{ text: 'OK' }]
      );
    }
  };
  const handleCreateAnother = () => {
    console.log('[OrderNotification] Create Another pressed');
    // Reset order items and generate a new order id but keep same table selection
    setOrderItems([]);
    const newValidOrderId = generateValidOrderId();
    setOrderId(newValidOrderId);
    console.log('Initialized new order after modal action with ID:', newValidOrderId);
    setShowOrderNotification(false);
  };

  const fetchUserFavorites = useCallback(async () => {
    try {
      if (!user || !user.userId) {
        console.log('No user or userId available for fetching favorites');
        return;
      }

      console.log('Fetching user favorites for userId:', user.userId);
      const favorites = await apiService.getFavorites();

      const favoriteIds = favorites
        .map(fav => (fav.foodId ?? '').toString().trim())
        .filter(id => id);
      console.log('User favorite food IDs:', favoriteIds);

      setUserFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching user favorites:', error);
      setUserFavorites([]);
    }
  }, [user]);

  // Fetch categories on component mount and initialize order
  useEffect(() => {
    fetchCategories();
    
    // Only initialize order for non-customer users
    if (!isCustomer) {
      const initialOrderId = generateValidOrderId();
      console.log('Initialized order with ID:', initialOrderId);
      setOrderId(initialOrderId);
    }
  }, [isCustomer]); // Include isCustomer as dependency
  
  // Separate effect for loading user favorites
  useEffect(() => {
    if (user && user.userId) {
      fetchUserFavorites();
    }
  }, [user, fetchUserFavorites]); // Include fetchUserFavorites dependency

  useEffect(() => {
    // Only handle table selection for non-customer users
    if (!isCustomer && route?.params?.selectedTable) {
      const table = route.params.selectedTable;
      const newOrderId = generateValidOrderId();
      console.log('Table selected from TableScreen:', table);
      console.log('Generated new OrderID for selected table:', newOrderId);

      setSelectedTable(table);
      setOrderItems([]);
      setOrderId(newOrderId);

      // Clear the selectedTable param to prevent infinite loops
      if (navigation?.setParams) {
        navigation.setParams({
          selectedTable: null
        });
      }
    }
  }, [route?.params?.selectedTable, isCustomer, navigation]); // More specific dependencies

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
        // Only set selectedCategory if it's not already set
        if (finalCategories.length > 0 && !selectedCategory) {
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
      
      // Only set selectedCategory if it's not already set
      if (finalCategories.length > 0 && !selectedCategory) {
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
        // Fetch all food items from all categories (showing duplicates is fine)
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

  // Toggle favorite function
  const toggleFavorite = async (foodId) => {
    try {
      if (!user || !user.userId) {
        Alert.alert('Login Required', 'Please login to add favorites');
        return;
      }

      const isFavorite = userFavorites.includes(foodId);
      console.log(`Toggling favorite for food ${foodId}. Currently favorite: ${isFavorite}`);
      
      if (isFavorite) {
        // Remove from favorites
        await apiService.removeFavorite(foodId);
        setUserFavorites(prev => prev.filter(id => id !== foodId));
        console.log(`Removed ${foodId} from favorites`);
      } else {
        // Add to favorites
        await apiService.addFavorite(foodId);
        setUserFavorites(prev => [...prev, foodId]);
        console.log(`Added ${foodId} to favorites`);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

  // Refresh function to reload both categories and food items
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchCategories();
      // If a category is selected, also refresh its food items
      if (selectedCategory) {
        await fetchFoodItemsByCategory(selectedCategory);
      }
      // Also refresh favorites
      if (user && user.userId) {
        await fetchUserFavorites();
      }
    } catch (error) {
      console.error('Error refreshing menu data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderMenuItem = (item) => {
    const hasImageError = imageErrors[item.id];
    const shouldShowImage = item.imageUrl && !hasImageError;
    const isFavorite = userFavorites.includes(item.id);
    
    // Check if item is already in order (for staff/admin)
    const itemInOrder = orderItems.find(orderItem => orderItem.id === item.id);
    const orderQuantity = itemInOrder ? itemInOrder.quantity : 0;

    // Check if item is already in cart (for customers)
    const itemInCart = cartItems.find(cartItem => cartItem.id === item.id);
    const cartQuantity = itemInCart ? itemInCart.quantity : 0;

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
          {/* Favorite button - only show for customers who are logged in */}
          {isCustomer && user && user.userId && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <MaterialCommunityIcons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#ff6b6b" : "#666"}
              />
            </TouchableOpacity>
          )}
          {/* Cart quantity badge - only show for customers who are logged in */}
          {isCustomer && user && user.userId && cartQuantity > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartQuantity}</Text>
            </View>
          )}
          {/* Order quantity badge - only show for admin/staff */}
          {!isCustomer && orderItems.find(orderItem => orderItem.id === item.id) && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {orderItems.find(orderItem => orderItem.id === item.id).quantity}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription}>{item.description}</Text>
          <View style={styles.menuItemFooter}>
            <Text style={styles.menuItemPrice}>{item.price}</Text>
            
            {/* For customers: Show cart controls (only when logged in) */}
            {isCustomer && user && user.userId && (
              <>
                {itemInCart ? (
                  <View style={styles.cartControls}>
                    <TouchableOpacity 
                      style={styles.cartButton}
                      onPress={() => decreaseQuantity(item.id)}
                    >
                      <MaterialCommunityIcons name="minus" size={16} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.cartQuantityText}>{cartQuantity}</Text>
                    <TouchableOpacity 
                      style={styles.cartButton}
                      onPress={() => increaseQuantity(item.id)}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                  >
                    <MaterialCommunityIcons name="cart-plus" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </>
            )}
            
            {/* For admin/staff: Show order sidebar controls */}
            {!isCustomer && (
              <>
                {orderItems.find(orderItem => orderItem.id === item.id) ? (
                  <View style={styles.cartControls}>
                    <TouchableOpacity 
                      style={styles.cartButton}
                      onPress={() => updateQuantity(item.id, -1)}
                    >
                      <MaterialCommunityIcons name="minus" size={16} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.cartQuantityText}>
                      {orderItems.find(orderItem => orderItem.id === item.id).quantity}
                    </Text>
                    <TouchableOpacity 
                      style={styles.cartButton}
                      onPress={() => updateQuantity(item.id, 1)}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => handleAddToOrder(item)}
                  >
                    <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Customer function: Add item to cart
  const handleAddToCart = (item) => {
    try {
      // Check if user is logged in
      if (!user || !user.userId) {
        Alert.alert('Đăng nhập yêu cầu', 'Vui lòng đăng nhập để thêm vào giỏ hàng', [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đăng nhập', onPress: () => navigation.navigate('Profile') }
        ]);
        return;
      }
      
      addToCart(item);
      Alert.alert('Thành công', `Đã thêm "${item.name}" vào giỏ hàng!`);
      console.log('Item added to cart:', item.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm món vào giỏ hàng');
    }
  };

  // Admin function: Add item to order sidebar (not cart)
  const handleAddToOrder = (item) => {
    try {
      // Check if item already exists in orderItems
      const existingItem = orderItems.find(orderItem => orderItem.id === item.id);
      
      if (existingItem) {
        // If item exists, increase quantity
        const updatedItems = orderItems.map(orderItem => {
          if (orderItem.id === item.id) {
            return { ...orderItem, quantity: orderItem.quantity + 1 };
          }
          return orderItem;
        });
        setOrderItems(updatedItems);
        Alert.alert('Thành công', `Đã tăng số lượng "${item.name}" trong đơn hàng!`);
      } else {
        // If item doesn't exist, add it with quantity 1
        const newOrderItem = {
          id: item.id,
          name: item.name,
          foodName: item.name,
          price: item.unitPrice,
          unitPrice: item.unitPrice,
          foodImage: item.imageUrl,
          imageUrl: item.imageUrl,
          description: item.description,
          categoryId: item.categoryId,
          quantity: 1
        };
        setOrderItems([...orderItems, newOrderItem]);
        Alert.alert('Thành công', `Đã thêm "${item.name}" vào đơn hàng!`);
      }
      
      console.log('Item added to order:', item.name);
    } catch (error) {
      console.error('Error adding to order:', error);
      Alert.alert('Lỗi', 'Không thể thêm món vào đơn hàng');
    }
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

  // Generate a valid OrderID (10 characters, starts with "ORD") - Updated to match API format
  const generateValidOrderId = () => {
    const timestamp = Date.now();
    // Take last 7 digits of timestamp to ensure 10 total characters with "ORD" prefix
    const orderNumber = timestamp.toString().slice(-7);
    return `ORD${orderNumber}`;
  };

  // Validate OrderID format (10 characters, starts with "ORD") - Updated to match API format
  const validateOrderId = (orderIdToValidate) => {
    if (!orderIdToValidate) {
      console.log('OrderID validation failed: OrderID is empty');
      return false;
    }
    
    if (orderIdToValidate.length !== 10) {
      console.log(`OrderID validation failed: Length is ${orderIdToValidate.length}, expected 10`);
      return false;
    }
    
    if (!orderIdToValidate.startsWith('ORD')) {
      console.log(`OrderID validation failed: Does not start with "ORD", starts with "${orderIdToValidate.substring(0, 3)}"`);
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
      Alert.alert('Lỗi', 'Vui lòng thêm món vào đơn hàng trước khi gửi');
      return;
    }

    if (!selectedTable) {
      console.log('ERROR: No table selected');
      Alert.alert(
        'Chưa chọn bàn',
        'Vui lòng chọn bàn từ màn hình Bàn trước khi tạo đơn hàng',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Chọn bàn', 
            onPress: () => navigation.navigate('Table')
          }
        ]
      );
      return;
    }

    // Validate OrderID format
    if (!validateOrderId(orderId)) {
      console.log('ERROR: Invalid OrderID format');
      Alert.alert('Lỗi', 'Mã đơn hàng không hợp lệ. Mã đơn hàng phải có 10 ký tự và bắt đầu bằng "ORD"');
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
        Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra kết nối internet và thử lại.');
        return;
      }

      // Try alternative fetch test
      console.log('=== TESTING WITH FETCH ===');
      const fetchTest = await apiService.testWithFetch();
      console.log('Fetch test result:', fetchTest);

      // Check if current user is available
      if (!user || !user.userId) {
        console.log('ERROR: No current user available');
        Alert.alert('Lỗi', 'Bạn phải đăng nhập để tạo đơn hàng. Vui lòng đăng nhập và thử lại.');
        return;
      }

      console.log('Current user info:', {
        userId: user.userId,
        userName: user.userName || user.fullName,
        role: user.role
      });

      // Prepare order data for API with validated format
      // Based on API documentation, using the full Order object format
      const orderData = {
        orderId: orderId, // Already validated to be 10 chars starting with "HD"
        status: 'Chưa làm', // Default status for new orders
        total: total,
        note: `Order for ${selectedTable.tableName || selectedTable.tableId} by ${user.userName || user.fullName || 'Staff'}`,
        discount: 0,
        tableId: (selectedTable.tableId || selectedTable.id || '').trim(), // Clean up extra spaces
        userId: user.userId // Use current logged-in employee's ID
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
          status: 'Chưa làm', // Default status for new orders
          total: parseFloat(total), // Ensure it's a proper decimal
          note: `Order for ${selectedTable.tableName || selectedTable.tableId} by ${user.userName || user.fullName || 'Staff'}`,
          discount: 0.0, // Explicit decimal format
          tableId: (selectedTable.tableId || selectedTable.id || '').trim(),
          userId: user.userId.toString() // Use current user's ID as string format
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
        console.log(`=== CREATING ${orderItems.length} ORDER DETAILS ===`);
        let successfulDetails = 0;
        let failedDetails = 0;
        
        for (let i = 0; i < orderItems.length; i++) {
          const item = orderItems[i];
          const orderDetailData = {
            foodId: (item.id || '').toString().trim(), // Ensure it's a string and clean up spaces
            orderId: createdOrderId.toString().trim(), // Ensure it's a string and clean up spaces  
            quantity: parseInt(item.quantity) || 1, // Ensure it's an integer
            // Explicit initial status for each detail to prevent backend auto-upgrade
            status: 'Chưa làm'
          };
          
          console.log(`Creating order detail ${i + 1}/${orderItems.length}:`, orderDetailData);
          console.log(`Item details - ID: ${item.id}, Name: ${item.name}, Quantity: ${item.quantity}, Price: ${item.price}`);
          
          try {
            const createdDetail = await apiService.createOrderDetail(orderDetailData);
            console.log(`Order detail ${i + 1} created successfully:`, createdDetail);
            successfulDetails++;
          } catch (detailError) {
            console.error(`Error creating order detail ${i + 1}:`, detailError);
            console.error('Order detail error response:', detailError.response?.data);
            console.error('Order detail error status:', detailError.response?.status);
            failedDetails++;
            
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
        
        console.log(`=== ORDER DETAILS SUMMARY ===`);
        console.log(`Successful: ${successfulDetails}/${orderItems.length}`);
        console.log(`Failed: ${failedDetails}/${orderItems.length}`);
        
        if (failedDetails > 0) {
          console.warn(`Warning: ${failedDetails} order details failed to create`);
        }
      } else {
        console.error('Order creation failed, skipping order details creation');
        console.error('Order response indicates error:', createdOrder);
        throw new Error('Order creation failed with validation errors');
      }

      console.log('=== ORDER SUBMISSION COMPLETE ===');
      
      // Show custom notification modal instead of Alert
      const summary = {
        orderId: createdOrderId,
        table: selectedTable?.tableName || selectedTable?.tableId || 'N/A',
        items: orderItems.length,
        total: total,
        status: 'Chưa làm',
        createdAt: new Date().toLocaleString()
      };
      setCreatedOrderSummary(summary);
      console.log('[OrderNotification] Showing modal with summary:', summary);
      setShowOrderNotification(true);

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
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        style={styles.orderFormContainer}
      >
        <View style={styles.orderFormHeader}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.orderFormTitleContainer}
          >
            <MaterialCommunityIcons name="clipboard-list-outline" size={24} color="white" />
            <Text style={styles.orderFormTitle}>Chi tiết đơn hàng</Text>
          </LinearGradient>
        </View>
        
        {/* Order Info */}
        <View style={styles.orderInfoSection}>
          <LinearGradient
            colors={['#E3F2FD', '#F3E5F5']}
            style={styles.orderInfoCard}
          >
            <View style={styles.orderInfoRow}>
              <MaterialCommunityIcons name="barcode-scan" size={20} color="#667EEA" />
              <View style={styles.orderInfoContent}>
                <Text style={styles.orderInfoLabel}>Mã đơn hàng:</Text>
                <Text style={styles.orderInfoValue}>{orderId || 'Chưa có mã'}</Text>
              </View>
            </View>
            
            <View style={styles.orderInfoDivider} />
            
            <TouchableOpacity 
              style={styles.orderInfoRow}
              onPress={() => {
                console.log('Table selection clicked, navigating to Table screen');
                navigation.navigate('Table');
              }}
            >
              <MaterialCommunityIcons name="table-furniture" size={20} color="#667EEA" />
              <View style={styles.orderInfoContent}>
                <Text style={styles.orderInfoLabel}>Bàn:</Text>
                <Text style={[styles.orderInfoValue, !selectedTable && styles.orderInfoValueWarning]}>
                  {selectedTable ? `${selectedTable.tableName || selectedTable.tableId}` : 'Chưa chọn bàn (Nhấn để chọn)'}
                </Text>
              </View>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={20} 
                color={!selectedTable ? "#E74C3C" : "#667EEA"} 
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>
        
        {/* Order Items */}
        <View style={styles.orderItemsSection}>
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.orderItemsHeader}
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={20} color="white" />
            <Text style={styles.orderItemsTitle}>Danh sách món ({orderItems.length})</Text>
          </LinearGradient>
          
          <ScrollView style={styles.orderItemsList} showsVerticalScrollIndicator={false}>
            {orderItems.length === 0 ? (
              <View style={styles.emptyOrderContainer}>
                <MaterialCommunityIcons name="cart-outline" size={48} color="#BDC3C7" />
                <Text style={styles.emptyOrderText}>Chưa có món nào</Text>
                <Text style={styles.emptyOrderSubText}>Thêm món từ menu bên trái</Text>
              </View>
            ) : (
              orderItems.map((item, index) => (
                <View key={item.id} style={styles.orderItemWrapper}>
                  <LinearGradient
                    colors={['#FFFFFF', '#F8F9FA']}
                    style={styles.orderItem}
                  >
                    <View style={styles.orderItemHeader}>
                      <View style={styles.itemNumberContainer}>
                        <LinearGradient
                          colors={['#FF6B35', '#FF8E53']}
                          style={styles.itemNumber}
                        >
                          <Text style={styles.itemNumberText}>{index + 1}</Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.orderItemInfo}>
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        <View style={styles.priceRow}>
                          <Text style={styles.unitPriceLabel}>Đơn giá:</Text>
                          <Text style={styles.orderItemPrice}>{formatPrice(item.price)}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.orderItemFooter}>
                      <View style={styles.quantitySection}>
                        <Text style={styles.quantityLabel}>Số lượng:</Text>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity 
                            onPress={() => updateQuantity(item.id, -1)}
                          >
                            <LinearGradient
                              colors={['#E74C3C', '#C0392B']}
                              style={styles.quantityButton}
                            >
                              <MaterialCommunityIcons name="minus" size={14} color="white" />
                            </LinearGradient>
                          </TouchableOpacity>
                          <View style={styles.quantityDisplay}>
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                          </View>
                          <TouchableOpacity 
                            onPress={() => updateQuantity(item.id, 1)}
                          >
                            <LinearGradient
                              colors={['#27AE60', '#229954']}
                              style={styles.quantityButton}
                            >
                              <MaterialCommunityIcons name="plus" size={14} color="white" />
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.totalPriceContainer}>
                        <Text style={styles.totalPriceLabel}>Thành tiền:</Text>
                        <LinearGradient
                          colors={['#4CAF50', '#45A049']}
                          style={styles.totalPriceTag}
                        >
                          <Text style={styles.totalPriceText}>
                            {formatPrice(item.price * item.quantity)}
                          </Text>
                        </LinearGradient>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
              ))
            )}
          </ScrollView>
        </View>
        
        {/* Total */}
        <LinearGradient
          colors={['#E3F2FD', '#F0F8FF']}
          style={styles.totalSection}
        >
          <View style={styles.totalHeader}>
            <MaterialCommunityIcons name="calculator" size={24} color="#2196F3" />
            <Text style={styles.totalLabel}>Tổng cộng</Text>
          </View>
          <View style={styles.totalAmountContainer}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.totalAmountBadge}
            >
              <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>
        
        {/* Action Buttons */}
        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setOrderItems([])}
          >
            <LinearGradient
              colors={['#E74C3C', '#C0392B']}
              style={styles.clearButtonGradient}
            >
              <MaterialCommunityIcons name="delete-outline" size={18} color="white" />
              <Text style={styles.clearButtonText}>Xóa đơn</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={submitOrder}
          >
            <LinearGradient
              colors={['#27AE60', '#229954']}
              style={styles.submitButtonGradient}
            >
              <MaterialCommunityIcons name="send-outline" size={18} color="white" />
              <Text style={styles.submitButtonText}>Gửi đơn</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
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
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundImageContainer}>
          <Image 
            source={{
              uri: 'https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/cac_mon_an_toi_01_d6cd0972c7.jpg'
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>
      </View>
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FF6B35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeSection}
      >
        <View style={styles.welcomeContent}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={60} color="white" />
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Thực Đơn</Text>
            <Text style={styles.welcomeSubtitle}>
              Khám phá các món ăn đa dạng{'\n'}
              Chọn và đặt món yêu thích của bạn
            </Text>
          </View>
        </View>
        
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>
      
      {/* Main Content Area */}
      <View style={[styles.mainContent, isCustomer && styles.mainContentFullWidth]}>
        {/* Left Side - Menu */}
        <View style={[styles.menuSection, isCustomer && styles.menuSectionFullWidth]}>
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
                  onPress={() => setSelectedCategory(category.id)}
                  style={styles.categoryTabWrapper}
                >
                  {selectedCategory === category.id ? (
                    <LinearGradient
                      colors={['#FF6B35', '#FF8E53', '#FFA726']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.activeCategoryTab}
                    >
                      <MaterialCommunityIcons 
                        name={category.icon} 
                        size={18} 
                        color="white" 
                      />
                      <Text style={styles.activeCategoryText}>
                        {category.name}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.categoryTab}>
                      <MaterialCommunityIcons 
                        name={category.icon} 
                        size={18} 
                        color="#FF6B35" 
                      />
                      <Text style={styles.categoryText}>
                        {category.name}
                      </Text>
                    </View>
                  )}
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
        
        {/* Right Side - Order Form - Only show for non-customers */}
        {!isCustomer && renderOrderForm()}
      </View>

      {/* Order Creation Notification Modal - Only show for non-customers */}
      {!isCustomer && (
        <Modal
          visible={showOrderNotification}
          transparent
          animationType="fade"
          onRequestClose={handleCloseNotification}
        >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="check-circle" size={42} color="#27AE60" />
              <Text style={styles.modalTitle}>Order Created!</Text>
              <Text style={styles.modalSubtitle}>Your order has been submitted successfully.</Text>
            </View>
            {createdOrderSummary && (
              <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Order ID:</Text>
                  <Text style={styles.summaryValue}>{createdOrderSummary.orderId}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Table:</Text>
                  <Text style={styles.summaryValue}>{createdOrderSummary.table}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Items:</Text>
                  <Text style={styles.summaryValue}>{createdOrderSummary.items}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total:</Text>
                  <Text style={[styles.summaryValue, styles.summaryTotal]}>{formatPrice(createdOrderSummary.total)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Status:</Text>
                  <Text style={[styles.summaryValue, styles.statusBadge]}>{createdOrderSummary.status}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Created:</Text>
                  <Text style={styles.summaryValue}>{createdOrderSummary.createdAt}</Text>
                </View>
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.secondaryButton]} onPress={handleCloseNotification}>
                <Text style={[styles.modalButtonText, styles.secondaryButtonText]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.primaryButton]} onPress={handleGoToOrders}>
                <MaterialCommunityIcons name="clipboard-list" size={18} color="white" />
                <Text style={styles.modalButtonText}>Orders</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.accentButton]} onPress={handleCreateAnother}>
                <MaterialCommunityIcons name="plus-circle" size={18} color="white" />
                <Text style={styles.modalButtonText}>New Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  // Background Image Styles
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImageContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  // Header Section Styles
  welcomeSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginRight: 20,
    padding: 10,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#FFA726',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    fontWeight: '400',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: -30,
    left: -30,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 1,
  },
  menuSection: {
    flex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    margin: 10,
    borderRadius: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    backdropFilter: 'blur(15px)',
  },
  orderFormContainer: {
    flex: 1,
    margin: 12,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  orderFormHeader: {
    marginBottom: 20,
  },
  orderFormTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  orderFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  orderInfoSection: {
    marginBottom: 20,
  },
  orderInfoCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderInfoContent: {
    flex: 1,
    marginLeft: 12,
  },
  orderInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667EEA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  orderInfoValue: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '500',
  },
  orderInfoValueWarning: {
    color: '#E74C3C',
    fontWeight: '600',
  },
  orderInfoDivider: {
    height: 1,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    marginVertical: 8,
    marginLeft: 32,
  },
  orderItemsSection: {
    marginBottom: 20,
  },
  orderItemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 3,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  orderItemsList: {
    flex: 1,
    maxHeight: 250,
    backgroundColor: '#F8F9FA',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  emptyOrderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 12,
  },
  emptyOrderSubText: {
    fontSize: 13,
    color: '#95A5A6',
    marginTop: 4,
    textAlign: 'center',
  },
  orderItemWrapper: {
    marginBottom: 8,
  },
  orderItem: {
    padding: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  orderItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemNumberContainer: {
    marginRight: 10,
    alignSelf: 'center',
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  itemNumberText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: 'white',
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitPriceLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginRight: 4,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
  },
  orderItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  quantitySection: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  quantityDisplay: {
    backgroundColor: '#E8F6F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginHorizontal: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
  },
  totalPriceLabel: {
    fontSize: 11,
    color: '#7F8C8D',
    marginBottom: 3,
  },
  totalPriceTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  totalPriceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  totalSection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 10,
  },
  totalAmountContainer: {
    alignItems: 'center',
  },
  totalAmountBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  clearButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  clearButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  categoryContentContainer: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  categoryScrollView: {
    flexGrow: 0,
  },
  categoryTabWrapper: {
    marginHorizontal: 6,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#FF6B35',
    elevation: 2,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeCategoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  activeCategoryText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 20,
  },
  categoryTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(44, 62, 80, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  menuItemWrapper: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  menuItemImage: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 16,
    marginLeft: 16,
    marginRight: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
  },
  menuItemImageContainer: {
    width: 90,
    height: 90,
    borderRadius: 16,
    marginLeft: 16,
    marginRight: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    resizeMode: 'cover',
  },
  fallbackImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  emojiImage: {
    fontSize: 40,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  menuItemContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  menuItemName: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C3E50',
    letterSpacing: 0.3,
    lineHeight: 22,
    marginRight: 8,
  },
  priceContainer: {
    alignSelf: 'flex-start',
  },
  priceTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  menuItemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 12,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFA726',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
    textAlign: 'center',
  },
  summarySection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
  },
  summaryValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  summaryTotal: {
    color: '#27AE60',
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: '#FFEFD5',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 12,
    color: '#D35400',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
  },
  primaryButton: {
    backgroundColor: '#27AE60',
  },
  accentButton: {
    backgroundColor: '#FF6B35',
  },
  secondaryButton: {
    backgroundColor: '#ECF0F1',
  },
  // Cart-related styles
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  secondaryButtonText: {
    color: '#2C3E50',
    marginLeft: 0,
  },
  // Add to Order button styles (for staff/admin)
  addToOrderButton: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addToOrderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addToOrderButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  // Order quantity badge (for staff/admin)
  orderQuantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#27AE60',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 2,
    borderColor: 'white',
  },
  orderQuantityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Customer-specific styles for full-width menu
  mainContentFullWidth: {
    flexDirection: 'column', // Stack vertically instead of side-by-side
  },
  menuSectionFullWidth: {
    flex: 1, // Take full available space
  },
});
