import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// screens
import HomeScreen from "./screens/HomeScreen";
import MenuScreen from "./screens/MenuScreen";
import OrdersScreen from "./screens/OrdersScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";

// context
import { AuthProvider } from "./context/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline";
              } else if (route.name === "Menu") {
                iconName = focused ? "food" : "food-outline";
              } else if (route.name === "Orders") {
                iconName = focused
                  ? "clipboard-list"
                  : "clipboard-list-outline";
              } else if (route.name === "Profile") {
                iconName = focused ? "account" : "account-outline";
              }

              return (
                <MaterialCommunityIcons
                  name={iconName}
                  size={size}
                  color={color}
                />
              );
            },
            tabBarActiveTintColor: "#FF6B35",
            tabBarInactiveTintColor: "gray",
            tabBarStyle: {
              backgroundColor: "white",
              borderTopWidth: 1,
              borderTopColor: "#E0E0E0",
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            headerStyle: {
              backgroundColor: "#2C3E50",
            },
            headerTintColor: "white",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 18,
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerTitle: "Delicious Bites" }}
          />
          <Tab.Screen
            name="Menu"
            component={MenuScreen}
            options={{ headerTitle: "Our Menu" }}
          />
          <Tab.Screen
            name="Orders"
            component={OrdersScreen}
            options={{ headerTitle: "My Orders" }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileStack} 
            options={{ headerShown: "My Profile" }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

