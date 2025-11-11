import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';
import ScreenHeader from '../components/ScreenHeader';

// Helper function to get icon and color for ingredients
const getIngredientIcon = (ingredientName) => {
  const name = ingredientName?.toLowerCase() || '';
  
  // Thịt
  if (name.includes('thịt bò') || name.includes('bò')) {
    return { icon: 'cow', color: '#E74C3C', bgColor: '#FADBD8' };
  }
  if (name.includes('thịt gà') || name.includes('gà')) {
    return { icon: 'food-drumstick', color: '#F39C12', bgColor: '#FEF5E7' };
  }
  if (name.includes('thịt heo') || name.includes('heo') || name.includes('sườn')) {
    return { icon: 'pig', color: '#EC7063', bgColor: '#FADBD8' };
  }
  
  // Hải sản
  if (name.includes('cá')) {
    return { icon: 'fish', color: '#3498DB', bgColor: '#D6EAF8' };
  }
  if (name.includes('tôm')) {
    return { icon: 'shimmer', color: '#E67E22', bgColor: '#FDEBD0' };
  }
  if (name.includes('mực')) {
    return { icon: 'jellyfish', color: '#9B59B6', bgColor: '#EBDEF0' };
  }
  
  // Rau củ
  if (name.includes('rau') || name.includes('xà lách')) {
    return { icon: 'leaf', color: '#27AE60', bgColor: '#D5F4E6' };
  }
  if (name.includes('hành') || name.includes('tỏi')) {
    return { icon: 'onion', color: '#8E44AD', bgColor: '#E8DAEF' };
  }
  if (name.includes('cà')) {
    return { icon: 'fruit-cherries', color: '#C0392B', bgColor: '#F2D7D5' };
  }
  
  // Tinh bột
  if (name.includes('gạo') || name.includes('cơm')) {
    return { icon: 'rice', color: '#F4D03F', bgColor: '#FCF3CF' };
  }
  if (name.includes('bánh phở') || name.includes('phở')) {
    return { icon: 'noodles', color: '#D68910', bgColor: '#FDEBD0' };
  }
  if (name.includes('bún')) {
    return { icon: 'bowl-mix', color: '#CA6F1E', bgColor: '#FDEBD0' };
  }
  if (name.includes('mì') || name.includes('mỳ')) {
    return { icon: 'pasta', color: '#E59866', bgColor: '#FADBD8' };
  }
  
  // Gia vị
  if (name.includes('nước mắm') || name.includes('tương')) {
    return { icon: 'bottle-tonic', color: '#7D3C98', bgColor: '#E8DAEF' };
  }
  if (name.includes('muối')) {
    return { icon: 'shaker', color: '#95A5A6', bgColor: '#ECF0F1' };
  }
  if (name.includes('đường')) {
    return { icon: 'cube-outline', color: '#F8B739', bgColor: '#FEF9E7' };
  }
  if (name.includes('dầu') || name.includes('mỡ')) {
    return { icon: 'water', color: '#F39C12', bgColor: '#FEF5E7' };
  }
  
  // Đồ uống
  if (name.includes('cà phê')) {
    return { icon: 'coffee', color: '#6C3483', bgColor: '#E8DAEF' };
  }
  if (name.includes('sữa')) {
    return { icon: 'cup', color: '#3498DB', bgColor: '#D6EAF8' };
  }
  if (name.includes('nước')) {
    return { icon: 'cup-water', color: '#3498DB', bgColor: '#D6EAF8' };
  }
  
  // Default
  return { icon: 'food-apple', color: '#FF6B35', bgColor: '#FFF5F2' };
};

const RecipeManagerScreen = ({ navigation }) => {
  console.log('🎬 RecipeManagerScreen component mounted');
  console.log('📱 Navigation object:', navigation ? 'Present' : 'Missing');
  console.log('🔧 apiService available:', typeof apiService);
  
  const [foods, setFoods] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Recipe form state
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeDetails, setRecipeDetails] = useState([]);

  useEffect(() => {
    console.log('🎯 useEffect triggered - calling loadData');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading recipe manager data...');
      console.log('📡 Making API calls to:');
      console.log('  - GET /api/FoodInfo');
      console.log('  - GET /api/Ingredient');
      console.log('  - GET /api/Recipe');
      
      const [foodsRes, ingredientsRes, recipesRes] = await Promise.all([
        apiService.getAllFoodItems(),
        apiService.getAllIngredients(),
        apiService.getAllRecipes(),
      ]);

      console.log('✅ API Responses received:');
      console.log('📦 Foods response type:', typeof foodsRes, 'isArray:', Array.isArray(foodsRes));
      console.log('📦 Ingredients response type:', typeof ingredientsRes, 'isArray:', Array.isArray(ingredientsRes));
      console.log('📦 Recipes response type:', typeof recipesRes, 'isArray:', Array.isArray(recipesRes));
      
      // API functions already return the data directly, not wrapped in { data: ... }
      const foodsData = Array.isArray(foodsRes) ? foodsRes : (foodsRes?.data || []);
      const ingredientsData = Array.isArray(ingredientsRes) ? ingredientsRes : (ingredientsRes?.data || []);
      const recipesData = Array.isArray(recipesRes) ? recipesRes : (recipesRes?.data || []);

      console.log('📊 Processed data counts:');
      console.log('  🍽️  Foods:', foodsData.length);
      console.log('  🥬 Ingredients:', ingredientsData.length);
      
      // DEBUG: Log first ingredient to see structure
      if (ingredientsData.length > 0) {
        console.log('=== FIRST INGREDIENT DEBUG ===');
        console.log('Keys:', Object.keys(ingredientsData[0]));
        console.log('Full object:', JSON.stringify(ingredientsData[0], null, 2));
        console.log('ingreId:', ingredientsData[0].ingreId);
        console.log('IngreID:', ingredientsData[0].IngreID);
        console.log('ingredientId:', ingredientsData[0].ingredientId);
        console.log('=============================');
      }
      console.log('  📝 Recipes:', recipesData.length);
      
      // Debug recipe data structure
      if (recipesData.length > 0) {
        console.log('=== FIRST RECIPE DEBUG ===');
        console.log('First recipe:', JSON.stringify(recipesData[0], null, 2));
        if (recipesData[0].recipeDetails && recipesData[0].recipeDetails.length > 0) {
          console.log('First recipe detail keys:', Object.keys(recipesData[0].recipeDetails[0]));
        }
        console.log('========================');
      }
      
      // Find Cơm Gà Xối Mỡ recipe
      const comGaRecipe = recipesData.find(r => 
        r.foodName?.toLowerCase().includes('cơm gà') || 
        r.foodId === 'FOOD003' ||
        r.recipeId === 'REC003'
      );
      
      if (comGaRecipe) {
        console.log('=== CƠM GÀ RECIPE FOUND ===');
        console.log('Recipe:', JSON.stringify(comGaRecipe, null, 2));
        console.log('==========================');
      } else {
        console.log('⚠️ CƠM GÀ RECIPE NOT FOUND in recipes array');
      }
      
      // Debug first food item to see field names
      if (foodsData.length > 0) {
        console.log('Sample food item:', JSON.stringify(foodsData[0], null, 2));
        console.log('Food image field:', foodsData[0].foodImage || foodsData[0].image || 'NO IMAGE FIELD');
      }

      // Log first items for debugging
      if (foodsData.length > 0) {
        console.log('🔍 First food item keys:', Object.keys(foodsData[0]));
        console.log('🔍 First food sample:', {
          foodId: foodsData[0].foodId,
          foodName: foodsData[0].foodName,
          price: foodsData[0].price,
          hasImage: !!(foodsData[0].foodImage || foodsData[0].image)
        });
      }
      
      setFoods(foodsData);
      setIngredients(ingredientsData);
      setRecipes(recipesData);
      
      console.log('✅ Data loaded successfully!');
      console.log('📈 State updated - Foods:', foodsData.length, 'Ingredients:', ingredientsData.length, 'Recipes:', recipesData.length);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      Alert.alert(
        'Lỗi tải dữ liệu', 
        'Không thể tải dữ liệu từ server.\n\n' + 
        'Chi tiết: ' + error.message + '\n\n' +
        'Vui lòng kiểm tra:\n' +
        '1. Kết nối internet\n' +
        '2. Server đang chạy\n' +
        '3. API endpoint đúng',
        [
          { text: 'Thử lại', onPress: () => loadData() },
          { text: 'Đóng', style: 'cancel' }
        ]
      );
      
      // Set empty arrays to prevent crashes
      setFoods([]);
      setIngredients([]);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const openFoodModal = (food) => {
    setSelectedFood(food);
    
    // Find existing recipe for this food
    const existingRecipe = recipes.find(r => r.foodId === food.foodId);
    
    console.log('=== Opening Food Modal ===');
    console.log('Food:', food.foodName, '(ID:', food.foodId + ')');
    console.log('Total recipes in system:', recipes.length);
    console.log('Existing recipe found:', existingRecipe ? 'YES' : 'NO');
    
    if (existingRecipe) {
      console.log('Recipe ID:', existingRecipe.recipeId);
      console.log('Recipe details count:', existingRecipe.recipeDetails?.length || 0);
      console.log('Recipe details RAW:', JSON.stringify(existingRecipe.recipeDetails, null, 2));
      
      // Check all possible field names in first detail
      if (existingRecipe.recipeDetails && existingRecipe.recipeDetails.length > 0) {
        const firstDetail = existingRecipe.recipeDetails[0];
        console.log('=== DEBUGGING FIELD NAMES ===');
        console.log('All keys in first detail:', Object.keys(firstDetail));
        console.log('ingredientId:', firstDetail.ingredientId);
        console.log('ingredientName:', firstDetail.ingredientName);
        console.log('ingreId:', firstDetail.ingreId);
        console.log('ingreName:', firstDetail.ingreName);
        console.log('quantity:', firstDetail.quantity);
        console.log('unitMeasurement:', firstDetail.unitMeasurement);
        console.log('============================');
      }
      
      // View mode - show existing recipe
      setSelectedRecipe(existingRecipe);
      setIsEditing(false);
      setRecipeDescription(existingRecipe.recipeDescription || '');
      
      // Map with fallback field names
      const mappedDetails = existingRecipe.recipeDetails?.map((rd, index) => {
        console.log(`=== Detail #${index + 1} RAW ===`);
        console.log('All keys:', Object.keys(rd));
        console.log('Raw object:', JSON.stringify(rd, null, 2));
        console.log('quantity:', rd.quantity, 'Type:', typeof rd.quantity);
        console.log('unitMeasurement:', rd.unitMeasurement);
        console.log('Quantity (capital Q):', rd.Quantity);
        console.log('UnitMeasurement (capital):', rd.UnitMeasurement);
        
        const detail = {
          ingredientId: rd.ingredientId || rd.ingreId || rd.IngredientId || rd.IngreId || '',
          ingredientName: rd.ingredientName || rd.ingreName || rd.IngredientName || rd.IngreName || '',
          quantity: (rd.quantity || rd.Quantity || '')?.toString() || '',
          unitMeasurement: rd.unitMeasurement || rd.UnitMeasurement || '',
        };
        console.log('Mapped detail:', detail);
        console.log('==================');
        return detail;
      }) || [];
      
      console.log('Final mapped details:', mappedDetails);
      setRecipeDetails(mappedDetails);
    } else {
      console.log('No recipe found - entering CREATE mode');
      
      // Create mode - start with empty form
      setSelectedRecipe(null);
      setIsEditing(true);
      setRecipeDescription('');
      setRecipeDetails([]);
    }
    
    setModalVisible(true);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const addIngredientRow = () => {
    setRecipeDetails([...recipeDetails, {
      ingredientId: '',
      ingredientName: '',
      quantity: '',
      unitMeasurement: '',
    }]);
  };

  // Helper function to convert ingredient ID to proper format
  const formatIngreId = (id) => {
    if (!id) return '';
    
    console.log('🔧 formatIngreId input:', id, 'type:', typeof id);
    
    // Database IngreID is char(10) - MUST be exactly 10 characters!
    // Pad with spaces to the right (like SQL char type does)
    const idStr = String(id);
    const formatted = idStr.padEnd(10, ' ');
    
    console.log('🔧 formatIngreId output:', `"${formatted}"`, 'length:', formatted.length);
    return formatted;
  };

  const updateIngredientRow = (index, field, value) => {
    const updated = [...recipeDetails];
    
    if (field === 'ingredientId') {
      // Tìm ingredient - support cả ingreId và ingredientId
      const ingredient = ingredients.find(i => 
        String(i.ingreId) === String(value) || 
        String(i.ingredientId) === String(value)
      );
      console.log('🔍 Selected ingredient:', value);
      console.log('   Found ingredient:', ingredient);
      
      updated[index].ingredientId = value; // Store original value (số hoặc string)
      updated[index].ingredientName = ingredient?.ingreName || ingredient?.ingredientName || '';
      // KHÔNG auto-fill unitMeasurement - để user tự chọn
      // Vì đơn vị trong recipe có thể khác với đơn vị stock của ingredient
      // VD: Stock tính kg, nhưng recipe có thể dùng g
      if (!updated[index].unitMeasurement) {
        updated[index].unitMeasurement = ''; // Để trống cho user nhập
      }
      
      console.log('   Updated row:', updated[index]);
    } else {
      updated[index][field] = value;
      console.log(`   Updated field ${field}:`, value);
    }
    
    console.log('📝 Recipe details after update:', updated);
    setRecipeDetails(updated);
  };

  const removeIngredientRow = (index) => {
    const updated = recipeDetails.filter((_, i) => i !== index);
    setRecipeDetails(updated);
  };

  const saveRecipe = async () => {
    if (!selectedFood) return;
    
    // Validation
    if (!recipeDescription.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả công thức');
      return;
    }
    
    console.log('🔍 DEBUG - All recipe details:', recipeDetails);
    
    const validDetails = recipeDetails.filter(rd => {
      const hasIngredient = rd.ingredientId;
      const hasQuantity = rd.quantity && parseFloat(rd.quantity) > 0;
      const hasUnit = rd.unitMeasurement && rd.unitMeasurement.trim() !== '';
      const isValid = hasIngredient && hasQuantity && hasUnit;
      
      console.log('🔍 Checking detail:', {
        ingredientId: rd.ingredientId,
        ingredientName: rd.ingredientName,
        quantity: rd.quantity,
        unit: rd.unitMeasurement,
        hasIngredient,
        hasQuantity,
        hasUnit,
        isValid
      });
      return isValid;
    });
    
    console.log('✅ Valid details count:', validDetails.length);
    console.log('✅ Valid details:', validDetails);
    
    if (validDetails.length === 0) {
      const missingInfo = [];
      recipeDetails.forEach((rd, idx) => {
        if (!rd.ingredientId) missingInfo.push(`Dòng ${idx + 1}: Chưa chọn nguyên liệu`);
        else if (!rd.quantity || parseFloat(rd.quantity) <= 0) missingInfo.push(`Dòng ${idx + 1}: Chưa nhập số lượng`);
        else if (!rd.unitMeasurement || rd.unitMeasurement.trim() === '') missingInfo.push(`Dòng ${idx + 1}: Chưa nhập đơn vị`);
      });
      
      Alert.alert(
        'Lỗi', 
        `Vui lòng thêm ít nhất một nguyên liệu hợp lệ.\n\n${missingInfo.join('\n')}\n\nĐảm bảo mỗi dòng có:\n✓ Nguyên liệu đã chọn\n✓ Số lượng > 0\n✓ Đơn vị (g, kg, ml, lít...)`
      );
      return;
    }

    try {
      setLoading(true);
      console.log('=== SAVE RECIPE STARTED ===');
      console.log('Selected Food:', selectedFood.foodName, '(ID:', selectedFood.foodId + ')');
      console.log('Recipe Description:', recipeDescription);
      console.log('Valid Details Count:', validDetails.length);
      
      const existingRecipe = recipes.find(r => r.foodId === selectedFood.foodId);
      
      if (existingRecipe) {
        // Update existing recipe
        console.log('=== UPDATING RECIPE ===');
        console.log('Recipe ID:', existingRecipe.recipeId);
        console.log('Food ID:', selectedFood.foodId);
        console.log('Description:', recipeDescription);
        
        await apiService.updateRecipe(existingRecipe.recipeId, {
          recipeId: existingRecipe.recipeId,
          foodId: selectedFood.foodId,
          recipeDescription: recipeDescription,
        });
        
        console.log('Recipe updated successfully');
        
        // Get existing recipe details and delete them (with error handling)
        try {
          const existingDetails = await apiService.getRecipeDetails(existingRecipe.recipeId);
          console.log('Existing details to delete:', existingDetails.length);
          
          // Delete all existing recipe details (ignore errors)
          for (const detail of existingDetails) {
            try {
              const ingredientId = detail.ingredientId || detail.ingreId;
              console.log('Deleting detail - RecipeId:', existingRecipe.recipeId, 'IngredientId:', ingredientId);
              await apiService.deleteRecipeDetail(existingRecipe.recipeId, ingredientId);
            } catch (deleteError) {
              console.warn('Failed to delete detail (continuing):', deleteError.message);
              // Continue even if delete fails
            }
          }
        } catch (getError) {
          console.warn('Failed to get existing details (continuing):', getError.message);
          // Continue even if we can't get existing details
        }
        
        // Create new recipe details
        console.log('Creating new details, count:', validDetails.length);
        let successCount = 0;
        let failCount = 0;
        
        for (const detail of validDetails) {
          try {
            // Convert ingredient ID to proper format (1 -> I001)
            const formattedIngreId = formatIngreId(detail.ingredientId);
            
            const ingredientObj = ingredients.find(i => 
              String(i.ingreId) === String(detail.ingredientId) ||
              String(i.ingredientId) === String(detail.ingredientId)
            );
            
            const detailData = {
              recipeId: existingRecipe.recipeId,
              ingreId: formattedIngreId,
              quantity: parseInt(detail.quantity, 10), // Must be integer
              unitMeasurement: detail.unitMeasurement || '',
              ingre: ingredientObj ? {
                ingreId: formattedIngreId,
                ingreName: ingredientObj.ingreName || ingredientObj.ingredientName || '',
                stock: ingredientObj.stock || 0,
                unitMeasurement: ingredientObj.unitMeasurement || ingredientObj.ingreUnit || ''
              } : {
                ingreId: formattedIngreId,
                ingreName: detail.ingredientName || '',
                stock: 0,
                unitMeasurement: ''
              },
              recipe: {
                recipeId: existingRecipe.recipeId,
                foodId: selectedFood.foodId,
                recipeDescription: recipeDescription
              }
            };
            console.log('📤 Creating detail:', detailData);
            console.log('   Original ID:', detail.ingredientId, '→ Formatted:', formattedIngreId);
            
            await apiService.createRecipeDetail(detailData);
            successCount++;
          } catch (createError) {
            console.error('❌ Failed to create detail:', createError);
            console.error('   Error message:', createError.message);
            console.error('   Response:', createError.response?.data);
            failCount++;
          }
        }
        
        console.log(`Created ${successCount} details, failed ${failCount}`);
        
        if (successCount > 0) {
          Alert.alert('Thành công', `Đã cập nhật công thức với ${successCount} nguyên liệu`);
        } else {
          Alert.alert('Lỗi', 'Không thể tạo chi tiết công thức');
          return;
        }
      } else {
        // Create new recipe
        console.log('=== CREATING NEW RECIPE ===');
        const newRecipeId = `RC${Date.now().toString().slice(-8)}`;
        console.log('New Recipe ID:', newRecipeId);
        
        await apiService.createRecipe({
          recipeId: newRecipeId,
          foodId: selectedFood.foodId,
          recipeDescription: recipeDescription,
        });
        
        console.log('Recipe created, now creating details...');
        console.log('📋 Valid details to create:', validDetails.length);
        
        // Create recipe details
        console.log('Creating details for new recipe...');
        let successCount = 0;
        let failCount = 0;
        const errors = [];
        
        for (let i = 0; i < validDetails.length; i++) {
          const detail = validDetails[i];
          try {
            console.log(`\n📤 Creating detail ${i + 1}/${validDetails.length}:`);
            console.log('   Raw detail:', detail);
            
            // Convert ingredient ID to proper format (1 -> I001)
            const formattedIngreId = formatIngreId(detail.ingredientId);
            
            // Find the ingredient object for full data
            const ingredientObj = ingredients.find(i => 
              String(i.ingreId) === String(detail.ingredientId) ||
              String(i.ingredientId) === String(detail.ingredientId)
            );
            
            const detailData = {
              recipeId: newRecipeId,
              ingreId: formattedIngreId,
              quantity: parseInt(detail.quantity, 10), // Must be integer, not float
              unitMeasurement: detail.unitMeasurement || '',
              // API Model validation requires full nested objects
              ingre: ingredientObj ? {
                ingreId: formattedIngreId,
                ingreName: ingredientObj.ingreName || ingredientObj.ingredientName || '',
                stock: ingredientObj.stock || 0,
                unitMeasurement: ingredientObj.unitMeasurement || ingredientObj.ingreUnit || ''
              } : {
                ingreId: formattedIngreId,
                ingreName: detail.ingredientName || '',
                stock: 0,
                unitMeasurement: ''
              },
              recipe: {
                recipeId: newRecipeId,
                foodId: selectedFood.foodId,
                recipeDescription: recipeDescription
              }
            };
            console.log('   📤 Sending to API:', JSON.stringify(detailData, null, 2));
            console.log('   📤 Data types:', {
              recipeId: typeof detailData.recipeId,
              ingreId: typeof detailData.ingreId,
              quantity: typeof detailData.quantity,
              unitMeasurement: typeof detailData.unitMeasurement
            });
            console.log('   Ingredient Name:', detail.ingredientName);
            console.log('   Original ID:', detail.ingredientId, '→ Formatted:', formattedIngreId);
            console.log('   Quantity:', detail.quantity, detail.unitMeasurement);
            
            const result = await apiService.createRecipeDetail(detailData);
            successCount++;
            console.log('   ✅ Detail created successfully!');
            console.log('   Response:', result);
          } catch (createError) {
            failCount++;
            const errorMsg = createError.response?.data?.message || createError.message;
            errors.push(`${detail.ingredientName}: ${errorMsg}`);
            
            console.error(`   ❌ Failed to create detail ${i + 1}:`);
            console.error('   Detail data:', detail);
            console.error('   Error message:', createError.message);
            console.error('   Error response:', createError.response?.data);
            console.error('   Error status:', createError.response?.status);
          }
        }
        
        console.log(`\n📊 RESULT: Created ${successCount}/${validDetails.length} details (${failCount} failed)`);
        
        if (successCount > 0) {
          const message = failCount > 0 
            ? `Đã tạo công thức với ${successCount}/${validDetails.length} nguyên liệu.\n\nLỗi:\n${errors.join('\n')}`
            : `Đã tạo công thức mới với ${successCount} nguyên liệu`;
            
          Alert.alert('Thành công', message, [
            { text: 'OK', onPress: () => console.log('Recipe created successfully') }
          ]);
        } else {
          const errorDetails = errors.length > 0 
            ? `\n\nChi tiết lỗi:\n${errors.join('\n')}`
            : '';
          Alert.alert(
            'Lỗi', 
            `Đã tạo công thức nhưng KHÔNG có nguyên liệu nào được thêm!${errorDetails}`,
            [{ text: 'OK' }]
          );
        }
      }
      
      console.log('=== SAVE COMPLETE - Reloading data ===');
      setIsEditing(false);
      setModalVisible(false);
      await loadData();
      console.log('=== Data reloaded ===');
    } catch (error) {
      console.error('=== ERROR SAVING RECIPE ===');
      console.error('Error:', error);
      console.error('Message:', error.message);
      console.error('Response:', error.response?.data);
      Alert.alert('Lỗi', 'Không thể lưu công thức: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const deleteRecipe = async () => {
    if (!selectedFood) return;
    
    const existingRecipe = recipes.find(r => r.foodId === selectedFood.foodId);
    if (!existingRecipe) {
      Alert.alert('Lỗi', 'Không tìm thấy công thức để xóa');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa công thức cho món "${selectedFood.foodName}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('=== DELETING RECIPE ===');
              console.log('Recipe ID:', existingRecipe.recipeId);
              console.log('Food:', selectedFood.foodName);
              
              // Delete recipe details first
              try {
                const existingDetails = await apiService.getRecipeDetails(existingRecipe.recipeId);
                console.log('Deleting', existingDetails.length, 'recipe details...');
                
                for (const detail of existingDetails) {
                  try {
                    const ingredientId = detail.ingredientId || detail.ingreId;
                    await apiService.deleteRecipeDetail(existingRecipe.recipeId, ingredientId);
                    console.log('✅ Deleted detail:', ingredientId);
                  } catch (deleteError) {
                    console.warn('⚠️ Failed to delete detail (continuing):', deleteError.message);
                  }
                }
              } catch (getError) {
                console.warn('⚠️ Failed to get recipe details (continuing):', getError.message);
              }
              
              // Delete the recipe
              await apiService.deleteRecipe(existingRecipe.recipeId);
              console.log('✅ Recipe deleted successfully');
              
              Alert.alert('Thành công', 'Đã xóa công thức', [
                { text: 'OK' }
              ]);
              
              setModalVisible(false);
              await loadData();
            } catch (error) {
              console.error('❌ Error deleting recipe:', error);
              console.error('Message:', error.message);
              console.error('Response:', error.response?.data);
              Alert.alert('Lỗi', 'Không thể xóa công thức: ' + (error.message || 'Lỗi không xác định'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredFoods = foods.filter(food =>
    food.foodName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFoodItem = ({ item }) => {
    const hasRecipe = recipes.some(r => r.foodId === item.foodId);
    const imageUrl = item.foodImage || item.image; // Support both field names
    
    return (
      <TouchableOpacity
        style={styles.foodCard}
        onPress={() => openFoodModal(item)}
        activeOpacity={0.7}
      >
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: hasRecipe ? '#10B981' : '#F59E0B' }
        ]}>
          <MaterialCommunityIcons 
            name={hasRecipe ? 'check-circle' : 'alert-circle'} 
            size={16} 
            color="white" 
          />
          <Text style={styles.statusBadgeText}>
            {hasRecipe ? 'Có công thức' : 'Chưa có'}
          </Text>
        </View>

        <View style={styles.foodImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.foodImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="food" size={40} color="#BDC3C7" />
            </View>
          )}
        </View>
        
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.foodName}</Text>
          <Text style={styles.foodCategory}>{item.categoryName || 'Chưa phân loại'}</Text>
          <Text style={styles.foodPrice}>
            {item.price?.toLocaleString('vi-VN')} ₫
          </Text>
          
          <View style={styles.recipeStatusContainer}>
            {hasRecipe ? (
              <>
                <MaterialCommunityIcons name="check-circle" size={16} color="#27AE60" />
                <Text style={styles.hasRecipeText}>Đã có công thức</Text>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="alert-circle" size={16} color="#E74C3C" />
                <Text style={styles.noRecipeText}>Chưa có công thức</Text>
              </>
            )}
          </View>
        </View>
        
        <MaterialCommunityIcons name="chevron-right" size={24} color="#BDC3C7" />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Quản lý công thức" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          <Text style={styles.loadingSubtext}>
            Vui lòng đợi trong giây lát
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Quản lý công thức" navigation={navigation} />
      
      {/* Debug Info */}
      {foods.length === 0 && !loading && (
        <View style={styles.debugContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#E74C3C" />
          <Text style={styles.debugTitle}>Không có dữ liệu</Text>
          <Text style={styles.debugText}>
            Foods: {foods.length}{'\n'}
            Ingredients: {ingredients.length}{'\n'}
            Recipes: {recipes.length}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadData}
          >
            <MaterialCommunityIcons name="reload" size={20} color="white" />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#95A5A6" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#95A5A6"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#95A5A6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Tổng: {filteredFoods.length} món | Có công thức: {recipes.length}
        </Text>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              'Debug Info',
              `Foods: ${foods.length}\nIngredients: ${ingredients.length}\nRecipes: ${recipes.length}\n\nRecipe IDs:\n${recipes.map(r => `${r.recipeId} → ${r.foodName}`).join('\n') || 'Không có'}`,
              [{ text: 'OK' }]
            );
          }} 
          style={styles.refreshButton}
        >
          <MaterialCommunityIcons name="bug" size={20} color="#3498DB" />
        </TouchableOpacity>
        <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
          <MaterialCommunityIcons name="refresh" size={20} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Food List */}
      <FlatList
        data={filteredFoods}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.foodId}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>Không tìm thấy món ăn</Text>
          </View>
        }
      />

      {/* Recipe Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <MaterialCommunityIcons name="food-variant" size={24} color="#FF6B35" />
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {selectedFood?.foodName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#7F8C8D" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Food Image */}
              {(selectedFood?.foodImage || selectedFood?.image) && (
                <Image
                  source={{ uri: selectedFood.foodImage || selectedFood.image }}
                  style={styles.modalFoodImage}
                  resizeMode="cover"
                />
              )}

              {/* Recipe Description */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.formLabel}>Mô tả công thức</Text>
                  {selectedRecipe && !isEditing && (
                    <TouchableOpacity
                      style={styles.editIconButton}
                      onPress={toggleEditMode}
                    >
                      <MaterialCommunityIcons name="pencil" size={20} color="#FF6B35" />
                    </TouchableOpacity>
                  )}
                </View>
                {isEditing ? (
                  <TextInput
                    style={styles.textArea}
                    placeholder="Nhập mô tả cách chế biến món ăn..."
                    value={recipeDescription}
                    onChangeText={setRecipeDescription}
                    multiline
                    numberOfLines={4}
                    placeholderTextColor="#95A5A6"
                  />
                ) : (
                  <View style={styles.descriptionView}>
                    <Text style={styles.descriptionText}>
                      {recipeDescription || 'Chưa có mô tả công thức'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Ingredients */}
              <View style={styles.formSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.formLabel}>Nguyên liệu</Text>
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={addIngredientRow}
                    >
                      <MaterialCommunityIcons name="plus" size={20} color="white" />
                      <Text style={styles.addButtonText}>Thêm</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* View Mode - Display ingredients beautifully */}
                {!isEditing && recipeDetails.length > 0 && (
                  <View style={styles.ingredientsListView}>
                    {recipeDetails.map((detail, index) => {
                      const { icon, color, bgColor } = getIngredientIcon(detail.ingredientName);
                      const hasData = detail.ingredientName && detail.quantity;
                      
                      return (
                        <View key={index} style={[
                          styles.ingredientViewCard,
                          !hasData && styles.ingredientViewCardMissing
                        ]}>
                          <View style={[styles.ingredientIconCircle, { backgroundColor: bgColor }]}>
                            <MaterialCommunityIcons 
                              name={hasData ? icon : 'alert-circle-outline'} 
                              size={24} 
                              color={hasData ? color : '#E74C3C'} 
                            />
                          </View>
                          <View style={styles.ingredientViewInfo}>
                            <Text style={[
                              styles.ingredientViewName,
                              !hasData && styles.ingredientViewNameMissing
                            ]}>
                              {detail.ingredientName || 'Chưa có tên nguyên liệu'}
                            </Text>
                            {hasData ? (
                              <View style={styles.quantityBadge}>
                                <MaterialCommunityIcons name="scale" size={14} color="#FF6B35" />
                                <Text style={styles.ingredientViewQuantity}>
                                  {detail.quantity} {detail.unitMeasurement}
                                </Text>
                              </View>
                            ) : (
                              <View style={styles.missingDataBadge}>
                                <MaterialCommunityIcons name="alert" size={14} color="#E74C3C" />
                                <Text style={styles.missingDataText}>Chưa có thông tin</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Show message when no recipe in view mode */}
                {!isEditing && recipeDetails.length === 0 && (
                  <View style={styles.emptyRecipeContainer}>
                    <MaterialCommunityIcons name="chef-hat" size={48} color="#BDC3C7" />
                    <Text style={styles.emptyRecipeText}>Chưa có công thức cho món này</Text>
                    <TouchableOpacity 
                      style={styles.createRecipeButton}
                      onPress={toggleEditMode}
                    >
                      <MaterialCommunityIcons name="plus-circle" size={20} color="white" />
                      <Text style={styles.createRecipeButtonText}>Tạo Công Thức</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Edit Mode - Show form controls */}
                {isEditing && recipeDetails.map((detail, index) => (
                  <View key={index} style={styles.ingredientRow}>
                    <View style={styles.ingredientRowContent}>
                      {/* Ingredient Selector */}
                      <View style={styles.ingredientSelector}>
                        <Text style={styles.ingredientLabel}>Nguyên liệu:</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.ingredientScrollView}
                        >
                          {ingredients.map((ingredient, idx) => {
                            // Get ingredient ID - support both ingreId and ingredientId
                            const ingId = ingredient.ingreId || ingredient.ingredientId;
                            const ingName = ingredient.ingreName || ingredient.ingredientName;
                            
                            // DEBUG: Log first ingredient
                            if (idx === 0) {
                              console.log('🔍 Rendering first ingredient:');
                              console.log('   Keys:', Object.keys(ingredient));
                              console.log('   ID:', ingId);
                              console.log('   Name:', ingName);
                              console.log('   Full:', ingredient);
                            }
                            
                            return (
                            <TouchableOpacity
                              key={ingId || idx}
                              style={[
                                styles.ingredientChip,
                                detail.ingredientId === ingId &&
                                  styles.ingredientChipSelected,
                              ]}
                              onPress={() => {
                                console.log('👆 Ingredient clicked:', ingName, 'ID:', ingId);
                                updateIngredientRow(index, 'ingredientId', ingId);
                              }}
                            >
                              <Text
                                style={[
                                  styles.ingredientChipText,
                                  detail.ingredientId === ingId &&
                                    styles.ingredientChipTextSelected,
                                ]}
                              >
                                {ingName}
                              </Text>
                            </TouchableOpacity>
                          );
                          })}
                        </ScrollView>
                      </View>

                      {/* Quantity and Unit */}
                      <View style={styles.quantityRow}>
                        <TextInput
                          style={styles.quantityInput}
                          placeholder="Số lượng"
                          value={detail.quantity}
                          onChangeText={(text) =>
                            updateIngredientRow(index, 'quantity', text)
                          }
                          keyboardType="numeric"
                          placeholderTextColor="#95A5A6"
                        />
                        <TextInput
                          style={styles.unitInput}
                          placeholder="g, kg, ml, lít..."
                          value={detail.unitMeasurement}
                          onChangeText={(text) =>
                            updateIngredientRow(index, 'unitMeasurement', text)
                          }
                          placeholderTextColor="#95A5A6"
                        />
                      </View>
                    </View>

                    {/* Remove Button */}
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeIngredientRow(index)}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                ))}

                {recipeDetails.length === 0 && (
                  <View style={styles.emptyIngredients}>
                    <MaterialCommunityIcons name="food-off" size={32} color="#BDC3C7" />
                    <Text style={styles.emptyIngredientsText}>
                      Chưa có nguyên liệu nào
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              {/* View Mode Buttons */}
              {!isEditing && selectedRecipe && (
                <>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={deleteRecipe}
                  >
                    <MaterialCommunityIcons name="delete" size={20} color="white" />
                    <Text style={styles.deleteButtonText}>Xóa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Đóng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={toggleEditMode}
                  >
                    <MaterialCommunityIcons name="pencil" size={20} color="white" />
                    <Text style={styles.editButtonText}>Sửa</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {/* Edit Mode Buttons */}
              {isEditing && (
                <>
                  {selectedRecipe && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={deleteRecipe}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="white" />
                      <Text style={styles.deleteButtonText}>Xóa</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      if (selectedRecipe) {
                        toggleEditMode(); // Cancel editing, go back to view
                      } else {
                        setModalVisible(false); // Close modal if creating new
                      }
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveRecipe}
                  >
                    <MaterialCommunityIcons name="content-save" size={20} color="white" />
                    <Text style={styles.saveButtonText}>Lưu</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {/* Create Mode - No recipe exists */}
              {!selectedRecipe && !isEditing && (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Đóng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color="white" />
                    <Text style={styles.createButtonText}>Tạo công thức</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#95A5A6',
  },
  debugContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E74C3C',
    marginTop: 16,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    marginLeft: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  refreshButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  foodImageContainer: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#ECF0F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  foodPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 6,
  },
  recipeStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hasRecipeText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
    marginLeft: 4,
  },
  noRecipeText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#95A5A6',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  modalBody: {
    maxHeight: '70%',
  },
  modalFoodImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#ECF0F1',
  },
  formSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  ingredientRowContent: {
    flex: 1,
  },
  ingredientSelector: {
    marginBottom: 8,
  },
  ingredientLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  ingredientScrollView: {
    maxHeight: 40,
  },
  ingredientChip: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  ingredientChipSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  ingredientChipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  ingredientChipTextSelected: {
    color: 'white',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityInput: {
    flex: 2,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  unitInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  removeButton: {
    justifyContent: 'center',
    paddingLeft: 8,
  },
  emptyIngredients: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIngredientsText: {
    fontSize: 14,
    color: '#95A5A6',
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    gap: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 'auto',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  cancelButton: {
    backgroundColor: '#ECF0F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  editIconButton: {
    padding: 4,
  },
  descriptionView: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  descriptionText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
  },
  ingredientsListView: {
    marginTop: 8,
  },
  ingredientViewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  ingredientIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ingredientViewInfo: {
    flex: 1,
  },
  ingredientViewName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  quantityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFE0D0',
  },
  ingredientViewQuantity: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 4,
  },
  ingredientViewCardMissing: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFDDDD',
    borderWidth: 1,
  },
  ingredientViewNameMissing: {
    color: '#E74C3C',
    fontStyle: 'italic',
  },
  missingDataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FFCCCC',
  },
  missingDataText: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: '600',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  emptyRecipeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyRecipeText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  createRecipeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createRecipeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default RecipeManagerScreen;
