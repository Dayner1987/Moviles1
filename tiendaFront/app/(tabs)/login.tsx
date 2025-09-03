// app/(tabs)/login.tsx
import React, { useState } from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import LoginForm from '../../components/forms/LoginForm';
import { API } from '../ip/IpDirection';

export default function Login() {
  const [ciOrEmail, setCIOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!ciOrEmail || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: ciOrEmail, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.error || 'Error desconocido');
        return;
      }

      // Redireccionar según el rol
      if (data.role === 'Cliente') {
        router.push('/ClientHome');
      } else if (data.role === 'Empleado') {
        router.push('/EmployeeHome'); // Ruta para empleados
      } else if (data.role === 'Administrador') {
        router.push('/AdminHome'); // Ruta para admins
      } else {
        Alert.alert('Acceso denegado', 'Rol no autorizado');
      }

    } catch (err) {
      Alert.alert('Error', 'No se pudo conectar al servidor');
    }
  };

  return (
    <View style={styles.container}>
      <LoginForm
        ci={ciOrEmail}
        setCI={setCIOrEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
});
