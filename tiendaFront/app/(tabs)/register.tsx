import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { API } from '../ip/IpDirection';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Register() {
  const [name, setName] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [email, setEmail] = useState('');
  const [ci, setCI] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    setErrorMsg('');

    // Validaciones
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !lastName1 || !email || !ci || !address || !password) {
      setErrorMsg('Completa todos los campos obligatorios');
      return;
    }
    if (!nameRegex.test(name) || !nameRegex.test(lastName1) || (lastName2 && !nameRegex.test(lastName2))) {
      setErrorMsg('Los nombres solo pueden contener letras');
      return;
    }
    if (!emailRegex.test(email)) {
      setErrorMsg('Correo electrónico inválido');
      return;
    }
    if (!/^\d+$/.test(ci) || ci.length < 7) {
      setErrorMsg('El CI debe ser numérico y tener al menos 7 dígitos');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Crear usuario
      const response = await fetch(`${API}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Roles_RolesID: 1, // Cliente
          Name1: name,
          LastName1: lastName1,
          LastName2: lastName2 || null,
          CI: parseInt(ci),
          Email: email,
          Address: address,
          Password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Error al registrar');
        return;
      }

      // Login automático para obtener JWT
      const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: ci, password }),
      });

      const loginData = await loginRes.json();

      if (!loginRes.ok) {
        setErrorMsg('Registrado pero no se pudo iniciar sesión automáticamente');
        return;
      }

      // Guardar token
      await AsyncStorage.setItem('token', loginData.token);

      // Redirigir a ClientHome
      router.push('/(tabs)/others/Home');

    } catch (error: any) {
      setErrorMsg('No se pudo conectar al servidor');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <LottieView
            source={require('../../assets/fonts/register.json')}
            autoPlay
            loop
            style={{ width: 250, height: 250, alignSelf: 'center', marginBottom: 0 }}
          />

          <View style={styles.container2}>
            {/* Campos de registro */}
            {/* Nombre */}
            <Text style={styles.label}>Nombre:</Text>
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/images/name.png')} style={styles.inputIcon} />
              <TextInput style={styles.inputWithIcon} value={name} onChangeText={setName} placeholder="Nombre" />
            </View>

            {/* Apellido Paterno */}
            <Text style={styles.label}>Apellido Paterno:</Text>
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/images/name2.png')} style={styles.inputIcon} />
              <TextInput style={styles.inputWithIcon} value={lastName1} onChangeText={setLastName1} placeholder="Apellido paterno" />
            </View>

            {/* Apellido Materno */}
            <Text style={styles.label}>Apellido Materno:</Text>
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/images/last.png')} style={styles.inputIcon} />
              <TextInput style={styles.inputWithIcon} value={lastName2} onChangeText={setLastName2} placeholder="Apellido materno" />
            </View>

            {/* Email */}
            <Text style={styles.label}>Correo Electrónico:</Text>
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/images/last2.png')} style={styles.inputIcon} />
              <TextInput style={styles.inputWithIcon} value={email} onChangeText={setEmail} placeholder="Correo" keyboardType="email-address" />
            </View>

            {/* CI */}
            <Text style={styles.label}>CI:</Text>
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/images/ci2.png')} style={styles.inputIcon} />
              <TextInput style={styles.inputWithIcon} value={ci} onChangeText={setCI} placeholder="Carnet de Identidad" keyboardType="numeric" />
            </View>

            {/* Dirección */}
            <Text style={styles.label}>Dirección:</Text>
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/images/adress.png')} style={styles.inputIcon} />
              <TextInput style={styles.inputWithIcon} value={address} onChangeText={setAddress} placeholder="Dirección" />
            </View>

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña:</Text>
            <View style={styles.inputContainer}>
              <Image source={require('../../assets/images/pass.png')} style={styles.inputIcon} />
              <TextInput style={styles.inputWithIcon} value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry />
            </View>

            {/* Error */}
            {errorMsg ? (
              <Animatable.View animation="shake" style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <View style={styles.errorIcon}><Text style={styles.errorIconText}>!</Text></View>
              </Animatable.View>
            ) : null}

            {/* Botón */}
            <TouchableOpacity onPress={handleRegister}>
              <LinearGradient colors={['#9C27B0', '#6200EE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
                <Text style={styles.buttonText}>Registrarse</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f8' },
  container2: { margin: 15, marginBottom: 35 },
  label: { alignSelf: 'flex-start', marginBottom: 5, fontWeight: '600', color: '#333' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#bbb', marginBottom: 5, paddingHorizontal: 10 },
  inputIcon: { width: 35, height: 35, marginRight: 10 },
  inputWithIcon: { flex: 1, paddingVertical: 12 },
  errorBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#fdecea', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#f5c6cb' },
  errorText: { color: '#721c24', fontWeight: '600' },
  errorIcon: { width: 15, height: 20, borderRadius: 4, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  errorIconText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  gradient: { padding: 15, alignItems: 'center', borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
