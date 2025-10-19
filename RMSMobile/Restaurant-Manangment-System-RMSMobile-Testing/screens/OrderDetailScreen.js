import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, API_BASE_URL } from '../services/apiService';

const OrderDetailScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showFoodListModal, setShowFoodListModal] = useState(false);
  const [foodItems, setFoodItems] = useState([]);
  const [loadingFoodItems, setLoadingFoodItems] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foodQuantities, setFoodQuantities] = useState({});

  const [orderBy, setOrderBy] = useState('newest'); // 'newest' or 'oldest'

  // Status options for order details (expanded to match API documentation)
  const statusOptions = [
    'All',
    'Chưa làm',
    'Đang chuẩn bị',
    'Sẵn sàng',
    'Đã phục vụ',
    'Hoàn tất',
    'Hủy'
  ];

  // Order status colors
  const orderStatusColors = {
    'Pending': '#F39C12',
    'Đang xử lý': '#F39C12',
    'InProgress': '#F39C12',
    'Hoàn tất': '#27AE60',
    'Completed': '#27AE60',
    'Cancelled': '#E74C3C',
    'Hủy': '#E74C3C',
  };

  const allowedStatuses = new Set([
    'Chưa làm',
    'Đang chuẩn bị', 
    'Sẵn sàng',
    'Đã phục vụ',
    'Hoàn tất',
    'Hủy'
  ]);

  const normalizeStatusValue = (status) => {
    console.log('normalizeStatusValue called with:', status, 'type:', typeof status);
    
    if (status === undefined || status === null) {
      console.log('Status is null/undefined, returning Chưa làm');
      return 'Chưa làm';
    }

    const trimmed = String(status).trim();
    console.log('Trimmed status:', trimmed);
    
    if (!trimmed) {
      console.log('Empty trimmed status, returning Chưa làm');
      return 'Chưa làm';
    }

    // Direct match first (case-sensitive for Vietnamese)
    if (allowedStatuses.has(trimmed)) {
      console.log('Direct match found:', trimmed);
      return trimmed;
    }

    // Normalize and check variations
    const normalizedLower = trimmed.normalize('NFC').toLowerCase();
    console.log('Normalized lowercase:', normalizedLower);

    // Map common variations to proper Vietnamese status
    const statusMap = {
      'chưa làm': 'Chưa làm',
      'chua lam': 'Chưa làm',
      'not started': 'Chưa làm',
      'pending': 'Chưa làm',
      
      'đang chuẩn bị': 'Đang chuẩn bị',
      'dang chuan bi': 'Đang chuẩn bị',
      'preparing': 'Đang chuẩn bị',
      'in progress': 'Đang chuẩn bị',
      
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

    const mappedStatus = statusMap[normalizedLower];
    console.log('Mapped status result:', mappedStatus);
    if (mappedStatus) {
      console.log('Mapped status found:', mappedStatus);
      return mappedStatus;
    }

    // Default to 'Chưa làm' for unknown statuses
    console.warn('Unknown status value:', status, 'trimmed:', trimmed, 'normalized:', normalizedLower, 'defaulting to Chưa làm');
    return 'Chưa làm';
  };

  const statusColors = {
    'Chưa làm': '#E74C3C',        // Red - Not started
    'Đang chuẩn bị': '#F39C12',   // Orange - Preparing
    'Sẵn sàng': '#3498DB',        // Blue - Ready
    'Đã phục vụ': '#2ECC71',      // Light Green - Served
    'Hoàn tất': '#27AE60',        // Green - Completed
    'Hủy': '#95A5A6',             // Gray - Cancelled
  };

  const trimIdValue = (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const normalizeIdValue = (value) => {
    const trimmed = trimIdValue(value);
    return trimmed ? trimmed.toUpperCase() : undefined;
  };

  // Load orders and their details from API
  const loadOrdersWithDetails = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading orders, order details, and food info from API...');

      // Note: API testing confirmed that backend doesn't return status field
      // We'll implement a local status management system as a workaround

      const [ordersResponse, orderDetailsResponse, foodsResponse] = await Promise.all([
        apiService.getAllOrders().catch(error => {
          console.error('Failed to fetch orders:', error);
          throw error;
        }),
        apiService.getAllOrderDetails().catch(error => {
          console.error('Failed to fetch order details:', error);
          throw error;
        }),
        apiService.getAllFoodItems().catch(error => {
          console.warn('Failed to fetch food items, continuing without names:', error);
          return [];
        })
      ]);

        const ordersArray = Array.isArray(ordersResponse)
          ? ordersResponse
          : ordersResponse
            ? [ordersResponse]
            : [];
        const orderDetailsArray = Array.isArray(orderDetailsResponse)
          ? orderDetailsResponse
          : orderDetailsResponse
            ? [orderDetailsResponse]
            : [];
        const foodsArray = Array.isArray(foodsResponse)
          ? foodsResponse
          : foodsResponse
            ? [foodsResponse]
            : [];

        console.log('Orders fetched:', ordersArray.length);
        console.log('Order details fetched:', orderDetailsArray.length);
        console.log('Food items fetched:', foodsArray.length);

        // Build lookup maps for quick access
        const foodLookup = new Map();
        foodsArray.forEach(food => {
          if (!food) {
            return;
          }
          const trimmedFoodId = trimIdValue(food.foodId ?? food.foodID ?? food.id);
          const normalizedFoodId = normalizeIdValue(trimmedFoodId ?? food.foodId ?? food.foodID ?? food.id);
          if (!normalizedFoodId) {
            return;
          }
          foodLookup.set(normalizedFoodId, {
            name: food.foodName ?? food.name ?? `Food ${normalizedFoodId}`,
            unitPrice: Number(food.unitPrice ?? food.UnitPrice ?? food.price ?? food.Price ?? 0)
          });
        });

        const transformDetail = (detail, fallbackNormalizedOrderId, fallbackTrimmedOrderId) => {
          if (!detail || typeof detail !== 'object') {
            return null;
          }

          const rawOrderIdCandidate = detail.orderId ?? detail.orderID ?? detail.OrderId ?? detail.OrderID ?? detail.order?.orderId ?? detail.order?.orderID ?? detail.order?.id ?? fallbackTrimmedOrderId ?? fallbackNormalizedOrderId;
          const trimmedOrderId = trimIdValue(rawOrderIdCandidate) ?? trimIdValue(fallbackTrimmedOrderId) ?? (fallbackNormalizedOrderId ? fallbackNormalizedOrderId : undefined);
          const normalizedOrderId = normalizeIdValue(rawOrderIdCandidate) ?? fallbackNormalizedOrderId ?? normalizeIdValue(trimmedOrderId);

          const rawFoodIdCandidate = detail.foodId ?? detail.foodID ?? detail.FoodId ?? detail.FoodID ?? detail.food?.foodId ?? detail.food?.foodID ?? detail.food?.id ?? detail.foodInfo?.foodId ?? detail.foodInfo?.foodID ?? detail.foodInfo?.id ?? detail.foodInfoId ?? detail.id;
          const trimmedFoodId = trimIdValue(rawFoodIdCandidate);
          const normalizedFoodId = normalizeIdValue(rawFoodIdCandidate) ?? normalizeIdValue(trimmedFoodId);

          if (!normalizedOrderId || !normalizedFoodId) {
            console.warn('Skipping order detail due to missing identifiers', detail);
            return null;
          }

          const foodInfo = foodLookup.get(normalizedFoodId);
          const rawQuantity = Number(detail.quantity ?? detail.qty ?? detail.Quantity ?? detail.Qty ?? 0);
          const quantity = Number.isFinite(rawQuantity) ? rawQuantity : 0;
          const rawUnitPrice = Number(detail.unitPrice ?? detail.UnitPrice ?? detail.price ?? detail.Price ?? foodInfo?.unitPrice ?? 0);
          const unitPrice = Number.isFinite(rawUnitPrice) ? rawUnitPrice : 0;
          const rawStatus = detail.status ?? detail.Status;
          
          // Debug logging for status processing BEFORE normalization
          if (normalizedOrderId === 'HD16D450CE' || trimmedOrderId === 'HD16D450CE') {
            console.log('=== BEFORE STATUS NORMALIZATION - ORDER HD16D450CE ===');
            console.log('Raw detail object keys:', Object.keys(detail));
            console.log('Raw detail.status:', detail.status);
            console.log('Raw detail.Status:', detail.Status);
            console.log('Combined rawStatus:', rawStatus);
          }
          
          // For debugging: temporarily bypass normalization for the target order
          let statusValue;
          let isAlreadyNormalized = false;
          
          if (normalizedOrderId === 'HD16D450CE' || trimmedOrderId === 'HD16D450CE') {
            console.log('=== BYPASSING NORMALIZATION FOR HD16D450CE ===');
            console.log('Using raw status directly:', rawStatus);
            statusValue = rawStatus || 'Chưa làm'; // Use raw status for debugging
          } else {
            // Check if status is already properly normalized by API service
            isAlreadyNormalized = rawStatus && allowedStatuses.has(rawStatus);
            statusValue = isAlreadyNormalized ? rawStatus : normalizeStatusValue(rawStatus);
          }
          
          // Debug logging for status processing AFTER normalization
          if (normalizedOrderId === 'HD16D450CE' || trimmedOrderId === 'HD16D450CE') {
            console.log('=== AFTER STATUS NORMALIZATION - ORDER HD16D450CE ===');
            console.log('Was already normalized?', isAlreadyNormalized);
            console.log('Final normalized status value:', statusValue);
            console.log('Food ID:', normalizedFoodId);
          }
          
          const foodName =
            detail.foodName ??
            detail.food?.foodName ??
            detail.food?.name ??
            detail.foodInfo?.foodName ??
            detail.foodInfo?.name ??
            foodInfo?.name ??
            `Food ${trimIdValue(rawFoodIdCandidate) ?? normalizedFoodId}`;

          return {
            ...detail,
            orderId: trimmedOrderId ?? '',
            normalizedOrderId,
            foodId: trimmedFoodId ?? '',
            normalizedFoodId,
            quantity,
            unitPrice,
            status: statusValue,
            foodName,
            totalPrice: quantity * unitPrice,
          };
        };

        const processDetailArray = (details, fallbackNormalizedOrderId, fallbackTrimmedOrderId) => {
          const array = Array.isArray(details) ? details : details ? [details] : [];
          return array
            .map(detail => transformDetail(detail, fallbackNormalizedOrderId, fallbackTrimmedOrderId))
            .filter(Boolean);
        };

        const detailsByOrder = new Map();
        orderDetailsArray.forEach(detail => {
          const processed = transformDetail(detail);
          if (!processed) {
            return;
          }
          if (!detailsByOrder.has(processed.normalizedOrderId)) {
            detailsByOrder.set(processed.normalizedOrderId, []);
          }
          detailsByOrder.get(processed.normalizedOrderId).push(processed);
        });

        const ordersWithDetails = ordersArray.map(order => {
          const rawOrderId = order.orderId ?? order.orderID ?? order.OrderId ?? order.OrderID ?? order.id ?? order.order?.orderId ?? order.order?.orderID ?? order.order?.id;
          const trimmedOrderId = trimIdValue(rawOrderId);
          const normalizedOrderId = normalizeIdValue(rawOrderId);

          const orderDetailsList = normalizedOrderId ? (detailsByOrder.get(normalizedOrderId) || []) : [];
          const computedOrderTotal = orderDetailsList.reduce((sum, detail) => sum + (detail.totalPrice || 0), 0);
          const fallbackOrderTotal = Number(order.total ?? order.Total ?? order.totalAmount ?? order.TotalAmount ?? 0);
          const orderTotal = Number.isFinite(computedOrderTotal) && computedOrderTotal > 0
            ? computedOrderTotal
            : Number.isFinite(fallbackOrderTotal)
              ? fallbackOrderTotal
              : 0;

          return {
            ...order,
            orderId: trimmedOrderId ?? normalizedOrderId ?? String(order.id ?? `unknown-${Math.random().toString(36).slice(2)}`),
            normalizedOrderId,
            tableId: trimIdValue(order.tableId ?? order.table?.tableId ?? order.table?.id) ?? 'N/A',
            orderDate: order.orderDate ?? order.OrderDate ?? order.createDate ?? order.createdTime ?? order.createdAt ?? order.timeCreate ?? null,
            orderDetails: orderDetailsList,
            totalItems: orderDetailsList.length,
            orderTotal,
          };
        });

        const fallbackOrders = ordersWithDetails.filter(order => order.orderDetails.length === 0 && order.orderId);

        if (fallbackOrders.length > 0) {
          console.log(`Attempting fallback detail fetch for ${fallbackOrders.length} orders with zero preloaded details`);
          for (const fallbackOrder of fallbackOrders) {
            try {
              const detailsRaw = await apiService.getOrderDetails(fallbackOrder.orderId);
              const processedFallback = processDetailArray(detailsRaw, fallbackOrder.normalizedOrderId, fallbackOrder.orderId);
              if (processedFallback.length > 0) {
                fallbackOrder.orderDetails = processedFallback;
                fallbackOrder.totalItems = processedFallback.length;
                fallbackOrder.orderTotal = processedFallback.reduce((sum, detail) => sum + (detail.totalPrice || 0), 0);
                if (fallbackOrder.normalizedOrderId) {
                  detailsByOrder.set(fallbackOrder.normalizedOrderId, processedFallback);
                }
              }
            } catch (fallbackError) {
              console.error(`Fallback fetch failed for order ${fallbackOrder.orderId}:`, fallbackError);
            }
          }
        }

        console.log('Processed orders with attached details:', ordersWithDetails.length);

        setOrders(ordersWithDetails);
        setFilteredOrders(ordersWithDetails);
        setExpandedOrders([]);

    } catch (error) {
      console.error('Error loading orders with details:', error);
      Alert.alert(
        'Connection Error',
        `Failed to load orders: ${error.message}. Please check your internet connection and try again.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort orders based on search, status, and order
  const filterOrders = useCallback(() => {
    let filtered = [...orders];

    // Filter by search query (order ID, table ID, or food names)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(order => {
        const orderMatch = (order.orderId || '').toLowerCase().includes(query) ||
                          (order.tableId || '').toLowerCase().includes(query);
        
        const detailMatch = order.orderDetails?.some(detail =>
          (detail.foodId || '').toLowerCase().includes(query) ||
          (detail.foodName || '').toLowerCase().includes(query)
        );
        
        return orderMatch || detailMatch;
      });
    }

    // Filter by status (check if any order detail has the status)
    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => 
        order.orderDetails?.some(detail => detail.status === statusFilter)
      );
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate || a.createdTime || 0);
      const dateB = new Date(b.orderDate || b.createdTime || 0);
      
      if (orderBy === 'newest') {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchQuery, statusFilter, orderBy]);



  // Toggle order expansion
  const toggleOrderExpansion = (orderId) => {
    const normalizedId = normalizeIdValue(orderId);
    if (!normalizedId) {
      return;
    }

    setExpandedOrders((prevExpanded) => {
      if (prevExpanded.includes(normalizedId)) {
        return prevExpanded.filter((id) => id !== normalizedId);
      }
      return [...prevExpanded, normalizedId];
    });
  };

  // Load food items and categories for adding to order
  const loadFoodItems = async () => {
    try {
      setLoadingFoodItems(true);
      console.log('Loading food items and categories for order addition...');
      
      const [foodResponse, categoriesResponse] = await Promise.all([
        apiService.getAllFoodItems(),
        apiService.getCategories()
      ]);
      
      setFoodItems(foodResponse || []);
      setCategories(categoriesResponse || []);
      console.log('Food items loaded:', foodResponse?.length || 0);
      console.log('Categories loaded:', categoriesResponse?.length || 0);
    } catch (error) {
      console.error('Error loading food items:', error);
      Alert.alert('Error', 'Failed to load food items. Please try again.');
    } finally {
      setLoadingFoodItems(false);
    }
  };

  // Filter food items by category
  const getFilteredFoodItems = () => {
    if (selectedCategory === 'All') {
      return foodItems;
    }
    return foodItems.filter(item => item.cateId === selectedCategory);
  };

  // Handle adding new item to order
  const handleAddItem = async (orderId) => {
    setSelectedOrderId(orderId);
    setSelectedCategory('All'); // Reset category filter
    setFoodQuantities({}); // Reset quantities when opening modal
    setShowFoodListModal(true);
    await loadFoodItems();
  };

  // Update quantity for a food item
  const updateFoodQuantity = (foodId, delta) => {
    setFoodQuantities(prev => {
      const currentQuantity = prev[foodId] || 1;
      const newQuantity = Math.max(1, currentQuantity + delta);
      return {
        ...prev,
        [foodId]: newQuantity
      };
    });
  };

  // Get quantity for a food item
  const getFoodQuantity = (foodId) => {
    return foodQuantities[foodId] || 1;
  };

  // Handle selecting a food item to add to the order
  const handleSelectFoodItem = async (foodItem) => {
    try {
      const foodId = foodItem.foodId || foodItem.id;
      const quantity = getFoodQuantity(foodId);
      console.log('Adding food item to order:', foodItem, 'Order ID:', selectedOrderId, 'Quantity:', quantity);
      
      // Create order detail data
      const orderDetailData = {
        orderId: selectedOrderId,
        foodId: foodId,
        quantity: quantity,
        unitPrice: foodItem.unitPrice || foodItem.price || 0,
        status: 'Chưa làm'
      };

      // Call API to create order detail
      const response = await apiService.createOrderDetail(orderDetailData);
      console.log('Order detail created:', response);
      console.log('📊 Order updated - OrdersScreen will refresh automatically when navigated back');

      // Close modal and refresh data
      setShowFoodListModal(false);
      setSelectedOrderId(null);
      
      Alert.alert(
        'Thành công', 
        `Đã thêm ${quantity} ${foodItem.foodName || foodItem.name} vào đơn hàng ${selectedOrderId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Refresh the orders list
              loadOrdersWithDetails();
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error adding food item to order:', error);
      Alert.alert(
        'Lỗi',
        'Không thể thêm món vào đơn hàng. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrdersWithDetails();
    setRefreshing(false);
  }, [loadOrdersWithDetails]);

  // Test API connection and load data on component mount
  useEffect(() => {
    const initializeScreen = async () => {
      console.log('OrderDetailScreen initializing...');
      console.log('API Base URL:', API_BASE_URL);
      
      // Test API connection first
      try {
        const connectionTest = await apiService.testConnection();
        console.log('API connection test result:', connectionTest);
        if (!connectionTest) {
          Alert.alert(
            'Connection Issue',
            'Unable to connect to the server. Please check your internet connection.',
            [
              { text: 'Retry', onPress: () => loadOrdersWithDetails() },
              { text: 'Cancel', style: 'cancel' }
            ]
          );
          return;
        }
      } catch (error) {
        console.error('Connection test failed:', error);
      }
      
      // Load order details
      await loadOrdersWithDetails();
    };
    
    initializeScreen();
  }, [loadOrdersWithDetails]);

  // Apply filters when search, status, or order changes
  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  // Render order detail item inside expanded order
  const renderOrderDetailItem = (orderDetail) => {
    const normalizedOrderKey = orderDetail.normalizedOrderId ?? normalizeIdValue(orderDetail.orderId ?? orderDetail.orderID ?? orderDetail.id);
    const normalizedFoodKey = orderDetail.normalizedFoodId ?? normalizeIdValue(orderDetail.foodId ?? orderDetail.foodID ?? orderDetail.id ?? orderDetail.food?.foodId ?? orderDetail.food?.id);
    const detailKey = `${normalizedOrderKey ?? 'order'}-${normalizedFoodKey ?? 'item'}`;

    return (
      <View
        key={`detail-${detailKey}`}
        style={styles.orderDetailSubCard}
      >
      <View style={styles.orderDetailHeader}>
        <View style={styles.orderDetailInfo}>
          <Text style={styles.orderDetailTitle}>
            {orderDetail.foodName || `Food ${orderDetail.foodId}`}
          </Text>
          <Text style={styles.orderDetailSubtitle}>
            Food ID: {orderDetail.foodId}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: statusColors[orderDetail.status] || '#9E9E9E' }
        ]}>
          <Text style={styles.statusText}>{orderDetail.status || 'Unknown'}</Text>
        </View>
      </View>
      
      <View style={styles.orderDetailBody}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="numeric" size={16} color="#666" />
          <Text style={styles.detailText}>Quantity: {orderDetail.quantity || 0}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="cash" size={16} color="#666" />
          <Text style={styles.detailText}>
            Unit Price: {(orderDetail.unitPrice || 0).toLocaleString('vi-VN')}₫
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calculator" size={16} color="#666" />
          <Text style={styles.detailText}>
            Total: {(orderDetail.totalPrice || 0).toLocaleString('vi-VN')}₫
          </Text>
        </View>
      </View>
      </View>
    );
  };

  // Render order item with expandable order details
  const renderOrderItem = ({ item }) => {
    const orderKey = item.orderId ?? item.id;
    const normalizedKey = item.normalizedOrderId ?? normalizeIdValue(orderKey);
    const isExpanded = normalizedKey ? expandedOrders.includes(normalizedKey) : false;
    const orderDetailsList = Array.isArray(item.orderDetails) ? item.orderDetails : [];
    const orderTotal = orderDetailsList.reduce((sum, detail) => sum + (detail.totalPrice || 0), 0);
    
    return (
      <View style={styles.orderCard}>
        <TouchableOpacity
          style={styles.orderHeader}
          onPress={() => toggleOrderExpansion(normalizedKey ?? orderKey)}
        >
          <View style={styles.orderHeaderLeft}>
            <View style={styles.orderTitleRow}>
              <Text style={styles.orderTitle}>Order #{item.orderId ?? normalizedKey ?? 'Unknown'}</Text>
              <View style={styles.orderBadge}>
                <Text style={styles.orderBadgeText}>{orderDetailsList.length} items</Text>
              </View>
            </View>
            <Text style={styles.orderSubtitle}>
              Table: {item.tableId || 'N/A'} • Total: {orderTotal.toLocaleString('vi-VN')}₫
            </Text>
            <View style={styles.orderStatusRow}>
              <Text style={styles.orderTimestamp}>
                {item.orderDate ? new Date(item.orderDate).toLocaleString('vi-VN') : 'No date'}
              </Text>
              <View style={[
                styles.orderStatusBadge,
                { backgroundColor: orderStatusColors[item.status] || '#9E9E9E' }
              ]}>
                <Text style={styles.orderStatusText}>
                  {item.status || 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
          <MaterialCommunityIcons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.orderDetailsContainer}>
            {orderDetailsList.map(orderDetail => renderOrderDetailItem(orderDetail))}
            
            {/* Add Item Button for orders with "Chưa làm" status */}
            {item.status === 'Chưa làm' && (
              <TouchableOpacity 
                style={styles.addItemButton}
                onPress={() => handleAddItem(item.orderId)}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#FF6B35" />
                <Text style={styles.addItemButtonText}>Thêm món</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Render status filter buttons and order by button
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Order By Button */}
      <TouchableOpacity
        style={styles.orderByButton}
        onPress={() => setOrderBy(orderBy === 'newest' ? 'oldest' : 'newest')}
      >
        <MaterialCommunityIcons 
          name={orderBy === 'newest' ? 'sort-calendar-descending' : 'sort-calendar-ascending'} 
          size={16} 
          color="#666" 
        />
        <Text style={styles.orderByText}>
          {orderBy === 'newest' ? 'Newest' : 'Oldest'}
        </Text>
      </TouchableOpacity>

      {/* Status Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilterContainer}
        contentContainerStyle={styles.statusFilterContent}
      >
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterButton,
              statusFilter === status && styles.statusFilterButtonActive
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text style={[
              styles.statusFilterText,
              statusFilter === status && styles.statusFilterTextActive
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Order ID, Food ID, or Food Name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      {renderFilters()}

      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found ({orderBy})
        </Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item, index) => {
          const key = item.normalizedOrderId ?? normalizeIdValue(item.orderId ?? item.id);
          return `order-${key ?? index}`;
        }}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-list-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria'
                : 'Orders will appear here when customers place orders'
              }
            </Text>
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={() => {
                Alert.alert(
                  'Debug Info',
                  `API URL: ${API_BASE_URL}\nLoading: ${loading}\nOrders Count: ${orders.length}\nFiltered Count: ${filteredOrders.length}`,
                  [
                    { text: 'Test Connection', onPress: async () => {
                      try {
                        const test = await apiService.testConnection();
                        Alert.alert('Connection Test', test ? 'Success' : 'Failed');
                      } catch (error) {
                        Alert.alert('Connection Error', error.message);
                      }
                    }},
                    { text: 'Reload', onPress: loadOrdersWithDetails },
                    { text: 'OK' }
                  ]
                );
              }}
            >
              <Text style={styles.debugButtonText}>Debug Info</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Food List Modal */}
      <Modal
        visible={showFoodListModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowFoodListModal(false);
          setSelectedOrderId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.foodModalContent}>
            <View style={styles.foodModalHeader}>
              <Text style={styles.foodModalTitle}>
                Chọn món để thêm vào đơn hàng {selectedOrderId}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowFoodListModal(false);
                  setSelectedOrderId(null);
                }}
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {loadingFoodItems ? (
              <View style={styles.foodModalLoading}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Đang tải danh sách món...</Text>
              </View>
            ) : (
              <>
                {/* Category Filter */}
                <View style={styles.categoryFilterContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryFilterContent}
                  >
                    <TouchableOpacity
                      style={[
                        styles.categoryFilterButton,
                        selectedCategory === 'All' && styles.categoryFilterButtonActive
                      ]}
                      onPress={() => setSelectedCategory('All')}
                    >
                      <Text style={[
                        styles.categoryFilterText,
                        selectedCategory === 'All' && styles.categoryFilterTextActive
                      ]}>
                        Tất cả
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.cateId || category.id}
                        style={[
                          styles.categoryFilterButton,
                          selectedCategory === (category.cateId || category.id) && styles.categoryFilterButtonActive
                        ]}
                        onPress={() => setSelectedCategory(category.cateId || category.id)}
                      >
                        <Text style={[
                          styles.categoryFilterText,
                          selectedCategory === (category.cateId || category.id) && styles.categoryFilterTextActive
                        ]}>
                          {category.cateName || category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Food Items List */}
                <FlatList
                  data={getFilteredFoodItems()}
                  renderItem={({ item }) => {
                    const foodId = item.foodId || item.id;
                    const quantity = getFoodQuantity(foodId);
                    
                    return (
                      <View style={styles.foodItemCard}>
                        <View style={styles.foodItemInfo}>
                          <Text style={styles.foodItemTitle}>
                            {item.foodName || item.name || 'Unknown Food'}
                          </Text>
                          <Text style={styles.foodItemPrice}>
                            {(item.unitPrice || item.price || 0).toLocaleString('vi-VN')}₫
                          </Text>
                        </View>
                        
                        <View style={styles.foodItemControls}>
                          {/* Quantity Controls */}
                          <View style={styles.quantityControls}>
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => updateFoodQuantity(foodId, -1)}
                              disabled={quantity <= 1}
                            >
                              <MaterialCommunityIcons 
                                name="minus" 
                                size={16} 
                                color={quantity <= 1 ? "#CCC" : "#FF6B35"} 
                              />
                            </TouchableOpacity>
                            
                            <Text style={styles.quantityText}>{quantity}</Text>
                            
                            <TouchableOpacity
                              style={styles.quantityButton}
                              onPress={() => updateFoodQuantity(foodId, 1)}
                            >
                              <MaterialCommunityIcons 
                                name="plus" 
                                size={16} 
                                color="#FF6B35" 
                              />
                            </TouchableOpacity>
                          </View>
                          
                          {/* Add Button */}
                          <TouchableOpacity
                            style={styles.addFoodButton}
                            onPress={() => handleSelectFoodItem(item)}
                          >
                            <MaterialCommunityIcons name="cart-plus" size={20} color="#FF6B35" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }}
                  keyExtractor={(item, index) => 
                    item.foodId || item.id || `food-${index}`
                  }
                  contentContainerStyle={styles.foodListContainer}
                  showsVerticalScrollIndicator={true}
                  ListEmptyComponent={() => (
                    <View style={styles.emptyFoodList}>
                      <MaterialCommunityIcons name="food-off" size={64} color="#CCC" />
                      <Text style={styles.emptyText}>Không có món ăn nào</Text>
                      <Text style={styles.emptySubtext}>
                        {selectedCategory === 'All' 
                          ? 'Danh sách món ăn trống hoặc không thể tải'
                          : 'Không có món ăn nào trong danh mục này'
                        }
                      </Text>
                    </View>
                  )}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  orderByButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  orderByText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  statusFilterContainer: {
    flex: 1,
  },
  statusFilterContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  statusFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    minWidth: 'auto',
    alignSelf: 'flex-start',
  },
  statusFilterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  statusFilterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusFilterTextActive: {
    color: 'white',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  orderDetailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  orderDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderDetailInfo: {
    flex: 1,
    marginRight: 12,
  },
  orderDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderDetailSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  orderDetailBody: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
    marginHorizontal: 32,
  },

  debugButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // New styles for hierarchical order layout
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  orderBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  orderBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  orderSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  orderTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  orderStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  orderStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  orderStatusText: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  orderDetailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  orderDetailSubCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    borderStyle: 'dashed',
  },
  addItemButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Food Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
  },
  foodModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  foodModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  modalCloseButton: {
    padding: 4,
  },
  foodModalLoading: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodListContainer: {
    padding: 16,
  },
  foodItemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  foodItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  foodItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  foodItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  foodItemControls: {
    alignItems: 'center',
    gap: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  quantityButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  addFoodButton: {
    backgroundColor: '#FFF5F2',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  emptyFoodList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  // Category Filter Styles
  categoryFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryFilterContent: {
    paddingVertical: 4,
  },
  categoryFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryFilterButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryFilterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryFilterTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OrderDetailScreen;