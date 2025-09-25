import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, formatPrice } from '../services/apiService';

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filterOrders = useCallback(() => {
    let result = [...orders]; // Create a new array to avoid mutating the original
    
    // Apply status filter
    if (selectedStatus !== 'All') {
      result = result.filter(order => {
        console.log('Filtering order:', order.orderId, 'status:', order.status, 'selected:', selectedStatus);
        return order.status && order.status.toLowerCase() === selectedStatus.toLowerCase();
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => {
        const orderIdMatch = order.orderId?.toLowerCase().includes(query);
        const tableMatch = order.tableId?.toString().toLowerCase().includes(query);
        const staffMatch = order.user?.fullName?.toLowerCase().includes(query);
        return orderIdMatch || tableMatch || staffMatch;
      });
    }
    
    console.log('Filtered orders:', result.length, 'of', orders.length);
    setFilteredOrders(result);
  }, [orders, searchQuery, selectedStatus]);

  // Apply filters whenever orders, search query, or status filter changes
  useEffect(() => {
    console.log('Filter effect triggered:', { selectedStatus, searchQuery, orderCount: orders.length });
    filterOrders();
  }, [filterOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllOrders();
      console.log('Raw API response:', response);

      // Map the response to ensure all required fields are present
      const processedOrders = response.map(order => {
        console.log('Processing order:', order);
        // Get the correct total amount from either total or totalAmount field
        const total = order.total || order.totalAmount || 0;
        
        // Extract user information
        const userInfo = order.user || {};
        const staffName = userInfo.fullName || userInfo.userName || order.userId || 'Unknown';
        
        return {
          ...order,
          orderId: order.orderId || order.orderID || order.id || 'N/A',
          createDate: order.createdTime || order.createDate || order.createdAt || order.orderDate || new Date().toISOString(),
          totalAmount: parseFloat(total), // Ensure it's a number
          status: order.status || 'Chưa làm',
          tableId: order.tableId || order.table?.tableId || 'Unknown',
          userId: order.userId || order.user?.userId || 'Unknown',
          user: {
            ...userInfo,
            fullName: staffName
          }
        };
      });

      console.log('Processed orders:', processedOrders);
      
      // Sort orders by creation time (most recent first)
      const sortedOrders = processedOrders.sort((a, b) => {
        const dateA = new Date(b.createDate);
        const dateB = new Date(a.createDate);
        return dateA - dateB;
      });
      
      console.log('Sorted orders:', sortedOrders);
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color="#7F8C8D" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID, table, or staff..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#95A5A6"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close" size={20} color="#7F8C8D" />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.filterButtons}>
        {[
          { id: 'All', label: 'Tất cả' },
          { id: 'chưa làm', label: 'Chưa làm' },
          { id: 'đã tạo bill', label: 'Đã tạo bill' },
          { id: 'hoàn tất', label: 'Hoàn tất' },
          { id: 'đã thanh toán', label: 'Đã thanh toán' }
        ].map((status) => (
          <TouchableOpacity
            key={status.id}
            style={[
              styles.filterButton,
              selectedStatus === status.id && styles.filterButtonActive
            ]}
            onPress={() => setSelectedStatus(status.id)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedStatus === status.id && styles.filterButtonTextActive
            ]}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2C3E50" style={styles.loader} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={80} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            Your order history will appear here once you place your first order
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.header}>Your Orders</Text>
          {renderSearchBar()}
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.orderId}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => <OrderItem order={item} />}
          />
        </View>
      )}
    </View>
  );
}

const OrderItem = ({ order }) => {
  console.log('Rendering order:', order);
  const [staffName, setStaffName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchStaffName = async () => {
      try {
        if (order.userId) {
          const userData = await apiService.getUserById(order.userId);
          setStaffName(userData.fullName || userData.userName || 'Unknown');
        }
      } catch (error) {
        console.error('Error fetching staff name:', error);
        setStaffName('Unknown');
      }
    };

    fetchStaffName();
  }, [order.userId]);

  const fetchOrderDetails = async () => {
    if (!order.orderId) return;
    
    setLoadingDetails(true);
    try {
      console.log('Fetching order details for orderId:', order.orderId);
      const details = await apiService.getOrderDetails(order.orderId);
      console.log('Raw order details response:', details);
      
      // Handle different response formats
      let processedDetails = [];
      if (details) {
        if (Array.isArray(details)) {
          processedDetails = details;
        } else if (details.$values && Array.isArray(details.$values)) {
          processedDetails = details.$values;
        } else if (typeof details === 'object') {
          processedDetails = [details];
        }
      }
      
      console.log('Processed order details:', processedDetails);
      setOrderDetails(processedDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setOrderDetails([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleExpand = () => {
    if (!isExpanded) {
      fetchOrderDetails();
    }
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const createdDate = formatDate(order.createDate);

  // Get status color (robust against casing / initial capital)
  const getStatusColor = (status) => {
    if (!status) return '#7F8C8D';
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'hoàn tất':
        return '#27AE60'; // Green
      case 'đã thanh toán':
        return '#2ECC71'; // Light Green
      case 'đã tạo bill':
        return '#F39C12'; // Orange
      case 'chưa làm':
        return '#E74C3C'; // Red
      default:
        return '#7F8C8D'; // Gray
    }
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <MaterialCommunityIcons name="receipt" size={20} color="#2C3E50" />
          <Text style={styles.orderId}>Order #{order.orderId}</Text>
        </View>
        <Text style={[styles.orderStatus, { 
          color: getStatusColor(order.status),
          backgroundColor: `${getStatusColor(order.status)}15`
        }]}>
          {order.status || 'chưa làm'}
        </Text>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.detailSection}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#7F8C8D" />
            <Text style={styles.detailText}>{createdDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="table-furniture" size={16} color="#7F8C8D" />
            <Text style={styles.detailText}>Table {order.tableId}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-tie" size={16} color="#7F8C8D" />
          <Text style={styles.detailText}>
            Staff: <Text style={styles.highlightText}>{staffName}</Text>
          </Text>
          {order.userId && (
            <Text style={styles.staffId}>ID: {order.userId}</Text>
          )}
        </View>
      </View>

      {/* Expand/Collapse Button */}
      <TouchableOpacity 
        style={styles.expandButton}
        onPress={handleToggleExpand}
      >
        <Text style={styles.expandButtonText}>
          {isExpanded ? 'Hide Order Details' : 'Show Order Details'}
        </Text>
        <MaterialCommunityIcons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#3498DB"
        />
      </TouchableOpacity>

      {/* Order Details Dropdown */}
      {isExpanded && (
        <View style={styles.orderDetailsList}>
          {loadingDetails ? (
            <View style={styles.detailsLoader}>
              <ActivityIndicator size="small" color="#3498DB" />
              <Text style={styles.loadingDetailsText}>Loading dishes...</Text>
            </View>
          ) : orderDetails.length > 0 ? (
            orderDetails.map((detail, index) => (
              <OrderDetailItem 
                key={index} 
                detail={detail} 
                index={index}
              />
            ))
          ) : (
            <Text style={styles.noDetailsText}>No dishes found in this order</Text>
          )}
        </View>
      )}

      <View style={styles.orderFooter}>
        <View style={styles.footerContent}>
          <View style={styles.amountRow}>
            <MaterialCommunityIcons name="cash-register" size={16} color="#2C3E50" />
            <Text style={styles.footerLabel}>Total Amount:</Text>
          </View>
          {typeof order.totalAmount === 'number' && order.totalAmount >= 0 ? (
            <Text style={styles.totalAmount}>{formatPrice(order.totalAmount)}</Text>
          ) : (
            <Text style={styles.calculatingText}>Calculating total...</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const OrderDetailItem = ({ detail, index }) => {
  const [foodInfo, setFoodInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoodInfo = async () => {
      if (!detail.foodId) return;

      setLoading(true);
      try {
        console.log('OrderDetailItem - Fetching food info for foodId:', detail.foodId);
        const foodData = await apiService.getFoodItemById(detail.foodId);
        console.log('OrderDetailItem - Received food data:', foodData);
        
        // The getFoodItemById should now return a single food object directly
        if (foodData && typeof foodData === 'object') {
          console.log('OrderDetailItem - Setting food info with price:', foodData.price);
          setFoodInfo(foodData);
        } else {
          console.warn('OrderDetailItem - Invalid food data received:', foodData);
          setFoodInfo(null);
        }
      } catch (error) {
        console.error('Error fetching food info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFoodInfo();
  }, [detail.foodId]);

  // Extract food information with accurate data priority
  const foodName = foodInfo?.name || 
                  foodInfo?.foodName || 
                  detail.foodName || 
                  detail.food?.name || 
                  detail.food?.foodName || 
                  detail.foodInfo?.name ||
                  detail.foodInfo?.foodName ||
                  `Food ID: ${detail.foodId || 'Unknown'}`;

  // Use actual food price from database, then fallback to order detail price
  // Note: FoodInfo API uses 'unitPrice' property, not 'price'
  const fetchedPrice = foodInfo?.unitPrice || foodInfo?.price;
  const detailPrice = detail.price || detail.unitPrice;
  const unitPrice = fetchedPrice || detailPrice || 0;

  const quantity = detail.quantity || 1;
  const totalItemPrice = unitPrice * quantity;

  console.log('OrderDetailItem price calculation:', {
    foodId: detail.foodId,
    foodName,
    foodInfoUnitPrice: foodInfo?.unitPrice,
    foodInfoPrice: foodInfo?.price,
    fetchedPrice: fetchedPrice,
    detailPrice: detailPrice,
    finalUnitPrice: unitPrice,
    quantity,
    totalItemPrice,
    hasValidFoodInfo: !!foodInfo,
    foodInfoKeys: foodInfo ? Object.keys(foodInfo) : 'null'
  });

  return (
    <View style={styles.orderDetailItem}>
      <View style={styles.orderDetailInfo}>
        <Text style={styles.dishName}>{foodName}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.dishPrice}>
            Unit: {formatPrice(unitPrice)}
          </Text>
          <Text style={styles.totalPrice}>
            Total: {formatPrice(totalItemPrice)}
          </Text>
        </View>
        {detail.foodId && (
          <Text style={styles.foodIdText}>ID: {detail.foodId}</Text>
        )}
        {loading && (
          <Text style={styles.loadingPriceText}>Loading accurate price...</Text>
        )}
      </View>
      <View style={styles.quantityBadge}>
        <Text style={styles.quantityText}>x{quantity}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    color: '#2C3E50',
    height: 40,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ECF0F1',
    marginHorizontal: 4,
  },
  filterButtonActive: {
    backgroundColor: '#3498DB',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loader: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    padding: 20,
    paddingBottom: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  orderCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingBottom: 12,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderDetails: {
    marginVertical: 8,
  },
  detailSection: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#34495E',
    marginLeft: 8,
    flex: 1,
  },
  orderFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  footerContent: {
    flexDirection: 'column',
    paddingVertical: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  footerLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
    marginTop: 4,
    textAlign: 'right',
  },
  calculatingText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'right',
  },
  highlightText: {
    color: '#3498DB',
    fontWeight: '500',
  },
  staffId: {
    fontSize: 12,
    color: '#95A5A6',
    marginLeft: 8,
  },
  // Order Details Dropdown Styles
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  expandButtonText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
    marginRight: 8,
  },
  orderDetailsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  detailsLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingDetailsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7F8C8D',
  },
  orderDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderDetailInfo: {
    flex: 1,
    marginRight: 12,
  },
  dishName: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    marginBottom: 4,
  },
  priceContainer: {
    marginTop: 4,
  },
  dishPrice: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 13,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  foodIdText: {
    fontSize: 11,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 2,
  },
  loadingPriceText: {
    fontSize: 10,
    color: '#3498DB',
    fontStyle: 'italic',
    marginTop: 2,
  },
  quantityBadge: {
    backgroundColor: '#E8F6F3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27AE60',
  },
  quantityText: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },
  noDetailsText: {
    textAlign: 'center',
    color: '#95A5A6',
    fontStyle: 'italic',
    padding: 16,
    fontSize: 14,
  },
});