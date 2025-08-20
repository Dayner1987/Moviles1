// components/forms/RegisterForm.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, ScrollView } from 'react-native';

const RegisterForm: React.FC = () => {
  const [form, setForm] = useState({
    Name1: '',
    Name2: '',
    LastName1: '',
    LastName2: '',
    CI: '',
    Address: '',
    Password: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleRegister = async () => {
    const { Name1, LastName1, CI, Address, Password } = form;

    // Validación básica
    if (!Name1 || !LastName1 || !CI || !Address || !Password) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    try {
      const response = await fetch('http://TU_BACKEND_API/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          CI: parseInt(form.CI),
          Roles_RolesID: 2, // puedes cambiarlo según tus roles
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Usuario registrado');
      } else {
        Alert.alert('Error', data.message || 'No se pudo registrar');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de red o del servidor');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Nombre:</Text>
      <TextInput style={styles.input} value={form.Name1} onChangeText={(text) => handleChange('Name1', text)} />

      <Text>Segundo Nombre:</Text>
      <TextInput style={styles.input} value={form.Name2} onChangeText={(text) => handleChange('Name2', text)} />

      <Text>Apellido:</Text>
      <TextInput style={styles.input} value={form.LastName1} onChangeText={(text) => handleChange('LastName1', text)} />

      <Text>Segundo Apellido:</Text>
      <TextInput style={styles.input} value={form.LastName2} onChangeText={(text) => handleChange('LastName2', text)} />

      <Text>CI:</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={form.CI} onChangeText={(text) => handleChange('CI', text)} />

      <Text>Dirección:</Text>
      <TextInput style={styles.input} value={form.Address} onChangeText={(text) => handleChange('Address', text)} />

      <Text>Contraseña:</Text>
      <TextInput style={styles.input} secureTextEntry value={form.Password} onChangeText={(text) => handleChange('Password', text)} />

      <Button title="Registrar" onPress={handleRegister} />
    </ScrollView>
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

export default RegisterForm;
