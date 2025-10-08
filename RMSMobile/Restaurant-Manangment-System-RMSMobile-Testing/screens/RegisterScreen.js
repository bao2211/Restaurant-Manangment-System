import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Vibration
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../services/apiService';

export default function RegisterScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const { showSuccess, showError, showWarning } = useToast();
  
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
  });
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.userName.trim()) {
      newErrors.userName = 'Tên đăng nhập không được để trống';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.userName)) {
      newErrors.userName = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (formData.password.length > 20) {
      newErrors.password = 'Mật khẩu không được quá 20 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Vibration.vibrate(200);
      showWarning('Vui lòng kiểm tra và sửa các lỗi trong form', {
        title: '⚠️ Thông tin chưa hợp lệ',
        duration: 4000
      });
      return;
    }

    setIsRegistering(true);
    try {
      // Generate a unique UserId (exactly 10 characters for SQL Server char(10))
      const timestamp = Date.now().toString();
      const lastDigits = timestamp.slice(-6); // Get last 6 digits of timestamp
      const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4 random digits
      const userId = lastDigits + randomDigits; // Total: 10 characters

      // Prepare user data for registration
      const userData = {
        UserId: userId, // Required by API
        UserName: formData.userName.trim(),
        Password: formData.password,
        FullName: formData.fullName.trim(),
        Email: formData.email.trim() || null, // Don't generate default email to avoid unique constraint conflicts
        Phone: formData.phone.trim() ? parseInt(formData.phone.trim(), 10) : null, // Convert to integer or null
        Role: 'Staff', // Default role for new users
        Right: 'USER', // Default rights
      };

      // Validate phone number conversion
      if (formData.phone.trim() && (isNaN(userData.Phone) || userData.Phone <= 0)) {
        showError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại đúng định dạng.', {
          title: '❌ Lỗi số điện thoại',
          duration: 4000
        });
        setIsRegistering(false);
        return;
      }

      // Additional validation for SQL Server constraints
      if (userData.Phone && userData.Phone.toString().length > 10) {
        showError('Số điện thoại quá dài. Vui lòng nhập tối đa 10 chữ số.', {
          title: '❌ Lỗi số điện thoại',
          duration: 4000
        });
        setIsRegistering(false);
        return;
      }

      if (userData.UserName.length > 50) {
        showError('Tên đăng nhập quá dài. Vui lòng nhập tối đa 50 ký tự.', {
          title: '❌ Lỗi tên đăng nhập',
          duration: 4000
        });
        setIsRegistering(false);
        return;
      }

      if (userData.Email.length > 100) {
        showError('Email quá dài. Vui lòng nhập tối đa 100 ký tự.', {
          title: '❌ Lỗi email',
          duration: 4000
        });
        setIsRegistering(false);
        return;
      }

      if (userData.Password.length > 20) {
        showError('Mật khẩu quá dài. Vui lòng nhập tối đa 20 ký tự.', {
          title: '❌ Lỗi mật khẩu',
          duration: 4000
        });
        setIsRegistering(false);
        return;
      }

      if (userData.FullName && userData.FullName.length > 250) {
        showError('Họ tên quá dài. Vui lòng nhập tối đa 250 ký tự.', {
          title: '❌ Lỗi họ tên',
          duration: 4000
        });
        setIsRegistering(false);
        return;
      }

      console.log('Registering new user:', { ...userData, Password: '[HIDDEN]' });

      // Create user via API
      const response = await apiService.createUser(userData);
      console.log('Registration response:', response);

      // Success vibration
      Vibration.vibrate([0, 100, 50, 100]);

      // Show success toast
      showSuccess(
        `Chào mừng ${formData.fullName}! Tài khoản của bạn đã được tạo thành công.`,
        {
          title: '🎉 Đăng ký thành công!',
          duration: 5000,
          actionText: 'Đăng nhập ngay',
          onActionPress: () => {
            // Auto-login after successful registration
            handleAutoLogin();
          }
        }
      );

      // Show detailed success alert
      setTimeout(() => {
        Alert.alert(
          '🎉 Đăng ký thành công!',
          `Chào mừng ${formData.fullName}!\n\nTài khoản của bạn đã được tạo với thông tin:\n✅ Tên đăng nhập: ${formData.userName}\n✅ Họ tên: ${formData.fullName}\n✅ Email: ${formData.email || 'Chưa cập nhật'}\n✅ Số điện thoại: ${formData.phone || 'Chưa cập nhật'}\n\nBạn có muốn đăng nhập ngay không?`,
          [
            {
              text: '🏠 Về trang chủ',
              style: 'cancel',
              onPress: () => navigation.navigate('Home')
            },
            {
              text: '🔑 Đăng nhập ngay',
              onPress: () => handleAutoLogin()
            }
          ]
        );
      }, 1000);

    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Vibration.vibrate(200);

      let errorMessage = 'Có lỗi xảy ra khi tạo tài khoản';
      let errorDetails = '';
      
      if (error.response?.status === 400) {
        // Handle validation errors
        errorMessage = 'Thông tin đăng ký không hợp lệ';
        if (error.response.data?.errors) {
          // Extract validation error details
          const validationErrors = error.response.data.errors;
          const errorList = Object.keys(validationErrors).map(field => 
            `• ${field}: ${validationErrors[field].join(', ')}`
          ).join('\n');
          errorDetails = `\n\nChi tiết lỗi:\n${errorList}`;
        } else if (error.response.data?.title) {
          errorDetails = `\n\nChi tiết: ${error.response.data.title}`;
        }
      } else if (error.response?.status === 409) {
        // Handle unique constraint violations
        const errorData = error.response.data;
        if (errorData && typeof errorData === 'string') {
          if (errorData.includes('UserName') || errorData.includes('IX_User')) {
            errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
          } else if (errorData.includes('Phone') || errorData.includes('IX_User_1')) {
            errorMessage = 'Số điện thoại đã được sử dụng. Vui lòng sử dụng số khác.';
          } else if (errorData.includes('Email') || errorData.includes('IX_User_2')) {
            errorMessage = 'Email đã được sử dụng. Vui lòng sử dụng email khác.';
          } else {
            errorMessage = 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.';
          }
        } else {
          errorMessage = 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.';
        }
      } else if (error.response?.status === 500) {
        // Handle 500 Internal Server Error (often constraint violations)
        const errorData = error.response.data;
        errorMessage = 'Lỗi máy chủ nội bộ';
        
        if (errorData?.message) {
          if (errorData.message.includes('UNIQUE constraint') || errorData.message.includes('duplicate')) {
            errorMessage = 'Thông tin đã tồn tại trong hệ thống. Vui lòng kiểm tra tên đăng nhập, email hoặc số điện thoại.';
          } else if (errorData.message.includes('entity changes')) {
            errorMessage = 'Không thể lưu thông tin người dùng. Vui lòng kiểm tra dữ liệu đầu vào.';
          } else {
            errorDetails = `\n\nChi tiết: ${errorData.message}`;
          }
        }
      } else if (error.message) {
        if (error.message.includes('duplicate') || error.message.includes('exists')) {
          errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.';
        } else if (error.message.includes('network') || error.message.includes('Network')) {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
        } else {
          errorMessage = error.message;
        }
      }

      showError(errorMessage, {
        title: '❌ Đăng ký thất bại',
        duration: 6000,
        actionText: 'Thử lại',
        onActionPress: () => handleRegister()
      });

      // Also show detailed error alert
      setTimeout(() => {
        Alert.alert(
          '❌ Đăng ký thất bại',
          `Rất tiếc! Không thể tạo tài khoản của bạn.\n\n🔍 Chi tiết lỗi:\n${errorMessage}${errorDetails}\n\n💡 Gợi ý:\n• Kiểm tra kết nối internet\n• Thử tên đăng nhập khác\n• Kiểm tra định dạng số điện thoại\n• Liên hệ hỗ trợ nếu lỗi tiếp tục`,
          [
            {
              text: '🔄 Thử lại',
              onPress: () => handleRegister()
            },
            {
              text: '❌ Đóng',
              style: 'cancel'
            }
          ]
        );
      }, 1000);

    } finally {
      setIsRegistering(false);
    }
  };

  const handleAutoLogin = async () => {
    try {
      const success = await login(formData.userName, formData.password);
      if (success) {
        showSuccess('Đăng nhập thành công!', {
          title: '🔑 Chào mừng!',
          duration: 3000
        });
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      navigation.navigate('Login');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Image 
          source={require('../assets/RMSIcon.png')} 
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>Đăng ký tài khoản</Text>
          <Text style={styles.headerSubText}>Tạo tài khoản mới để sử dụng</Text>
        </View>
      </View>

      {/* Registration Form */}
      <View style={styles.formSection}>
        <View style={styles.formCard}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <MaterialCommunityIcons name="account-plus" size={60} color="#FF6B35" />
            <Text style={styles.welcomeTitle}>Tạo tài khoản mới</Text>
            <Text style={styles.welcomeText}>Điền thông tin bên dưới để tạo tài khoản</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.inputSection}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên đăng nhập *</Text>
              <View style={[styles.inputContainer, errors.userName && styles.inputError]}>
                <MaterialCommunityIcons name="account" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.userName}
                  onChangeText={(value) => handleInputChange('userName', value)}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor="#BDC3C7"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                <MaterialCommunityIcons name="account-outline" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#BDC3C7"
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu *</Text>
              <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                <MaterialCommunityIcons name="lock" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#BDC3C7"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#7F8C8D" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <Text style={styles.passwordHint}>6-20 ký tự, bao gồm chữ hoa, chữ thường và số</Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu *</Text>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                <MaterialCommunityIcons name="lock-check" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#BDC3C7"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <MaterialCommunityIcons 
                    name={showConfirmPassword ? "eye" : "eye-off"} 
                    size={20} 
                    color="#7F8C8D" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email (tùy chọn)</Text>
              <View style={[styles.inputContainer, errors.email && styles.inputError]}>
                <MaterialCommunityIcons name="email" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Nhập địa chỉ email"
                  placeholderTextColor="#BDC3C7"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại (tùy chọn)</Text>
              <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                <MaterialCommunityIcons name="phone" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#BDC3C7"
                  keyboardType="phone-pad"
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.registerButton, isRegistering && styles.buttonDisabled]} 
          onPress={handleRegister}
          disabled={isRegistering}
        >
          {isRegistering ? (
            <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
          ) : (
            <MaterialCommunityIcons name="account-plus" size={20} color="white" style={styles.buttonIcon} />
          )}
          <Text style={styles.registerButtonText}>
            {isRegistering ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginLinkButton} 
          onPress={() => navigation.navigate('Login')}
          disabled={isRegistering}
        >
          <MaterialCommunityIcons name="login" size={20} color="#3498DB" style={styles.buttonIcon} />
          <Text style={styles.loginLinkButtonText}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isRegistering}
        >
          <MaterialCommunityIcons name="close" size={20} color="#E74C3C" style={styles.buttonIcon} />
          <Text style={styles.cancelButtonText}>Hủy</Text>
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
  // Header Section
  headerSection: {
    backgroundColor: '#2C3E50',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  logoImage: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubText: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 2,
  },
  // Form Section
  formSection: {
    padding: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 15,
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  // Input Styles
  inputSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: '#E74C3C',
    backgroundColor: '#FDF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  passwordHint: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 5,
  },
  // Action Section
  actionSection: {
    padding: 20,
    paddingBottom: 40,
  },
  registerButton: {
    backgroundColor: '#27AE60',
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
  loginLinkButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3498DB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E74C3C',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7',
    elevation: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkButtonText: {
    color: '#3498DB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: 'bold',
  },
});