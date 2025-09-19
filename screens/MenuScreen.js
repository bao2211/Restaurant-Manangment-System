import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService, getCategoryIcon, formatPrice } from '../services/apiService';

export default function MenuScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);
  const [imageErrors, setImageErrors] = useState({}); // Track failed image loads

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch food items when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchFoodItemsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Test both connection methods
      console.log('=== STARTING CONNECTION TESTS ===');
      
      // Test 1: Axios
      console.log('Testing with axios...');
      const axiosTest = await apiService.testConnection();
      console.log('Axios test result:', axiosTest);
      
      // Test 2: Fetch
      console.log('Testing with fetch...');
      const fetchTest = await apiService.testWithFetch();
      console.log('Fetch test result:', fetchTest);
      
      // If fetch works but axios doesn't, use fetch data
      if (!axiosTest && fetchTest.success) {
        console.log('Using fetch data since axios failed');
        const categoriesData = fetchTest.data.$values || fetchTest.data;
        
        const transformedCategories = categoriesData.map((category, index) => ({
          id: category.cateId?.trim() || `category-${index}`,
          name: category.cateName?.trim() || 'Unknown Category',
          description: category.description,
          icon: getCategoryIcon(category.cateName)
        }));
        
        // Add "Tất cả" (All) category at the beginning
        const allCategory = {
          id: 'all',
          name: 'Tất cả',
          description: 'View all menu items',
          icon: 'food-variant'
        };
        
        const finalCategories = [allCategory, ...transformedCategories];
        
        setCategories(finalCategories);
        if (finalCategories.length > 0) {
          setSelectedCategory(finalCategories[0].id);
        }
        return;
      }
      
      // If axios test failed completely
      if (!axiosTest) {
        throw new Error('Cannot connect to server with either method');
      }
      
      // Proceed with normal axios flow
      const categoriesData = await apiService.getCategories();
      console.log('Categories fetched:', categoriesData);
      
      if (!categoriesData || categoriesData.length === 0) {
        console.log('No categories returned from API');
        setCategories([]);
        return;
      }
      
      const transformedCategories = categoriesData.map((category, index) => ({
        id: category.cateId?.trim() || `category-${index}`,
        name: category.cateName?.trim() || 'Unknown Category',
        description: category.description,
        icon: getCategoryIcon(category.cateName)
      }));
      
      // Add "Tất cả" (All) category at the beginning
      const allCategory = {
        id: 'all',
        name: 'Tất cả',
        description: 'View all menu items',
        icon: 'food-variant'
      };
      
      const finalCategories = [allCategory, ...transformedCategories];
      
      console.log('Transformed categories:', finalCategories);
      setCategories(finalCategories);
      
      if (finalCategories.length > 0) {
        console.log('Setting selected category to:', finalCategories[0].id);
        setSelectedCategory(finalCategories[0].id);
      }
      
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      Alert.alert(
        'Connection Error', 
        `Unable to load menu categories.\n\nError: ${error.message}\n\nDetails:\n- Server URL: http://46.250.231.129:8080/\n- Check if server is running\n- Check internet connection\n- Try restarting the app`,
        [
          { text: 'Retry', onPress: fetchCategories },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItemsByCategory = async (categoryId) => {
    try {
      setLoadingItems(true);
      setImageErrors({}); // Reset image errors when fetching new category
      
      let foodData;
      
      if (categoryId === 'all') {
        // Fetch all food items from all categories
        console.log('Fetching all food items from all categories');
        const allFoodItems = [];
        
        // Get all categories except 'all'
        const realCategories = categories.filter(cat => cat.id !== 'all');
        
        for (const category of realCategories) {
          try {
            const categoryFoodData = await apiService.getFoodItemsByCategory(category.id);
            allFoodItems.push(...categoryFoodData);
          } catch (error) {
            console.error(`Error fetching items for category ${category.name}:`, error);
            // Continue with other categories even if one fails
          }
        }
        
        foodData = allFoodItems;
      } else {
        // Fetch specific category
        foodData = await apiService.getFoodItemsByCategory(categoryId);
      }
      
      console.log('Food items fetched:', foodData);
      
      // Transform API data to match our component format
      const transformedFoodItems = foodData.map((food, index) => ({
        id: food.foodId?.trim() || `food-${index}`, // Ensure unique ID
        name: food.foodName?.trim() || 'Unknown Dish',
        description: food.description || 'Delicious dish prepared with care',
        price: formatPrice(food.unitPrice || 0),
        imageUrl: food.foodImage, // Use actual food image URL
        emojiFallback: getEmojiFallback(food.foodName), // Keep emoji as fallback
        categoryId: food.cateId?.trim(),
        unitPrice: food.unitPrice || 0
      }));
      
      setFoodItems(transformedFoodItems);
      
    } catch (error) {
      console.error('Error fetching food items:', error);
      Alert.alert(
        'Loading Error', 
        'Unable to load menu items for this category.',
        [{ text: 'OK' }]
      );
      setFoodItems([]); // Show empty state
    } finally {
      setLoadingItems(false);
    }
  };

  // Helper function to generate emoji fallbacks based on food names
  const getEmojiFallback = (foodName) => {
    const name = foodName?.toLowerCase() || '';
    
    // Vietnamese food mappings
    if (name.includes('cơm')) return '🍚'; // Rice dishes
    if (name.includes('gà')) return '🍗'; // Chicken
    if (name.includes('cá')) return '🐟'; // Fish
    if (name.includes('tôm')) return '🍤'; // Shrimp
    if (name.includes('bò')) return '🥩'; // Beef
    if (name.includes('heo') || name.includes('thịt')) return '🥓'; // Pork/Meat
    if (name.includes('canh') || name.includes('súp')) return '🍲'; // Soup
    if (name.includes('mì') || name.includes('bún') || name.includes('phở')) return '🍜'; // Noodles
    if (name.includes('rau')) return '🥬'; // Vegetables
    if (name.includes('nước') || name.includes('trà') || name.includes('cà phê')) return '🥤'; // Drinks
    if (name.includes('bánh')) return '🥧'; // Cakes/Pastries
    
    // English food mappings (fallback)
    if (name.includes('salad')) return '🥗';
    if (name.includes('chicken')) return '�';
    if (name.includes('beef') || name.includes('steak')) return '🥩';
    if (name.includes('fish') || name.includes('salmon')) return '🐟';
    if (name.includes('pasta') || name.includes('noodle')) return '🍝';
    if (name.includes('pizza')) return '�';
    if (name.includes('burger')) return '🍔';
    if (name.includes('cake')) return '🍰';
    if (name.includes('ice cream')) return '🍨';
    if (name.includes('coffee')) return '☕';
    if (name.includes('juice')) return '🧃';
    if (name.includes('soup')) return '🍲';
    if (name.includes('rice')) return '🍚';
    if (name.includes('bread')) return '🍞';
    if (name.includes('wine')) return '🍷';
    
    return '🍽️'; // Default food emoji
  };

  const renderMenuItem = (item) => {
    const hasImageError = imageErrors[item.id];
    const shouldShowImage = item.imageUrl && !hasImageError;

    return (
      <TouchableOpacity key={item.id} style={styles.menuItem}>
        <View style={styles.menuItemImage}>
          {shouldShowImage ? (
            <Image 
              source={{ uri: item.imageUrl }}
              style={styles.foodImage}
              onError={() => {
                console.log(`Failed to load image for ${item.name}: ${item.imageUrl}`);
                setImageErrors(prev => ({ ...prev, [item.id]: true }));
              }}
              onLoad={() => {
                // Reset error state if image loads successfully
                setImageErrors(prev => ({ ...prev, [item.id]: false }));
              }}
            />
          ) : (
            <View style={styles.fallbackImageContainer}>
              <Text style={styles.emojiImage}>{item.emojiFallback}</Text>
            </View>
          )}
        </View>
        <View style={styles.menuItemContent}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <Text style={styles.menuItemDescription}>{item.description}</Text>
          <View style={styles.menuItemFooter}>
            <Text style={styles.menuItemPrice}>{item.price}</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleAddToCart = (item) => {
    Alert.alert(
      'Add to Cart',
      `Add ${item.name} to your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: () => {
            // TODO: Implement cart functionality
            Alert.alert('Success', `${item.name} added to cart!`);
          }
        }
      ]
    );
  };

  // Loading state for categories
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading menu categories...</Text>
      </View>
    );
  }

  // Empty state if no categories
  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="food-off" size={80} color="#BDC3C7" />
        <Text style={styles.emptyTitle}>No Menu Available</Text>
        <Text style={styles.emptySubtitle}>
          Please check your connection and try again
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryContentContainer}
          style={styles.categoryScrollView}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.activeCategoryTab
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialCommunityIcons 
                name={category.icon} 
                size={18} 
                color={selectedCategory === category.id ? 'white' : '#FF6B35'} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.activeCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.menuContainer}>
        <Text style={styles.categoryTitle}>
          {selectedCategory === 'all' ? 'Tất cả món ăn' : (categories.find(cat => cat.id === selectedCategory)?.name || 'Menu Items')}
        </Text>
        {loadingItems ? (
          <View style={styles.itemsLoadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading menu items...</Text>
          </View>
        ) : foodItems.length === 0 ? (
          <View style={styles.emptyItemsContainer}>
            <MaterialCommunityIcons name="food-off" size={60} color="#BDC3C7" />
            <Text style={styles.emptyItemsText}>No items in this category</Text>
          </View>
        ) : (
          foodItems.map(renderMenuItem)
        )}
      </ScrollView>
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
    color: '#7F8C8D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 0,
    paddingHorizontal: 10,
    height: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  categoryContentContainer: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  categoryScrollView: {
    flexGrow: 0,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 15,
    marginHorizontal: 4,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#FF6B35',
    height: 30,
  },
  activeCategoryTab: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B35',
  },
  activeCategoryText: {
    color: 'white',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 0,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    marginTop: 5,
  },
  itemsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyItemsContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyItemsText: {
    fontSize: 18,
    color: '#7F8C8D',
    marginTop: 15,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden', // Ensure images don't overflow the rounded corners
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  fallbackImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  emojiImage: {
    fontSize: 40,
  },
  menuItemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 10,
  },
  menuItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});