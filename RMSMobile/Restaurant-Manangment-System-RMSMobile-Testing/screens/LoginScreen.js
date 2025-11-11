import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, ScrollView, Image, KeyboardAvoidingView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Demo accounts for display - Real accounts from database
const demoAccounts = [
  { username: 'VAnh', password: 'VAnh123', role: 'Admin', color: ['#FF6B6B', '#FF8E53'] },
  { username: 'bao', password: 'bao2211', role: 'TN', color: ['#4ECDC4', '#44A08D'] },
  { username: 'khang', password: 'khang123', role: 'Bếp', color: ['#FFD93D', '#F4A261'] },
  { username: 'ngoc', password: 'Ngoc123', role: 'Customer', color: ['#FD79A8', '#FDCB6E'] },
  { username: 'abc', password: 'abc1234', role: 'NV', color: ['#A8E6CF', '#56C596'] },
];

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!username || !password) {
    if (Platform.OS === "web") {
      alert("Vui lòng nhập đầy đủ thông tin");
    } else {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
    }
    return;
  }

  try {
    await login(username, password);
    if (Platform.OS === "web") {
      alert("Đăng nhập thành công!");
    } else {
      Alert.alert("Thành công", "Đăng nhập thành công!");
    }
    // Navigate to Home screen 
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home', state: { routes: [{ name: 'Profile' }] } }],
    });
  } catch (error) {
    if (Platform.OS === "web") {
      alert(error.message);
    } else {
      Alert.alert("Lỗi", error.message);
    }
  }
  };

  const handleQuickLogin = (account) => {
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.backgroundGradient}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {/* Left Side - Login Form */}
          <View style={styles.leftSection}>
            <View style={styles.loginCard}>
              {/* Logo */}
              <View style={styles.logoSection}>
                <View style={styles.logoCircle}>
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E53']}
                    style={styles.logoGradient}
                  >
                    <MaterialCommunityIcons name="silverware-fork-knife" size={40} color="white" />
                  </LinearGradient>
                </View>
                <Text style={styles.brandTitle}>RMS</Text>
                <Text style={styles.brandSubtitle}>Restaurant Management System</Text>
              </View>

              {/* Welcome Text */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeSubtitle}>Please login to your account</Text>
              </View>

              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <View style={styles.inputGroup}>
                  <MaterialCommunityIcons name="account-outline" size={20} color="#667eea" style={styles.inputIconLeft} />
                  <TextInput
                    placeholder="Username"
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#667eea" style={styles.inputIconLeft} />
                  <TextInput
                    placeholder="Password"
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialCommunityIcons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#667eea" />
                </View>
              ) : (
                <TouchableOpacity onPress={handleLogin}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.loginButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue as</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Guest Button */}
              <TouchableOpacity 
                style={styles.guestButton} 
                onPress={() => navigation.navigate('Home')}
              >
                <MaterialCommunityIcons name="account-question-outline" size={18} color="#667eea" />
                <Text style={styles.guestButtonText}>Guest</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Side - Demo Accounts */}
          <View style={styles.rightSection}>
            <View style={styles.demoAccountsCard}>
              <View style={styles.demoHeader}>
                <MaterialCommunityIcons name="account-group" size={28} color="#667eea" />
                <Text style={styles.demoTitle}>Demo Accounts</Text>
                <Text style={styles.demoSubtitle}>Tap any account to quick login</Text>
              </View>

              <ScrollView 
                style={styles.accountsList}
                showsVerticalScrollIndicator={false}
              >
                {demoAccounts.map((account, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.accountCard}
                    onPress={() => handleQuickLogin(account)}
                  >
                    <LinearGradient
                      colors={account.color}
                      style={styles.accountGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.accountHeader}>
                        <View style={styles.accountIconCircle}>
                          <MaterialCommunityIcons 
                            name={account.role === 'Admin' ? 'shield-crown' : 
                                  account.role === 'TN' ? 'cash-register' :
                                  account.role === 'Bếp' ? 'chef-hat' :
                                  account.role === 'NV' ? 'account-tie' :
                                  account.role === 'Customer' ? 'account' : 'account-circle'} 
                            size={24} 
                            color="white" 
                          />
                        </View>
                        <View style={styles.roleBadge}>
                          <Text style={styles.roleText}>{account.role}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.accountInfo}>
                        <View style={styles.infoRow}>
                          <MaterialCommunityIcons name="account-circle" size={16} color="white" />
                          <Text style={styles.accountLabel}>Username:</Text>
                          <Text style={styles.accountValue}>{account.username}</Text>
                        </View>
                        <View style={styles.infoRow}>
                          <MaterialCommunityIcons name="lock" size={16} color="white" />
                          <Text style={styles.accountLabel}>Password:</Text>
                          <Text style={styles.accountValue}>{account.password}</Text>
                        </View>
                      </View>

                      <View style={styles.tapHint}>
                        <MaterialCommunityIcons name="gesture-tap" size={16} color="rgba(255,255,255,0.8)" />
                        <Text style={styles.tapHintText}>Tap to use</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.05,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  mainContent: {
    flexDirection: isTablet ? 'row' : 'column',
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  
  // Left Section - Login Form
  leftSection: {
    flex: isTablet ? 1 : 0,
    paddingRight: isTablet ? 20 : 0,
    marginBottom: isTablet ? 0 : 30,
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 40,
    elevation: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  
  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  
  // Welcome Section
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  
  // Input Styles
  inputContainer: {
    marginBottom: 25,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  inputIconLeft: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 8,
  },
  
  // Button Styles
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 5,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#9CA3AF',
  },
  
  // Guest Button
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  guestButtonText: {
    color: '#667eea',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Right Section - Demo Accounts
  rightSection: {
    flex: isTablet ? 1 : 0,
    paddingLeft: isTablet ? 20 : 0,
  },
  demoAccountsCard: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    elevation: 10,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    maxHeight: isTablet ? 700 : 600,
  },
  demoHeader: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
  },
  demoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 6,
  },
  demoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Account Cards
  accountsList: {
    flex: 1,
  },
  accountCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  accountGradient: {
    padding: 20,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  roleText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  accountInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  accountLabel: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 75,
  },
  accountValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.3,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tapHintText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
