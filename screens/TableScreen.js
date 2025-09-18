import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

export default function TableScreen() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for testing when API is not available
  const mockTables = [
    {
      tableId: 'T001',
      tableName: 'Table 1',
      capacity: 4,
      status: 'Available',
      location: 'Main Dining'
    },
    {
      tableId: 'T002',
      tableName: 'Table 2', 
      capacity: 2,
      status: 'Occupied',
      location: 'Window Side'
    },
    {
      tableId: 'T003',
      tableName: 'Table 3',
      capacity: 6,
      status: 'Reserved',
      location: 'Private Room'
    },
    {
      tableId: 'T004',
      tableName: 'Table 4',
      capacity: 4,
      status: 'Available',
      location: 'Main Dining'
    }
  ];

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch tables...');
      
      // First test the connection
      const connectionTest = await apiService.testConnection();
      console.log('Connection test result:', connectionTest);
      
      if (!connectionTest) {
        console.log('Connection failed, trying fetch method...');
        const fetchResult = await apiService.testWithFetch();
        console.log('Fetch test result:', fetchResult);
        
        if (!fetchResult.success) {
          console.log('API unavailable, using mock data...');
          Alert.alert('Info', 'API server unavailable. Showing sample data.');
          setTables(mockTables);
          return;
        }
      }
      
      const tablesData = await apiService.getAllTables();
      console.log('Raw tables data:', tablesData);
      console.log('Tables data type:', typeof tablesData);
      console.log('Tables data length:', tablesData?.length);
      
      if (Array.isArray(tablesData) && tablesData.length > 0) {
        setTables(tablesData);
        console.log('Set tables array with length:', tablesData.length);
      } else if (tablesData && typeof tablesData === 'object') {
        // Handle case where API returns object instead of array
        console.log('Tables data is object, trying to extract array...');
        if (tablesData.$values && Array.isArray(tablesData.$values)) {
          setTables(tablesData.$values);
          console.log('Set tables from $values with length:', tablesData.$values.length);
        } else {
          setTables([tablesData]);
          console.log('Set single table as array');
        }
      } else {
        console.log('No valid table data received, using mock data...');
        Alert.alert('Info', 'No tables found in API. Showing sample data.');
        setTables(mockTables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      console.error('Error details:', error.message);
      Alert.alert('Warning', `API Error: ${error.message}. Showing sample data.`);
      setTables(mockTables);
    } finally {
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
            Capacity: {item.capacity || 'N/A'} people
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
          <Text style={styles.detailText}>
            Location: {item.location || 'Not specified'}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurant Tables</Text>
        <Text style={styles.headerSubtitle}>
          {tables.length} {tables.length === 1 ? 'table' : 'tables'} available
        </Text>
      </View>

      {tables.length === 0 ? (
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
          keyExtractor={(item) => item.tableId}
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