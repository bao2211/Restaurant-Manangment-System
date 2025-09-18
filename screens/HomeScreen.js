import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const quickActions = [
    { id: 1, title: 'View Menu', icon: 'food', screen: 'Menu', color: '#FF6B35' },
    { id: 2, title: 'My Orders', icon: 'clipboard-list', screen: 'Orders', color: '#4CAF50' },
    { id: 3, title: 'Reservations', icon: 'calendar', screen: 'Reservations', color: '#2196F3' },
    { id: 4, title: 'Table', icon: 'table', screen: 'Table', color: '#FF5722' },
  ];

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: action.color }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <MaterialCommunityIcons name={action.icon} size={32} color="white" />
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <Text style={styles.aboutText}>
          We serve the finest cuisine with fresh ingredients sourced locally. 
          Our chefs bring years of experience to create memorable dining experiences 
          for our valued customers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  welcomeSection: {
    backgroundColor: '#2C3E50',
    padding: 30,
    alignItems: 'center',
    flexDirection: 'row',
  },
  logoImage: {
    width: 80,
    height: 80,
    marginRight: 20,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
    lineHeight: 30,
  },
  featuredSection: {
    padding: 20,
    alignItems: 'center',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#34495E',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredText: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  aboutSection: {
    padding: 20,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  aboutText: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
  },
});