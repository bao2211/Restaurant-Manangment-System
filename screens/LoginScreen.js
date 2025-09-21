import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { AuthContext } from '../context/AuthContext';


export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
    navigation.navigate('Profile');
  } catch (error) {
    if (Platform.OS === "web") {
      alert(error.message);
    } else {
      Alert.alert("Lỗi", error.message);
    }
  }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#FF6B35" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
