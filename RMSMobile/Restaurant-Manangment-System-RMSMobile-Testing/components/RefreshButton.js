import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RefreshButton({ 
  onRefresh, 
  refreshing = false, 
  style = {}, 
  size = 24, 
  color = "#3498DB",
  backgroundColor = "#EBF3FD"
}) {
  return (
    <TouchableOpacity
      style={[styles.refreshButton, { backgroundColor }, style]}
      onPress={onRefresh}
      disabled={refreshing}
      activeOpacity={0.7}
    >
      {refreshing ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <MaterialCommunityIcons 
          name="refresh" 
          size={size} 
          color={color} 
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});