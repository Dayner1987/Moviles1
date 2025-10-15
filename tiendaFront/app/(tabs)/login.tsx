// app/(tabs)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { API } from '../ip/IpDirection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';

export default function Login() {
  const [ciOrEmail, setCIOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');

    if (!ciOrEmail || !password) {
      setErrorMsg('Completa todos los campos');
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
        setErrorMsg(data.error || 'Error desconocido');
        return;
      }

      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('token', data.token);

      // Redirigir según rol
      if (data.role === 'Cliente') router.push('/(tabs)/others/Home');
      else if (data.role === 'Empleado') router.push('/(tabs)/operations/EmployeeHome');
      else if (data.role === 'Administrador') router.push('/(tabs)/opAdmin/NewProducts');
      else setErrorMsg('Rol no autorizado');

    } catch (err) {
      setErrorMsg('No se pudo conectar al servidor');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <LottieView
            source={require('../../assets/fonts/Login.json')}
            autoPlay
            loop
            style={{ width: 220, height: 220, alignSelf: 'center', marginBottom: 20 }}
          />

          {/* Campos de login */}
          <Text style={styles.label}>Correo Electrónico o CI:</Text>
          <View style={styles.inputContainer}>
            <Image source={require('../../assets/images/ci.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              value={ciOrEmail}
              onChangeText={setCIOrEmail}
              placeholder="Correo/CI"
            />
          </View>

          <Text style={styles.label}>Contraseña:</Text>
          <View style={styles.inputContainer}>
            <Image source={require('../../assets/images/pass.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              secureTextEntry
            />
          </View>

          {/* Error */}
          {errorMsg ? (
            <Animatable.View animation="shake" style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
            </Animatable.View>
          ) : null}

          {/* Botón ingresar */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <LinearGradient
              colors={['#9C27B0', '#6200EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.buttonText}>Ingresar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, paddingHorizontal: 10 },
  inputIcon: { width: 20, height: 20, marginRight: 10 },
  inputWithIcon: { flex: 1, height: 40 },
  label: { marginBottom: 5, fontWeight: 'bold' },
  button: { marginTop: 20, borderRadius: 10 },
  gradient: { padding: 12, alignItems: 'center', borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdd', padding: 10, borderRadius: 8, marginTop: 10 },
  errorText: { flex: 1, color: '#900' },
  errorIcon: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#900', borderRadius: 10 },
  errorIconText: { color: '#fff', fontWeight: 'bold' },
});
