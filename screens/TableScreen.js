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
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

export default function TableScreen() {
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

  // Debug effect to track state changes
  useEffect(() => {
    console.log('=== STATE CHANGE ===');
    console.log('Loading:', loading);
    console.log('Tables length:', tables.length);
    console.log('Tables:', tables.map(t => ({ id: t.tableId, name: t.tableName })));
  }, [loading, tables]);

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
          setTables(tablesData);
          return;
        } else if (tablesData && typeof tablesData === 'object' && !Array.isArray(tablesData)) {
          console.log('✓ API returned single object, converting to array');
          setTables([tablesData]);
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
        setTables(mockTables);
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

  const renderTableItem = ({ item }) => (
    <TouchableOpacity style={styles.tableCard}>
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
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-group" size={20} color="#666" />
          <Text style={styles.detailText}>
            Seats: {item.numOfSeats || item.capacity || 'N/A'} people
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
              <Text style={styles.modalTitle}>Add New Table</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Table ID (e.g., T005)"
                value={newTable.tableId}
                onChangeText={(text) => setNewTable(prev => ({ ...prev, tableId: text }))}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Table Name"
                value={newTable.tableName}
                onChangeText={(text) => setNewTable(prev => ({ ...prev, tableName: text }))}
                autoCorrect={false}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Number of seats"
                value={newTable.numOfSeats}
                onChangeText={(text) => setNewTable(prev => ({ ...prev, numOfSeats: text }))}
                keyboardType="numeric"
                autoCorrect={false}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddTable}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Add Table</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurant Tables</Text>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>
            {(tables && tables.length) ? 
              `${tables.length} ${tables.length === 1 ? 'table' : 'tables'} found` :
              'Loading tables...'
            }
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <MaterialCommunityIcons name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

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
    backgroundColor: '#F5F5F5',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 50,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
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
    color: '#666',
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
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
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
    color: '#2C3E50',
    marginBottom: 4,
  },
  tableId: {
    fontSize: 14,
    color: '#7F8C8D',
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
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 12,
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
});