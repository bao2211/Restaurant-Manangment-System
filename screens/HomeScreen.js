import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen({ navigation }) {
  const [showSpecialDishes, setShowSpecialDishes] = useState(false);

  // Danh sách món ăn đặc biệt
  const specialDishes = [
    {
      id: 1,
      name: 'Cơm Gà Xối Mỡ Siêu Ngon',
      image: 'https://barona.vn/storage/meo-vat/83/com-ga-xoi-mo.jpg',
      price: '56,000₫',
      description: 'Hương vị đậm đà, gà giòn rụm',
      isHot: true
    },
    {
      id: 2,
      name: 'Mì Xào Bò Wagu Hấp Dẫn',
      image: 'https://maisonmando.com/wp-content/uploads/2022/04/cach-lam-mi-xao-bo-1-1.jpg',
      price: '40,000₫',
      description: 'Bò xào mềm, gia vị đậm đà',
      isHot: true
    },
    {
      id: 3,
      name: 'Cơm Tấm Sườn Bì Chả Siêu To',
      image: 'https://i.ytimg.com/vi/h__kLq8NG2I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDqn7vasJHB1JVJB8uobiB67rxztw',
      price: '45,0000₫',
      description: 'Sườn nướng thơm lừng',
      isNew: true
    },
    {
      id: 4,
      name: 'Bánh Mì Thịt Nướng Ram Ram',
      image: 'https://xebanhangtop1.vn/wp-content/uploads/2023/08/banh-mi-thit-nuong.jpg',
      price: '30,000₫',
      description: 'Bánh mì giòn tan, thịt nướng đậm đà',
      isNew: true
    },
    {
      id: 5,
      name: 'Canh Trứng Cà Chua Thịt Bằm',
      image: 'data:image/jpeg;base64,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',
      price: '50,000₫',
      description: 'Hương vị đậm đà, thịt mềm',
      isHot: true
    },
    {
      id: 6,
      name: 'Cơm Bò KoBe Siêu Ngon Từ Nhật Bản',
      image: 'https://fujifoods.vn/wp-content/uploads/2021/07/com-bo-gyudon-3-2.jpg',
      price: '50,000₫',
      description: 'Bò xào mềm, gia vị đậm đà',
      isHot: true
    },
    {
      id: 7,
      name: 'Canh Cải Xoong Nấu Tôm/Thịt Thanh Mát',
      image: 'https://cdn.tgdd.vn/Files/2021/02/26/1330784/7-cach-lam-canh-cai-nau-tom-de-lam-giai-nhiet-hang-ngay-202102261354138651.jpg',
      price: '35,0000₫',
      description: 'Canh thanh thanh mát mát ngon ngọt',
      isNew: true
    },
    {
      id: 8,
      name: 'Canh Khổ Qua Nhồi Thịt Bổ Dưỡng',
      image: 'https://i-giadinh.vnecdn.net/2022/01/27/Thanh-pham-1-1572-1643216934.jpg',
      price: '50,000₫',
      description: 'Canh khổ qua ăn vào khổ sẽ qua',
      isNew: true
    },
    {
      id: 9,
      name: 'Canh Rong Biển Nấu Với Gì Ngon?',
      image: 'https://cdn.tgdd.vn/2023/11/CookDish/canh-rong-bien-nau-voi-gi-ngon-tong-hop-cac-mon-canh-tu-rong-avt-1200x676.jpg',
      price: '40,0000₫',
      description: 'Canh rong biển từ Thái Bình Dương',
      isNew: true
    },
    {
      id: 10,
      name: 'Canh Bò Trứng Ngon Tuyệt',
      image: 'https://cdn.tgdd.vn/Files/2018/09/05/1115250/3-cach-nau-canh-ca-chua-trung-bo-duong-cho-bua-com-gia-dinh-202205231518387644.jpg',
      price: '55,000₫',
      description: 'Canh bò trứng bổ dưỡng, ngon miệng',
      isNew: true
    },
     {
      id: 11,
      name: 'Trà Đé Đẽ Đè Đê !!!!!!!!!',
      image: 'https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2019/7/25/746291/Tra-Da.jpg',
      price: '4,000₫',
      description: 'Giải khát mùa hè',
      isHot: true
    },
    {
      id: 12,
      name: 'Trà Vải Ngon Vãiiiiii',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSopt8XXBlzr6y7y3WnfVbVAW2EfLIizmDpzA&s',
      price: '882,005₫',
      description: 'Vải thiều Lục Ngạn Bắc Giang',
      isHot: true
    },
    {
      id: 13,
      name: 'Cá Lóc Đồng Nướng Trui',
      image: 'https://toplistcantho.com/wp-content/uploads/2020/07/quan-ca-loc-nuong-ngon-o-can-tho-11.jpg',
      price: '120,000₫',
      description: 'Cá lóc đồng nướng trui thơm ngon',
      isHot: true
    }
  ];

  const handleSpecialDishPress = (dish) => {
    // Chuyển đến trang Menu với thông tin món ăn được chọn
    navigation.navigate('Menu', { selectedDish: dish });
  };

  const toggleSpecialDishes = () => {
    setShowSpecialDishes(!showSpecialDishes);
  };

  const quickActions = [
    { id: 1, title: 'View Menu', icon: 'food', screen: 'Menu', color: '#FF6B35' },
    { id: 2, title: 'My Orders', icon: 'clipboard-list', screen: 'Orders', color: '#4CAF50' },
    { id: 3, title: 'Reservations', icon: 'calendar', screen: 'Reservations', color: '#2196F3' },
    { id: 4, title: 'Table', icon: 'table', screen: 'Table', color: '#FF5722' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>  
        <Image 
          source={require('../assets/RMSIcon.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.welcomeTextContainer}>
          <Text style={styles.welcomeText}>
            Power Your Restaurant{'\n'}With Confidence
          </Text>
        </View>
      </View>

      {/* Featured Image */}
      <View style={styles.featuredSection}>
        <View style={styles.featuredImagePlaceholder}>
          <MaterialCommunityIcons name="silverware-fork-knife" size={60} color="#FF6B35" />
          <Text style={styles.featuredText}>Today's Specialsss</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chức năng chính</Text>
          <Text style={styles.sectionSubtitle}>Truy cập nhanh các tính năng quan trọng</Text>
        </View>
        
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={action.gradient}
                style={styles.actionCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.actionCardContent}>
                  <View style={[styles.actionIconContainer, { backgroundColor: action.iconBg }]}>
                    <MaterialCommunityIcons name={action.icon} size={28} color="white" />
                  </View>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Section */}
      <View style={styles.featuredSection}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.featuredCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.featuredContent}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={50} color="white" />
            <Text style={styles.featuredTitle}>Món đặc biệt hôm nay</Text>
            <Text style={styles.featuredSubtitle}>Khám phá các món ăn được chef khuyến nghị</Text>
            <TouchableOpacity 
              style={styles.featuredButton}
              onPress={toggleSpecialDishes}
            >
              <Text style={styles.featuredButtonText}>Xem ngay</Text>
              <MaterialCommunityIcons 
                name={showSpecialDishes ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="white" 
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Special Dishes Dropdown */}
        {showSpecialDishes && (
          <View style={styles.specialDishesContainer}>
            <View style={styles.dishesHeader}>
              <Text style={styles.specialDishesTitle}>🔥 Món Hot Hôm Nay</Text>
              <Text style={styles.scrollHint}>← Kéo để xem thêm →</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.dishesScrollView}
              contentContainerStyle={styles.dishesScrollContent}
              decelerationRate="fast"
              snapToInterval={155} // Width của card + margin
              snapToAlignment="start"
            >
              {specialDishes.map((dish) => (
                <TouchableOpacity
                  key={dish.id}
                  style={styles.dishCard}
                  onPress={() => handleSpecialDishPress(dish)}
                  activeOpacity={0.8}
                >
                  <View style={styles.dishImageContainer}>
                    <Image 
                      source={{ uri: dish.image }} 
                      style={styles.dishImage}
                      resizeMode="cover"
                    />
                    {dish.isHot && (
                      <View style={styles.hotBadge}>
                        <MaterialCommunityIcons name="fire" size={12} color="white" />
                        <Text style={styles.hotBadgeText}>HOT</Text>
                      </View>
                    )}
                    {dish.isNew && (
                      <View style={styles.newBadge}>
                        <MaterialCommunityIcons name="star" size={12} color="white" />
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName} numberOfLines={2}>{dish.name}</Text>
                    <Text style={styles.dishDescription} numberOfLines={1}>{dish.description}</Text>
                    <View style={styles.dishFooter}>
                      <Text style={styles.dishPrice}>{dish.price}</Text>
                      <TouchableOpacity style={styles.addButton}>
                        <MaterialCommunityIcons name="plus" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('Menu')}
            >
              <Text style={styles.viewAllButtonText}>Xem tất cả món ăn</Text>
              <MaterialCommunityIcons name="arrow-right" size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <MaterialCommunityIcons name="information" size={24} color="#2196F3" />
            <Text style={styles.aboutTitle}>Về chúng tôi</Text>
          </View>
          <Text style={styles.aboutText}>
            Chúng tôi phục vụ những món ăn tinh tế với nguyên liệu tươi ngon được chọn lọc kỹ càng. 
            Đội ngũ đầu bếp giàu kinh nghiệm luôn tạo ra những trải nghiệm ẩm thực đáng nhớ 
            cho khách hàng quý báu của chúng tôi.
          </Text>
        </View>
      </View>

      {/* Bottom spacing */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    padding: 5,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  statsSection: {
    paddingHorizontal: 20,
    marginTop: -20,
    zIndex: 3,
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#ecf0f1',
    marginHorizontal: 10,
  },
  quickActionsSection: {
    padding: 20,
    marginTop: 20,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 20,
    marginBottom: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  actionCardGradient: {
    borderRadius: 20,
    padding: 20,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  featuredSection: {
    padding: 20,
  },
  featuredCard: {
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featuredContent: {
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
    marginBottom: 8,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuredButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  specialDishesContainer: {
    backgroundColor: 'white',
    marginTop: 15,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  dishesHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  specialDishesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 5,
  },
  scrollHint: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  dishesScrollView: {
    marginBottom: 15,
    marginHorizontal: -20, // Để scroll sát mép container
  },
  dishesScrollContent: {
    paddingHorizontal: 20, // Padding cho nội dung scroll
    paddingRight: 5, // Thêm một chút padding cuối
  },
  dishCard: {
    width: 140,
    marginRight: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Đảm bảo card cuối cùng không bị che
    minWidth: 140,
  },
  dishImageContainer: {
    position: 'relative',
    height: 80,
  },
  dishImage: {
    width: '100%',
    height: '100%',
  },
  hotBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hotBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  newBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  dishInfo: {
    padding: 10,
  },
  dishName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    lineHeight: 16,
  },
  dishDescription: {
    fontSize: 10,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    marginTop: 10,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 5,
  },
  aboutSection: {
    padding: 20,
  },
  aboutCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 10,
  },
  aboutText: {
    fontSize: 15,
    color: '#5d6d7e',
    lineHeight: 24,
    textAlign: 'justify',
  },
});