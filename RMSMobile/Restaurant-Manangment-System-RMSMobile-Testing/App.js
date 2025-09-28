import React, { useState } from "react";
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
  TouchableWithoutFeedback 
} from "react-native";

// screens
import HomeScreen from "./screens/HomeScreen";
import MenuScreen from "./screens/MenuScreen";
import OrdersScreen from "./screens/OrdersScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";

// context
import { AuthProvider } from "./context/AuthContext";
import TableScreen from './screens/TableScreen';
import BillScreen from './screens/BillScreen';
import ReportScreen from './screens/ReportScreen';
import MenuManagerScreen from './screens/MenuManagerScreen';
import OrderDetailManagerScreen from './screens/OrderDetailManagerScreen';

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
    </Stack.Navigator>
  );
}

// Main App Stack with Hamburger Menu
function MainAppStack({ openSidebar }) {
  return (
    <Stack.Navigator
      screenOptions={{
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
      }}
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
        component={MenuScreen}
        options={{ 
          headerTitle: 'Our Menu',
        }}
      />
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ 
          headerTitle: 'My Orders',
        }}
      />
      <Stack.Screen 
        name="Table" 
        component={TableScreen}
        options={{ 
          headerTitle: 'Our Table',
        }}
      />
      <Stack.Screen 
        name="Bill" 
        component={BillScreen}
        options={{ 
          headerTitle: 'Our Bill',
        }}
      />
      <Stack.Screen 
        name="Report" 
        component={ReportScreen}
        options={{ 
          headerTitle: 'Our Report',
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ 
          headerTitle: 'My Profile',
        }}
      />
      <Stack.Screen 
        name="MenuManager" 
        component={MenuManagerScreen}
        options={{ 
          headerTitle: 'Quản Lý Món Ăn',
        }}
      />
      <Stack.Screen 
        name="OrderDetailManager" 
        component={OrderDetailManagerScreen}
        options={{ 
          headerTitle: 'Trạng Thái Món Ăn',
        }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerTitle: "Profile" }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerTitle: "Change Password" }}
      />
    </Stack.Navigator>
  );
}



// Custom Sidebar Menu Component
function CustomSidebarMenu({ visible, onClose }) {
  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

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
    { name: 'Orders', icon: 'clipboard-list', title: 'My Orders', screen: 'Orders' },
    { name: 'Table', icon: 'table-chair', title: 'Our Table', screen: 'Table' },
    { name: 'Bill', icon: 'file-document', title: 'Our Bill', screen: 'Bill' },
    { name: 'Report', icon: 'file-chart', title: 'Our Report', screen: 'Report' },
    { name: 'Profile', icon: 'account', title: 'My Profile', screen: 'Profile' },
  ];

  const managementItems = [
    { name: 'MenuManager', icon: 'silverware-fork-knife', title: 'Quản Lý Món Ăn', screen: 'MenuManager' },
    { name: 'OrderDetailManager', icon: 'food-fork-drink', title: 'Trạng Thái Món Ăn', screen: 'OrderDetailManager' },
  ];

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
              </View>
              
              <View style={styles.sidebarItems}>
                <Text style={styles.sectionTitle}>Main Menu</Text>
                {menuItems.map((item) => (
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

                <Text style={styles.sectionTitle}>Management</Text>
                {managementItems.map((item) => (
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
              </View>

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
    paddingTop: 20,
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
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppContainer />
      </NavigationContainer>
    </AuthProvider>
  );
}

