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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function UpdateInformationScreen({ navigation }) {
  const { user, updateUserInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    userName: '',
  });
  const [errors, setErrors] = useState({});

  // API Base URL - adjust according to your setup
  const API_BASE_URL = 'http://46.250.231.129:8080'; 
  
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone ? user.phone.toString() : '',
        email: user.email || '',
        userName: user.userName || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    } else if (formData.userName.length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateInformation = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Prepare the update data - KEEP EXISTING PASSWORD
      // Clean userId to remove any trailing spaces
      const cleanUserId = user.userId.toString().trim();
      
      const updateData = {
        userId: cleanUserId,
        userName: formData.userName.trim(),
        password: user.password, // Keep existing password unchanged
        role: user.role,
        // Only include 'right' if it exists and is not undefined
        ...(user.right !== undefined && user.right !== null && { right: user.right }),
        fullName: formData.fullName.trim(),
        phone: parseInt(formData.phone),
        email: formData.email.trim(),
      };

      console.log('Sending update data:', updateData);
      console.log('API URL:', `${API_BASE_URL}/api/User/${cleanUserId}`);
      console.log('User object before update:', JSON.stringify(user, null, 2));

      const response = await fetch(`${API_BASE_URL}/api/User/${cleanUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        // Update successful - create updated user data locally
        const updatedUserData = {
          ...user,
          fullName: formData.fullName,
          phone: parseInt(formData.phone),
          email: formData.email,
          userName: formData.userName,
        };

        // Update user context using the new function
        if (updateUserInfo) {
          await updateUserInfo(updatedUserData);
        }

        Alert.alert(
          'Success! ✅',
          'Your information has been updated successfully!',
          [{ 
            text: 'OK', 
            onPress: () => {
              navigation.goBack();
            }
          }]
        );
      } else {
        // Get detailed error response
        const errorData = await response.text();
        console.error('Update failed - Status:', response.status);
        console.error('Update failed - Response text:', errorData);
        console.error('Update failed - Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Try to get more detailed error
        let errorMessage = 'Failed to update information. Please try again.';
        let detailedErrors = [];
        
        try {
          const errorJson = JSON.parse(errorData);
          console.error('Update failed - Parsed JSON:', errorJson);
          
          // Handle different error response formats
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.title) {
            errorMessage = errorJson.title;
          }
          
          // Extract validation errors if available
          if (errorJson.errors) {
            Object.keys(errorJson.errors).forEach(field => {
              const fieldErrors = Array.isArray(errorJson.errors[field]) ? errorJson.errors[field] : [errorJson.errors[field]];
              detailedErrors.push(`${field}: ${fieldErrors.join(', ')}`);
            });
          }
          
          if (detailedErrors.length > 0) {
            errorMessage += '\n\nValidation errors:\n' + detailedErrors.join('\n');
          }
          
        } catch (parseError) {
          console.error('Could not parse error response as JSON:', parseError);
          errorMessage = `Server error (${response.status}): ${errorData}`;
        }
        
        Alert.alert('Update Failed', errorMessage);
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert(
        'Network Error',
        'Unable to connect to server. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
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
        <Text style={styles.errorText}>User not found. Please login again.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerSection}>
          <MaterialCommunityIcons name="account-edit" size={50} color="#FF6B35" />
          <Text style={styles.headerTitle}>Update Information</Text>
          <Text style={styles.headerSubtitle}>Keep your profile information up to date</Text>
        </View>

        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account" size={20} color="#7F8C8D" />
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                placeholderTextColor="#BDC3C7"
              />
            </View>
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username *</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="account-circle" size={20} color="#7F8C8D" />
              <TextInput
                style={[styles.input, errors.userName && styles.inputError]}
                placeholder="Enter username"
                value={formData.userName}
                onChangeText={(text) => handleInputChange('userName', text)}
                placeholderTextColor="#BDC3C7"
                autoCapitalize="none"
              />
            </View>
            {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="email" size={20} color="#7F8C8D" />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholderTextColor="#BDC3C7"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="phone" size={20} color="#7F8C8D" />
              <TextInput
                style={[styles.input, errors.phone && styles.inputError]}
                placeholder="Enter phone number"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholderTextColor="#BDC3C7"
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Current Info Display */}
          <View style={styles.currentInfoSection}>
            <Text style={styles.currentInfoTitle}>Current Account Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{user.userId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role:</Text>
              <Text style={styles.infoValue}>{user.role}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          {/* Test API Format Button - for debugging 
          <TouchableOpacity
            style={[styles.testButton]}
            onPress={async () => {
              try {
                console.log('Testing API formats...');
                const testData = {
                  userName: formData.userName.trim(),
                  password: user.password,
                  role: user.role,
                  right: user.right,
                  fullName: formData.fullName.trim(),
                  phone: parseInt(formData.phone),
                  email: formData.email.trim(),
                };
                
                // Import apiService dynamically if needed
                const { apiService } = require('../services/apiService');
                
                if (apiService.testUserUpdateFormats) {
                  const result = await apiService.testUserUpdateFormats(user.userId, testData);
                  Alert.alert('API Test Result', JSON.stringify(result, null, 2));
                } else {
                  Alert.alert('Debug', 'Add testUserUpdateFormats to apiService first');
                }
              } catch (error) {
                Alert.alert('Test Error', error.message);
              }
            }}
          >
            <Text style={styles.testButtonText}>🔧 Test API Formats</Text>
          </TouchableOpacity>*/}

          <TouchableOpacity
            style={[styles.updateButton, loading && styles.buttonDisabled]}
            onPress={handleUpdateInformation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <MaterialCommunityIcons name="content-save" size={20} color="white" />
            )}
            <Text style={styles.updateButtonText}>
              {loading ? 'Updating...' : 'Update Information'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <MaterialCommunityIcons name="close" size={20} color="#7F8C8D" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
  currentInfoSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  currentInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
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
  testButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});