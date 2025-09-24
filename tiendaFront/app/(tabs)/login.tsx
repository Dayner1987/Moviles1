// app/(tabs)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { API } from '../ip/IpDirection';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

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

      if (data.role === 'Cliente') {
        router.push('/ClientHome');
      } else if (data.role === 'Empleado') {
        router.push('/EmployeeHome');
      } else if (data.role === 'Administrador') {
        router.push('/AdminHome');
      } else {
        setErrorMsg('Rol no autorizado');
      }
    } catch (err) {
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
          <View style={styles.backCircle}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.navbarTitle}>HairLux</Text>
        <View style={{ width: 40 }} />
      </View>
    </LinearGradient>

    {/* Aquí empieza la sección ajustable al teclado */}
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.container2}>
          {/* Ícono animado Lottie */}
          <LottieView
            source={require('../../assets/fonts/Login.json')}
            autoPlay
            loop
            style={{
              width: 220,
              height: 220,
              marginBottom: 20,
              borderRadius: 75,
              borderWidth: 3,
              borderColor: '#6200EE',
              alignSelf: 'center',
            }}
          />

          {/* Campos */}
        <Text style={styles.label}>Correo Electrónico o CI:</Text>
<View style={styles.inputContainer}>
  <Image
    source={require('../../assets/images/ci.png')}
    style={styles.inputIcon}
    resizeMode="contain"
  />
  <TextInput
    style={styles.inputWithIcon}
    value={ciOrEmail}
    onChangeText={setCIOrEmail}
    placeholder="Correo/CI"
  />
</View>
                <Text style={styles.label}>Correo Electrónico o CI:</Text>
<View style={styles.inputContainer}>
  <Image
    source={require('../../assets/images/pass.png')}
    style={styles.inputIcon}
    resizeMode="contain"
  />
  <TextInput
    style={styles.inputWithIcon}
    value={password}
    onChangeText={setPassword}
    placeholder="Contraseña"
  />
</View>



          {/* Error */}
          {errorMsg ? (
            <Animatable.View animation="shake" style={styles.errorBox}>
             
              <Text style={styles.errorText}>{errorMsg} </Text>
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
  </View>
);

}

const styles = StyleSheet.create({
  container: { padding: 0, flex: 1, backgroundColor: '#f5f5f5', marginTop: 0 },
  container2:{ margin:30},
  navbar: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    elevation: 0,
    shadowColor: '#6200EE',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 0,
    
  },
  navbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },
  navbarTitle: { color: '#fff', fontSize: 27, fontWeight: 'bold' },

  backButton: { justifyContent: 'center', alignItems: 'center' },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  backText: { color: '#6200EE', fontSize: 24, fontWeight: 'bold' },

  avatar: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6200EE',
    alignSelf: 'center',
  },

  label: { marginBottom: 5, fontWeight: '600', color: '#333', alignSelf: 'flex-start' },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbb',
    marginBottom: 5,
  },

   errorBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#fdecea',
     padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#f5c6cb' },
  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  errorIconText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  errorText: {
    color: '#db0a0aff',
    fontSize: 14,
    fontWeight: '600',
  },

  button: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#6200EE',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  gradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
   botonImagen: { width: 50, height: 50, marginBottom: 8 },
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
