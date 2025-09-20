import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="shield-account" size={50} color="#FF6B35" />
        <Text style={styles.headerText}>Admin Dashboard</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurant Management</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('MenuManager')}
        >
          <MaterialCommunityIcons name="food" size={24} color="#2C3E50" />
          <Text style={styles.menuText}>Quản Lý Danh Sách Món</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="clipboard-list" size={24} color="#2C3E50" />
          <Text style={styles.menuText}>Quản Lý Order</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="table-furniture" size={24} color="#2C3E50" />
          <Text style={styles.menuText}>Quản Lý Danh Sách Bàn</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#BDC3C7" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="account-group" size={24} color="#2C3E50" />
          <Text style={styles.menuText}>Quản Lý Tài Khoản</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#BDC3C7" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống Kê & Báo Cáo</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <MaterialCommunityIcons name="chart-line" size={24} color="#2C3E50" />
          <Text style={styles.menuText}>Thống Kê Doanh Thu</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#BDC3C7" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 15,
  },
});