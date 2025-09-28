import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Modal,
  ScrollView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, formatPrice } from '../services/apiService';

export default function OrderDetailManagerScreen() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [expandedOrders, setExpandedOrders] = useState(new Set()); // Track which orders are expanded

  // Available statuses for orders and order details
  const orderStatuses = [
    { id: 'All', label: 'Tất cả', color: '#7F8C8D' },
    { id: 'pending', label: 'Chờ xử lý', color: '#F39C12' },
    { id: 'confirmed', label: 'Đã xác nhận', color: '#3498DB' },
    { id: 'preparing', label: 'Đang chuẩn bị', color: '#E67E22' },
    { id: 'ready', label: 'Sẵn sàng', color: '#2ECC71' },
    { id: 'completed', label: 'Hoàn tất', color: '#27AE60' },
    { id: 'cancelled', label: 'Đã hủy', color: '#95A5A6' }
  ];

  const orderDetailStatuses = [
    { id: 'All', label: 'Tất cả', color: '#7F8C8D' },
    { id: 'Chưa làm', label: 'Chưa làm', color: '#E74C3C' },
    { id: 'Đang chuẩn bị', label: 'Đang chuẩn bị', color: '#F39C12' },
    { id: 'Sẵn sàng', label: 'Sẵn sàng', color: '#3498DB' },
    { id: 'Đã phục vụ', label: 'Đã phục vụ', color: '#27AE60' },
    { id: 'Hoàn tất', label: 'Hoàn tất', color: '#2ECC71' },
    { id: 'Hủy', label: 'Hủy', color: '#95A5A6' }
  ];

  const filterOrders = useCallback(() => {
    let result = [...orders];
    
    // Apply status filter
    if (selectedStatus !== 'All') {
      result = result.filter(order => {
        const status = order.status || 'pending';
        return status.toLowerCase() === selectedStatus.toLowerCase();
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(order => {
        const orderIdMatch = order.orderId?.toLowerCase().includes(query);
        const tableNameMatch = order.tableName?.toLowerCase().includes(query);
        const userNameMatch = order.userName?.toLowerCase().includes(query);
        const noteMatch = order.note?.toLowerCase().includes(query);
        // Also search in order details
        const detailsMatch = order.orderDetails?.some(detail => 
          detail.foodName?.toLowerCase().includes(query)
        );
        return orderIdMatch || tableNameMatch || userNameMatch || noteMatch || detailsMatch;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let orderComparison;
      if (sortOrder === 'newest') {
        orderComparison = (b.orderId || '').localeCompare(a.orderId || '');
      } else {
        orderComparison = (a.orderId || '').localeCompare(b.orderId || '');
      }
      return orderComparison;
    });
    
    console.log('Filtered and sorted orders:', result.length, 'of', orders.length);
    setFilteredOrders(result);
  }, [orders, searchQuery, selectedStatus, sortOrder]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching all orders with details...');
      
      // Fetch all orders
      const ordersResponse = await apiService.getAllOrders();
      console.log('Raw orders response:', ordersResponse);
      console.log('Orders response type:', typeof ordersResponse);
      console.log('Orders response length:', Array.isArray(ordersResponse) ? ordersResponse.length : 'Not an array');
      
      // Handle empty or invalid response
      if (!ordersResponse || !Array.isArray(ordersResponse)) {
        console.warn('Orders response is not a valid array:', ordersResponse);
        setOrders([]);
        setFilteredOrders([]);
        return;
      }
      
      if (ordersResponse.length === 0) {
        console.log('No orders found in database');
        setOrders([]);
        setFilteredOrders([]);
        return;
      }

      // Enrich each order with its details
      const enrichedOrders = await Promise.all(
        ordersResponse.map(async (order) => {
          console.log('Processing order:', order);
          // Handle different ID property names: id, orderId, OrderId
          const orderIdValue = order.id || order.orderId || order.OrderId;
          console.log('Order ID:', orderIdValue);
          try {
            // Use existing orderDetails from API response or fetch them
            let orderDetails = [];
            
            if (order.orderDetails && Array.isArray(order.orderDetails)) {
              console.log('Using existing orderDetails from API response:', order.orderDetails.length);
              // Use the orderDetails that came with the order
              orderDetails = await Promise.all(
                order.orderDetails.map(async (detail) => {
                  try {
                    let foodInfo = null;
                    if (detail.foodId) {
                      try {
                        foodInfo = await apiService.getFoodItemById(detail.foodId);
                      } catch (foodError) {
                        console.warn('Could not fetch food info for foodId:', detail.foodId);
                      }
                    }

                    return {
                      ...detail,
                      foodName: foodInfo?.foodName || foodInfo?.name || `Food ID: ${detail.foodId}`,
                      unitPrice: detail.unitPrice || foodInfo?.unitPrice || foodInfo?.price || 0,
                      status: detail.status || 'Chưa làm',
                      quantity: detail.quantity || 1,
                      totalPrice: (detail.unitPrice || foodInfo?.unitPrice || 0) * (detail.quantity || 1)
                    };
                  } catch (error) {
                    console.error('Error enriching order detail:', error);
                    return {
                      ...detail,
                      foodName: `Food ID: ${detail.foodId}`,
                      unitPrice: detail.unitPrice || 0,
                      status: detail.status || 'Chưa làm',
                      quantity: detail.quantity || 1,
                      totalPrice: (detail.unitPrice || 0) * (detail.quantity || 1)
                    };
                  }
                })
              );
            } else {
              console.log('No orderDetails in response, trying to fetch separately...');
              try {
                if (!orderIdValue) {
                  console.warn('Order missing ID:', order);
                  throw new Error('Order ID is missing');
                }
                const detailsResponse = await apiService.getOrderDetailsByOrderId(orderIdValue);
                console.log('Fetched order details separately:', detailsResponse);
                // Process the separately fetched details the same way
                orderDetails = detailsResponse || [];
              } catch (detailsError) {
                console.warn('Could not fetch details for order:', orderIdValue, detailsError);
              }
            }

            return {
              ...order,
              orderId: orderIdValue, // Ensure consistent orderId property
              orderDetails: orderDetails,
              detailsCount: orderDetails.length,
              totalAmount: orderDetails.reduce((sum, detail) => sum + detail.totalPrice, 0)
            };
          } catch (error) {
            console.error('Error enriching order:', error);
            return {
              ...order,
              orderId: orderIdValue, // Ensure consistent orderId property
              orderDetails: [],
              detailsCount: 0,
              totalAmount: order.total || order.Total || 0
            };
          }
        })
      );

      // Sort orders by ID considering sort order
      const sortedOrders = enrichedOrders.sort((a, b) => {
        const aId = a.id || a.orderId || a.OrderId || '';
        const bId = b.id || b.orderId || b.OrderId || '';
        if (sortOrder === 'newest') {
          return bId.localeCompare(aId);
        } else {
          return aId.localeCompare(bId);
        }
      });

      console.log('Enriched and sorted orders:', sortedOrders);
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrderDetail) return;

    setUpdatingStatus(true);
    try {
      const updateData = {
        ...selectedOrderDetail,
        status: newStatus
      };

      console.log('Updating order detail status:', updateData);
      
      await apiService.updateOrderDetail(
        selectedOrderDetail.foodId,
        selectedOrderDetail.orderId,
        updateData
      );

      // Update local state - update the specific order detail within the orders array
      const updatedOrders = orders.map(order => {
        if (order.orderDetails && order.orderDetails.length > 0) {
          const updatedOrderDetails = order.orderDetails.map(detail => {
            if (detail.foodId === selectedOrderDetail.foodId && 
                (detail.orderId === selectedOrderDetail.orderId || order.id === selectedOrderDetail.orderId)) {
              return { ...detail, status: newStatus };
            }
            return detail;
          });
          return { ...order, orderDetails: updatedOrderDetails };
        }
        return order;
      });

      setOrders(updatedOrders);
      
      // Also update filtered orders to reflect the change immediately
      const updatedFilteredOrders = filteredOrders.map(order => {
        if (order.orderDetails && order.orderDetails.length > 0) {
          const updatedOrderDetails = order.orderDetails.map(detail => {
            if (detail.foodId === selectedOrderDetail.foodId && 
                (detail.orderId === selectedOrderDetail.orderId || order.id === selectedOrderDetail.orderId)) {
              return { ...detail, status: newStatus };
            }
            return detail;
          });
          return { ...order, orderDetails: updatedOrderDetails };
        }
        return order;
      });
      
      setFilteredOrders(updatedFilteredOrders);
      setEditModalVisible(false);
      setSelectedOrderDetail(null);
      
      Alert.alert('Success', 'Order detail status updated successfully!');
    } catch (error) {
      console.error('Error updating order detail status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openEditModal = (orderDetail) => {
    setSelectedOrderDetail(orderDetail);
    setEditModalVisible(true);
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <MaterialCommunityIcons name="magnify" size={20} color="#7F8C8D" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID, food ID, or food name..."
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
      
      {/* Sort Buttons */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOrder === 'newest' && styles.activeSortButton
            ]}
            onPress={() => setSortOrder('newest')}
          >
            <MaterialCommunityIcons 
              name="sort-calendar-descending" 
              size={16} 
              color={sortOrder === 'newest' ? 'white' : '#3498DB'} 
            />
            <Text style={[
              styles.sortButtonText,
              sortOrder === 'newest' && styles.activeSortButtonText
            ]}>
              Newest First
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortOrder === 'oldest' && styles.activeSortButton
            ]}
            onPress={() => setSortOrder('oldest')}
          >
            <MaterialCommunityIcons 
              name="sort-calendar-ascending" 
              size={16} 
              color={sortOrder === 'oldest' ? 'white' : '#3498DB'} 
            />
            <Text style={[
              styles.sortButtonText,
              sortOrder === 'oldest' && styles.activeSortButtonText
            ]}>
              Oldest First
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterButtonsContainer}
      >
        <View style={styles.filterButtons}>
          {orderDetailStatuses.map((status) => (
            <TouchableOpacity
              key={status.id}
              style={[
                styles.filterButton,
                selectedStatus === status.id && { backgroundColor: status.color }
              ]}
              onPress={() => setSelectedStatus(status.id)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedStatus === status.id && { color: 'white' }
              ]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().then(() => setRefreshing(false));
  }, []);

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Re-apply filtering and sorting when sortOrder changes
  useEffect(() => {
    console.log('Sort order changed to:', sortOrder);
    filterOrders();
  }, [sortOrder]);

  const getStatusColor = (status) => {
    const statusObj = orderDetailStatuses.find(s => s.id.toLowerCase() === status?.toLowerCase());
    return statusObj?.color || '#7F8C8D';
  };

  const renderOrderItem = ({ item }) => {
    const orderIdForExpansion = item.id || item.orderId || item.OrderId;
    const isExpanded = expandedOrders.has(orderIdForExpansion);
    
    return (
      <View style={styles.orderCard}>
        {/* Order Header - Clickable to expand/collapse */}
        <TouchableOpacity 
          style={styles.orderHeader}
          onPress={() => toggleOrderExpansion(orderIdForExpansion)}
        >
          <View style={styles.orderHeaderLeft}>
            <View style={styles.orderIdRow}>
              <MaterialCommunityIcons name="receipt" size={18} color="#2C3E50" />
              <Text style={styles.orderId}>#{orderIdForExpansion}</Text>
            </View>
            <View style={styles.orderSummaryRow}>
              <Text style={styles.orderItemCount}>{item.detailsCount} items</Text>
              <Text style={styles.orderTotal}>{formatPrice(item.totalAmount)}</Text>
            </View>
          </View>
          <View style={styles.orderHeaderRight}>
            <View style={[
              styles.orderStatusBadge,
              { backgroundColor: getStatusColor(item.status || 'pending') }
            ]}>
              <Text style={styles.statusText}>{item.status || 'Chờ xử lý'}</Text>
            </View>
            <MaterialCommunityIcons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#7F8C8D" 
            />
          </View>
        </TouchableOpacity>

        {/* Order Details - Show when expanded */}
        {isExpanded && (
          <View style={styles.orderDetailsSection}>
            <View style={styles.orderDetailsSeparator} />
            {item.orderDetails && item.orderDetails.length > 0 ? (
              item.orderDetails.map((detail, index) => (
                <TouchableOpacity 
                  key={`${detail.orderId}-${detail.foodId}-${index}`}
                  style={styles.orderDetailRow}
                  onPress={() => openEditModal(detail)}
                >
                  <View style={styles.orderDetailLeft}>
                    <Text style={styles.foodName}>{detail.foodName}</Text>
                    <View style={styles.detailInfoRow}>
                      <Text style={styles.detailQuantity}>x{detail.quantity}</Text>
                      <Text style={styles.detailPrice}>{formatPrice(detail.unitPrice)}</Text>
                    </View>
                  </View>
                  <View style={styles.orderDetailRight}>
                    <View style={[
                      styles.detailStatusBadge,
                      { backgroundColor: getStatusColor(detail.status) }
                    ]}>
                      <Text style={styles.detailStatusText}>{detail.status || 'Chưa làm'}</Text>
                    </View>
                    <Text style={styles.detailTotal}>{formatPrice(detail.totalPrice)}</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noDetailsMessage}>
                <Text style={styles.noDetailsText}>No order details available</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderStatusModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Order Detail Status</Text>
            <TouchableOpacity 
              onPress={() => setEditModalVisible(false)}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color="#7F8C8D" />
            </TouchableOpacity>
          </View>

          {selectedOrderDetail && (
            <View style={styles.modalBody}>
              <View style={styles.orderDetailSummary}>
                <Text style={styles.summaryTitle}>Order Detail Summary</Text>
                <Text style={styles.summaryText}>Order: #{selectedOrderDetail.orderId}</Text>
                <Text style={styles.summaryText}>Food: {selectedOrderDetail.foodName}</Text>
                <Text style={styles.summaryText}>Quantity: x{selectedOrderDetail.quantity}</Text>
                <Text style={styles.summaryText}>
                  Current Status: <Text style={[styles.currentStatus, { color: getStatusColor(selectedOrderDetail.status) }]}>
                    {selectedOrderDetail.status || 'Chưa làm'}
                  </Text>
                </Text>
              </View>

              <Text style={styles.statusSelectionTitle}>Select New Status:</Text>
              
              {orderDetailStatuses
                .filter(status => status.id !== 'All')
                .map((status) => (
                <TouchableOpacity
                  key={status.id}
                  style={[
                    styles.statusOption,
                    { borderColor: status.color },
                    selectedOrderDetail.status === status.id && { backgroundColor: `${status.color}15` }
                  ]}
                  onPress={() => handleStatusChange(status.id)}
                  disabled={updatingStatus}
                >
                  <View style={[styles.statusIndicator, { backgroundColor: status.color }]} />
                  <Text style={[styles.statusOptionText, { color: status.color }]}>
                    {status.label}
                  </Text>
                  {selectedOrderDetail.status === status.id && (
                    <MaterialCommunityIcons name="check" size={20} color={status.color} />
                  )}
                </TouchableOpacity>
              ))}

              {updatingStatus && (
                <View style={styles.updatingIndicator}>
                  <ActivityIndicator size="small" color="#3498DB" />
                  <Text style={styles.updatingText}>Updating status...</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2C3E50" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={80} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>No Orders Found</Text>
          <Text style={styles.emptySubtitle}>
            Orders will appear here once they are placed
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="food-fork-drink" size={28} color="#2C3E50" />
            <Text style={styles.headerTitle}>Order Detail Manager</Text>
          </View>
          
          {renderSearchBar()}
          
          <View style={styles.statsRow}>
            <Text style={styles.statsText}>
              Showing {filteredOrders.length} of {orders.length} orders • Sorted by {sortOrder === 'newest' ? 'newest first' : 'oldest first'}
            </Text>
          </View>

          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id || item.orderId || item.OrderId || Math.random().toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={renderOrderItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {renderStatusModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    color: '#2C3E50',
    height: 40,
  },
  filterButtonsContainer: {
    maxHeight: 50,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ECF0F1',
    marginHorizontal: 2,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  statsRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  statsText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ECF0F1',
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  activeSortButton: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
    marginLeft: 4,
  },
  activeSortButtonText: {
    color: 'white',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
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
  orderDetailCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderDetailInfo: {
    flex: 1,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 6,
  },
  foodIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodId: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetailBody: {
    marginBottom: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E67E22',
  },
  quantityInfo: {
    alignItems: 'flex-end',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498DB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  editHintText: {
    fontSize: 12,
    color: '#3498DB',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  orderDetailSummary: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 4,
  },
  currentStatus: {
    fontWeight: '600',
  },
  statusSelectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  updatingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  updatingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#3498DB',
  },
  // New Order-based styles
  orderCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  orderItemCount: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  orderDetailsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  orderDetailsSeparator: {
    height: 1,
    backgroundColor: '#ECF0F1',
    marginBottom: 12,
  },
  orderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderDetailLeft: {
    flex: 1,
  },
  orderDetailRight: {
    alignItems: 'flex-end',
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailQuantity: {
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 12,
  },
  detailPrice: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  detailStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  detailStatusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  detailTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  noDetailsMessage: {
    padding: 20,
    alignItems: 'center',
  },
  noDetailsText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});