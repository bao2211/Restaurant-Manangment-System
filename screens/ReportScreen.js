import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

    export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="file-document-outline" size={80} color="#BDC3C7" />
        <Text style={styles.emptyTitle}>Bill</Text>
        <Text style={styles.emptySubtitle}>
          Sign in to access your profile and preferences
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
});