import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, RefreshControl, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../services/apiService';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSpecialMenu, setShowSpecialMenu] = useState(false);
  const [specialDishes, setSpecialDishes] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    recentOrders: [],
    recentActivities: []
  });

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M đ`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K đ`;
    }
    return `${amount.toLocaleString()} đ`;
  };

  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const statsData = [
    { 
      label: 'Doanh Thu Hôm Nay', 
      value: formatCurrency(dashboardData.todayRevenue), 
      icon: 'cash-multiple',
      color: '#2563EB',
      bgColor: '#EFF6FF'
    },
    { 
      label: 'Tổng Đơn Hàng', 
      value: dashboardData.totalOrders.toString(), 
      icon: 'clipboard-list',
      color: '#059669',
      bgColor: '#ECFDF5'
    },
    { 
      label: 'Tổng Khách Hàng', 
      value: dashboardData.totalCustomers.toString(), 
      icon: 'account-group',
      color: '#7C3AED',
      bgColor: '#F3E8FF'
    },
  ];

  const quickActions = [
    { id: 1, title: 'Xem Menu', icon: 'food', screen: 'Menu', gradient: ['#FF6B35', '#FF8E53'] },
    { id: 2, title: 'Đơn Hàng', icon: 'clipboard-list', screen: 'Orders', gradient: ['#00D4FF', '#00B4D8'] },
    { id: 3, title: 'Hóa Đơn', icon: 'receipt', screen: 'Bill', gradient: ['#8B5CF6', '#A855F7'] },
    { id: 4, title: 'Quản Lý Bàn', icon: 'table-furniture', screen: 'Table', gradient: ['#10B981', '#059669'] },
    { id: 5, title: 'Báo Cáo', icon: 'chart-line', screen: 'Report', gradient: ['#F59E0B', '#D97706'] },
    { id: 6, title: 'Profile', icon: 'account-circle', screen: 'Profile', gradient: ['#6B7280', '#4B5563'] },
  ];

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch recent orders
      const ordersResponse = await apiService.orders.getAllOrders();
      const orders = ordersResponse?.data || [];
      
      // Fetch recent bills for revenue calculation
      const billsResponse = await apiService.bills.getAllBills();
      const bills = billsResponse?.data || [];
      
      // Fetch users for customer count
      const usersResponse = await apiService.users.getAllUsers();
      const users = usersResponse?.data || [];
      
      // Calculate today's revenue
      const today = new Date().toISOString().split('T')[0];
      const todayBills = bills.filter(bill => {
        const billDate = new Date(bill.createdTime || bill.orderTime || bill.date).toISOString().split('T')[0];
        return billDate === today && bill.status !== 'Cancelled';
      });
      
      const todayRevenue = todayBills.reduce((sum, bill) => {
        return sum + (parseFloat(bill.totalPrice || bill.totalAmount || bill.amount || 0));
      }, 0);
      
      // Get recent orders (last 10)
      const recentOrders = orders
        .sort((a, b) => new Date(b.orderTime || b.createdTime || b.date) - new Date(a.orderTime || a.createdTime || a.date))
        .slice(0, 10);
      
      // Create recent activities from orders and bills
      const recentActivities = [];
      
      // Add recent orders to activities
      recentOrders.slice(0, 3).forEach(order => {
        recentActivities.push({
          id: `order-${order.orderId}`,
          type: 'order',
          title: `Đơn hàng #${order.orderId} đã ${order.status === 'Completed' ? 'hoàn thành' : 'được tạo'}`,
          time: getTimeAgo(order.orderTime || order.createdTime || order.date),
          icon: order.status === 'Completed' ? 'check-circle' : 'shopping',
          color: order.status === 'Completed' ? '#10B981' : '#00D4FF'
        });
      });
      
      // Add recent customer registrations
      const recentUsers = users
        .sort((a, b) => new Date(b.createdTime || b.registerDate || new Date()) - new Date(a.createdTime || a.registerDate || new Date()))
        .slice(0, 2);
      
      recentUsers.forEach(user => {
        recentActivities.push({
          id: `user-${user.userId}`,
          type: 'user',
          title: `Khách hàng ${user.userName || 'mới'} đã đăng ký`,
          time: getTimeAgo(user.createdTime || user.registerDate || new Date()),
          icon: 'account-plus',
          color: '#8B5CF6'
        });
      });
      
      // Sort activities by time and take first 5
      recentActivities.sort((a, b) => {
        // Simple time comparison based on "X phút trước" format
        const timeA = parseInt(a.time.split(' ')[0]) || 0;
        const timeB = parseInt(b.time.split(' ')[0]) || 0;
        return timeA - timeB;
      });
      
      setDashboardData({
        todayRevenue,
        totalOrders: orders.length,
        totalCustomers: users.filter(user => user.role !== 'Admin').length,
        recentOrders: recentOrders.slice(0, 5),
        recentActivities: recentActivities.slice(0, 5)
      });
      
      console.log('✅ Dashboard data loaded successfully');
      console.log('📊 Stats:', { todayRevenue, totalOrders: orders.length, totalCustomers: users.length });
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      Alert.alert(
        'Lỗi tải dữ liệu',
        'Không thể tải dữ liệu dashboard. Đang hiển thị dữ liệu mẫu.',
        [{ text: 'OK' }]
      );
      
      // Fallback to sample data
      setDashboardData({
        todayRevenue: 5200000,
        totalOrders: 127,
        totalCustomers: 89,
        recentOrders: [],
        recentActivities: [
          {
            id: 'sample-1',
            type: 'order',
            title: 'Đơn hàng #RMS001 đã hoàn thành',
            time: '2 phút trước',
            icon: 'check-circle',
            color: '#10B981'
          },
          {
            id: 'sample-2',
            type: 'user',
            title: 'Khách hàng mới đã đăng ký',
            time: '10 phút trước',
            icon: 'account-plus',
            color: '#8B5CF6'
          },
          {
            id: 'sample-3',
            type: 'table',
            title: 'Bàn số 5 đã được đặt trước',
            time: '15 phút trước',
            icon: 'table-furniture',
            color: '#F59E0B'
          }
        ]
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  // Fetch random special dishes
  const fetchSpecialDishes = async () => {
    try {
      console.log('🍽️ Fetching special dishes...');
      const foodResponse = await apiService.food.getAllFood();
      const allFoods = foodResponse?.data || [];
      
      // Get random 5 dishes
      const shuffled = allFoods.sort(() => 0.5 - Math.random());
      const randomDishes = shuffled.slice(0, 5);
      
      const sampleImages = [
        'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1563379091339-03246963d117?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ];

      const formattedDishes = randomDishes.map((dish, index) => ({
        id: dish.foodId,
        name: dish.foodName || 'Món ăn đặc biệt',
        price: formatCurrency(dish.price || 0),
        image: dish.foodImage || sampleImages[index % sampleImages.length],
        description: dish.description || 'Món ăn được chọn lọc đặc biệt',
        category: (dish.cateName || 'KHÁC').toUpperCase()
      }));
      
      setSpecialDishes(formattedDishes);
      console.log('✅ Special dishes loaded:', formattedDishes.length);
      console.log('📸 First dish image:', formattedDishes[0]?.image);
      console.log('🍽️ Sample dishes:', formattedDishes.map(d => ({ name: d.name, image: d.image ? 'HAS_IMAGE' : 'NO_IMAGE' })));
      
    } catch (error) {
      console.error('❌ Error fetching special dishes:', error);
      // Fallback to sample dishes with images
      setSpecialDishes([
        { 
          id: 1, 
          name: 'Cơm Gà Xối Mỡ', 
          price: '56,000 đ', 
          category: 'BEST SELLER', 
          description: 'Cơm gà xối mỡ giòn tan, thơm ngon',
          image: 'https://barona.vn/storage/meo-vat/83/com-ga-xoi-mo.jpg'
        },
        { 
          id: 2, 
          name: 'Mì Xào Bò Đặc Biệt', 
          price: '40,000 đ', 
          category: 'MÌ', 
          description: 'Mì xào bò với rau củ tươi ngon',
          image: 'https://maisonmando.com/wp-content/uploads/2022/04/cach-lam-mi-xao-bo-1-1.jpg'
        },
        { 
          id: 3, 
          name: 'Cơm Xà Bì Chưởng', 
          price: '450,000 đ', 
          category: 'CƠM', 
          description: 'Cơm sườn, bì, chả, trứng ốp la đầy đặn',
          image: 'https://i.ytimg.com/vi/h__kLq8NG2I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDqn7vasJHB1JVJB8uobiB67rxztw'
        },
        { 
          id: 4, 
          name: 'Gà Quay Nguyên Con', 
          price: '120,000 đ', 
          category: 'GÀ', 
          description: 'Gà quay nguyên con, da giòn, thịt mềm',
          image: 'https://cdn.tgdd.vn/2021/03/CookRecipe/GalleryStep/thanh-pham-287.jpg'
        },
        { 
          id: 5, 
          name: 'Trà Đé', 
          price: '4,000 đ', 
          category: 'NƯỚC UỐNG', 
          description: 'Trà đá mát lạnh giải khát',
          image: 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2019/7/25/746291/Tra-Da.jpg'
        }
      ]);
    }
  };

  // Handle special menu toggle
  const handleSpecialMenuPress = () => {
    if (!showSpecialMenu && specialDishes.length === 0) {
      fetchSpecialDishes();
    }
    setShowSpecialMenu(!showSpecialMenu);
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1B3B" />
      
      {/* Header with RMS Logo */}
      <LinearGradient
        colors={['#1A1B3B', '#2D1B69', '#4C1D95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.brandSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoHexagon}>
                  <Text style={styles.logoText}>RMS</Text>
                  <View style={styles.logoCrown}>
                    <MaterialCommunityIcons name="crown" size={16} color="#00D4FF" />
                  </View>
                </View>
              </View>
              <View style={styles.brandText}>
                <Text style={styles.brandTitle}>Restaurant Manager</Text>
                <Text style={styles.brandSubtitle}>Hệ thống quản lý thông minh</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="white" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Chào mừng trở lại! 👋</Text>
            <Text style={styles.welcomeSubtext}>Hôm nay là ngày tuyệt vời để phục vụ khách hàng</Text>
          </View>
        </View>
        
        {/* Decorative Neon Effects */}
        <View style={styles.neonCircle1} />
        <View style={styles.neonCircle2} />
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00D4FF', '#FF6B35']}
            tintColor="#00D4FF"
          />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>📊 Thống kê hôm nay</Text>
          <View style={styles.statsContainer}>
            {statsData.map((stat, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: stat.bgColor }]}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <MaterialCommunityIcons name={stat.icon} size={24} color="white" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Featured Banner */}
        <View style={styles.bannerSection}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={handleSpecialMenuPress}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2', '#8B7EC8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.featuredBanner}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerIcon}>
                  <MaterialCommunityIcons name="star" size={32} color="white" />
                </View>
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>Món Đặc Biệt Hôm Nay</Text>
                  <Text style={styles.bannerSubtitle}>Khám phá thực đơn được chọn lọc đặc biệt</Text>
                </View>
                <MaterialCommunityIcons 
                  name={showSpecialMenu ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="white" 
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          {/* Special Dishes Dropdown */}
          {showSpecialMenu && (
            <View style={styles.specialMenuDropdown}>
              <LinearGradient
                colors={['#F8FAFC', '#E2E8F0']}
                style={styles.dropdownHeader}
              >
                <Text style={styles.dropdownTitle}>🌟 Món đặc biệt được chọn lọc</Text>
              </LinearGradient>
              
              {specialDishes.map((dish, index) => {
                // Màu sắc đa dạng cho từng món
                const colors = [
                  ['#FF6B35', '#FF8E53'], // Orange
                  ['#00D4FF', '#00B4D8'], // Cyan  
                  ['#8B5CF6', '#A855F7'], // Purple
                  ['#10B981', '#059669'], // Green
                  ['#F59E0B', '#D97706'], // Yellow
                ];
                const categoryColors = [
                  '#FF6B35', '#00D4FF', '#8B5CF6', '#10B981', '#F59E0B'
                ];
                const dishColor = colors[index % colors.length];
                const categoryColor = categoryColors[index % categoryColors.length];
                
                return (
                  <TouchableOpacity 
                    key={dish.id} 
                    style={[styles.dishItem, { borderLeftWidth: 4, borderLeftColor: categoryColor }]}
                    onPress={() => {
                      navigation.navigate('Menu');
                      setShowSpecialMenu(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dishContent}>
                      <View style={styles.dishImageContainer}>
                        {dish.image && dish.image !== null && dish.image !== '' ? (
                          <View style={styles.imageWrapper}>
                            <Image 
                              source={{ uri: dish.image }} 
                              style={styles.dishImage}
                              resizeMode="cover"
                              onError={(error) => {
                                console.warn('Image load error:', error.nativeEvent.error);
                              }}
                            />
                            <LinearGradient
                              colors={['transparent', 'rgba(0,0,0,0.4)']}
                              style={styles.imageOverlay}
                            />
                          </View>
                        ) : (
                          <LinearGradient
                            colors={dishColor}
                            style={styles.dishImagePlaceholder}
                          >
                            <MaterialCommunityIcons name="food" size={28} color="white" />
                          </LinearGradient>
                        )}
                        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                          <Text style={styles.categoryBadgeText}>#{index + 1}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.dishInfo}>
                        <Text style={styles.dishName}>{dish.name}</Text>
                        <View style={styles.categoryContainer}>
                          <MaterialCommunityIcons name="tag" size={12} color={categoryColor} />
                          <Text style={[styles.dishCategory, { color: categoryColor }]}>
                            {dish.category}
                          </Text>
                        </View>
                        <Text style={styles.dishDescription} numberOfLines={2}>
                          {dish.description}
                        </Text>
                        
                        {/* Rating stars */}
                        <View style={styles.ratingContainer}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <MaterialCommunityIcons 
                              key={star}
                              name="star" 
                              size={12} 
                              color={star <= 4 ? "#F59E0B" : "#E5E7EB"} 
                            />
                          ))}
                          <Text style={styles.ratingText}>4.0</Text>
                        </View>
                      </View>
                      
                      <View style={styles.dishPriceContainer}>
                        <LinearGradient
                          colors={['#059669', '#10B981']}
                          style={styles.priceTag}
                        >
                          <Text style={styles.dishPrice}>{dish.price}</Text>
                        </LinearGradient>
                        <TouchableOpacity style={styles.addButton}>
                          <MaterialCommunityIcons name="plus" size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.viewAllButton}
              >
                <TouchableOpacity 
                  style={styles.viewAllButtonInner}
                  onPress={() => {
                    navigation.navigate('Menu');
                    setShowSpecialMenu(false);
                  }}
                >
                  <MaterialCommunityIcons name="silverware-fork-knife" size={18} color="white" />
                  <Text style={styles.viewAllText}>Xem tất cả món ăn</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="white" />
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Thao tác nhanh</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.actionGradient}
                >
                  <View style={styles.actionIconContainer}>
                    <MaterialCommunityIcons name={action.icon} size={28} color="white" />
                  </View>
                  <Text style={styles.actionText}>{action.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>🕒 Hoạt động gần đây</Text>
          <View style={styles.activityCard}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialCommunityIcons name="loading" size={24} color="#6B7280" />
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            ) : dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
                    <MaterialCommunityIcons name={activity.icon} size={20} color={activity.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <MaterialCommunityIcons name="clock-outline" size={32} color="#9CA3AF" />
                <Text style={styles.noDataText}>Chưa có hoạt động nào</Text>
                <Text style={styles.noDataSubtext}>Hoạt động mới sẽ hiển thị ở đây</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Header with RMS Theme
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 15,
  },
  logoHexagon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00D4FF',
    position: 'relative',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4FF',
    textShadowColor: 'rgba(0, 212, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  logoCrown: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    borderRadius: 10,
    padding: 2,
  },
  brandText: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeContainer: {
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 22,
  },

  // Neon Effects
  neonCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    top: -30,
    right: -30,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.3)',
  },
  neonCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    bottom: -20,
    left: -20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 53, 0.3)',
  },

  // Content
  content: {
    flex: 1,
  },

  // Stats Section
  statsSection: {
    padding: 20,
    marginTop: -15,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },

  // Banner Section
  bannerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuredBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
  },
  bannerIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },

  // Special Menu Dropdown
  specialMenuDropdown: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 12,
    elevation: 12,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  dropdownHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dishItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: 'white',
  },
  dishContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  dishImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  imageWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dishImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    borderRadius: 16,
  },
  dishImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dishCategory: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dishDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '600',
  },
  dishPriceContainer: {
    alignItems: 'flex-end',
  },
  priceTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: '#667EEA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  viewAllButton: {
    marginTop: 8,
  },
  viewAllButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginHorizontal: 12,
    letterSpacing: 0.3,
  },

  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1B3B',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 3,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  actionGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Activity Section
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1B3B',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Loading States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  noDataSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },

  // Bottom Space
  bottomSpace: {
    height: 30,
  },
});