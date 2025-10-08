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
  ScrollView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <View style={styles.billHeader}>
        <View style={styles.billIdContainer}>
          <MaterialCommunityIcons name="receipt" size={20} color="#3498DB" />
          <Text style={styles.billId}>#{item.billId?.substring(0, 8) || 'N/A'}</Text>
        </View>
        <View style={styles.paymentContainer}>
          <MaterialCommunityIcons 
            name={getPaymentMethodIcon(item.payment)} 
            size={16} 
            color="#7F8C8D" 
          />
          <Text style={styles.paymentMethod}>{item.payment || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.billContent}>
        <View style={styles.amountSection}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Subtotal:</Text>
            <Text style={styles.amountValue}>
              {item.total ? formatPrice(item.total) : '0₫'}
            </Text>
          </View>
          
          {item.discount && item.discount > 0 && (
            <View style={styles.amountRow}>
              <Text style={styles.discountLabel}>Discount:</Text>
              <Text style={styles.discountValue}>
                -{formatPrice(item.discount)}
              </Text>
            </View>
          )}
          
          <View style={[styles.amountRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {item.totalFinal ? formatPrice(item.totalFinal) : formatPrice(item.total || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.billInfo}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#7F8C8D" />
            <Text style={styles.infoText}>{formatDate(item.createdTime)}</Text>
          </View>
          
          {item.orderId && (
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="clipboard-list" size={16} color="#7F8C8D" />
              <Text style={styles.infoText}>Order: {item.orderId.substring(0, 8)}</Text>
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
          <Text style={[styles.filterChipText, filterPayment === 'all' && styles.activeFilterChipText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filterPayment === 'cash' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('cash')}
        >
          <MaterialCommunityIcons name="cash" size={16} color={filterPayment === 'cash' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'cash' && styles.activeFilterChipText]}>
            Cash
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filterPayment === 'card' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('card')}
        >
          <MaterialCommunityIcons name="credit-card" size={16} color={filterPayment === 'card' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'card' && styles.activeFilterChipText]}>
            Card
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filterPayment === 'transfer' && styles.activeFilterChip]}
          onPress={() => setFilterPayment('transfer')}
        >
          <MaterialCommunityIcons name="bank-transfer" size={16} color={filterPayment === 'transfer' ? '#FFFFFF' : '#7F8C8D'} />
          <Text style={[styles.filterChipText, filterPayment === 'transfer' && styles.activeFilterChipText]}>
            Transfer
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="receipt-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Bills Found</Text>
      <Text style={styles.emptySubtitle}>
        {filterPayment !== 'all' ? 
          `No bills found with ${filterPayment} payment method` :
          'Bills will appear here once orders are completed and paid'
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Bills</Text>
            <Text style={styles.headerSubtitle}>
              {filteredBills.length} of {bills.length} {bills.length === 1 ? 'bill' : 'bills'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
          >
            <MaterialCommunityIcons name="sort" size={24} color="#3498DB" />
          </TouchableOpacity>
        </View>
      </View>

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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  sortButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  listContainer: {
    padding: 16,
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
    maxWidth: 280,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  billIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 6,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  billContent: {
    gap: 12,
  },
  amountSection: {
    gap: 6,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  amountValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  discountLabel: {
    fontSize: 14,
    color: '#E74C3C',
  },
  discountValue: {
    fontSize: 14,
    color: '#E74C3C',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  billInfo: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#7F8C8D',
    marginLeft: 6,
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
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterScrollContainer: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  activeFilterChip: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  filterChipText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});