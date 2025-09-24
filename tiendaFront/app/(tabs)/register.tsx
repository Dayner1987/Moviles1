import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { API } from '../ip/IpDirection';

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

if (!/^\d+$/.test(ci)) {
  setErrorMsg('El CI debe contener solo números');
  return;
}

if (ci.length < 7) {
  setErrorMsg('El CI debe tener al menos 7 dígitos');
  return;
}

if (password.length < 6) {
  setErrorMsg('La contraseña debe tener al menos 6 caracteres');
  return;
}

  try {
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

    setErrorMsg(`Usuario ${data.user?.Name1 || name} registrado correctamente`);

    // Limpiar formulario
    setName('');
    setLastName1('');
    setLastName2('');
    setEmail('');
    setCI('');
    setAddress('');
    setPassword('');
  } catch (error: any) {
    setErrorMsg('No se pudo conectar al servidor');
  }
};


  return (
    <View style={styles.container}>
      {/* Navbar */}
      <LinearGradient
        colors={['#9C27B0', '#6200EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.navbar}
      >
        <View style={styles.navbarRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.navbarTitle}>HairLux</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }} keyboardShouldPersistTaps="handled">
          {/* Lottie animado */}
          <LottieView
            source={require('../../assets/fonts/register.json')}
            autoPlay
            loop
            style={{
              width: 250,
              height: 250,
              alignSelf: 'center',
              marginBottom: 0,
            }}
          />

          <View style={styles.container2}>
            {/* Campos */}
            {/* Campos con íconos */}
<Text style={styles.label}>Nombre:</Text>
<View style={styles.inputContainer}>
  <Image source={require('../../assets/images/name.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputWithIcon}
    value={name}
    onChangeText={setName}
    placeholder="Ingrese su nombre"
  />
</View>

<Text style={styles.label}>Apellido Paterno:</Text>
<View style={styles.inputContainer}>
  <Image source={require('../../assets/images/name2.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputWithIcon}
    value={lastName1}
    onChangeText={setLastName1}
    placeholder="Apellido paterno"
  />
</View>

<Text style={styles.label}>Apellido Materno:</Text>
<View style={styles.inputContainer}>
  <Image source={require('../../assets/images/last.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputWithIcon}
    value={lastName2}
    onChangeText={setLastName2}
    placeholder="Apellido materno"
  />
</View>

<Text style={styles.label}>Correo Electrónico:</Text>
<View style={styles.inputContainer}>
  <Image source={require('../../assets/images/last2.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputWithIcon}
    value={email}
    onChangeText={setEmail}
    placeholder="ejemplo@correo.com"
    keyboardType="email-address"
  />
</View>

<Text style={styles.label}>CI:</Text>
<View style={styles.inputContainer}>
  <Image source={require('../../assets/images/ci2.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputWithIcon}
    value={ci}
    onChangeText={setCI}
    placeholder="Carnet de Identidad"
    keyboardType="numeric"
  />
</View>

<Text style={styles.label}>Dirección:</Text>
<View style={styles.inputContainer}>
  <Image source={require('../../assets/images/adress.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputWithIcon}
    value={address}
    onChangeText={setAddress}
    placeholder="Dirección"
  />
</View>

<Text style={styles.label}>Contraseña:</Text>
<View style={styles.inputContainer}>
  <Image source={require('../../assets/images/pass.png')} style={styles.inputIcon} resizeMode="contain" />
  <TextInput
    style={styles.inputWithIcon}
    value={password}
    onChangeText={setPassword}
    placeholder="Contraseña"
    secureTextEntry
  />
</View>

            {/* Mensaje de error */}
            {errorMsg ? (
              <Animatable.View animation="shake" style={styles.errorBox}>
                           
                            <Text style={styles.errorText}>{errorMsg} </Text>
                             <View style={styles.errorIcon}>
                              <Text style={styles.errorIconText}>!</Text>
                            </View>
                          </Animatable.View>
            ) : null}

            {/* Botón */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <LinearGradient
                colors={['#9C27B0', '#6200EE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                <Text style={styles.buttonText}>Registrarse</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f8' },
  container2: { margin: 15, marginBottom: 35 },
  navbar: {
    height: 100,
    justifyContent: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  navbarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  navbarTitle: { color: '#fff', fontSize: 30, fontWeight: '600', textAlign: 'center', flex: 1 },
  backButton: { width: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  label: { alignSelf: 'flex-start', marginBottom: 5, fontWeight: '600', color: '#333' },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbb',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
 errorIcon: {
    width: 15,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  errorIconText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  errorBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10,
  backgroundColor: '#fdecea', padding: 15, borderRadius: 8, borderWidth: 1,
  borderColor: '#f5c6cb' },
  errorText: { color: '#721c24', fontWeight: '600' },

  button: { width: '100%', marginTop: 15, borderRadius: 13, overflow: 'hidden' },
  gradient: { padding: 15, alignItems: 'center', borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  inputContainer: {
  flexDirection: 'row',     // pone icono y input en línea
  alignItems: 'center',
  backgroundColor: '#fff',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#bbb',
  marginBottom: 5,
  paddingHorizontal: 10,
},

inputIcon: {
  width: 35,
  height: 35,
  marginRight: 10, // espacio entre icono y texto
},

inputWithIcon: {
  flex: 1,           // ocupa el espacio restante
  paddingVertical: 12,
},

});
