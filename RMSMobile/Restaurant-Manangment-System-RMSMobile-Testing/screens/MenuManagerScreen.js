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
  
  // Success popup state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isErrorMessage, setIsErrorMessage] = useState(false);

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

  // Success popup utility function
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setIsErrorMessage(false);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 2000);
  };

  // Error popup utility function
  const showError = (message) => {
    setSuccessMessage(message);
    setIsErrorMessage(true);
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000); // Show errors a bit longer
  };

  // Translate English error messages to Vietnamese
  const translateErrorMessage = (message) => {
    if (!message) return 'Có lỗi xảy ra khi xóa món ăn.';
    
    // Convert to string if not already
    const msgStr = message.toString();
    
    // Check for common error patterns and translate them
    if (msgStr.includes('referenced in') && msgStr.includes('order')) {
      // Extract number of orders if possible
      const orderMatch = msgStr.match(/(\d+)\s+order/);
      const orderCount = orderMatch ? orderMatch[1] : '';
      return orderCount ? 
        `Không thể xóa món ăn này vì đang được sử dụng trong ${orderCount} đơn hàng.` :
        'Không thể xóa món ăn này vì đang được sử dụng trong các đơn hàng.';
    }
    
    if (msgStr.includes('Cannot delete food item')) {
      return 'Không thể xóa món ăn này vì đang được sử dụng trong hệ thống.';
    }
    
    if (msgStr.includes('being used in existing orders')) {
      return 'Món ăn này đang được sử dụng trong các đơn hàng hiện tại.';
    }
    
    if (msgStr.includes('constraint')) {
      return 'Không thể xóa do ràng buộc dữ liệu trong hệ thống.';
    }
    
    // If no specific pattern matches, return the original message
    // but try to keep it in Vietnamese if already translated
    return msgStr.includes('Món ăn') ? msgStr : 'Không thể xóa món ăn này vì đang được sử dụng trong hệ thống.';
  };

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
      
      // Use API service to add the item
      const result = await apiService.createFoodItem(newItem);
      
      console.log('Successfully added item via API:', result);
      // Reload data from API
      await loadMenuItems();
      setIsAddModalVisible(false);
      resetForm();
      showSuccess('Đã thêm món ăn mới thành công!');
      
    } catch (error) {
      console.error('Error adding item:', error);
      
      // Fallback: add to local state if API fails
      const newItem = {
        ...formData,
        foodId: generateFoodId(),
        unitPrice: parseFloat(formData.unitPrice),
        foodImage: formData.foodImage || 'default-food.jpg'
      };
      setMenuItems([...menuItems, newItem]);
      setIsAddModalVisible(false);
      resetForm();
      Alert.alert('Cảnh báo', 'Đã thêm món ăn mới (chỉ cục bộ - vui lòng kiểm tra kết nối mạng)');
    }
  };

  const handleEditItem = async () => {
    if (!validateForm()) return;

    try {
      const updatedItem = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice)
      };

      console.log('Updating food item:', selectedItem.foodId, updatedItem);
      
      // Use API service to update the item
      const result = await apiService.updateFoodItem(selectedItem.foodId, updatedItem);
      
      console.log('Successfully updated item via API:', result);
      // Reload data from API to get updated list
      await loadMenuItems();
      setIsEditModalVisible(false);
      setSelectedItem(null);
      resetForm();
      showSuccess('Đã cập nhật món ăn thành công!');
    } catch (error) {
      console.error('Error updating item:', error);
      
      // Fallback: update local state if API fails
      setMenuItems(menuItems.map(item => 
        item.foodId === selectedItem.foodId ? { ...item, ...updatedItem } : item
      ));
      setIsEditModalVisible(false);
      setSelectedItem(null);
      resetForm();
      Alert.alert('Cảnh báo', 'Đã cập nhật món ăn (chỉ cục bộ - vui lòng kiểm tra kết nối mạng)');
    }
  };

  const handleDeleteItem = (item) => {
    console.log('=== DELETE BUTTON PRESSED ===');
    console.log('Item to delete:', item);
    console.log('Item ID:', item.foodId);
    console.log('Item Name:', item.foodName);
    
    // Set the item to delete and show confirmation modal
    setItemToDelete(item);
    setShowDeleteConfirm(true);
    console.log('Delete confirmation modal should now be visible');
  };

  const performDelete = async () => {
    if (!itemToDelete) return;
    
    console.log('=== USER CONFIRMED DELETE ===');
    setShowDeleteConfirm(false);
    
    try {
      // Trim any whitespace from foodId
      const cleanFoodId = itemToDelete.foodId.toString().trim();
      console.log('Deleting food item:', cleanFoodId, 'Original ID:', itemToDelete.foodId);
      console.log('About to call apiService.deleteFoodItem...');
      
      // Use API service to delete the item
      const result = await apiService.deleteFoodItem(cleanFoodId);
      console.log('API delete result:', result);
      
      console.log('Successfully deleted item via API');
      // Reload data from API to get updated list
      await loadMenuItems();
      showSuccess('Đã xóa món ăn thành công!');
      
    } catch (error) {
      console.log('=== DELETE ERROR OCCURRED ===');
      console.error('Error deleting item:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'No response'
      });
      
      // Check if it's a constraint error (409 Conflict) or other known errors
      if (error.response && (error.response.status === 409 || error.response.status === 400)) {
        // Handle constraint violation error
        const errorData = error.response.data;
        console.log('Showing constraint error popup');
        
        // Show custom error popup
        const vietnameseMessage = translateErrorMessage(errorData.details || errorData.message || 'Món ăn này đang được sử dụng trong hệ thống và không thể xóa.');
        showError(vietnameseMessage);
        
      } else if (error.response && error.response.status === 404) {
        console.log('Item not found - probably already deleted');
        Alert.alert(
          'Thông báo', 
          'Món ăn không tồn tại hoặc đã được xóa. Đang cập nhật danh sách...',
          [{ 
            text: 'OK', 
            onPress: async () => {
              await loadMenuItems(); // Refresh the list
            }
          }]
        );
      } else {
        // Fallback: remove from local state if API fails
        setMenuItems(menuItems.filter(menuItem => menuItem.foodId !== itemToDelete.foodId));
        Alert.alert('Cảnh báo', 'Đã xóa món ăn (chỉ cục bộ - vui lòng kiểm tra kết nối mạng)');
      }
    }
    
    setItemToDelete(null);
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
      
      // Use API service to add the category
      await apiService.createCategory(newCategory);
      
      console.log('Successfully added category via API');
      // Reload data from API
      await loadCategories();
      setIsAddCategoryModalVisible(false);
      resetCategoryForm();
      showSuccess('Đã thêm danh mục mới thành công!');
      
    } catch (error) {
      console.error('Error adding category:', error);
      
      // Fallback: add to local state if API fails
      const newCategory = {
        ...categoryFormData,
        cateId: generateCategoryId()
      };
      setCategories([...categories, newCategory]);
      setIsAddCategoryModalVisible(false);
      resetCategoryForm();
      Alert.alert('Cảnh báo', 'Đã thêm danh mục mới (chỉ cục bộ - vui lòng kiểm tra kết nối mạng)');
    }
  };

  const handleEditCategory = async () => {
    if (!validateCategoryForm()) return;

    try {
      const updatedCategory = {
        ...categoryFormData
      };

      console.log('Updating category:', selectedCategory.cateId, updatedCategory);
      
      // Use API service to update the category
      await apiService.updateCategory(selectedCategory.cateId, updatedCategory);
      
      // Reload data from API to get updated list
      await loadCategories();
      setIsEditCategoryModalVisible(false);
      setSelectedCategory(null);
      resetCategoryForm();
      showSuccess('Đã cập nhật danh mục thành công!');
    } catch (error) {
      console.error('Error updating category:', error);
      
      // Fallback: update local state if API fails
      setCategories(categories.map(cat => 
        cat.cateId === selectedCategory.cateId ? { ...cat, ...updatedCategory } : cat
      ));
      setIsEditCategoryModalVisible(false);
      setSelectedCategory(null);
      resetCategoryForm();
      Alert.alert('Cảnh báo', 'Đã cập nhật danh mục (chỉ cục bộ - vui lòng kiểm tra kết nối mạng)');
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
              
              // Use API service to delete the category
              await apiService.deleteCategory(category.cateId);
              
              console.log('Successfully deleted category via API');
              // Reload data from API to get updated list
              await loadCategories();
              showSuccess('Đã xóa danh mục thành công!');
              
            } catch (error) {
              console.error('Error deleting category:', error);
              
              // Check if it's a constraint error
              if (error.response && error.response.status === 409) {
                // Handle constraint violation error
                const errorData = error.response.data;
                Alert.alert(
                  'Không thể xóa',
                  errorData.message || 'Danh mục này đang được sử dụng và không thể xóa.',
                  [{ text: 'OK', style: 'default' }]
                );
              } else {
                // Fallback: remove from local state if API fails
                setCategories(categories.filter(cat => cat.cateId !== category.cateId));
                Alert.alert('Cảnh báo', 'Đã xóa danh mục (chỉ cục bộ - vui lòng kiểm tra kết nối mạng)');
              }
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
              Alert.alert('Kiểm tra', 'Nút gỡ lỗi đã được nhấn!');
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
        keyboardShouldPersistTaps="handled"
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
                  style={[styles.deleteButton, { minWidth: 40, minHeight: 40 }]}
                  onPress={() => {
                    console.log('Delete button touched!');
                    Alert.alert('Debug', 'Delete button was pressed!');
                    handleDeleteItem(item);
                  }}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={{ color: '#E74C3C', fontSize: 16, fontWeight: 'bold' }}>🗑️</Text>
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={[styles.successIcon, { backgroundColor: '#ff6b6b' }]}>
              <Text style={styles.successCheckmark}>⚠️</Text>
            </View>
            <Text style={styles.successTitle}>Xác Nhận Xóa</Text>
            <Text style={styles.successMessage}>
              {itemToDelete ? `Bạn có chắc chắn muốn xóa "${itemToDelete.foodName}"?` : ''}
            </Text>
            <View style={{ flexDirection: 'row', gap: 15 }}>
              <TouchableOpacity 
                style={[styles.successButton, { backgroundColor: '#6c757d' }]}
                onPress={() => {
                  console.log('User cancelled delete');
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
              >
                <Text style={styles.successButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.successButton, { backgroundColor: '#dc3545' }]}
                onPress={performDelete}
              >
                <Text style={styles.successButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success/Error Popup Modal */}
      <Modal
        visible={showSuccessPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessPopup(false)}
      >
        <View style={styles.successOverlay}>
          <View style={styles.successModal}>
            <View style={[styles.successIcon, { backgroundColor: isErrorMessage ? '#dc3545' : '#4CAF50' }]}>
              <Text style={styles.successCheckmark}>{isErrorMessage ? '❌' : '✓'}</Text>
            </View>
            <Text style={styles.successTitle}>{isErrorMessage ? 'Không thể xóa!' : 'Thành công!'}</Text>
            <Text style={styles.successMessage}>{successMessage}</Text>
            <TouchableOpacity 
              style={[styles.successButton, { backgroundColor: isErrorMessage ? '#dc3545' : '#FF6B35' }]}
              onPress={() => setShowSuccessPopup(false)}
            >
              <Text style={styles.successButtonText}>OK</Text>
            </TouchableOpacity>
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
  // Success popup styles
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 280,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successCheckmark: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});