import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Image
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService, formatPrice } from '../services/apiService';

export default function BillScreen() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'payment'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  const [showSortModal, setShowSortModal] = useState(false);
  const [filterPayment, setFilterPayment] = useState('all'); // 'all', 'cash', 'card', 'transfer'

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const billsData = await apiService.getAllBills();
      console.log('Fetched bills:', billsData);
      setBills(billsData || []);
      setFilteredBills(billsData || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
      Alert.alert('Error', 'Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBills();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sorting and filtering functions
  const sortBills = (billsToSort, sortCriteria, direction) => {
    const sorted = [...billsToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortCriteria) {
        case 'date':
          aValue = new Date(a.createdTime || 0).getTime();
          bValue = new Date(b.createdTime || 0).getTime();
          break;
        case 'amount':
          aValue = parseFloat(a.totalFinal || a.total || 0);
          bValue = parseFloat(b.totalFinal || b.total || 0);
          break;
        case 'payment':
          aValue = (a.payment || '').toLowerCase();
          bValue = (b.payment || '').toLowerCase();
          break;
        default:
          return 0;
      }
      
      if (sortCriteria === 'payment') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
    
    return sorted;
  };

  const filterBills = (billsToFilter, paymentFilter) => {
    if (paymentFilter === 'all') return billsToFilter;
    
    return billsToFilter.filter(bill => {
      const payment = (bill.payment || '').toLowerCase();
      switch (paymentFilter) {
        case 'cash':
          return payment.includes('cash') || payment.includes('tiền mặt');
        case 'card':
          return payment.includes('card') || payment.includes('thẻ');
        case 'transfer':
          return payment.includes('transfer') || payment.includes('chuyển khoản');
        default:
          return true;
      }
    });
  };

  const applyFiltersAndSort = () => {
    let processed = filterBills(bills, filterPayment);
    processed = sortBills(processed, sortBy, sortDirection);
    setFilteredBills(processed);
  };

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    applyFiltersAndSort();
  }, [bills, sortBy, sortDirection, filterPayment]);

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortDirection('desc');
    }
    setShowSortModal(false);
  };

  const getSortIcon = (criteria) => {
    if (sortBy !== criteria) return 'sort';
    return sortDirection === 'asc' ? 'sort-ascending' : 'sort-descending';
  };

  const getPaymentMethodIcon = (payment) => {
    switch (payment?.toLowerCase()) {
      case 'cash':
      case 'tiền mặt':
        return 'cash';
      case 'card':
      case 'thẻ':
        return 'credit-card';
      case 'transfer':
      case 'chuyển khoản':
        return 'bank-transfer';
      default:
        return 'cash-multiple';
    }
  };

  const renderBillItem = ({ item }) => (
    <TouchableOpacity style={styles.billCard} activeOpacity={0.7}>
      {/* Icon Badge */}
      <View style={styles.billIconBadge}>
        <LinearGradient
          colors={['#9B59B6', '#8E44AD']}
          style={styles.iconGradient}
        >
          <MaterialCommunityIcons name="receipt-text" size={24} color="white" />
        </LinearGradient>
      </View>

      <View style={styles.billHeader}>
        <View style={styles.billIdContainer}>
          <Text style={styles.billIdLabel}>HÓA ĐơN</Text>
          <Text style={styles.billId}>#{item.billId?.substring(0, 8) || 'N/A'}</Text>
        </View>
        <View style={styles.paymentContainer}>
          <LinearGradient
            colors={['#9B59B6', '#8E44AD']}
            style={styles.paymentBadge}
          >
            <MaterialCommunityIcons 
              name={getPaymentMethodIcon(item.payment)} 
              size={14} 
              color="white" 
            />
            <Text style={styles.paymentMethod}>{item.payment || 'N/A'}</Text>
          </LinearGradient>
        </View>
      </View>

      {/* Amount Section with Modern Design */}
      <View style={styles.billContent}>
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <View style={styles.amountLabelContainer}>
              <Ionicons name="document-text-outline" size={16} color="#7F8C8D" />
              <Text style={styles.amountLabel}>Tạm tính</Text>
            </View>
            <Text style={styles.amountValue}>
              {item.total ? formatPrice(item.total) : '0₫'}
            </Text>
          </View>
          
          {item.discount && item.discount > 0 && (
            <View style={styles.amountRow}>
              <View style={styles.amountLabelContainer}>
                <Ionicons name="pricetag-outline" size={16} color="#E74C3C" />
                <Text style={styles.discountLabel}>Giảm giá</Text>
              </View>
              <Text style={styles.discountValue}>
                -{formatPrice(item.discount)}
              </Text>
            </View>
          )}
          
          <View style={[styles.amountRow, styles.totalRow]}>
            <View style={styles.amountLabelContainer}>
              <Ionicons name="wallet" size={18} color="#9B59B6" />
              <Text style={styles.totalLabel}>Tổng cộng</Text>
            </View>
            <Text style={styles.totalValue}>
              {item.totalFinal ? formatPrice(item.totalFinal) : formatPrice(item.total || 0)}
            </Text>
          </View>
        </View>

        {/* Info Section with Icons */}
        <View style={styles.billInfo}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="calendar-outline" size={16} color="#9B59B6" />
            </View>
            <Text style={styles.infoText}>{formatDate(item.createdTime)}</Text>
          </View>
          
          {item.orderId && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="list-outline" size={16} color="#9B59B6" />
              </View>
              <Text style={styles.infoText}>Đơn hàng: {item.orderId.substring(0, 8)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1}
        onPress={() => setShowSortModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sort Bills</Text>
          
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => handleSort('date')}
          >
            <MaterialCommunityIcons 
              name="calendar" 
              size={20} 
              color={sortBy === 'date' ? '#3498DB' : '#7F8C8D'} 
            />
            <Text style={[styles.sortOptionText, sortBy === 'date' && styles.activeSortOption]}>
              Date Created
            </Text>
            <MaterialCommunityIcons 
              name={getSortIcon('date')} 
              size={20} 
              color={sortBy === 'date' ? '#3498DB' : '#7F8C8D'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => handleSort('amount')}
          >
            <MaterialCommunityIcons 
              name="currency-usd" 
              size={20} 
              color={sortBy === 'amount' ? '#3498DB' : '#7F8C8D'} 
            />
            <Text style={[styles.sortOptionText, sortBy === 'amount' && styles.activeSortOption]}>
              Amount
            </Text>
            <MaterialCommunityIcons 
              name={getSortIcon('amount')} 
              size={20} 
              color={sortBy === 'amount' ? '#3498DB' : '#7F8C8D'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortOption} 
            onPress={() => handleSort('payment')}
          >
            <MaterialCommunityIcons 
              name="credit-card" 
              size={20} 
              color={sortBy === 'payment' ? '#3498DB' : '#7F8C8D'} 
            />
            <Text style={[styles.sortOptionText, sortBy === 'payment' && styles.activeSortOption]}>
              Payment Method
            </Text>
            <MaterialCommunityIcons 
              name={getSortIcon('payment')} 
              size={20} 
              color={sortBy === 'payment' ? '#3498DB' : '#7F8C8D'} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderFilterBar = () => (
    <View style={styles.filterBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContainer}>
        <TouchableOpacity 
          style={[styles.filterChip, filterPayment === 'all' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('all')}
        >
          <Ionicons name="apps" size={16} color={filterPayment === 'all' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'all' && styles.activeFilterChipText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filterPayment === 'cash' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('cash')}
        >
          <Ionicons name="cash" size={16} color={filterPayment === 'cash' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'cash' && styles.activeFilterChipText]}>
            Tiền mặt
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filterPayment === 'card' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('card')}
        >
          <Ionicons name="card" size={16} color={filterPayment === 'card' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'card' && styles.activeFilterChipText]}>
            Thẻ
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filterPayment === 'transfer' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('transfer')}
        >
          <Ionicons name="swap-horizontal" size={16} color={filterPayment === 'transfer' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'transfer' && styles.activeFilterChipText]}>
            Chuyển khoản
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <LinearGradient
          colors={['#9B59B6', '#8E44AD']}
          style={styles.emptyIconGradient}
        >
          <MaterialCommunityIcons name="receipt-text-outline" size={60} color="white" />
        </LinearGradient>
      </View>
      <Text style={styles.emptyTitle}>Chưa Có Hóa Đơn</Text>
      <Text style={styles.emptySubtitle}>
        {filterPayment !== 'all' ? 
          `Không tìm thấy hóa đơn với phương thức ${filterPayment}` :
          'Hóa đơn sẽ xuất hiện khi đơn hàng được thanh toán'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Loading bills...</Text>
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
              uri: 'https://images.unsplash.com/photo-1554224311-beee4479d0ed?w=1200'
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#9B59B6', '#8E44AD', '#7D3C98']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={60} color="white" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Hóa Đơn</Text>
            <Text style={styles.headerSubtitle}>
              {filteredBills.length} / {bills.length} hóa đơn
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="options" size={24} color="#9B59B6" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {renderFilterBar()}
      
      <FlatList
        data={filteredBills}
        renderItem={renderBillItem}
        keyExtractor={(item) => item.billId || Math.random().toString()}
        contentContainerStyle={filteredBills.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
      
      {renderSortModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
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
    opacity: 0.25,
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginRight: 20,
    padding: 10,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    fontWeight: '400',
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  billCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#9B59B6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.1)',
    position: 'relative',
    overflow: 'visible',
  },
  billIconBadge: {
    position: 'absolute',
    top: -15,
    right: 20,
    zIndex: 10,
  },
  iconGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#9B59B6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(155, 89, 182, 0.1)',
  },
  billIdContainer: {
    flex: 1,
  },
  billIdLabel: {
    fontSize: 11,
    color: '#9B59B6',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  billId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7D3C98',
    letterSpacing: 0.5,
  },
  paymentContainer: {
    alignItems: 'flex-end',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  paymentMethod: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  billContent: {
    gap: 16,
  },
  amountSection: {
    gap: 10,
    backgroundColor: 'rgba(155, 89, 182, 0.03)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(155, 89, 182, 0.1)',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  amountValue: {
    fontSize: 15,
    color: '#2C3E50',
    fontWeight: '700',
  },
  discountLabel: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '700',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: 'rgba(155, 89, 182, 0.2)',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#9B59B6',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#27AE60',
  },
  billInfo: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(155, 89, 182, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#5D6D7E',
    fontWeight: '500',
    flex: 1,
  },
  // Sort Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  activeSortOption: {
    color: '#3498DB',
    fontWeight: '600',
  },
  // Filter Bar Styles
  filterBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(155, 89, 182, 0.1)',
    zIndex: 1,
  },
  filterScrollContainer: {
    paddingRight: 16,
    gap: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(155, 89, 182, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(155, 89, 182, 0.2)',
    gap: 6,
  },
  activeFilterChip: {
    backgroundColor: '#9B59B6',
    borderColor: '#9B59B6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});