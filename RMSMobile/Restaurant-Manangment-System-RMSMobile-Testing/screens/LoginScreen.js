import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform, ScrollView, Image, KeyboardAvoidingView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';


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

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Image 
            source={require('../assets/RMSIcon.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appTitle}>Restaurant Management</Text>
          <Text style={styles.appSubtitle}>Sign in to continue</Text>
        </View>

        {/* Login Form Section */}
        <View style={styles.formSection}>
          <View style={styles.loginCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="account-circle" size={60} color="#FF6B35" />
              <Text style={styles.loginTitle}>Welcome Back!</Text>
              <Text style={styles.loginSubtitle}>Please sign in to your account</Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  placeholder="Username"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor="#BDC3C7"
                />
              </View>

              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="lock" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#BDC3C7"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#7F8C8D" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={styles.loadingText}>Signing in...</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <MaterialCommunityIcons name="login" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.loginButtonText}>Sign In</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.guestButton} 
              onPress={() => navigation.navigate('Home')}
            >
              <MaterialCommunityIcons name="account-question" size={20} color="#34495E" />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Don't have an account? Contact your administrator
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  // Header Section Styles
  headerSection: {
    backgroundColor: '#2C3E50',
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#BDC3C7',
    textAlign: 'center',
  },
  // Form Section Styles
  formSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loginCard: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 15,
    marginBottom: 5,
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  // Input Styles
  inputContainer: {
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#2C3E50',
  },
  eyeIcon: {
    padding: 5,
  },
  // Button Styles
  loginButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  // Loading Styles
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 25,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7F8C8D',
  },
  // Divider Styles
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#7F8C8D',
  },
  // Guest Button Styles
  guestButton: {
    backgroundColor: '#ECF0F1',
    paddingVertical: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  guestButtonText: {
    color: '#34495E',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Footer Styles
  footerSection: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
  },
});
