import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { apiService } from '../services/apiService';

const { width } = Dimensions.get('window');

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userToken, userData } = useContext(AuthContext);
  const { addToCart } = useCart();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadFavorites();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFavorites();
      // Normalize API data to a consistent shape used by the UI
      const normalized = (response || []).map((f) => ({
        favoriteId: (f.favoriteId ?? f.userFavoriteId ?? '').toString().trim(),
        foodId: (f.foodId ?? f.foodID ?? '').toString().trim(),
        foodName: (f.foodName || f.food?.foodName || 'Tên món ăn').toString().trim(),
        foodImage: f.foodImage || f.food?.foodImage || null,
        unitPrice: Number(f.unitPrice ?? f.food?.unitPrice ?? 0),
        description: f.description || f.food?.description || '',
        createdTime: f.createdTime || f.createdAt || null,
        raw: f,
      }));
      setFavorites(normalized);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách món yêu thích. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  const removeFavorite = async (foodId, foodName) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có muốn xóa "${foodName}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const trimmedId = (foodId || '').toString().trim();
              await apiService.removeFavorite(trimmedId);
              setFavorites((prev) => prev.filter(item => (item.foodId || '').toString().trim() !== trimmedId));
              Alert.alert('Thành công', 'Đã xóa món ăn khỏi danh sách yêu thích');
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Lỗi', 'Không thể xóa món ăn. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  const viewFoodDetail = (food) => {
    // Navigate to MenuScreen instead since OrderDetailScreen doesn't exist
    Alert.alert(
      'Chi tiết món ăn',
      `${food.foodName}\n\nGiá: ${formatPrice(food.unitPrice)}\n\nMô tả: ${food.description || 'Không có mô tả'}`,
      [
        { text: 'Đóng', style: 'cancel' },
        { 
          text: 'Xem Menu', 
          onPress: () => navigation.navigate('MenuScreen')
        }
      ]
    );
  };

  const handleAddToCart = async (food) => {
    try {
      const foodName = food.foodName;
      
      // Directly add to cart using CartContext
      addToCart({
        id: food.foodId,
        name: foodName,
        foodName: foodName,
        unitPrice: food.unitPrice,
        price: food.unitPrice,
        foodImage: food.foodImage,
        imageUrl: food.foodImage,
        description: food.description,
        categoryId: food.categoryId || 'unknown'
      });
      
      Alert.alert('Thành công', `Đã thêm "${foodName}" vào giỏ hàng!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Lỗi', 'Không thể thêm món ăn vào giỏ hàng.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderFavoriteItem = ({ item, index }) => {
    const name = item.foodName || item.raw?.food?.foodName || 'Tên món ăn';
    const desc = item.description || item.raw?.food?.description || 'Không có mô tả';
    const imageUrl = item.foodImage || item.raw?.food?.foodImage || null;
    const price = item.unitPrice ?? 0;
    const itemAnim = new Animated.Value(0);
    
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={[
          styles.favoriteCard,
          {
            opacity: itemAnim,
            transform: [{
              translateY: itemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => viewFoodDetail(item)}
          activeOpacity={0.7}
        >
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.foodImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.foodImage, styles.placeholderImage]}>
                <Ionicons name="restaurant" size={40} color="#ccc" />
                <Text style={styles.placeholderText}>Không có ảnh</Text>
              </View>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageOverlay}
            />
            <View style={styles.favoriteDate}>
              <Text style={styles.dateText}>
                {formatDate(item.createdTime)}
              </Text>
            </View>
          </View>

          <View style={styles.foodInfo}>
            <Text style={styles.foodName} numberOfLines={2}>
              {name}
            </Text>
            
            <Text style={styles.foodDescription} numberOfLines={2}>
              {desc}
            </Text>

            <View style={styles.priceContainer}>
              <Text style={styles.foodPrice}>
                {formatPrice(price)}
              </Text>
              <View style={styles.favoriteIcon}>
                <Ionicons name="heart" size={16} color="#ff6b6b" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cartButton]}
            onPress={() => handleAddToCart({
              foodId: item.foodId,
              foodName: name,
              unitPrice: price,
              description: desc,
              foodImage: imageUrl,
            })}
            activeOpacity={0.7}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.buttonText}>Thêm vào giỏ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={() => removeFavorite(item.foodId, name)}
            activeOpacity={0.7}
          >
            <Ionicons name="heart-dislike" size={20} color="#fff" />
            <Text style={styles.buttonText}>Bỏ yêu thích</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Ionicons name="heart-outline" size={80} color="#ddd" />
      <Text style={styles.emptyTitle}>Chưa có món yêu thích</Text>
      <Text style={styles.emptySubtitle}>
        Hãy khám phá menu và thêm những món ăn bạn yêu thích!
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('MenuScreen')}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#ff6b6b', '#ff8e8e']}
          style={styles.browseButtonGradient}
        >
          <Ionicons name="restaurant" size={20} color="#fff" />
          <Text style={styles.browseButtonText}>Khám phá Menu</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#ff6b6b', '#ff8e8e']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Món Yêu Thích</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Món yêu thích</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Đang tải danh sách yêu thích...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => (item.favoriteId || item.foodId || '').toString().trim()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ff6b6b']}
            tintColor="#ff6b6b"
          />
        }
        ListEmptyComponent={renderEmptyState}
        numColumns={2}
        columnWrapperStyle={favorites.length > 0 ? styles.row : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    width: (width - 45) / 2,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  favoriteDate: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  favoriteIcon: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cartButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  browseButton: {
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  browseButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default FavoritesScreen;