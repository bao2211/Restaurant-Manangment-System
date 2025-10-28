import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RefreshButton from './RefreshButton';

export default function ScreenHeader({ 
  title, 
  onRefresh, 
  refreshing = false, 
  showRefreshButton = true,
  style = {},
  titleStyle = {},
  rightComponent = null
}) {
  return (
    <View style={[styles.headerContainer, style]}>
      <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
      
      <View style={styles.headerActions}>
        {rightComponent}
        {showRefreshButton && (
          <RefreshButton 
            onRefresh={onRefresh} 
            refreshing={refreshing}
            style={styles.refreshButtonSpacing}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshButtonSpacing: {
    marginLeft: 10,
  },
});