import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(user);

  useFocusEffect(
    useCallback(() => {
      setCurrentUser(user); // cập nhật user khi tab Profile được focus
    }, [user])
  );

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <MaterialIcons name="person-outline" size={80} color="#7F8C8D" style={styles.iconPerson} />
        <Text style={styles.text}>You are not logged in yet</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, {currentUser.fullName || currentUser.userName}!</Text>
      <Text style={styles.text}>Username: {currentUser.userName}</Text>
      <Text style={styles.text}>Email: {currentUser.email || 'Chưa có email'}</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 },
  text: { 
    fontSize: 18, 
    marginBottom: 10,
    color: '#7F8C8D',
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: '20%',
    height: '5%',
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold',
    textAlign: 'center',
   },
   iconPerson: { marginBottom: 20 },
});
