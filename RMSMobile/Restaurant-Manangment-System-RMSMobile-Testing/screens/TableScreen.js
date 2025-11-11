import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/apiService';
import ScreenHeader from '../components/ScreenHeader';

export default function TableScreen({ navigation }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTable, setNewTable] = useState({
    tableId: '',
    tableName: '',
    numOfSeats: '',
    status: 'Available'
  });
  const [submitting, setSubmitting] = useState(false);
  const [showFullTableModal, setShowFullTableModal] = useState(false);

  const handleAddTable = async () => {
    try {
      console.log('=== STARTING ADD TABLE ===');
      
      // Validate input
      if (!newTable.tableId.trim() || !newTable.tableName.trim() || !newTable.numOfSeats.trim()) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }

      // Validate numOfSeats is a positive number
      const numOfSeats = parseInt(newTable.numOfSeats.trim(), 10);
      if (isNaN(numOfSeats) || numOfSeats <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid number of seats');
        return;
      }

      // Convert numOfSeats to number
      const tableData = {
        tableId: newTable.tableId.trim().toUpperCase(), // Ensure uppercase for consistency
        tableName: newTable.tableName.trim(),
        numOfSeats: numOfSeats,
        status: 'Available'
      };

      console.log('Prepared table data:', tableData);
      setSubmitting(true);
      
      // Try to create the table
      const response = await apiService.createTable(tableData);
      console.log('Table creation successful:', response);
      
      // Success - close modal and refresh
      setIsAddModalVisible(false);
      resetForm();
      
      Alert.alert('Success', 'Table created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Refresh the table list
            fetchTables();
          }
        }
      ]);
      
    } catch (error) {
      console.error('=== ADD TABLE ERROR ===');
      console.error('Error creating table:', error);
      console.error('Error message:', error.message);
      
      // If API fails, ask user if they want to add locally for testing
      if (error.message.includes('Cannot connect to server') || error.message.includes('Network Error')) {
        Alert.alert(
          'Server Unavailable', 
          'Cannot connect to server. Would you like to add the table locally for testing?',
          [
            {
              text: 'Add Locally',
              onPress: () => {
                // Add table to local state for testing
                const newTableWithId = {
                  ...tableData,
                  id: Date.now() // Simple ID for local testing
                };
                setTables(prevTables => [...prevTables, newTableWithId]);
                setIsAddModalVisible(false);
                resetForm();
                Alert.alert('Success', 'Table added locally for testing!');
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      } else {
        // Show user-friendly error message for other errors
        Alert.alert(
          'Error Creating Table', 
          error.message || 'Failed to create table. Please try again.',
          [
            {
              text: 'Try Again',
              style: 'default'
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewTable({
      tableId: '',
      tableName: '',
      numOfSeats: '',
      status: 'Available'
    });
  };

  const handleCancel = () => {
    resetForm();
    setIsAddModalVisible(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalVisible(true);
  };

  // Mock data for testing when API is not available
  const mockTables = [
    {
      tableId: 'T001',
      tableName: 'Table 1',
      numOfSeats: 4,
      status: 'Available'
    },
    {
      tableId: 'T002',
      tableName: 'Table 2', 
      numOfSeats: 2,
      status: 'Occupied'
    },
    {
      tableId: 'T003',
      tableName: 'Table 3',
      numOfSeats: 6,
      status: 'Reserved'
    },
    {
      tableId: 'T004',
      tableName: 'Table 4',
      numOfSeats: 4,
      status: 'Available'
    }
  ];

  useEffect(() => {
    fetchTables();
  }, []);

  // Auto-refresh table status when screen gets focus (user returns from other screens)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('TableScreen focused - refreshing table status');
      // Only refresh status if we already have tables loaded
      if (tables.length > 0) {
        refreshTableStatus();
      }
    });

    return unsubscribe;
  }, [navigation, tables]);

  // Debug effect to track state changes
  useEffect(() => {
    console.log('=== STATE CHANGE ===');
    console.log('Loading:', loading);
    console.log('Tables length:', tables.length);
    console.log('Tables:', tables.map(t => ({ id: t.tableId, name: t.tableName })));
  }, [loading, tables]);

  // Function to update table status based on existing orders
  const updateTableStatusBasedOnOrders = async (tablesData) => {
    try {
      console.log('=== UPDATING TABLE STATUS BASED ON ORDERS ===');
      
      // Get all orders from API
      const allOrders = await apiService.getAllOrders();
      console.log('Fetched orders for status update:', allOrders);
      
      if (!Array.isArray(allOrders) || allOrders.length === 0) {
        console.log('No orders found, keeping table status as is');
        return tablesData;
      }

      // Create a map to track table status based on orders
      const tableOrderStatus = {};
      
      // Group orders by table and check their status
      allOrders.forEach(order => {
        const tableId = order.tableId || order.TableID;
        const orderStatus = order.status || order.Status;
        
        if (tableId) {
          if (!tableOrderStatus[tableId]) {
            tableOrderStatus[tableId] = [];
          }
          tableOrderStatus[tableId].push(orderStatus);
        }
      });

      console.log('Table order status map:', tableOrderStatus);

      // Update table status based on order status
      const updatedTables = tablesData.map(table => {
        const tableId = table.tableId || table.TableID;
        const ordersForTable = tableOrderStatus[tableId];
        
        console.log(`Checking table ${tableId}:`, {
          originalStatus: table.status,
          ordersForTable: ordersForTable
        });
        
        if (!ordersForTable || ordersForTable.length === 0) {
          // No orders for this table, keep it available
          console.log(`  -> No orders found, setting to Available`);
          return {
            ...table,
            status: 'Available'
          };
        }
        
        // Check if all orders are "Đã thanh toán" (paid), completed, or have bill created
        const allOrdersPaid = ordersForTable.every(status => {
          const normalizedStatus = status?.toLowerCase().trim() || '';
          const isPaid = (
            normalizedStatus === 'đã thanh toán' ||
            normalizedStatus === 'da thanh toan' ||
            normalizedStatus === 'paid' ||
            normalizedStatus === 'completed' ||
            normalizedStatus === 'hoàn tất' ||
            normalizedStatus === 'hoan tat' ||
            normalizedStatus === 'finished' ||
            normalizedStatus === 'done' ||
            normalizedStatus === 'đã tạo bill' ||
            normalizedStatus === 'da tao bill'
          );
          console.log(`    Status "${status}" -> normalized: "${normalizedStatus}" -> isPaid: ${isPaid}`);
          return isPaid;
        });
        
        const newStatus = allOrdersPaid ? 'Available' : 'Occupied';
        console.log(`  -> All orders paid: ${allOrdersPaid}, setting status to: ${newStatus}`);
        
        return {
          ...table,
          status: newStatus
        };
      });

      console.log('Updated tables with order-based status:', updatedTables);
      return updatedTables;
      
    } catch (error) {
      console.error('Error updating table status based on orders:', error);
      // Return original tables if there's an error
      return tablesData;
    }
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      console.log('=== STARTING TABLE FETCH ===');
      
      // Always try to fetch from API first
      try {
        const tablesData = await apiService.getAllTables();
        console.log('=== API RESPONSE ===');
        console.log('Raw tables data:', tablesData);
        console.log('Tables data type:', typeof tablesData);
        console.log('Is array:', Array.isArray(tablesData));
        console.log('Tables data length:', tablesData?.length);
        
        if (Array.isArray(tablesData) && tablesData.length > 0) {
          console.log('✓ Setting tables from API response (array)');
          // Update table status based on existing orders
          const updatedTables = await updateTableStatusBasedOnOrders(tablesData);
          setTables(updatedTables);
          return;
        } else if (tablesData && typeof tablesData === 'object' && !Array.isArray(tablesData)) {
          console.log('✓ API returned single object, converting to array');
          const singleTableArray = [tablesData];
          const updatedTables = await updateTableStatusBasedOnOrders(singleTableArray);
          setTables(updatedTables);
          return;
        } else {
          console.log('⚠ API returned empty or invalid data');
          throw new Error('No valid table data from API');
        }
      } catch (apiError) {
        console.log('=== API ERROR ===');
        console.error('API Error details:', apiError.message);
        
        // Test connection to see what's happening
        try {
          const connectionTest = await apiService.testConnection();
          console.log('Connection test result:', connectionTest);
          
          if (!connectionTest) {
            console.log('Connection failed, trying fetch test...');
            const fetchResult = await apiService.testWithFetch();
            console.log('Fetch test result:', fetchResult);
          }
        } catch (testError) {
          console.log('Connection test also failed:', testError.message);
        }
        
        // Fallback to mock data
        console.log('🔄 Using mock data as fallback');
        Alert.alert('Info', 'Cannot connect to server. Showing sample data.');
        // Try to update mock data status based on orders if possible
        try {
          const updatedMockTables = await updateTableStatusBasedOnOrders(mockTables);
          setTables(updatedMockTables);
        } catch (statusError) {
          console.log('Could not update mock table status:', statusError.message);
          setTables(mockTables);
        }
      }
      
    } catch (error) {
      console.error('=== GENERAL ERROR ===');
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Always ensure we have some data to show
      console.log('🔄 Setting mock data due to general error');
      setTables(mockTables);
    } finally {
      console.log('=== LOADING COMPLETE ===');
      console.log('Final tables count:', tables.length);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTables();
    setRefreshing(false);
  };

  // Function to manually refresh table status based on current orders
  const refreshTableStatus = async () => {
    try {
      console.log('=== MANUAL REFRESH TABLE STATUS ===');
      setRefreshing(true);
      
      // Count current status before update
      const statusCounts = tables.reduce((acc, table) => {
        acc[table.status] = (acc[table.status] || 0) + 1;
        return acc;
      }, {});
      
      const updatedTables = await updateTableStatusBasedOnOrders(tables);
      
      // Count status after update
      const newStatusCounts = updatedTables.reduce((acc, table) => {
        acc[table.status] = (acc[table.status] || 0) + 1;
        return acc;
      }, {});
      
      setTables(updatedTables);
      
      // Show detailed success message
      const statusSummary = Object.keys(newStatusCounts).map(status => 
        `${status}: ${newStatusCounts[status]}`
      ).join(', ');
      
      Alert.alert(
        'Table Status Updated', 
        `Status refreshed based on current orders!\n\nCurrent status: ${statusSummary}`
      );
    } catch (error) {
      console.error('Error refreshing table status:', error);
      Alert.alert('Error', 'Failed to refresh table status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const getTableStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return '#4CAF50'; // Green
      case 'occupied':
        return '#F44336'; // Red
      case 'reserved':
        return '#FF9800'; // Orange
      default:
        return '#9E9E9E'; // Gray
    }
  };

  const getTableStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'check-circle';
      case 'occupied':
        return 'account-multiple';
      case 'reserved':
        return 'clock';
      default:
        return 'help-circle';
    }
  };

  const handleCreateOrder = (table) => {
    const normalizedStatus = table.status?.toLowerCase().trim() || '';
    const isOccupied = (
      normalizedStatus === 'occupied' ||
      normalizedStatus === 'đã chiếm giữ' ||
      normalizedStatus === 'da chiem giu' ||
      normalizedStatus === 'busy' ||
      normalizedStatus === 'taken'
    );
    
    if (isOccupied) {
      setShowFullTableModal(true);
      return;
    }
    
    navigation.navigate('Menu', { 
      selectedTable: table,
      lastUpdated: Date.now()
    });
  };

  const renderTableItem = ({ item }) => {
    // Function to get emoji and description based on number of seats
    const getSeatsInfo = (numOfSeats) => {
      if (numOfSeats <= 2) return { emoji: '👥', desc: 'Bàn đôi' };
      if (numOfSeats <= 4) return { emoji: '👨‍👩‍👧‍👦', desc: 'Gia đình nhỏ' };
      if (numOfSeats <= 6) return { emoji: '👨‍👩‍👧‍👦👥', desc: 'Nhóm vừa' };
      return { emoji: '🎉👨‍👩‍👧‍👦', desc: 'Tiệc lớn' };
    };

    // Function to get table icon based on seats
    const getTableIcon = (numOfSeats) => {
      if (numOfSeats <= 2) return 'table-chair';
      if (numOfSeats <= 4) return 'table-furniture';
      return 'stadium';
    };

    const seatsInfo = getSeatsInfo(item.numOfSeats || 4);

    return (
      <View style={styles.tableCard}>
        <View style={styles.tableIconContainer}>
          <LinearGradient
            colors={['#5B9BD5', '#4A7FB8']}
            style={styles.tableIconGradient}
          >
            <MaterialCommunityIcons 
              name={getTableIcon(item.numOfSeats || 4)} 
              size={40} 
              color="white" 
            />
          </LinearGradient>
        </View>
        
        <View style={styles.tableContent}>
          <View style={styles.tableHeader}>
            <View style={styles.tableInfo}>
              <Text style={styles.tableName}>{item.tableName || `Table ${item.tableId}`}</Text>
              <Text style={styles.tableId}>ID: {item.tableId}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getTableStatusColor(item.status) }]}> 
              <MaterialCommunityIcons 
                name={getTableStatusIcon(item.status)} 
                size={16} 
                color="white" 
              />
              <Text style={styles.statusText}>{item.status || 'Unknown'}</Text>
            </View>
          </View>
          
          <View style={styles.tableDetails}>
            <View style={styles.seatsContainer}>
              <View style={styles.emojiContainer}>
                <Text style={styles.seatsEmoji}>{seatsInfo.emoji}</Text>
                <Text style={styles.emojiDescription}>{seatsInfo.desc}</Text>
              </View>
              <View style={styles.seatsInfo}>
                <Text style={styles.seatsLabel}>Số chỗ ngồi</Text>
                <Text style={styles.seatsNumber}>{item.numOfSeats || item.capacity || 'N/A'} người</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.createOrderButton}
              onPress={() => handleCreateOrder(item)}
            >
              <LinearGradient
                colors={['#5B9BD5', '#4A7FB8']}
                style={styles.createOrderButtonGradient}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
                <Text style={styles.createOrderText}>Chọn bàn</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Loading tables...</Text>
      </View>
    );
  }

  console.log('=== RENDER ===');
  console.log('Loading:', loading);
  console.log('Tables array length:', tables.length);
  console.log('Tables data:', tables);

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundImageContainer}>
          <Image 
            source={{
              uri: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200'
            }}
            style={[styles.backgroundImage, { opacity: 0.3 }]}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Modal thông báo bàn đã đầy */}
      <Modal
        visible={showFullTableModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullTableModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullTableModalContent}>
            <MaterialCommunityIcons name="alert-circle" size={48} color="#F44336" style={{ marginBottom: 10 }} />
            <Text style={styles.fullTableModalTitle}>Bàn này đang có khách</Text>
            <Text style={styles.fullTableModalText}>Vui lòng chọn bàn khác hoặc đợi khách thanh toán!</Text>
            <TouchableOpacity
              style={styles.fullTableModalButton}
              onPress={() => setShowFullTableModal(false)}
            >
              <Text style={styles.fullTableModalButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              {/* Modal Header with Icon */}
              <View style={styles.modalHeader}>
                <View style={styles.modalIconContainer}>
                  <LinearGradient
                    colors={['#5B9BD5', '#4A7FB8']}
                    style={styles.modalIconGradient}
                  >
                    <MaterialCommunityIcons name="table-furniture" size={40} color="white" />
                  </LinearGradient>
                </View>
                <Text style={styles.modalTitle}>Thêm Bàn Mới</Text>
                <Text style={styles.modalSubtitle}>Nhập thông tin bàn ăn mới</Text>
              </View>

              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="identifier" size={20} color="#5B9BD5" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mã bàn (VD: T005)"
                    placeholderTextColor="#95A5A6"
                    value={newTable.tableId}
                    onChangeText={(text) => setNewTable(prev => ({ ...prev, tableId: text }))}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
                
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="format-text" size={20} color="#5B9BD5" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Tên bàn (VD: Bàn VIP 1)"
                    placeholderTextColor="#95A5A6"
                    value={newTable.tableName}
                    onChangeText={(text) => setNewTable(prev => ({ ...prev, tableName: text }))}
                    autoCorrect={false}
                  />
                </View>
                
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account-group" size={20} color="#5B9BD5" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Số chỗ ngồi (VD: 4)"
                    placeholderTextColor="#95A5A6"
                    value={newTable.numOfSeats}
                    onChangeText={(text) => setNewTable(prev => ({ ...prev, numOfSeats: text }))}
                    keyboardType="numeric"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={submitting}
                >
                  <MaterialCommunityIcons name="close-circle" size={20} color="white" />
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddTable}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check-circle" size={20} color="white" />
                      <Text style={styles.buttonText}>Thêm Bàn</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Welcome Section with Logo */}
      <LinearGradient
        colors={['#10B981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeSection}
      >
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.welcomeContent}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="table-furniture" size={32} color="white" />
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Bàn Ăn</Text>
            <Text style={styles.welcomeSubtitle}>
              Quản lý và chọn bàn phục vụ
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.refreshButtonHeader}
              onPress={refreshTableStatus}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#5B9BD5" />
              ) : (
                <Ionicons name="refresh" size={22} color="#5B9BD5" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButtonHeader}
              onPress={openAddModal}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#5B9BD5" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {(!tables || tables.length === 0) ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="table-furniture" size={80} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>No Tables Found</Text>
          <Text style={styles.emptySubtitle}>
            No tables are currently configured in the system
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTables}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tables}
          renderItem={renderTableItem}
          keyExtractor={(item, index) => item.tableId || `table-${index}`}
          style={styles.tablesList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshButtonHeader: {
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
  addButtonHeader: {
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3498DB',
  },
  refreshStatusText: {
    color: '#3498DB',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 24,
    paddingTop: 32,
    backgroundColor: '#F0F7FF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(91, 155, 213, 0.1)',
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputContainer: {
    padding: 24,
    paddingTop: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#5B9BD5',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C3E50',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  header: {
    backgroundColor: '#2C3E50',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BDC3C7',
  },
  tablesList: {
    flex: 1,
    padding: 15,
    zIndex: 1,
  },
  tableCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(91, 155, 213, 0.15)',
  },
  tableIconContainer: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableIconGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tableContent: {
    flex: 1,
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C5AA0',
    marginBottom: 4,
  },
  tableId: {
    fontSize: 14,
    color: '#C0392B',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  tableDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 155, 213, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
  },
  emojiContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  seatsEmoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  emojiDescription: {
    fontSize: 9,
    color: '#5B9BD5',
    fontWeight: '700',
    textAlign: 'center',
  },
  seatsInfo: {
    flex: 1,
  },
  seatsLabel: {
    fontSize: 11,
    color: '#5B9BD5',
    fontWeight: '600',
    marginBottom: 2,
  },
  seatsNumber: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#34495E',
    marginLeft: 8,
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#5B9BD5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createOrderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  createOrderText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  detailRowSpacer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullTableModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    minWidth: 260,
  },
  fullTableModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 8,
  },
  fullTableModalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 18,
    textAlign: 'center',
  },
  fullTableModalButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 8,
  },
  fullTableModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});