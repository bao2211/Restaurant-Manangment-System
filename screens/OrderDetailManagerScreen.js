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
  const [orderDetails, setOrderDetails] = useState([]);
  const [filteredOrderDetails, setFilteredOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Available statuses for order details
  const orderDetailStatuses = [
    { id: 'All', label: 'Tất cả', color: '#7F8C8D' },
    { id: 'Chưa làm', label: 'Chưa làm', color: '#E74C3C' },
    { id: 'Đang chuẩn bị', label: 'Đang chuẩn bị', color: '#F39C12' },
    { id: 'Sẵn sàng', label: 'Sẵn sàng', color: '#3498DB' },
    { id: 'Đã phục vụ', label: 'Đã phục vụ', color: '#27AE60' },
    { id: 'Hoàn tất', label: 'Hoàn tất', color: '#2ECC71' },
    { id: 'Hủy', label: 'Hủy', color: '#95A5A6' }
  ];

  const filterOrderDetails = useCallback(() => {
    let result = [...orderDetails];
    
    // Apply status filter
    if (selectedStatus !== 'All') {
      result = result.filter(detail => {
        const status = detail.status || 'Chưa làm';
        return status.toLowerCase() === selectedStatus.toLowerCase();
      });
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(detail => {
        const orderIdMatch = detail.orderId?.toLowerCase().includes(query);
        const foodIdMatch = detail.foodId?.toLowerCase().includes(query);
        const foodNameMatch = detail.foodName?.toLowerCase().includes(query);
        return orderIdMatch || foodIdMatch || foodNameMatch;
      });
    }
    
    console.log('Filtered order details:', result.length, 'of', orderDetails.length);
    setFilteredOrderDetails(result);
  }, [orderDetails, searchQuery, selectedStatus]);

  useEffect(() => {
    filterOrderDetails();
  }, [filterOrderDetails]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllOrderDetails();
      console.log('Raw order details response:', response);

      // Enrich order details with food information
      const enrichedDetails = await Promise.all(
        response.map(async (detail) => {
          try {
            // Fetch food information
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

      // Sort by order ID and then by food ID
      const sortedDetails = enrichedDetails.sort((a, b) => {
        const orderComparison = (b.orderId || '').localeCompare(a.orderId || '');
        if (orderComparison !== 0) return orderComparison;
        return (a.foodId || '').localeCompare(b.foodId || '');
      });

      console.log('Enriched and sorted order details:', sortedDetails);
      setOrderDetails(sortedDetails);
      setFilteredOrderDetails(sortedDetails);
    } catch (error) {
      console.error('Error fetching order details:', error);
      Alert.alert('Error', 'Failed to fetch order details. Please try again.');
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

      // Update local state
      const updatedDetails = orderDetails.map(detail => {
        if (detail.foodId === selectedOrderDetail.foodId && 
            detail.orderId === selectedOrderDetail.orderId) {
          return { ...detail, status: newStatus };
        }
        return detail;
      });

      setOrderDetails(updatedDetails);
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
    fetchOrderDetails().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const getStatusColor = (status) => {
    const statusObj = orderDetailStatuses.find(s => s.id.toLowerCase() === status?.toLowerCase());
    return statusObj?.color || '#7F8C8D';
  };

  const renderOrderDetailItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderDetailCard}
      onPress={() => openEditModal(item)}
    >
      <View style={styles.orderDetailHeader}>
        <View style={styles.orderDetailInfo}>
          <View style={styles.orderIdRow}>
            <MaterialCommunityIcons name="receipt" size={16} color="#2C3E50" />
            <Text style={styles.orderId}>#{item.orderId}</Text>
          </View>
          <View style={styles.foodIdRow}>
            <MaterialCommunityIcons name="food" size={16} color="#7F8C8D" />
            <Text style={styles.foodId}>Food: {item.foodId}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{item.status || 'Chưa làm'}</Text>
        </View>
      </View>

      <View style={styles.orderDetailBody}>
        <Text style={styles.foodName}>{item.foodName}</Text>
        
        <View style={styles.priceQuantityRow}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Unit Price:</Text>
            <Text style={styles.priceValue}>{formatPrice(item.unitPrice)}</Text>
          </View>
          <View style={styles.quantityInfo}>
            <Text style={styles.quantityLabel}>Qty:</Text>
            <Text style={styles.quantityValue}>x{item.quantity}</Text>
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatPrice(item.totalPrice)}</Text>
        </View>
      </View>

      <View style={styles.editHint}>
        <MaterialCommunityIcons name="pencil" size={16} color="#3498DB" />
        <Text style={styles.editHintText}>Tap to change status</Text>
      </View>
    </TouchableOpacity>
  );

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
      ) : orderDetails.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="clipboard-list-outline" size={80} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>No Order Details Found</Text>
          <Text style={styles.emptySubtitle}>
            Order details will appear here once orders are placed
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
              Showing {filteredOrderDetails.length} of {orderDetails.length} items
            </Text>
          </View>

          <FlatList
            data={filteredOrderDetails}
            keyExtractor={(item) => `${item.foodId}-${item.orderId}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={renderOrderDetailItem}
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
});