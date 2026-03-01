import React, { useState, useContext } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView 
} from "react-native";

// screens
import HomeScreen from "./screens/HomeScreen";
import MenuScreen from "./screens/MenuScreen";
import OrdersScreen from "./screens/OrdersScreen";
import OrderDetailScreen from "./screens/OrderDetailScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import UpdateInformationScreen from "./screens/UpdateInformationScreen";
import RegisterScreen from "./screens/RegisterScreen";
import FavoritesScreen from "./screens/FavoritesScreen";
import CartScreen from "./screens/CartScreen";

// context
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CartProvider, useCart } from "./context/CartContext";
import TableScreen from './screens/TableScreen';
import BillManagerScreen from './screens/BillManagerScreen';
import ReportScreen from './screens/ReportScreen';
import MenuManagerScreen from './screens/MenuManagerScreen';
import OrderDetailManagerScreen from './screens/OrderDetailManagerScreen';
import IngredientManagerScreen from './screens/IngredientManagerScreen';
import UserManagementScreen from './screens/UserManagementScreen';


const Stack = createStackNavigator();
const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.3;

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerTitle: "Profile" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpdateInformation"
        component={UpdateInformationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

// Protected Screen Component
function ProtectedScreen({ children, screenName, fallbackScreen = 'Home' }) {
  const { hasAccessToScreen } = useContext(AuthContext);
  const navigation = useNavigation();

  React.useEffect(() => {
    if (!hasAccessToScreen(screenName)) {
      console.log(`Access denied to ${screenName}, redirecting to ${fallbackScreen}`);
      navigation.replace(fallbackScreen);
    }
  }, [screenName, hasAccessToScreen, navigation, fallbackScreen]);

  if (!hasAccessToScreen(screenName)) {
    return (
      <View style={styles.accessDeniedContainer}>
        <MaterialCommunityIcons name="lock" size={60} color="#BDC3C7" />
        <Text style={styles.accessDeniedTitle}>Access Denied</Text>
        <Text style={styles.accessDeniedText}>You don't have permission to access this screen</Text>
      </View>
    );
  }

  return children;
}

// Cart Header Button Component
function CartHeaderButton({ navigation }) {
  const { getTotalItems } = useCart();
  const { getUserRole } = useContext(AuthContext);
  const totalItems = getTotalItems();
  const userRole = getUserRole();

  // Don't show cart button for Admin users
  if (userRole === 'Admin' || userRole === 'admin' || userRole === 'ADMIN') {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.cartButton}
      onPress={() => navigation.navigate('Cart')}
    >
      <MaterialCommunityIcons name="cart" size={24} color="white" />
      {totalItems > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{totalItems}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Main App Stack with Hamburger Menu
function MainAppStack({ openSidebar }) {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#2C3E50',
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerLeft: ({ canGoBack }) => (
          <TouchableOpacity
            style={styles.hamburgerButton}
            onPress={openSidebar}
          >
            <MaterialCommunityIcons name="menu" size={24} color="white" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          headerTitle: 'Delicious Bites',
        }}
      />
      <Stack.Screen 
        name="Menu" 
        options={{ 
          headerTitle: 'Our Menu',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="Menu">
            <MenuScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Orders" 
        options={{ 
          headerTitle: 'My Orders',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="Orders">
            <OrdersScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Table" 
        options={{ 
          headerTitle: 'Our Table',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="Table">
            <TableScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="BillManager" 
        options={{ 
          headerTitle: 'Bill Management',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="BillManager">
            <BillManagerScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Report" 
        options={{ 
          headerTitle: 'Our Report',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="Report">
            <ReportScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ 
          headerTitle: 'My Profile',
        }}
      />
      <Stack.Screen 
        name="Favorites" 
        options={{ 
          headerTitle: 'Yêu Thích',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="Favorites">
            <FavoritesScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="Cart" 
        options={({ navigation }) => ({ 
          headerTitle: 'Giỏ Hàng',
          headerRight: () => <CartHeaderButton navigation={navigation} />,
        })}
      >
        {(props) => (
          <ProtectedScreen screenName="Cart">
            <CartScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="OrderDetail" 
        options={{ 
          headerTitle: 'Order Details',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="OrderDetail">
            <OrderDetailScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="MenuManager" 
        options={{ 
          headerTitle: 'Quản Lý Món Ăn',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="MenuManager">
            <MenuManagerScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="IngredientManager" 
        options={{ 
          headerTitle: 'Quản Lý Nguyên Liệu',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="IngredientManager">
            <IngredientManagerScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="OrderDetailManager" 
        options={{ 
          headerTitle: 'Trạng Thái Món Ăn',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="OrderDetailManager">
            <OrderDetailManagerScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen 
        name="UserManagement" 
        options={{ 
          headerTitle: 'Quản Lý Người Dùng',
        }}
      >
        {(props) => (
          <ProtectedScreen screenName="UserManagement">
            <UserManagementScreen {...props} />
          </ProtectedScreen>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerTitle: "Profile" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerTitle: "Change Password" }}
      />
      <Stack.Screen
        name="UpdateInformation"
        component={UpdateInformationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}



// Custom Sidebar Menu Component
function CustomSidebarMenu({ visible, onClose }) {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const { user, getUserRole, getAccessibleMenuItems } = useContext(AuthContext);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const navigation = useNavigation();

  const handleMenuItemPress = (screenName) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 300);
  };

  const menuItems = [
    { name: 'Home', icon: 'home', title: 'Home', screen: 'Home' },
    { name: 'Menu', icon: 'food', title: 'Our Menu', screen: 'Menu' },
    { name: 'Favorites', icon: 'heart', title: 'Yêu Thích', screen: 'Favorites' },
    { name: 'Cart', icon: 'cart', title: 'Giỏ Hàng', screen: 'Cart' },
    { name: 'Orders', icon: 'clipboard-list', title: 'My Orders', screen: 'Orders' },
    { name: 'OrderDetail', icon: 'clipboard-text', title: 'Order Details', screen: 'OrderDetail' },
    { name: 'Table', icon: 'table-chair', title: 'Our Table', screen: 'Table' },
    { name: 'BillManager', icon: 'receipt', title: 'Bill Management', screen: 'BillManager' },
    { name: 'Report', icon: 'file-chart', title: 'Our Report', screen: 'Report' },
    { name: 'Profile', icon: 'account', title: 'My Profile', screen: 'Profile' },
  ];

  const managementItems = [
    { name: 'MenuManager', icon: 'silverware-fork-knife', title: 'Quản Lý Món Ăn', screen: 'MenuManager' },
    { name: 'IngredientManager', icon: 'food-apple', title: 'Quản Lý Nguyên Liệu', screen: 'IngredientManager' },
    { name: 'OrderDetailManager', icon: 'food-fork-drink', title: 'Trạng Thái Món Ăn', screen: 'OrderDetailManager' },
    { name: 'UserManagement', icon: 'account-group', title: 'Quản Lý Người Dùng', screen: 'UserManagement' },
  ];

  const { mainMenu, managementMenu } = getAccessibleMenuItems();
  const userRole = getUserRole();
  console.log('CustomSidebarMenu - Current user role:', userRole);
  console.log('CustomSidebarMenu - Accessible main menu items:', mainMenu.length);
  console.log('CustomSidebarMenu - Accessible management menu items:', managementMenu.length);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View 
              style={[
                styles.sidebarContainer,
                {
                  width: SIDEBAR_WIDTH,
                  transform: [{ translateX: slideAnim }]
                }
              ]}
            >
              <View style={styles.sidebarHeader}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={40} color="#FF6B35" />
                <Text style={styles.sidebarHeaderTitle}>Delicious Bites</Text>
                <Text style={styles.sidebarHeaderSubtitle}>Restaurant Management</Text>
                {user && (
                  <Text style={styles.userRoleText}>Role: {userRole}</Text>
                )}
              </View>
              
              <ScrollView 
                style={styles.sidebarItems}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.sidebarItemsContent}
              >
                {mainMenu.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Main Menu</Text>
                    {mainMenu.map((item) => (
                      <TouchableOpacity 
                        key={item.name}
                        style={styles.sidebarItem}
                        onPress={() => handleMenuItemPress(item.screen)}
                      >
                        <MaterialCommunityIcons name={item.icon} size={24} color="#2C3E50" />
                        <Text style={styles.sidebarItemText}>{item.title}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#BDC3C7" />
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {managementMenu.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>Management</Text>
                    {managementMenu.map((item) => (
                      <TouchableOpacity 
                        key={item.name}
                        style={styles.sidebarItem}
                        onPress={() => handleMenuItemPress(item.screen)}
                      >
                        <MaterialCommunityIcons name={item.icon} size={24} color="#FF6B35" />
                        <Text style={[styles.sidebarItemText, { color: '#FF6B35' }]}>{item.title}</Text>
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#BDC3C7" />
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {mainMenu.length === 0 && managementMenu.length === 0 && (
                  <View style={styles.noAccessContainer}>
                    <MaterialCommunityIcons name="lock" size={40} color="#BDC3C7" />
                    <Text style={styles.noAccessText}>No accessible screens for your role</Text>
                    <Text style={styles.noAccessSubtext}>Contact your administrator</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.sidebarFooter}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <MaterialCommunityIcons name="close" size={20} color="#7F8C8D" />
                  <Text style={styles.closeButtonText}>Close Menu</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}



const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarHeader: {
    backgroundColor: '#2C3E50',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  sidebarHeaderTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  sidebarHeaderSubtitle: {
    color: '#BDC3C7',
    fontSize: 14,
    marginTop: 5,
  },
  sidebarItems: {
    flex: 1,
  },
  sidebarItemsContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sidebarItemText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 15,
    fontWeight: '500',
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    padding: 20,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  closeButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7F8C8D',
  },
  hamburgerButton: {
    marginLeft: 15,
    padding: 5,
  },
  userRoleText: {
    color: '#BDC3C7',
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noAccessText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  noAccessSubtext: {
    fontSize: 12,
    color: '#BDC3C7',
    textAlign: 'center',
    marginTop: 5,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
});

// App Container with Sidebar
function AppContainer() {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const openSidebar = () => setSidebarVisible(true);
  const closeSidebar = () => setSidebarVisible(false);

  return (
    <>
      <MainAppStack openSidebar={openSidebar} />
      <CustomSidebarMenu 
        visible={sidebarVisible}
        onClose={closeSidebar}
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppContainer />
          </NavigationContainer>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

