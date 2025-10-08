import React, { useState, useContext, useEffect } from 'react';
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

export default function UpdateInformationScreen({ navigation }) {
  const { user, updateUserProfile, loading } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    userName: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.FullName || '',
        email: user.email || user.Email || '',
        phone: user.phone || user.Phone || '',
        userName: user.userName || user.UserName || ''
      });
    }
  }, [user]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    }

    if (!formData.userName.trim()) {
      newErrors.userName = 'Tên đăng nhập không được để trống';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
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

  const handleUpdateInfo = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare profile data for update
      const profileData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        userName: formData.userName.trim(),
      };

      console.log('Updating user profile with data:', profileData);

      // Use the enhanced updateUserProfile function from AuthContext
      await updateUserProfile(profileData);

      // Add haptic feedback for success (works on both iOS and Android)
      Vibration.vibrate([0, 100, 50, 100]); // Pattern: wait, vibrate, wait, vibrate

      // Show modern toast notification first
      showSuccess(
        `Chào mừng ${formData.fullName}! Thông tin của bạn đã được cập nhật thành công.`,
        {
          title: '🎉 Cập nhật thành công!',
          duration: 5000,
          actionText: 'Xem chi tiết',
          onActionPress: () => {
            // Show detailed alert when user taps action
            Alert.alert(
              '📋 Chi tiết cập nhật', 
              `✅ Họ tên: ${formData.fullName}\n✅ Tên đăng nhập: ${formData.userName}\n✅ Email: ${formData.email || 'Chưa cập nhật'}\n✅ Số điện thoại: ${formData.phone || 'Chưa cập nhật'}\n\nCảm ơn bạn đã cập nhật thông tin!`,
              [
                {
                  text: '🏠 Về trang chính',
                  onPress: () => navigation.navigate('Home')
                },
                {
                  text: '👤 Xem hồ sơ',
                  onPress: () => navigation.goBack()
                }
              ]
            );
          }
        }
      );

      // Auto navigate back after showing toast
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      console.error('Update user info error:', error);
      // Add error vibration feedback (works on both iOS and Android)
      Vibration.vibrate(200); // Single vibration for error

      // Show modern error toast notification
      showError(
        `Có lỗi xảy ra khi cập nhật thông tin: ${error.message || 'Kết nối mạng không ổn định'}`,
        {
          title: '❌ Lỗi cập nhật',
          duration: 6000,
          actionText: 'Thử lại',
          onActionPress: () => {
            setTimeout(() => {
              handleUpdateInfo();
            }, 500);
          }
        }
      );

      // Also show detailed alert for comprehensive error information
      setTimeout(() => {
        Alert.alert(
          '❌ Lỗi cập nhật thông tin', 
          `Rất tiếc! Có lỗi xảy ra khi cập nhật thông tin của bạn.\n\n🔍 Chi tiết lỗi:\n${error.message || 'Kết nối mạng không ổn định hoặc server đang bận.'}\n\n💡 Gợi ý:\n• Kiểm tra kết nối internet\n• Thử lại sau vài giây\n• Liên hệ hỗ trợ nếu lỗi tiếp tục`,
          [
            {
              text: '🔄 Thử lại',
              style: 'default',
              onPress: () => {
                setTimeout(() => {
                  handleUpdateInfo();
                }, 500);
              }
            },
            {
              text: '❌ Đóng',
              style: 'cancel'
            }
          ]
        );
      }, 1000); // Show alert after toast is visible
    } finally {
      setIsUpdating(false);
    }
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

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
          <Text style={styles.headerText}>Cập nhật thông tin</Text>
          <Text style={styles.headerSubText}>Chỉnh sửa thông tin cá nhân</Text>
        </View>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <View style={styles.formCard}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <MaterialCommunityIcons name="account-circle" size={80} color="#FF6B35" />
            <Text style={styles.currentUserText}>@{user.userName}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.inputSection}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
                <MaterialCommunityIcons name="account" size={20} color="#7F8C8D" style={styles.inputIcon} />
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

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên đăng nhập *</Text>
              <View style={[styles.inputContainer, errors.userName && styles.inputError]}>
                <MaterialCommunityIcons name="at" size={20} color="#7F8C8D" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={formData.userName}
                  onChangeText={(value) => handleInputChange('userName', value)}
                  placeholder="Nhập tên đăng nhập"
                  placeholderTextColor="#BDC3C7"
                  autoCapitalize="none"
                />
              </View>
              {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
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
              <Text style={styles.inputLabel}>Số điện thoại</Text>
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

          {/* User Info Display */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Thông tin tài khoản</Text>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="identifier" size={16} color="#7F8C8D" />
              <Text style={styles.infoText}>ID: {user.userId}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="shield-account" size={16} color="#7F8C8D" />
              <Text style={styles.infoText}>Vai trò: {user.role || user.Role || 'Staff'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.updateButton, (isUpdating || loading) && styles.buttonDisabled]} 
          onPress={handleUpdateInfo}
          disabled={isUpdating || loading}
        >
          {isUpdating ? (
            <ActivityIndicator size="small" color="white" style={styles.buttonIcon} />
          ) : (
            <MaterialCommunityIcons name="check" size={20} color="white" style={styles.buttonIcon} />
          )}
          <Text style={styles.updateButtonText}>
            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={isUpdating}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  currentUserText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
    marginTop: 10,
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
  // Info Section
  infoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  // Action Section
  actionSection: {
    padding: 20,
    paddingBottom: 40,
  },
  updateButton: {
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
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#E74C3C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
});