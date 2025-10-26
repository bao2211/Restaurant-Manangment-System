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
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

export default function IngredientManagerScreen({ navigation }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newIngredient, setNewIngredient] = useState({
    ingreID: '',
    ingreName: '',
    unitMeasurement: '',
    stock: ''
  });

  const [editingIngredient, setEditingIngredient] = useState(null);

  //cảm ơn chat gpt nháa
  // Mock data cho test khi API không khả dụng
  const mockIngredients = [
    {
      ingreID: 1,
      ingreName: 'Gạo',
      unitMeasurement: 'kg',
      stock: 30
    },
    {
      ingreID: 2,
      ingreName: 'Gà',
      unitMeasurement: 'con',
      stock: 10
    },
    {
      ingreID: 3,
      ingreName: 'Cà rốt',
      unitMeasurement: 'củ',
      stock: 100
    },
    {
      ingreID: 4,
      ingreName: 'Hành tây',
      unitMeasurement: 'củ',
      stock: 1000
    }
  ];

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING INGREDIENTS ===');
      
      try {
        const ingredientsData = await apiService.getAllIngredients();
        console.log('API Response:', ingredientsData);
        
        if (Array.isArray(ingredientsData) && ingredientsData.length > 0) {
          // Ensure each item has a consistent ingreID field used by the UI
          const normalized = ingredientsData.map(item => ({
            ...item,
            // keep existing ingreID if present, otherwise fallback to other possible id names
            ingreID: item.ingreID ?? item.ingreId ?? item.IngreId ?? item.id
          }));
          setIngredients(normalized);
          return;
        } else if (ingredientsData && typeof ingredientsData === 'object' && !Array.isArray(ingredientsData)) {
          const item = ingredientsData;
          item.ingreID = item.ingreID ?? item.ingreId ?? item.IngreId ?? item.id;
          setIngredients([item]);
          return;
        } else {
          throw new Error('No valid ingredient data from API');
        }
      } catch (apiError) {
        console.log('API Error:', apiError.message);
        Alert.alert('Info', 'Không thể kết nối server. Hiển thị dữ liệu mẫu.');
        setIngredients(mockIngredients);
      }
      
    } catch (error) {
      console.error('General Error:', error.message);
      setIngredients(mockIngredients);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIngredients();
    setRefreshing(false);
  };

  const handleAddIngredient = async () => {
    try {
      // Validate input
      if (!newIngredient.ingreID.toString().trim() || 
          !newIngredient.ingreName.trim() || 
          !newIngredient.unitMeasurement.trim() ||
          !newIngredient.stock.toString().trim()) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      const stock = parseFloat(newIngredient.stock);

      if (isNaN(stock) || stock < 0) {
        Alert.alert('Lỗi', 'Số lượng tồn kho phải là số hợp lệ');
        return;
      }

      const ingredientData = {
        // Build payload with PascalCase keys to match the server model (IngreId is string)
        IngreId: newIngredient.ingreID.toString().trim(),
        IngreName: newIngredient.ingreName.trim(),
        UnitMeasurement: newIngredient.unitMeasurement.trim(),
        Stock: stock
      };

      setSubmitting(true);
      
      try {
  const response = await apiService.createIngredient(ingredientData);
        console.log('Ingredient created:', response);
        
        // Close modal, reset form and immediately refresh list so the new item appears
        setIsAddModalVisible(false);
        resetForm();
        // Refresh ingredients immediately
        await fetchIngredients();
        // Notify user
        Alert.alert('Thành công', 'Đã thêm nguyên liệu!');
      } catch (apiError) {
        if (apiError.message.includes('Cannot connect') || apiError.message.includes('Network Error')) {
          Alert.alert(
            'Server Unavailable', 
            'Không thể kết nối server. Thêm vào local để test?',
            [
              {
                text: 'Thêm Local',
                onPress: () => {
                    const newIngr = {
                      // Create a UI-friendly local item using ingreID/ingreName keys
                      ingreID: ingredientData.IngreId || Date.now().toString(),
                      ingreName: ingredientData.IngreName || '',
                      unitMeasurement: ingredientData.UnitMeasurement || '',
                      stock: ingredientData.Stock ?? 0
                    };
                    setIngredients(prev => [...prev, newIngr]);
                    setIsAddModalVisible(false);
                    resetForm();
                    Alert.alert('Thành công', 'Đã thêm nguyên liệu local!');
                  }
              },
              {
                text: 'Hủy',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Lỗi', apiError.message || 'Không thể thêm nguyên liệu');
        }
      }
      
    } catch (error) {
      console.error('Error adding ingredient:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi thêm nguyên liệu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditIngredient = async () => {
    try {
      if (!editingIngredient.ingreName.trim() || 
          !editingIngredient.unitMeasurement.trim() ||
          !editingIngredient.stock.toString().trim()) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      const stock = parseFloat(editingIngredient.stock);

      if (isNaN(stock) || stock < 0) {
        Alert.alert('Lỗi', 'Số lượng tồn kho phải là số hợp lệ');
        return;
      }

      // Build payload with PascalCase keys to match server model and ensure IngreId is a string
      const ingredientData = {
        IngreId: editingIngredient.ingreID?.toString().trim(),
        IngreName: editingIngredient.ingreName.trim(),
        UnitMeasurement: editingIngredient.unitMeasurement.trim(),
        Stock: stock
      };

      setSubmitting(true);
      
      try {
  // Ensure the URL id is string and matches the body.IngreId
  const idForUrl = editingIngredient.ingreID?.toString().trim();
  const response = await apiService.updateIngredient(idForUrl, ingredientData);
        console.log('Ingredient updated:', response);
        
        // Close modal, clear editing state, refresh list immediately
        setIsEditModalVisible(false);
        setEditingIngredient(null);
        await fetchIngredients();
        Alert.alert('Thành công', 'Đã cập nhật nguyên liệu!');
      } catch (apiError) {
        if (apiError.message.includes('Cannot connect') || apiError.message.includes('Network Error')) {
          Alert.alert(
            'Server Unavailable', 
            'Không thể kết nối server. Cập nhật local?',
            [
              {
                text: 'Cập nhật Local',
                onPress: () => {
                  // Update local list by matching ingreID and updating UI-friendly keys
                  setIngredients(prev => prev.map(item => {
                    const matchId = item.ingreID ?? item.ingreId ?? item.IngreId ?? item.id;
                    if (matchId == ingredientData.IngreId) {
                      return {
                        ...item,
                        ingreID: ingredientData.IngreId,
                        ingreName: ingredientData.IngreName,
                        unitMeasurement: ingredientData.UnitMeasurement,
                        stock: ingredientData.Stock
                      };
                    }
                    return item;
                  }));
                  setIsEditModalVisible(false);
                  setEditingIngredient(null);
                  Alert.alert('Thành công', 'Đã cập nhật local!');
                }
              },
              {
                text: 'Hủy',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Lỗi', apiError.message || 'Không thể cập nhật nguyên liệu');
        }
      }
      
    } catch (error) {
      console.error('Error updating ingredient:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIngredient = (ingredient) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${ingredient.ingreName}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            // Normalize id from different possible keys
            const idForUrl = (ingredient.ingreID ?? ingredient.ingreId ?? ingredient.IngreId ?? ingredient.id)?.toString().trim();
            if (!idForUrl) {
              Alert.alert('Lỗi', 'Không tìm thấy ID nguyên liệu để xóa.');
              return;
            }

            try {
              // Call API to delete
              await apiService.deleteIngredient(idForUrl);

              // Refresh list immediately so UI updates
              await fetchIngredients();

              // Notify user
              Alert.alert('Thành công', 'Đã xóa nguyên liệu!');
            } catch (error) {
              console.error('Error deleting ingredient:', error);

              const isNetworkError = (error.message && (error.message.includes('Cannot connect') || error.message.includes('Network Error'))) || error.code === 'ERR_NETWORK';

              if (isNetworkError) {
                Alert.alert(
                  'Server Unavailable',
                  'Không thể kết nối server. Xóa local?',
                  [
                    {
                      text: 'Xóa Local',
                      onPress: () => {
                        // Use normalized matching for local deletion
                        const matchId = idForUrl;
                        setIngredients(prev => prev.filter(item => {
                          const itemId = (item.ingreID ?? item.ingreId ?? item.IngreId ?? item.id)?.toString();
                          return itemId !== matchId;
                        }));
                        Alert.alert('Thành công', 'Đã xóa local!');
                      }
                    },
                    {
                      text: 'Hủy',
                      style: 'cancel'
                    }
                  ]
                );
              } else if (error.response) {
                // Server returned an error status
                const status = error.response.status;
                const data = error.response.data;
                const message = data?.message || JSON.stringify(data) || error.message;
                Alert.alert('Lỗi', `Server trả lỗi ${status}: ${message}`);
              } else {
                Alert.alert('Lỗi', error.message || 'Không thể xóa nguyên liệu');
              }
            }
          }
        }
      ]
    );
  };

  const openEditModal = (ingredient) => {
    // Normalize id field if API returned ingreId/IngreId
    const idValue = ingredient.ingreID ?? ingredient.ingreId ?? ingredient.IngreId ?? ingredient.id;
    setEditingIngredient({...ingredient, ingreID: idValue, stock: ingredient.stock?.toString()});
    setIsEditModalVisible(true);
  };

  const resetForm = () => {
    setNewIngredient({
      ingreID: '',
      ingreName: '',
      unitMeasurement: '',
      stock: ''
    });
  };

  const handleCancelAdd = () => {
    resetForm();
    setIsAddModalVisible(false);
  };

  const handleCancelEdit = () => {
    setEditingIngredient(null);
    setIsEditModalVisible(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalVisible(true);
  };

  const renderIngredientItem = ({ item }) => (
    <View style={styles.ingredientCard}>
      <View style={styles.cardHeader}>
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{item.ingreName}</Text>
          <Text style={styles.ingredientId}>ID: {item.ingreID}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#3498DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteIngredient(item)}
          >
            <MaterialCommunityIcons name="delete" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.ingredientDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="package-variant" size={18} color="#666" />
          <Text style={styles.detailText}>Đơn vị: {item.unitMeasurement}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="warehouse" size={18} color="#666" />
          <Text style={styles.detailText}>Tồn kho: {item.stock}</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>Đang tải nguyên liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Thêm Nguyên Liệu Mới</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Mã nguyên liệu (VD: 1, 2, 3...)"
                  value={newIngredient.ingreID}
                  onChangeText={(text) => setNewIngredient(prev => ({ ...prev, ingreID: text }))}
                  autoCorrect={false}
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Tên nguyên liệu"
                  value={newIngredient.ingreName}
                  onChangeText={(text) => setNewIngredient(prev => ({ ...prev, ingreName: text }))}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Đơn vị (VD: kg, lít, gói)"
                  value={newIngredient.unitMeasurement}
                  onChangeText={(text) => setNewIngredient(prev => ({ ...prev, unitMeasurement: text }))}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Số lượng tồn kho"
                  value={newIngredient.stock}
                  onChangeText={(text) => setNewIngredient(prev => ({ ...prev, stock: text }))}
                  keyboardType="numeric"
                />


                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelAdd}
                    disabled={submitting}
                  >
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleAddIngredient}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Thêm</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>


      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chỉnh Sửa Nguyên Liệu</Text>
                
                {/* === FIX 1: DÙNG ingreID === */}
                <View style={[styles.input, { justifyContent: 'center' }]}>
                  <Text style={styles.disabledText}>Mã: {editingIngredient?.ingreID}</Text>
                </View>
                
                {/* === FIX 2: DÙNG ingreName === */}
                <TextInput
                  style={styles.input}
                  placeholder="Tên nguyên liệu"
                  value={editingIngredient?.ingreName}
                  onChangeText={(text) => setEditingIngredient(prev => ({ ...prev, ingreName: text }))}
                />
                
                {/* === FIX 3: DÙNG unitMeasurement === */}
                <TextInput
                  style={styles.input}
                  placeholder="Đơn vị"
                  value={editingIngredient?.unitMeasurement}
                  onChangeText={(text) => setEditingIngredient(prev => ({ ...prev, unitMeasurement: text }))}
                />

                {/* === FIX 4: DÙNG stock === */}
                <TextInput
                  style={styles.input}
                  placeholder="Số lượng tồn kho"
                  value={editingIngredient?.stock} // Đã là string từ openEditModal
                  onChangeText={(text) => setEditingIngredient(prev => ({ ...prev, stock: text }))}
                  keyboardType="numeric"
                />

                {/* TextInput cho unitPrice ĐÃ BỊ XÓA VÌ KO CÓ TRONG STATE */}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={handleCancelEdit}
                    disabled={submitting}
                  >
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleEditIngredient}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.buttonText}>Cập nhật</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* ==================== MAIN CONTENT ======================= */}
      {/* ========================================================= */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản Lý Nguyên Liệu</Text>
        <View style={styles.headerContent}>
          <Text style={styles.headerSubtitle}>
            {ingredients.length} nguyên liệu
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <MaterialCommunityIcons name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {ingredients.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="package-variant-closed" size={80} color="#BDC3C7" />
          <Text style={styles.emptyTitle}>Chưa có nguyên liệu</Text>
          <Text style={styles.emptySubtitle}>
            Nhấn nút + để thêm nguyên liệu mới
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchIngredients}>
            <Text style={styles.retryButtonText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={ingredients}
          renderItem={renderIngredientItem}
          // === FIX: DÙNG ingreID và toString() ===
          keyExtractor={(item, index) => item.ingreID?.toString() || `ingredient-${index}`}
          style={styles.ingredientsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }} // Thêm padding ở dưới
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BDC3C7',
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
  ingredientsList: {
    flex: 1,
    padding: 15,
  },
  ingredientCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  ingredientId: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#EAF6FB',
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 8,
  },
  ingredientDetails: {
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
    maxHeight: '98%', 
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
  disabledText: {
    fontSize: 16,
    color: '#7F8C8D',
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