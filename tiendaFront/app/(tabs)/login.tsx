// app/(tabs)/login.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { jwtDecode }from 'jwt-decode';
import LottieView from 'lottie-react-native';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useStatus } from '../../hooks/UseStatus';
import { JwtPayload } from '../data/jwtPayload';
import { API } from '../ip/IpDirection';
export default function Login() {
  const [ciOrEmail, setCIOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, setUser } = useStatus();
const [redirectDone, setRedirectDone] = useState(false);

useEffect(() => {
  if (!user || redirectDone) return;

  switch (user.role) {
    case 'cliente':
      router.replace('/(tabs)/others/Home');
      break;
    case 'empleado':
      router.replace('/(tabs)/operations/EmployeeHome');
      break;
    case 'administrador':
      router.replace('/(tabs)/opAdmin/NewProducts');
      break;
  }

  setRedirectDone(true);
}, [user, redirectDone]);

const handleLogin = async () => {
  if (!ciOrEmail || !password) {
    setErrorMsg('Completa todos los campos');
    return;
  }

  setIsSubmitting(true);
  setErrorMsg('');

  try {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: ciOrEmail, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrorMsg(data.message || 'Error de autenticación');
      return;
    }

    await AsyncStorage.setItem('token', data.token);

    const decoded: JwtPayload = jwtDecode<JwtPayload>(data.token);
    console.log('Decoded JWT:', decoded);

    if (!decoded.role || !decoded.id) {
      setErrorMsg('El token no contiene datos válidos. Contacta soporte.');
      return;
    }

    // 🔹 Normalizamos rol para PayClient
    const roleNormalized =
      decoded.role.toLowerCase() === 'cliente'
        ? 'Cliente'
        : decoded.role.toLowerCase() === 'empleado'
        ? 'Empleado'
        : decoded.role.toLowerCase() === 'administrador'
        ? 'Administrador'
        : decoded.role;

    // 🔹 Actualizamos el estado global
    setUser({
      id: decoded.id,
      role: roleNormalized,
      name: decoded.name,
      email: decoded.email || '',
    });

    // 🔹 Redirección inmediata según rol
    if (roleNormalized === 'Cliente') router.replace('/(tabs)/others/Home');
    else if (roleNormalized === 'Empleado') router.replace('/(tabs)/operations/EmployeeHome');
    else if (roleNormalized === 'Administrador') router.replace('/(tabs)/opAdmin/NewProducts');

  } catch (error) {
    console.error('Login error:', error);
    setErrorMsg('Error en el servidor');
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <LottieView
            source={require('../../assets/fonts/Login.json')}
            autoPlay
            loop
            style={styles.lottie}
          />

          <Text style={styles.label}>Correo Electrónico o CI:</Text>
          <View style={styles.inputContainer}>
            <Image source={require('../../assets/images/ci.png')} style={styles.inputIcon} />
            <TextInput
              style={styles.inputWithIcon}
              value={ciOrEmail}
              onChangeText={setCIOrEmail}
              placeholder="Correo/CI"
              autoCapitalize="none"
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

          {errorMsg ? (
            <Animatable.View animation="shake" style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
            </Animatable.View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, isSubmitting && { opacity: 0.6 }]}
            disabled={isSubmitting}
            onPress={handleLogin}
          >
            <LinearGradient
              colors={['#9C27B0', '#6200EE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Ingresar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  lottie: { width: 220, height: 220, alignSelf: 'center', marginBottom: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputIcon: { width: 20, height: 20, marginRight: 10 },
  inputWithIcon: { flex: 1, height: 40 },
  label: { marginBottom: 5, fontWeight: 'bold' },
  button: { marginTop: 20, borderRadius: 10 },
  gradient: { padding: 12, alignItems: 'center', borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdd',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: { flex: 1, color: '#900' },
  errorIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#900',
    borderRadius: 10,
  },
  errorIconText: { color: '#fff', fontWeight: 'bold' },
});
