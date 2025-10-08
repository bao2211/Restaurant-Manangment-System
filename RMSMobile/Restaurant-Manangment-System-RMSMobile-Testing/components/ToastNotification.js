import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  Vibration
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ToastNotification = ({ 
  visible, 
  message, 
  type = 'success', 
  duration = 4000, 
  onHide,
  title,
  actionText,
  onActionPress 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      
      // Add haptic feedback based on type (works on both iOS and Android)
      if (type === 'success') {
        Vibration.vibrate([0, 100, 50, 100]); // Success pattern
      } else if (type === 'error') {
        Vibration.vibrate(200); // Error vibration
      }

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onHide && onHide();
    });
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#2ECC71',
          icon: 'check-circle',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        };
      case 'error':
        return {
          backgroundColor: '#E74C3C',
          icon: 'alert-circle',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        };
      case 'warning':
        return {
          backgroundColor: '#F39C12',
          icon: 'alert',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        };
      case 'info':
        return {
          backgroundColor: '#3498DB',
          icon: 'information',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        };
      default:
        return {
          backgroundColor: '#2ECC71',
          icon: 'check-circle',
          iconColor: '#FFFFFF',
          textColor: '#FFFFFF'
        };
    }
  };

  if (!isVisible) return null;

  const config = getToastConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={config.iconColor}
          style={styles.icon}
        />
        
        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, { color: config.textColor }]}>
              {title}
            </Text>
          )}
          <Text style={[styles.message, { color: config.textColor }]}>
            {message}
          </Text>
        </View>

        {actionText && onActionPress && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              onActionPress();
              hideToast();
            }}
          >
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.closeButton}
          onPress={hideToast}
        >
          <MaterialCommunityIcons
            name="close"
            size={20}
            color={config.iconColor}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 15,
    right: 15,
    zIndex: 9999,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 60,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
});

export default ToastNotification;