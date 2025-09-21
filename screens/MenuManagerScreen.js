import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Modal, 
  RefreshControl,
  ActivityIndicator,
  Image
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { apiService, API_BASE_URL } from '../services/apiService';

export default function MenuManagerScreen({ navigation }) {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState(''); // Debug info for UI
  
  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] = useState(false);
  const [isEditCategoryModalVisible, setIsEditCategoryModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    foodId: '',
    foodName: '',
    unitPrice: '',
    description: '',
    cateId: '',
    foodImage: ''
  });

  // Image picker state
  const [selectedImage, setSelectedImage] = useState(null);

  // Category form states
  const [categoryFormData, setCategoryFormData] = useState({
    cateId: '',
    cateName: '',
    description: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter items when search query changes
  useEffect(() => {
    filterItems();
  }, [searchQuery, menuItems]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMenuItems(),
        loadCategories()
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      console.log('Loading menu items...');
      setDebugInfo('Starting API request...');
      
      let items = [];
      
      try {
        // Use the updated apiService which handles both old and new formats
        items = await apiService.getAllFoodItems();
        console.log('API service returned items:', items?.length || 0);
        
        if (Array.isArray(items) && items.length > 0) {
          // Ensure all items have required properties
          const processedItems = items.map(item => ({
            foodId: String(item.foodId || '').trim(),
            foodName: String(item.foodName || 'Unnamed Item').trim(),
            unitPrice: parseFloat(item.unitPrice) || 0,
            description: String(item.description || '').trim(),
            cateId: String(item.cateId || '').trim(),
            foodImage: String(item.foodImage || 'default-food.jpg').trim(),
            categoryName: String(item.categoryName || 'Uncategorized').trim()
          }));
          
          console.log('Processed items count:', processedItems.length);
          console.log('Sample processed item:', processedItems[0]);
          setDebugInfo(`✅ Successfully loaded ${processedItems.length} món`);
          setMenuItems(processedItems);
        } else {
          console.log('No valid items received');
          setDebugInfo('⚠️ No món found in API response');
          setMenuItems([]);
        }
      } catch (fetchError) {
        console.error('API service error:', fetchError);
        setDebugInfo(`❌ API Error: ${fetchError.message}`);
        setMenuItems([]);
      }
      
    } catch (error) {
      console.error('Error in loadMenuItems:', error);
      setDebugInfo(`❌ Error loading món: ${error.message}`);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      
      // First try the API service
      let cats = [];
      try {
        cats = await apiService.getCategories();
        console.log('API Service returned categories:', cats);
        console.log('Number of categories from API Service:', cats?.length);
      } catch (serviceError) {
        console.log('API Service failed, trying direct fetch:', serviceError);
        
        // Try direct API call if service fails
        try {
          const response = await fetch(`${API_BASE_URL}api/Category`);
          if (response.ok) {
            const data = await response.json();
            console.log('Direct API raw response for categories:', data);
            
            // Handle different response formats
            if (data && data.$values) {
              cats = data.$values.filter(item => 
                item && 
                typeof item === 'object' && 
                !item.$ref && 
                item.cateId
              );
            } else if (Array.isArray(data)) {
              cats = data.filter(item => 
                item && 
                typeof item === 'object' && 
                !item.$ref && 
                item.cateId
              );
            } else if (data && data.cateId) {
              cats = [data];
            }
            
            console.log('Processed categories from direct API:', cats);
            console.log('Number of processed categories:', cats?.length);
          }
        } catch (directError) {
          console.log('Direct API also failed:', directError);
        }
      }
      
      if (!cats || cats.length === 0) {
        console.log('No categories loaded, using fallback data');
        cats = [
          { cateId: 'C001', cateName: 'Món Chính', description: 'Các món ăn chính' },
          { cateId: 'C002', cateName: 'Món Nhẹ', description: 'Các món ăn nhẹ' },
          { cateId: 'C003', cateName: 'Đồ Uống', description: 'Các loại thức uống' }
        ];
      }
      
      console.log('Final categories to set:', cats);
      console.log('Final number of categories:', cats?.length);
      setCategories(cats || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Add some fallback data for testing
      const fallbackCategories = [
        { cateId: 'C001', cateName: 'Món Chính', description: 'Các món ăn chính' },
        { cateId: 'C002', cateName: 'Món Nhẹ', description: 'Các món ăn nhẹ' },
        { cateId: 'C003', cateName: 'Đồ Uống', description: 'Các loại thức uống' }
      ];
      setCategories(fallbackCategories);
      throw error;
    }
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(item =>
        item.foodName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setFormData({
      foodId: '',
      foodName: '',
      unitPrice: '',
      description: '',
      cateId: '',
      foodImage: ''
    });
    setSelectedImage(null);
  };

  // Image picker functions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để chọn hình ảnh!');
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      setFormData({...formData, foodImage: imageUri});
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập camera để chụp ảnh!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      setFormData({...formData, foodImage: imageUri});
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Chọn Hình Ảnh',
      'Bạn muốn chọn hình ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thư viện ảnh', onPress: pickImageFromGallery },
        { text: 'Chụp ảnh', onPress: takePhoto },
      ]
    );
  };

  const generateFoodId = () => {
    const lastId = menuItems.length > 0 
      ? Math.max(...menuItems.map(item => {
          const idNum = parseInt(item.foodId || '0');
          return isNaN(idNum) ? 0 : idNum;
        }))
      : 0;
    return String(lastId + 1);
  };

  const validateForm = () => {
    if (!formData.foodName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món ăn');
      return false;
    }
    if (!formData.unitPrice.trim() || isNaN(parseFloat(formData.unitPrice))) {
      Alert.alert('Lỗi', 'Vui lòng nhập giá hợp lệ');
      return false;
    }
    if (!formData.cateId) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return false;
    }
    return true;
  };

  const handleAddItem = async () => {
    if (!validateForm()) return;

    try {
      const newItem = {
        ...formData,
        foodId: generateFoodId(),
        unitPrice: parseFloat(formData.unitPrice),
        foodImage: formData.foodImage || 'default-food.jpg'
      };

      console.log('Adding new item:', newItem);
      
      // Try to add via API first
      try {
        const response = await fetch(`${API_BASE_URL}api/FoodInfo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem)
        });
        
        if (response.ok) {
          console.log('Successfully added item via API');
          // Reload data from API
          await loadMenuItems();
        } else {
          console.log('API add failed, adding locally');
          setMenuItems([...menuItems, newItem]);
        }
      } catch (apiError) {
        console.log('API add failed, adding locally:', apiError);
        setMenuItems([...menuItems, newItem]);
      }
      
      setIsAddModalVisible(false);
      resetForm();
      Alert.alert('Thành công', 'Đã thêm món ăn mới');
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Lỗi', 'Không thể thêm món ăn. Vui lòng thử lại.');
    }
  };

  const handleEditItem = async () => {
    if (!validateForm()) return;

    try {
      const updatedItem = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice)
      };

      // For production, uncomment these API calls:
      // await apiService.updateFoodItem(selectedItem.foodId, updatedItem);
      
      // For now, update local state
      setMenuItems(menuItems.map(item => 
        item.foodId === selectedItem.foodId ? { ...item, ...updatedItem } : item
      ));
      setIsEditModalVisible(false);
      setSelectedItem(null);
      resetForm();
      Alert.alert('Thành công', 'Đã cập nhật món ăn');
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật món ăn. Vui lòng thử lại.');
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      "Xác Nhận Xóa",
      `Bạn có chắc chắn muốn xóa "${item.foodName}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Deleting food item:', item.foodId);
              
              // Try to delete via API first
              try {
                const response = await fetch(`${API_BASE_URL}api/FoodInfo/${item.foodId}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  }
                });
                
                if (response.ok) {
                  console.log('Successfully deleted item via API');
                  // Reload data from API to get updated list
                  await loadMenuItems();
                  Alert.alert('Thành công', 'Đã xóa món ăn');
                } else {
                  console.log('API delete failed, removing locally');
                  // Remove from local state if API fails
                  setMenuItems(menuItems.filter(menuItem => menuItem.foodId !== item.foodId));
                  Alert.alert('Thành công', 'Đã xóa món ăn (local)');
                }
              } catch (apiError) {
                console.log('API delete failed, removing locally:', apiError);
                // Remove from local state if API fails
                setMenuItems(menuItems.filter(menuItem => menuItem.foodId !== item.foodId));
                Alert.alert('Thành công', 'Đã xóa món ăn (local)');
              }
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Lỗi', 'Không thể xóa món ăn. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      foodId: item.foodId,
      foodName: item.foodName,
      unitPrice: item.unitPrice.toString(),
      description: item.description || '',
      cateId: item.cateId,
      foodImage: item.foodImage || ''
    });
    // Set selected image if item has an image
    if (item.foodImage && item.foodImage !== 'default-food.jpg') {
      setSelectedImage(item.foodImage);
    } else {
      setSelectedImage(null);
    }
    setIsEditModalVisible(true);
  };

  const getCategoryName = (cateId) => {
    const category = categories.find(cat => cat.cateId === cateId);
    return category?.cateName || 'Không xác định';
  };

  const formatPrice = (price) => {
    return `${parseFloat(price).toLocaleString('vi-VN')}₫`;
  };

  // Debug function to test API directly
  const debugApiData = async () => {
    Alert.alert('Debug Button Working!', 'Now testing API...');
    
    try {
      console.log('=== DEBUG API DATA ===');
      const response = await fetch(`${API_BASE_URL}api/FoodInfo`);
      const data = await response.json();
      
      console.log('Raw response keys:', Object.keys(data));
      console.log('$values type:', typeof data.$values);
      console.log('$values isArray:', Array.isArray(data.$values));
      console.log('$values length:', data.$values?.length);
      
      if (data.$values) {
        console.log('First 3 raw items:');
        data.$values.slice(0, 3).forEach((item, index) => {
          console.log(`Item ${index}:`, {
            foodId: item.foodId,
            foodName: item.foodName,
            type: typeof item,
            hasRef: !!item.$ref
          });
        });
      }
      
      Alert.alert('Debug Complete', `Found ${data.$values?.length || 0} items. Check console for details.`);
    } catch (error) {
      console.error('Debug error:', error);
      Alert.alert('Debug Error', error.message);
    }
  };

  // Category Management Functions
  const resetCategoryForm = () => {
    setCategoryFormData({
      cateId: '',
      cateName: '',
      description: ''
    });
  };

  const generateCategoryId = () => {
    const lastId = categories.length > 0 
      ? Math.max(...categories.map(cat => {
          const idNum = parseInt(cat.cateId || '0');
          return isNaN(idNum) ? 0 : idNum;
        }))
      : 0;
    return String(lastId + 1);
  };

  const validateCategoryForm = () => {
    if (!categoryFormData.cateName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return false;
    }
    return true;
  };

  const handleAddCategory = async () => {
    if (!validateCategoryForm()) return;

    try {
      const newCategory = {
        ...categoryFormData,
        cateId: generateCategoryId()
      };

      console.log('Adding new category:', newCategory);
      
      // Try to add via API first
      try {
        const response = await fetch(`${API_BASE_URL}api/Category`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory)
        });
        
        if (response.ok) {
          console.log('Successfully added category via API');
          // Reload data from API
          await loadCategories();
        } else {
          console.log('API add failed, adding locally');
          setCategories([...categories, newCategory]);
        }
      } catch (apiError) {
        console.log('API add failed, adding locally:', apiError);
        setCategories([...categories, newCategory]);
      }
      
      setIsAddCategoryModalVisible(false);
      resetCategoryForm();
      Alert.alert('Thành công', 'Đã thêm danh mục mới');
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Lỗi', 'Không thể thêm danh mục. Vui lòng thử lại.');
    }
  };

  const handleEditCategory = async () => {
    if (!validateCategoryForm()) return;

    try {
      const updatedCategory = {
        ...categoryFormData
      };

      // For production, uncomment these API calls:
      // await apiService.updateCategory(selectedCategory.cateId, updatedCategory);
      
      // For now, update local state
      setCategories(categories.map(cat => 
        cat.cateId === selectedCategory.cateId ? { ...cat, ...updatedCategory } : cat
      ));
      setIsEditCategoryModalVisible(false);
      setSelectedCategory(null);
      resetCategoryForm();
      Alert.alert('Thành công', 'Đã cập nhật danh mục');
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật danh mục. Vui lòng thử lại.');
    }
  };

  const handleDeleteCategory = (category) => {
    // Check if category is being used by any food items
    const itemsUsingCategory = menuItems.filter(item => item.cateId === category.cateId);
    
    if (itemsUsingCategory.length > 0) {
      Alert.alert(
        'Không thể xóa',
        `Danh mục "${category.cateName}" đang được sử dụng bởi ${itemsUsingCategory.length} món ăn. Vui lòng xóa hoặc chuyển các món ăn này sang danh mục khác trước.`
      );
      return;
    }

    Alert.alert(
      "Xác Nhận Xóa",
      `Bạn có chắc chắn muốn xóa danh mục "${category.cateName}"?`,
      [
        { text: "Hủy", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: async () => {
            try {
              console.log('Deleting category:', category.cateId);
              
              // Try to delete via API first
              try {
                const response = await fetch(`${API_BASE_URL}api/Category/${category.cateId}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  }
                });
                
                if (response.ok) {
                  console.log('Successfully deleted category via API');
                  // Reload data from API to get updated list
                  await loadCategories();
                  Alert.alert('Thành công', 'Đã xóa danh mục');
                } else {
                  console.log('API delete failed, removing locally');
                  // Remove from local state if API fails
                  setCategories(categories.filter(cat => cat.cateId !== category.cateId));
                  Alert.alert('Thành công', 'Đã xóa danh mục (local)');
                }
              } catch (apiError) {
                console.log('API delete failed, removing locally:', apiError);
                // Remove from local state if API fails
                setCategories(categories.filter(cat => cat.cateId !== category.cateId));
                Alert.alert('Thành công', 'Đã xóa danh mục (local)');
              }
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Lỗi', 'Không thể xóa danh mục. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const openEditCategoryModal = (category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      cateId: category.cateId,
      cateName: category.cateName,
      description: category.description || ''
    });
    setIsEditCategoryModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản Lý Danh Sách Món</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => {
              Alert.alert('Test', 'Debug button pressed!');
              debugApiData();
            }}
          >
            <MaterialCommunityIcons name="bug" size={20} color="#E74C3C" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.categoryButton}
            onPress={() => setIsCategoryModalVisible(true)}
          >
            <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#FF6B35" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setIsAddModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <TouchableOpacity 
          style={styles.statCard}
          onPress={() => setIsCategoryModalVisible(true)}
        >
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>Danh Mục</Text>
        </TouchableOpacity>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{menuItems.length}</Text>
          <Text style={styles.statLabel}>Tổng Món</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredItems.length}</Text>
          <Text style={styles.statLabel}>Hiển Thị</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#BDC3C7" />
        <TextInput 
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn..."
          placeholderTextColor="#BDC3C7"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close" size={20} color="#BDC3C7" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Menu Items List */}
      <ScrollView 
        style={styles.menuList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="food-off" size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy món ăn nào' : 'Chưa có món ăn nào'}
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <View key={item.foodId} style={styles.menuItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.foodName}</Text>
                <Text style={styles.itemCategory}>{getCategoryName(item.cateId)}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>
                  {item.description || 'Không có mô tả'}
                </Text>
                <Text style={styles.itemPrice}>{formatPrice(item.unitPrice)}</Text>
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => openEditModal(item)}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color="#3498DB" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item)}
                >
                  <MaterialCommunityIcons name="delete" size={18} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Món Ăn Mới</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên Món Ăn *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.foodName}
                  onChangeText={(text) => setFormData({...formData, foodName: text})}
                  placeholder="Nhập tên món ăn"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giá (VNĐ) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.unitPrice}
                  onChangeText={(text) => setFormData({...formData, unitPrice: text})}
                  placeholder="Nhập giá món ăn"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Danh Mục *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.cateId}
                    onValueChange={(value) => setFormData({...formData, cateId: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Chọn danh mục" value="" />
                    {categories.map((category) => (
                      <Picker.Item 
                        key={category.cateId} 
                        label={category.cateName} 
                        value={category.cateId} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô Tả</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  placeholder="Nhập mô tả món ăn"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hình Ảnh</Text>
                
                <TouchableOpacity 
                  style={styles.imagePickerButton}
                  onPress={showImageOptions}
                >
                  <MaterialCommunityIcons name="camera-plus" size={20} color="#FF6B35" />
                  <Text style={styles.imagePickerText}>Chọn/Chụp Hình Ảnh</Text>
                </TouchableOpacity>

                {selectedImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => {
                        setSelectedImage(null);
                        setFormData({...formData, foodImage: ''});
                      }}
                    >
                      <MaterialCommunityIcons name="close-circle" size={24} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.inputLabel}>Hoặc nhập URL hình ảnh</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.foodImage}
                  onChangeText={(text) => {
                    setFormData({...formData, foodImage: text});
                    if (text && !selectedImage) {
                      setSelectedImage(text);
                    }
                  }}
                  placeholder="Nhập URL hình ảnh"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddItem}
              >
                <Text style={styles.saveButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh Sửa Món Ăn</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên Món Ăn *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.foodName}
                  onChangeText={(text) => setFormData({...formData, foodName: text})}
                  placeholder="Nhập tên món ăn"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Giá (VNĐ) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.unitPrice}
                  onChangeText={(text) => setFormData({...formData, unitPrice: text})}
                  placeholder="Nhập giá món ăn"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Danh Mục *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.cateId}
                    onValueChange={(value) => setFormData({...formData, cateId: value})}
                    style={styles.picker}
                  >
                    <Picker.Item label="Chọn danh mục" value="" />
                    {categories.map((category) => (
                      <Picker.Item 
                        key={category.cateId} 
                        label={category.cateName} 
                        value={category.cateId} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô Tả</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  placeholder="Nhập mô tả món ăn"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hình Ảnh</Text>
                
                <TouchableOpacity 
                  style={styles.imagePickerButton}
                  onPress={showImageOptions}
                >
                  <MaterialCommunityIcons name="camera-plus" size={20} color="#FF6B35" />
                  <Text style={styles.imagePickerText}>Chọn/Chụp Hình Ảnh</Text>
                </TouchableOpacity>

                {selectedImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => {
                        setSelectedImage(null);
                        setFormData({...formData, foodImage: ''});
                      }}
                    >
                      <MaterialCommunityIcons name="close-circle" size={24} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={styles.inputLabel}>Hoặc nhập URL hình ảnh</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.foodImage}
                  onChangeText={(text) => {
                    setFormData({...formData, foodImage: text});
                    if (text && !selectedImage) {
                      setSelectedImage(text);
                    }
                  }}
                  placeholder="Nhập URL hình ảnh"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditItem}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Management Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCategoryModalVisible}
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quản Lý Danh Mục</Text>
              <View style={styles.modalHeaderButtons}>
                <TouchableOpacity 
                  style={styles.addCategoryButton}
                  onPress={() => {
                    resetCategoryForm();
                    setIsAddCategoryModalVisible(true);
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#FF6B35" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsCategoryModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#2C3E50" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.categoryList}>
              {categories.length === 0 ? (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="format-list-bulleted-square" size={64} color="#BDC3C7" />
                  <Text style={styles.emptyText}>Chưa có danh mục nào</Text>
                </View>
              ) : (
                categories.map((category) => (
                  <View key={category.cateId} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.cateName}</Text>
                      <Text style={styles.categoryDescription}>
                        {category.description || 'Không có mô tả'}
                      </Text>
                      <Text style={styles.categoryId}>ID: {category.cateId}</Text>
                    </View>
                    
                    <View style={styles.categoryActions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => {
                          setIsCategoryModalVisible(false);
                          openEditCategoryModal(category);
                        }}
                      >
                        <MaterialCommunityIcons name="pencil" size={18} color="#3498DB" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDeleteCategory(category)}
                      >
                        <MaterialCommunityIcons name="delete" size={18} color="#E74C3C" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddCategoryModalVisible}
        onRequestClose={() => setIsAddCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm Danh Mục Mới</Text>
              <TouchableOpacity onPress={() => setIsAddCategoryModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên Danh Mục *</Text>
                <TextInput
                  style={styles.textInput}
                  value={categoryFormData.cateName}
                  onChangeText={(text) => setCategoryFormData({...categoryFormData, cateName: text})}
                  placeholder="Nhập tên danh mục"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô Tả</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={categoryFormData.description}
                  onChangeText={(text) => setCategoryFormData({...categoryFormData, description: text})}
                  placeholder="Nhập mô tả danh mục"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsAddCategoryModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.saveButtonText}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditCategoryModalVisible}
        onRequestClose={() => setIsEditCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh Sửa Danh Mục</Text>
              <TouchableOpacity onPress={() => setIsEditCategoryModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên Danh Mục *</Text>
                <TextInput
                  style={styles.textInput}
                  value={categoryFormData.cateName}
                  onChangeText={(text) => setCategoryFormData({...categoryFormData, cateName: text})}
                  placeholder="Nhập tên danh mục"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mô Tả</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={categoryFormData.description}
                  onChangeText={(text) => setCategoryFormData({...categoryFormData, description: text})}
                  placeholder="Nhập mô tả danh mục"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditCategoryModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleEditCategory}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButton: {
    padding: 5,
    marginRight: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  menuList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  itemCategory: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: '#95A5A6',
    marginTop: 4,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 5,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 5,
    backgroundColor: '#EBF4FD',
    borderRadius: 6,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FDEBEB',
    borderRadius: 6,
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
    width: '90%',
    maxHeight: '80%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  picker: {
    height: 50,
    color: '#2C3E50',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    marginLeft: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  // Category Management Styles
  modalHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCategoryButton: {
    padding: 5,
    marginRight: 10,
    backgroundColor: '#FFF2E8',
    borderRadius: 6,
  },
  categoryList: {
    padding: 20,
    maxHeight: 400,
  },
  categoryItem: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  categoryDescription: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 4,
  },
  categoryId: {
    fontSize: 11,
    color: '#95A5A6',
    marginTop: 2,
  },
  categoryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryModalContent: {
    backgroundColor: 'white',
    width: '90%',
    maxHeight: '60%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  debugCard: {
    backgroundColor: '#FFF3CD',
    margin: 15,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  // Image picker styles
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2E8',
    borderWidth: 1,
    borderColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  imagePickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: '35%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});