// (tabs)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { TabsStackParamList } from './types';

type LoginScreenNavigationProp = NativeStackNavigationProp<TabsStackParamList, 'Login'>;

export default function Login() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [ci, setCI] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!ci || !password) {
      Alert.alert('Error', 'CI y contraseña son obligatorios');
      return;
    }
    // Aquí puedes hacer tu llamada al backend
    Alert.alert('Login exitoso', `CI: ${ci}`);
    // Ejemplo: después de login, navegar a Home o a otra pantalla
    // navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>CI:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={ci}
        onChangeText={setCI}
        placeholder="Ingresa tu CI"
      />
      <Text style={styles.label}>Contraseña:</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Ingresa tu contraseña"
      />
      <Button title="Ingresar" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  label: { marginBottom: 5, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
