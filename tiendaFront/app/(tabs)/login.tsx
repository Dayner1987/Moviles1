// app/(tabs)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router } from 'expo-router';

export default function Login() {
  const [ci, setCI] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (ci === 'cliente' && password === '1234') {
      router.push('/ClientHome');
    } else if (ci === 'empleado' && password === '1234') {
      router.push('/EmployeeHome');
    } else if (ci === 'admin' && password === '1234') {
      router.push('/AdminHome');
    } else {
      Alert.alert('Error', 'Credenciales incorrectas');
    }
  };

  return (
    <View style={styles.container}>
      {/* Imagen de ejemplo */}
      <Image
        source={{ uri: 'https://th.bing.com/th/id/OIP.cSJJmB2bmKjacco5lutZqwHaHa?w=215&h=215&c=7&r=0&o=7&pid=1.7&rm=3' }}
        style={styles.avatar}
      />

      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        placeholder="CI o Usuario"
        style={styles.input}
        value={ci}
        onChangeText={setCI}
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 15 },
  button: { backgroundColor: '#32CD32', padding: 12, borderRadius: 6, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
