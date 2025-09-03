import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

interface Props {
  name: string;
  setName: (val: string) => void;
  lastName1: string;
  setLastName1: (val: string) => void;
  lastName2: string;
  setLastName2: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  ci: string;
  setCI: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: () => void;
}

const RegisterForm: React.FC<Props> = ({
  name, setName,
  lastName1, setLastName1,
  lastName2, setLastName2,
  email, setEmail,
  ci, setCI,
  address, setAddress,
  password, setPassword,
  onSubmit
}) => {
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Avatar */}
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
          style={styles.avatar}
        />

        {/* Inputs */}
        <Text style={styles.label}>Nombre:</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ingrese su nombre" />

        <Text style={styles.label}>Apellido Paterno:</Text>
        <TextInput style={styles.input} value={lastName1} onChangeText={setLastName1} placeholder="Apellido paterno" />

        <Text style={styles.label}>Apellido Materno:</Text>
        <TextInput style={styles.input} value={lastName2} onChangeText={setLastName2} placeholder="Apellido materno" />

        <Text style={styles.label}>Correo Electrónico:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
        />

        <Text style={styles.label}>CI:</Text>
        <TextInput
          style={styles.input}
          value={ci}
          onChangeText={setCI}
          placeholder="Carnet de Identidad"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Dirección:</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Dirección" />

        <Text style={styles.label}>Contraseña:</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Contraseña" secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <LinearGradient
            colors={['#9C27B0', '#6200EE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Text style={styles.buttonText}>Registrarse</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default RegisterForm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f8' },
  
  // Navbar elegante y centrado
  navbar: {
    height: 55,
    justifyContent: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    margin:40,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  navbarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
  navbarTitle: { color: '#fff', fontSize: 20, fontWeight: '600', textAlign: 'center', flex: 1 },
  backButton: { width: 40, justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  scrollContainer: { padding: 20, paddingBottom: 50 },

  avatar: { width: 80, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#9C27B0' },

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

  button: { width: '100%', marginTop: 15, borderRadius: 12, overflow: 'hidden' },
  gradient: { padding: 15, alignItems: 'center', borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
