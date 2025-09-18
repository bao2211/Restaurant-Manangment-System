import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import MenuScreen from './screens/MenuScreen';
import OrdersScreen from './screens/OrdersScreen';
import ProfileScreen from './screens/ProfileScreen';
import TableScreen from './screens/TableScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Menu') {
              iconName = focused ? 'food' : 'food-outline';
            } else if (route.name === 'Orders') {
              iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'account' : 'account-outline';
            } else if (route.name === 'Table') {
              iconName = focused ? 'table' : 'table-outline';
            }
            

            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: '#2C3E50',
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerTitle: 'Delicious Bites' }}
        />
        <Tab.Screen 
          name="Menu" 
          component={MenuScreen} 
          options={{ headerTitle: 'Our Menu' }}
        />
        <Tab.Screen 
          name="Orders" 
          component={OrdersScreen} 
          options={{ headerTitle: 'My Orders' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ headerTitle: 'Profile' }}
        />
        <Tab.Screen 
          name="Table" 
          component={TableScreen} 
          options={{ headerTitle: 'Table' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
