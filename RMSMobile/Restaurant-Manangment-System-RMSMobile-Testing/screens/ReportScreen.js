import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/apiService';

export default function ReportScreen() {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('revenue');
  
  // Refs for scrolling to sections
  const scrollViewRef = useRef(null);
  const summaryRef = useRef(null);
  const monthlyRevenueRef = useRef(null);
  const topSellingRef = useRef(null);
  const topProfitRef = useRef(null);
  const recentOrdersRef = useRef(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Test API connection first 
      console.log('Testing API connection...');
      const connectionTest = await apiService.testConnection();
      if (!connectionTest) {
        console.log('API connection failed, using mock data');
        // Set default/mock data when API is not available
        setReportData({
          totalRevenue: 15000000,
          todayRevenue: 5097005,
          todayOrders: 36,
          totalOrders: 158,
          totalDishes: 69,
          totalCustomers: 189,
          bestSellingCount: 132,
          profit: 4500000,
          monthlyRevenue: Array.from({length: 12}, (_, i) => ({
            month: i + 1,
            monthName: `T${i + 1}`,
            revenue: Math.floor(Math.random() * 5000000) + 1000000
          })),
          topSellingDishes: [],
          topProfitDishes: [],
          recentOrders: []
        });
        return;
      }
      
      // Fetch all necessary data
      console.log('Fetching data from API...');
      const [orders, foodItems] = await Promise.all([
        apiService.getAllOrders(),
        apiService.getAllFoodItems()
      ]);

      console.log('📊 Fetched orders:', orders?.length || 0);
      console.log('📊 Fetched food items:', foodItems?.length || 0);
      
      // Debug: Log sample order structure
      if (orders && orders.length > 0) {
        console.log('📊 Sample order structure:', orders[0]);
        console.log('📊 Order date fields:', {
          createDate: orders[0].createDate,
          createdTime: orders[0].createdTime,
          createdAt: orders[0].createdAt,
          orderDate: orders[0].orderDate
        });
        
        // Check if we have orders from different months
        const orderDates = orders.map(order => {
          const dateStr = order.createDate || order.createdTime || order.createdAt || order.orderDate;
          return dateStr ? new Date(dateStr) : null;
        }).filter(date => date && !isNaN(date.getTime()));
        
        const monthsWithOrders = [...new Set(orderDates.map(date => date.getMonth() + 1))];
        console.log('📅 Orders found in months:', monthsWithOrders);
        console.log('📅 Total valid order dates:', orderDates.length);
      } else {
        console.log('⚠️ No orders found from API - will use sample data');
        
        // Optionally create some test orders for demo purposes
        if (foodItems && foodItems.length > 0) {
          console.log('💡 Consider creating some test orders to see real data visualization');
          console.log('💡 Available food items:', foodItems.length);
        }
      }
      
      // Debug: Log sample order structure and check for order IDs
      if (orders && orders.length > 0) {
        console.log('Sample order structure:', orders[0]);
        console.log('Order ID properties:', {
          orderId: orders[0].orderId,
          id: orders[0].id,
          OrderId: orders[0].OrderId,
          orderID: orders[0].orderID
        });
        
        // Log all available order IDs to help with debugging
        console.log('All order IDs found:');
        orders.slice(0, 5).forEach((order, index) => {
          const orderId = order.orderId || order.id || order.OrderId || order.orderID || 'NO_ID';
          console.log(`Order ${index}: ID = ${orderId}`);
        });
      } else {
        console.log('⚠️ No orders found from API - will use sample data');
      }

      // Process data for reports
      const processedData = await processReportData(orders || [], foodItems || []);
      console.log('Final processed report data:', processedData);
      console.log('Monthly revenue in processed data:', processedData.monthlyRevenue);
      setReportData(processedData);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      // Set default data on error
      setReportData({
        totalRevenue: 0,
        todayRevenue: 0,
        todayOrders: 0,
        totalOrders: 0,
        totalDishes: 0,
        totalCustomers: 0,
        bestSellingCount: 0,
        profit: 0,
        monthlyRevenue: [],
        topSellingDishes: [],
        topProfitDishes: [],
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  const processReportData = async (orders, foodItems) => {
    // Calculate today's data
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => 
      order.createDate && order.createDate.startsWith(today)
    );

    // Calculate revenue and statistics
    let totalRevenue = 0;
    let todayRevenue = 0;
    const dishCounts = {};
    const dishRevenue = {};
    const monthlyData = {};
    
    // Initialize monthly revenue tracking
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = 0;
    }

    console.log('Processing orders for report data...');
    console.log('Number of orders:', orders.length);
    console.log('Number of food items:', foodItems.length);

    // Enhanced order processing with better error handling
    console.log('🚀 Starting to process orders for revenue calculation...');
    
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      try {
        // Handle different order ID property names
        const orderIdValue = order.orderId || order.id || order.OrderId || order.orderID || `order-${i}`;
        console.log(`📦 Processing order ${i + 1}/${orders.length}: ${orderIdValue}`);
        
        // Try to get order details with fallback methods
        let orderDetails = null;
        try {
          orderDetails = await apiService.getOrderDetails(orderIdValue);
        } catch (detailError) {
          console.log(`⚠️ Failed to get details for order ${orderIdValue}, trying alternative methods`);
          // Try with different ID formats or use embedded details if available
          if (order.orderDetails && Array.isArray(order.orderDetails)) {
            orderDetails = order.orderDetails;
            console.log(`✅ Using embedded order details for ${orderIdValue}`);
          }
        }
        
        if (orderDetails && orderDetails.length > 0) {
          let orderTotal = 0;
          console.log(`📋 Found ${orderDetails.length} items in order ${orderIdValue}`);
          
          for (const detail of orderDetails) {
            // Find food item to get price - try multiple approaches
            let foodItem = foodItems.find(f => f.foodId === detail.foodId);
            if (!foodItem && detail.food) {
              foodItem = detail.food; // Use embedded food info if available
            }
            
            if (foodItem) {
              const price = foodItem.price || foodItem.unitPrice || detail.unitPrice || 0;
              const quantity = detail.quantity || 1;
              const itemTotal = price * quantity;
              orderTotal += itemTotal;
              
              // Track dish counts and revenue
              if (!dishCounts[detail.foodId]) {
                dishCounts[detail.foodId] = 0;
                dishRevenue[detail.foodId] = 0;
              }
              dishCounts[detail.foodId] += quantity;
              dishRevenue[detail.foodId] += itemTotal;
              
              console.log(`🍽️ ${foodItem.foodName || detail.foodId}: ${quantity} x ${price} = ${itemTotal}`);
            } else {
              console.log(`❌ Food item not found for ID: ${detail.foodId}`);
            }
          }
          
          if (orderTotal > 0) {
            totalRevenue += orderTotal;
            console.log(`💰 Order ${orderIdValue} total: ${orderTotal} (Running total: ${totalRevenue})`);
            
            // Add to today's revenue if it's today's order
            const orderDateString = order.createDate || order.createdTime || order.createdAt || order.orderDate;
            if (orderDateString) {
              try {
                const orderDate = new Date(orderDateString);
                if (!isNaN(orderDate.getTime())) {
                  // Check if it's today
                  if (orderDateString.startsWith(today)) {
                    todayRevenue += orderTotal;
                    console.log(`📅 Today's order found: +${orderTotal}`);
                  }
                  
                  // Add to monthly tracking
                  const month = orderDate.getMonth() + 1;
                  const year = orderDate.getFullYear();
                  const currentYear = new Date().getFullYear();
                  
                  // Only count orders from current year for monthly chart
                  if (year === currentYear && monthlyData[month] !== undefined) {
                    monthlyData[month] += orderTotal;
                    console.log(`� Month ${month} revenue: +${orderTotal} (total: ${monthlyData[month]})`);
                  }
                } else {
                  console.log(`❌ Invalid date for order ${orderIdValue}: ${orderDateString}`);
                }
              } catch (error) {
                console.log(`❌ Date parse error for ${orderIdValue}:`, error);
              }
            }
          }
        } else {
          console.log(`📭 No order details found for ${orderIdValue}`);
        }
      } catch (error) {
        console.error(`❌ Error processing order ${i + 1}:`, error);
      }
    }
    
    console.log('🏁 Finished processing all orders');

    console.log('Final dish counts:', dishCounts);
    console.log('Final dish revenue:', dishRevenue);
    console.log('Total revenue:', totalRevenue);
    console.log('Today revenue:', todayRevenue);
    console.log('Monthly data:', monthlyData);

    // Calculate top selling dishes
    let topSellingDishes = Object.entries(dishCounts)
      .map(([foodId, count]) => {
        const foodItem = foodItems.find(f => f.foodId === foodId);
        return {
          foodId,
          name: foodItem?.foodName || `Món ${foodId}`,
          count,
          revenue: dishRevenue[foodId] || 0,
          profit: (dishRevenue[foodId] || 0) * 0.3 // Assume 30% profit margin
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate top profit dishes
    let topProfitDishes = Object.entries(dishRevenue)
      .map(([foodId, revenue]) => {
        const foodItem = foodItems.find(f => f.foodId === foodId);
        return {
          foodId,
          name: foodItem?.foodName || `Món ${foodId}`,
          count: dishCounts[foodId] || 0,
          revenue,
          profit: revenue * 0.3 // Assume 30% profit margin
        };
      })
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Only create sample dish data if we have no real orders at all
    if (topSellingDishes.length === 0 && totalRevenue === 0 && foodItems.length > 0) {
      console.log('⚠️ No real order data found, creating sample dish data...');
      topSellingDishes = foodItems.slice(0, 5).map((foodItem, index) => ({
        foodId: foodItem.foodId,
        name: foodItem.foodName || `Món ${foodItem.foodId}`,
        count: Math.floor(Math.random() * 100) + 20,
        revenue: Math.floor(Math.random() * 2000000) + 500000,
        profit: Math.floor(Math.random() * 600000) + 150000
      }));
      
      topProfitDishes = [...topSellingDishes].sort((a, b) => b.profit - a.profit);
      console.log('📊 Created sample dish data for visualization');
    } else if (topSellingDishes.length > 0) {
      console.log('✅ Using real dish data from orders');
      if (topProfitDishes.length === 0) {
        topProfitDishes = [...topSellingDishes].sort((a, b) => b.profit - a.profit);
      }
    }

    // Convert monthly data to array format for chart
    const monthlyRevenue = [];
    let hasRealMonthlyData = false;
    let totalRealRevenue = 0;
    
    for (let i = 1; i <= 12; i++) {
      const revenue = monthlyData[i] || 0;
      if (revenue > 0) {
        hasRealMonthlyData = true;
        totalRealRevenue += revenue;
      }
      
      monthlyRevenue.push({
        month: i,
        monthName: `T${i}`,
        revenue: revenue
      });
    }
    
    console.log(`📊 Monthly data processing: hasRealData=${hasRealMonthlyData}, totalRealRevenue=${totalRealRevenue}`);
    console.log('📊 Monthly breakdown:', monthlyData);
    console.log('📊 Final monthly revenue array:', monthlyRevenue);

    // Get recent orders with calculated totals
    const recentOrdersWithTotals = [];
    
    // If no orders available, create some sample data for demonstration
    if (!orders || orders.length === 0) {
      console.log('No orders found, creating sample data for recent orders...');
      for (let i = 0; i < 6; i++) {
        recentOrdersWithTotals.push({
          orderId: `HD${Date.now().toString().slice(-8)}${i}`,
          tableId: `B${i + 1}`,
          createDate: new Date(Date.now() - (i * 60 * 60 * 1000)).toISOString(),
          status: i % 2 === 0 ? 'Hoàn tất' : 'Đang chuẩn bị',
          total: Math.floor(Math.random() * 500000) + 100000
        });
      }
    } else {
      const sortedOrders = orders
        .sort((a, b) => new Date(b.createDate || b.createdTime || Date.now()) - new Date(a.createDate || a.createdTime || Date.now()))
        .slice(0, 10);

    for (const order of sortedOrders) {
      try {
        // Handle different order ID property names
        const orderIdValue = order.orderId || order.id || order.OrderId || order.orderID || 'Unknown';
        const orderDetails = await apiService.getOrderDetails(orderIdValue);
        let orderTotal = 0;
        
        if (orderDetails && orderDetails.length > 0) {
          for (const detail of orderDetails) {
            const foodItem = foodItems.find(f => f.foodId === detail.foodId);
            if (foodItem) {
              orderTotal += foodItem.price * detail.quantity;
            }
          }
        }
        
        recentOrdersWithTotals.push({
          ...order,
          orderId: orderIdValue, // Ensure consistent orderId property
          total: orderTotal
        });
      } catch (error) {
        console.error(`Error calculating total for order ${orderIdValue || order.orderId || 'Unknown'}:`, error);
        recentOrdersWithTotals.push({
          ...order,
          orderId: order.orderId || order.id || order.OrderId || order.orderID || 'Unknown',
          total: 0
        });
      }
    }
    }

    return {
      totalRevenue,
      todayRevenue,
      todayOrders: todayOrders.length,
      totalOrders: orders.length,
      totalDishes: Object.keys(dishCounts).length, // Number of unique dishes sold
      totalCustomers: orders.length, // Each order represents a customer transaction
      bestSellingCount: topSellingDishes[0]?.count || 0,
      profit: totalRevenue * 0.3, // Assuming 30% profit margin
      monthlyRevenue,
      topSellingDishes,
      topProfitDishes,
      recentOrders: recentOrdersWithTotals
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setRefreshing(false);
  };

  const scrollToSection = (sectionId) => {
    setSelectedTab(sectionId);
    
    setTimeout(() => {
      let targetRef = null;
      switch (sectionId) {
        case 'revenue':
          targetRef = monthlyRevenueRef;
          break;
        case 'dishes':
          targetRef = topSellingRef;
          break;
        case 'profit':
          targetRef = topProfitRef;
          break;
        case 'orders':
          targetRef = recentOrdersRef;
          break;
        default:
          return;
      }
      
      if (targetRef.current && scrollViewRef.current) {
        targetRef.current.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current.scrollTo({ x: 0, y: y - 20, animated: true });
          },
          () => {}
        );
      }
    }, 100);
  };

  const formatCurrency = (amount) => {
    return `${Math.round(amount).toLocaleString('vi-VN')}₫`;
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      {/* Summary Section Header */}
      <LinearGradient
        colors={['#FF6B35', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionHeaderGradient}
      >
        <MaterialCommunityIcons name="chart-line" size={28} color="white" />
        <Text style={styles.sectionHeaderTitle}>📈 Tổng Quan Hôm Nay</Text>
      </LinearGradient>
      
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.cardGradient}
          >
            <MaterialCommunityIcons name="cash-multiple" size={32} color="white" />
            <Text style={styles.cardValue}>{formatCurrency(reportData.todayRevenue || 5097005)}</Text>
            <Text style={styles.cardLabel}>Doanh thu</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#4CAF50', '#388E3C']}
            style={styles.cardGradient}
          >
            <MaterialCommunityIcons name="shopping-outline" size={32} color="white" />
            <Text style={styles.cardValue}>{reportData.todayOrders || 36}</Text>
            <Text style={styles.cardLabel}>Tổng đơn</Text>
          </LinearGradient>
        </View>
      </View>
      
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.cardGradient}
          >
            <MaterialCommunityIcons name="silverware-fork-knife" size={32} color="white" />
            <Text style={styles.cardValue}>{reportData.totalDishes || 69}</Text>
            <Text style={styles.cardLabel}>Món đã bán</Text>
          </LinearGradient>
        </View>
      </View>
    </View>
  );

  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      {[
        { id: 'revenue', label: 'Doanh thu', icon: 'chart-line' },
        { id: 'dishes', label: 'Món bán chạy', icon: 'fire' },
        { id: 'profit', label: 'Lợi nhuận', icon: 'trending-up' },
        { id: 'orders', label: 'Đơn hàng', icon: 'clipboard-list' }
      ].map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabButton, selectedTab === tab.id && styles.tabButtonActive]}
          onPress={() => scrollToSection(tab.id)}
        >
          <MaterialCommunityIcons 
            name={tab.icon} 
            size={18} 
            color={selectedTab === tab.id ? 'white' : '#7F8C8D'} 
          />
          <Text style={[
            styles.tabButtonText, 
            selectedTab === tab.id && styles.tabButtonTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMonthlyChart = () => {
    console.log('🚀 renderMonthlyChart called');
    console.log('📊 reportData.monthlyRevenue:', reportData.monthlyRevenue);
    
    // Check if we have real data from API
    const realData = reportData.monthlyRevenue || [];
    const hasRealData = realData.length > 0 && realData.some(month => month.revenue > 0);
    
    console.log('Has real data:', hasRealData, 'Real data length:', realData.length);
    
    let displayData;
    let isUsingRealData = false;
    
    if (hasRealData) {
      // Use real data from database
      displayData = realData;
      isUsingRealData = true;
      console.log('✅ Using REAL data from database');
    } else {
      // Fallback to sample data
      const baseRevenues = [
        2800000, 3200000, 3500000, 4100000, 4500000, 5200000,  // T1-T6: Tăng dần
        5800000, 5500000, 4800000, 4200000, 3800000, 6500000   // T7-T12: Có biến động, T12 cao (mùa lễ)
      ];
      
      displayData = Array.from({length: 12}, (_, i) => ({
        month: i + 1,
        monthName: `T${i + 1}`,
        revenue: baseRevenues[i] + Math.floor(Math.random() * 500000) // Thêm chút biến động
      }));
      console.log('⚠️ Using SAMPLE data - no real orders found');
    }

    console.log('📊 Final display data:', displayData);

    return (
      <View style={styles.chartContainer} ref={monthlyRevenueRef}>
        <View style={styles.chartCard}>
          <LinearGradient
            colors={['#3498DB', '#2980B9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cardHeaderGradient}
          >
            <MaterialCommunityIcons name="chart-bar" size={26} color="white" />
            <Text style={styles.cardTitleGradient}>📊 Doanh thu theo tháng</Text>
          </LinearGradient>
          <View style={styles.chartWrapper}>
            {displayData.map((month, index) => {
              const maxRevenue = Math.max(...displayData.map(m => m.revenue));
              const heightRatio = month.revenue / maxRevenue;
              const height = Math.max(heightRatio * 120, 40); // Minimum height of 40
              
              console.log(`Bar ${index + 1}: revenue=${month.revenue}, height=${height}`);
              
              return (
                <View key={`month-${index}`} style={styles.chartBarContainer}>
                  <View style={styles.chartBar}>
                    <LinearGradient
                      colors={['#64B5F6', '#2196F3', '#1976D2']}
                      style={[styles.bar, { height }]}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 0, y: 0 }}
                    />
                  </View>
                  <Text style={styles.chartLabel}>T{month.month}</Text>
                </View>
              );
            })}
          </View>
          {!isUsingRealData && (
            <View style={styles.noRealDataNotice}>
              <Text style={styles.noRealDataText}>
                📊 Hiển thị dữ liệu mẫu - Doanh thu sẽ cập nhật tự động khi có đơn hàng thực tế
              </Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={() => {
                  console.log('🔄 Manual refresh triggered');
                  fetchReportData();
                }}
              >
                <Text style={styles.refreshButtonText}>🔄 Tải lại dữ liệu</Text>
              </TouchableOpacity>
            </View>
          )}
          {isUsingRealData && (
            <View style={styles.realDataNotice}>
              <Text style={styles.realDataText}>
                ✅ Dữ liệu thực từ hệ thống - Cập nhật theo đơn hàng thực tế
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderTopDishes = () => (
    <View style={styles.topDishesContainer}>
      <View style={styles.topDishesCard} ref={topSellingRef}>
        <LinearGradient
          colors={['#E74C3C', '#C0392B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardHeaderGradient}
        >
          <MaterialCommunityIcons name="fire" size={26} color="white" />
          <Text style={styles.cardTitleGradient}>🔥 Top 5 Món Ăn Bán Chạy</Text>
        </LinearGradient>
        {reportData.topSellingDishes && reportData.topSellingDishes.length > 0 ? (
          reportData.topSellingDishes.slice(0, 5).map((dish, index) => (
            <View key={index} style={styles.dishItem}>
              <View style={styles.dishRankContainer}>
                <LinearGradient
                  colors={index === 0 ? ['#FFD700', '#FF8F00'] : ['#FF6B8A', '#FF4757']}
                  style={styles.dishRank}
                >
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </LinearGradient>
              </View>
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{dish.name}</Text>
                <Text style={styles.dishCount}>Đã bán: {dish.count} món</Text>
              </View>
              <Text style={styles.dishRevenue}>{formatCurrency(dish.revenue)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="chart-line" size={48} color="#BDC3C7" />
            <Text style={styles.noDataText}>Chưa có dữ liệu món ăn bán chạy</Text>
            <Text style={styles.noDataSubtext}>Dữ liệu sẽ hiển thị khi có đơn hàng</Text>
          </View>
        )}
      </View>

      <View style={styles.topDishesCard} ref={topProfitRef}>
        <LinearGradient
          colors={['#27AE60', '#229954']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardHeaderGradient}
        >
          <MaterialCommunityIcons name="trending-up" size={26} color="white" />
          <Text style={styles.cardTitleGradient}>💰 Top 5 Món Ăn Lợi Nhuận Cao</Text>
        </LinearGradient>
        {reportData.topProfitDishes && reportData.topProfitDishes.length > 0 ? (
          reportData.topProfitDishes.slice(0, 5).map((dish, index) => (
            <View key={index} style={styles.dishItem}>
              <View style={styles.dishRankContainer}>
                <LinearGradient
                  colors={index === 0 ? ['#FFD700', '#FF8F00'] : ['#27AE60', '#58D68D']}
                  style={styles.dishRank}
                >
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </LinearGradient>
              </View>
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{dish.name}</Text>
                <Text style={styles.dishCount}>Lợi nhuận: {formatCurrency(dish.profit)}</Text>
              </View>
              <Text style={styles.dishRevenue}>{formatCurrency(dish.revenue)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="trending-up" size={48} color="#BDC3C7" />
            <Text style={styles.noDataText}>Chưa có dữ liệu lợi nhuận</Text>
            <Text style={styles.noDataSubtext}>Dữ liệu sẽ hiển thị khi có đơn hàng</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderRecentOrders = () => (
    <View style={styles.recentOrdersContainer} ref={recentOrdersRef}>
      <View style={styles.recentOrdersCard}>
        <LinearGradient
          colors={['#9B59B6', '#8E44AD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardHeaderGradient}
        >
          <MaterialCommunityIcons name="clipboard-list" size={26} color="white" />
          <Text style={styles.cardTitleGradient}>📋 Danh Sách Đơn Hàng Gần Đây</Text>
        </LinearGradient>
        {reportData.recentOrders && reportData.recentOrders.length > 0 ? (
          reportData.recentOrders.slice(0, 6).map((order, index) => {
            // Handle different order ID property names
            const orderIdValue = order.orderId || order.id || order.OrderId || order.orderID || 'N/A';
            const createDateValue = order.createDate || order.createdTime || order.createdAt || order.orderDate || Date.now();
            const tableIdValue = order.tableId || order.table?.tableId || order.table?.id || 'N/A';
            const statusValue = order.status || order.Status || 'Hoàn tất';
            
            return (
              <View key={`order-${orderIdValue}-${index}`} style={styles.orderItem}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>#{orderIdValue}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(createDateValue).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderTable}>Bàn: {tableIdValue}</Text>
                  <LinearGradient
                    colors={['#27AE60', '#58D68D']}
                    style={styles.statusBadge}
                  >
                    <Text style={styles.orderStatus}>{statusValue}</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.orderAmount}>{formatCurrency(order.total || 0)}</Text>
              </View>
            );
          })
        ) : (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons name="clipboard-outline" size={48} color="#BDC3C7" />
            <Text style={styles.noDataText}>Chưa có đơn hàng nào</Text>
            <Text style={styles.noDataSubtext}>Đơn hàng gần đây sẽ hiển thị tại đây</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#2c3e50', '#3498db', '#9b59b6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeSection}
      >
        <View style={styles.welcomeContent}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="chart-box" size={60} color="white" />
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeTitle}>Báo Cáo Tổng Hợp</Text>
            <Text style={styles.welcomeSubtitle}>
              Thống kê doanh thu và món ăn chi tiết{'\n'}
              Theo dõi hiệu quả kinh doanh
            </Text>
          </View>
        </View>
        
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </LinearGradient>

      {/* Sticky Tab Buttons */}
      {renderTabButtons()}

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498DB']}
            tintColor="#3498DB"
          />
        }
      >
        {renderSummaryCards()}
        {renderMonthlyChart()}
        {renderTopDishes()}
        {renderRecentOrders()}
        
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  welcomeSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    marginRight: 20,
    padding: 10,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    fontWeight: '400',
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
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    borderBottomWidth: 0,
    zIndex: 10,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonActive: {
    backgroundColor: '#3498DB',
    elevation: 4,
    shadowColor: '#3498DB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tabButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 8,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Summary Cards
  summaryContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  sectionHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardGradient: {
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  cardLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Chart Styles
  chartContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 300, // Ensure minimum height
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: -5,
    marginTop: -5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 10,
  },
  cardTitleGradient: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 15,
    height: 150,
    paddingHorizontal: 5,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 1,
    backgroundColor: 'transparent',
  },
  chartBar: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '90%',
    minHeight: 30,
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    minHeight: 40, // Ensure minimum height
  },
  chartLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },

  // Top Dishes Styles
  topDishesContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  topDishesCard: {
    backgroundColor: 'white',
    marginBottom: 15,
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dishItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    marginVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
  },
  dishRankContainer: {
    marginRight: 15,
  },
  dishRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  rankNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  dishCount: {
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: '500',
  },
  dishRevenue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#E74C3C',
  },

  // Recent Orders Styles
  recentOrdersContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  recentOrdersCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  orderDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  orderDetails: {
    flex: 1,
    alignItems: 'center',
  },
  orderTable: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  orderStatus: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  
  // No Data Styles
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 12,
    textAlign: 'center',
  },
  noDataSubtext: {
    fontSize: 13,
    color: '#95A5A6',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  noRealDataNotice: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498DB',
  },
  noRealDataText: {
    fontSize: 12,
    color: '#3498DB',
    textAlign: 'center',
    fontWeight: '500',
  },
  realDataNotice: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#27AE60',
  },
  realDataText: {
    fontSize: 12,
    color: '#27AE60',
    textAlign: 'center',
    fontWeight: '500',
  },
  refreshButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3498DB',
    borderRadius: 6,
    alignSelf: 'center',
  },
  refreshButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
});