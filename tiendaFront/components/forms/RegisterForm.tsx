import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native';

interface Props {
  name: string;
  setName: (val: string) => void;
  lastName1: string;
  setLastName1: (val: string) => void;
  lastName2: string;
  setLastName2: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  onSubmit: () => void;
}

const RegisterForm: React.FC<Props> = ({
  name,
  setName,
  lastName1,
  setLastName1,
  lastName2,
  setLastName2,
  email,
  setEmail,
  onSubmit,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
        style={styles.avatar}
      />

      <Text style={styles.label}>Nombre(s):</Text>
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

      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default RegisterForm;

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f5f5', alignItems: 'center', flexGrow: 1 },
  avatar: { width: 100, height: 100, marginBottom: 20 },
  label: { alignSelf: 'flex-start', marginLeft: 10, marginBottom: 5, fontWeight: '600', color: '#333' },
  input: { width: '100%', padding: 12, marginBottom: 15, borderRadius: 10, borderWidth: 1, borderColor: '#bbb', backgroundColor: '#fff' },
  button: { width: '100%', padding: 15, borderRadius: 10, backgroundColor: '#6200EE', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
