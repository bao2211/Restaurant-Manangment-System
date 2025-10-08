import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { showInfo } = useToast();
  const [currentUser, setCurrentUser] = useState(user);

  // Update user state whenever the context changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Also update when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setCurrentUser(user); // cập nhật user khi tab Profile được focus
    }, [user])
  );

  if (!currentUser) {
    return (
      <ScrollView style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image 
            source={require('../assets/RMSIcon.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Profile</Text>
            <Text style={styles.headerSubText}>Please log in to continue</Text>
          </View>
        </View>

        {/* Login Prompt Section */}
        <View style={styles.loginPromptSection}>
          <View style={styles.loginCard}>
            <MaterialCommunityIcons name="account-circle-outline" size={100} color="#FF6B35" />
            <Text style={styles.promptTitle}>Welcome!</Text>
            <Text style={styles.promptText}>You are not logged in yet</Text>
            
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
              <MaterialCommunityIcons name="login" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={() => {
                showInfo('Tạo tài khoản mới để trải nghiệm đầy đủ tính năng của ứng dụng', {
                  title: '✨ Tạo tài khoản mới',
                  duration: 3000
                });
                navigation.navigate('Register');
              }}
            >
              <MaterialCommunityIcons name="account-plus" size={20} color="#FF6B35" style={styles.buttonIcon} />
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  const profileMenuItems = [
    { id: 1, title: 'My Orders', icon: 'clipboard-list', action: () => navigation.navigate('Orders'), color: '#4CAF50' },
    { 
      id: 2, 
      title: 'Update Information', 
      icon: 'account-edit', 
      action: () => {
        showInfo('Bạn có thể cập nhật thông tin cá nhân tại đây', {
          title: 'ℹ️ Cập nhật thông tin',
          duration: 3000
        });
        navigation.navigate('UpdateInformation');
      }, 
      color: '#3498DB' 
    },
    { id: 3, title: 'Change Password', icon: 'lock-reset', action: () => navigation.navigate('ChangePassword'), color: '#fccb72ff' },
    
    //{ id: 4, title: 'Order History', icon: 'history', action: () => navigation.navigate('OrderHistory'), color: '#2196F3' },
    //{ id: 5, title: 'Help & Support', icon: 'help-circle', action: () => navigation.navigate('Support'), color: '#9C27B0' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Image 
          source={require('../assets/RMSIcon.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Profile</Text>
          <Text style={styles.headerSubText}>Manage your account</Text>
        </View>
      </View>

      {/* Profile Info Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account-circle" size={80} color="#FF6B35" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userName}>{currentUser.fullName || currentUser.userName}</Text>
              <Text style={styles.userDetail}>@{currentUser.userName}</Text>
            </View>
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="email" size={20} color="#34495E" />
              <Text style={styles.detailText}>{currentUser.email || 'No email provided'}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account" size={20} color="#34495E" />
              <Text style={styles.detailText}>User ID: {currentUser.userId}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Combined Menu Section */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account Options</Text>
        <View style={styles.menuList}>
          {profileMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuButton, { backgroundColor: item.color }]}
              onPress={item.action}
            >
              <MaterialCommunityIcons name={item.icon} size={24} color="white" />
              <Text style={styles.menuButtonText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Additional Account Management */}
      <View style={styles.additionalSection}>
        <Text style={styles.sectionTitle}>Quản lý tài khoản</Text>
        <TouchableOpacity 
          style={styles.createAccountButton}
          onPress={() => {
            showInfo('Tạo tài khoản mới cho nhân viên hoặc thành viên khác', {
              title: '👥 Tạo tài khoản mới',
              duration: 3000
            });
            navigation.navigate('Register');
          }}
        >
          <MaterialCommunityIcons name="account-plus" size={24} color="white" />
          <Text style={styles.createAccountButtonText}>Tạo tài khoản mới</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Header Section Styles
  headerSection: {
    backgroundColor: '#2C3E50',
    padding: 30,
    alignItems: 'center',
    flexDirection: 'row',
  },
  logoImage: {
    width: 60,
    height: 60,
    marginRight: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
  },
  headerSubText: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'left',
    marginTop: 5,
  },
  // Login Prompt Styles (when not logged in)
  loginPromptSection: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  promptTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  promptText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 15,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  registerButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B35',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  registerButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  // Profile Section Styles (when logged in)
  profileSection: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#34495E',
    marginLeft: 15,
    flex: 1,
  },
  // Combined Menu Section Styles
  menuSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  // Additional Section Styles
  additionalSection: {
    padding: 20,
    paddingTop: 0,
  },
  createAccountButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 15,
  },
  createAccountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  menuList: {
    flexDirection: 'column',
  },
  menuButton: {
    width: '48%',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 15,
    alignSelf: 'stretch',
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    textAlign: 'left',
  },
  // Logout Section Styles
  logoutSection: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});