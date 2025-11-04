import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Function to calculate total amount for an order from its order details
  const calculateOrderTotal = async (orderId) => {
    try {
      console.log(`Calculating total for order ${orderId}`);
      const orderDetails = await apiService.getOrderDetails(orderId);
      console.log(`Order details for ${orderId}:`, orderDetails);
      
      if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
        console.log(`No order details found for order ${orderId}`);
        return 0;
      }

      const total = orderDetails.reduce((sum, detail) => {
        const quantity = detail.quantity || 1;
        const unitPrice = detail.price || detail.unitPrice || 0;
        const lineTotal = quantity * unitPrice;
        console.log(`Detail: foodId=${detail.foodId}, quantity=${quantity}, unitPrice=${unitPrice}, lineTotal=${lineTotal}`);
        return sum + lineTotal;
      }, 0);

      console.log(`Total calculated for order ${orderId}: ${total}`);
      return total;
    } catch (error) {
      console.error(`Error calculating total for order ${orderId}:`, error);
      return 0;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllOrders();
      console.log('Raw API response:', response);

      // Map the response to ensure all required fields are present
      const processedOrders = await Promise.all(response.map(async order => {
        console.log('Processing order:', order);
        
        // Extract user information
        const userInfo = order.user || {};
        const staffName = userInfo.fullName || userInfo.userName || order.userId || 'Unknown';
        
        // Calculate actual total from order details
        const orderId = order.orderId || order.orderID || order.id || 'N/A';
        const calculatedTotal = await calculateOrderTotal(orderId);
        
        return {
          ...order,
          orderId: orderId,
          createDate: order.createdTime || order.createDate || order.createdAt || order.orderDate || new Date().toISOString(),
          totalAmount: calculatedTotal, // Use calculated total from order details
          status: order.status || 'Chưa làm',
          tableId: order.tableId || order.table?.tableId || 'Unknown',
          userId: order.userId || order.user?.userId || 'Unknown',
          user: {
            ...userInfo,
            fullName: staffName
          }
        };
      }));

      console.log('Processed orders with calculated totals:', processedOrders);
      
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

  // Function to update total for a specific order
  const updateOrderTotal = async (orderId) => {
    try {
      console.log(`Updating total for order ${orderId}`);
      const newTotal = await calculateOrderTotal(orderId);
      
      setOrders(prevOrders => {
        const updatedOrders = prevOrders.map(order => {
          if (order.orderId === orderId) {
            console.log(`Updating order ${orderId} total from ${order.totalAmount} to ${newTotal}`);
            return { ...order, totalAmount: newTotal };
          }
          return order;
        });
        return updatedOrders;
      });
      
      // Also update filtered orders
      setFilteredOrders(prevFiltered => {
        const updatedFiltered = prevFiltered.map(order => {
          if (order.orderId === orderId) {
            return { ...order, totalAmount: newTotal };
          }
          return order;
        });
        return updatedFiltered;
      });
      
    } catch (error) {
      console.error(`Error updating total for order ${orderId}:`, error);
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

  // Use focus effect to refresh data when returning to this screen
  useFocusEffect(
    useCallback(() => {
      console.log('OrdersScreen is focused - refreshing order data');
      fetchOrders();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundImageContainer}>
          <Image 
            source={{
              uri: 'https://gaophuongnam.vn/upload/ckfinder/images/%E1%BA%A3nh%20tin%20t%E1%BB%A9c/320211736-689662439425355-4861645986957870390-n-853.jpeg'
            }}
            style={[styles.backgroundImage, { opacity: 0.3 }]}
            resizeMode="cover"
          />
        </View>
      </View>

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
          {/* Welcome Section with Logo */}
          <LinearGradient
            colors={['#4A90E2', '#357ABD', '#2E5F8C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeSection}
          >
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />
            <View style={styles.welcomeContent}>
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons name="clipboard-text" size={32} color="white" />
              </View>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>My Orders</Text>
                <Text style={styles.welcomeSubtitle}>
                  Theo dõi và quản lý đơn hàng của bạn
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.refreshButtonHeader}
                onPress={onRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="refresh" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>

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
    backgroundColor: '#2C3E50',
  },
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
  welcomeSection: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginRight: 16,
    padding: 10,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    fontWeight: '400',
  },
  refreshButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  content: {
    flex: 1,
    width: '100%',
    zIndex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#4A90E2',
    elevation: 3,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    elevation: 6,
    shadowOpacity: 0.4,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
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
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 144, 226, 0.1)',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  orderId: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2E5F8C',
    letterSpacing: 0.5,
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderDetails: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
  },
  detailSection: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    paddingVertical: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#5A6C7D',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  orderFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.03)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 144, 226, 0.1)',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 15,
    color: '#5A6C7D',
    marginLeft: 8,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#27AE60',
    letterSpacing: 0.5,
  },
  calculatingText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'right',
  },
  highlightText: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  staffId: {
    fontSize: 11,
    color: '#95A5A6',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  // Order Details Dropdown Styles
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  expandButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '700',
    marginRight: 8,
  },
  orderDetailsList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.02)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 144, 226, 0.1)',
  },
  detailsLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingDetailsText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  orderDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.1)',
    elevation: 2,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  orderDetailInfo: {
    flex: 1,
    marginRight: 12,
  },
  dishName: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  priceContainer: {
    marginTop: 4,
  },
  dishPrice: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '600',
    marginBottom: 3,
  },
  totalPrice: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '700',
  },
  foodIdText: {
    fontSize: 11,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 3,
  },
  loadingPriceText: {
    fontSize: 11,
    color: '#4A90E2',
    fontStyle: 'italic',
    marginTop: 3,
  },
  quantityBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#27AE60',
    minWidth: 50,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 15,
    color: '#27AE60',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  noDetailsText: {
    textAlign: 'center',
    color: '#95A5A6',
    fontStyle: 'italic',
    padding: 20,
    fontSize: 14,
  },
});