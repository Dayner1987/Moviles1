// components/forms/LoginForm.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet } from 'react-native';

const LoginForm: React.FC = () => {
  const [ci, setCI] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!ci || !password) {
      Alert.alert('Error', 'CI y contraseña requeridos');
      return;
    }

    try {
      const response = await fetch('http://TU_BACKEND_API/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          CI: parseInt(ci),
          Password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Bienvenido', `Hola ${data.name}`);
        // Aquí puedes navegar a otra pantalla
      } else {
        Alert.alert('Error', data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red o del servidor');
    }
  };

  return (
    <View style={styles.container}>
      <Text>CI:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={ci}
        onChangeText={setCI}
      />

      <Text>Contraseña:</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Ingresar" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default LoginForm;
