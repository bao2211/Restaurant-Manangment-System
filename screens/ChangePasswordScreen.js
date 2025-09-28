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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function ChangePassScreen({ navigation }) {
  const { user, updateUserPassword, loading: contextLoading } = useContext(AuthContext);
  const [localLoading, setLocalLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.oldPassword.trim()) {
      newErrors.oldPassword = 'Old password is required';
    } else if (formData.oldPassword.length < 6) {
      newErrors.oldPassword = 'Old password must be at least 6 characters';
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }

    if (!formData.confirmNewPassword.trim()) {
      newErrors.confirmNewPassword = 'Confirm new password is required';
    } else if (formData.confirmNewPassword !== formData.newPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }

    // Validate old password matches current password
    if (user && user.password && formData.oldPassword !== user.password) {
      newErrors.oldPassword = 'Old password is incorrect';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    setLocalLoading(true);

    try {
      console.log('=== STARTING PASSWORD CHANGE ===');
      console.log('Form data:', { 
        oldPassword: formData.oldPassword ? '[ENTERED]' : '[EMPTY]',
        newPassword: formData.newPassword ? '[ENTERED]' : '[EMPTY]',
        confirmNewPassword: formData.confirmNewPassword ? '[ENTERED]' : '[EMPTY]'
      });

      // Use the new updateUserPassword function
      const result = await updateUserPassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      console.log('Password change result:', result);

      // Clear form after successful change
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });

      console.log('=== PASSWORD CHANGE SUCCESSFUL ===');
      
      // Try different alert approaches
      if (Platform.OS === 'web') {
        alert('Password changed successfully! Redirecting to profile...');
        setTimeout(() => {
          navigation.navigate('ProfileHome');
        }, 1000);
      } else {
        Alert.alert(
          'Success!',
          'Your password has been changed successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                console.log('Alert OK pressed, navigating...');
                navigation.navigate('ProfileHome');
              },
              style: 'default'
            }
          ],
          { 
            cancelable: false,
            onDismiss: () => {
              console.log('Alert dismissed');
              navigation.navigate('ProfileHome');
            }
          }
        );
      }
    } catch (error) {
      console.error('Change pass error:', error);
      Alert.alert('Failed', error.message || 'Failed to change password. Try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found. Please login again.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerSection}>
          <MaterialCommunityIcons name="lock-reset" size={50} color="#FF6B35" />
          <Text style={styles.headerTitle}>Change Password</Text>
          <Text style={styles.headerSubtitle}>Update your password for security</Text>
        </View>

        <View style={styles.formSection}>
          {/* Old Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Old Password *</Text>
            <View style={[styles.inputContainer, errors.oldPassword && styles.inputError]}>
              <MaterialCommunityIcons name="lock" size={20} color="#7F8C8D" />
              <TextInput
                style={styles.input}
                placeholder="Enter old password"
                value={formData.oldPassword}
                onChangeText={(text) => handleInputChange('oldPassword', text)}
                placeholderTextColor="#BDC3C7"
                secureTextEntry={!showOldPass}
              />
              <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)}>
                <MaterialCommunityIcons name={showOldPass ? 'eye-off' : 'eye'} size={20} color="#7F8C8D" />
              </TouchableOpacity>
            </View>
            {errors.oldPassword && <Text style={styles.errorText}>{errors.oldPassword}</Text>}
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password *</Text>
            <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
              <MaterialCommunityIcons name="lock" size={20} color="#7F8C8D" />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                value={formData.newPassword}
                onChangeText={(text) => handleInputChange('newPassword', text)}
                placeholderTextColor="#BDC3C7"
                secureTextEntry={!showNewPass}
              />
              <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
                <MaterialCommunityIcons name={showNewPass ? 'eye-off' : 'eye'} size={20} color="#7F8C8D" />
              </TouchableOpacity>
            </View>
            {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password *</Text>
            <View style={[styles.inputContainer, errors.confirmNewPassword && styles.inputError]}>
              <MaterialCommunityIcons name="lock-check" size={20} color="#7F8C8D" />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={formData.confirmNewPassword}
                onChangeText={(text) => handleInputChange('confirmNewPassword', text)}
                placeholderTextColor="#BDC3C7"
                secureTextEntry={!showConfirmPass}
              />
              <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
                <MaterialCommunityIcons name={showConfirmPass ? 'eye-off' : 'eye'} size={20} color="#7F8C8D" />
              </TouchableOpacity>
            </View>
            {errors.confirmNewPassword && <Text style={styles.errorText}>{errors.confirmNewPassword}</Text>}
          </View>

          {/* Password Requirements */}
          <View style={styles.requirementsSection}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementsText}>• At least 6 characters long</Text>
            <Text style={styles.requirementsText}>• Must match confirmation password</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.updateButton, (contextLoading || localLoading) && styles.buttonDisabled]}
            onPress={handleChangePassword}
            disabled={contextLoading || localLoading}
          >
            {contextLoading || localLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialCommunityIcons name="content-save" size={20} color="white" />
            )}
            <Text style={styles.updateButtonText}>
              {contextLoading || localLoading ? 'Changing...' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={contextLoading || localLoading}
          >
            <MaterialCommunityIcons name="close" size={20} color="#7F8C8D" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 15,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 10,
    fontSize: 16,
    color: '#2C3E50',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    marginTop: 5,
  },
  requirementsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  requirementsText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  buttonSection: {
    gap: 15,
  },
  updateButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
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
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});