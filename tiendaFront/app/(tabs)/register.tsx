import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';

export default function Register() {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [ci, setCI] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    if (!name1 || !lastName1 || !ci || !address || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }
    // Aquí envías los datos al backend para registrar el usuario
    Alert.alert('Registro exitoso', `Usuario ${name1} registrado`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Nombre 1*:</Text>
      <TextInput
        style={styles.input}
        value={name1}
        onChangeText={setName1}
        placeholder="Primer nombre"
      />
      <Text>Nombre 2:</Text>
      <TextInput
        style={styles.input}
        value={name2}
        onChangeText={setName2}
        placeholder="Segundo nombre (opcional)"
      />
      <Text>Apellido 1*:</Text>
      <TextInput
        style={styles.input}
        value={lastName1}
        onChangeText={setLastName1}
        placeholder="Primer apellido"
      />
      <Text>Apellido 2:</Text>
      <TextInput
        style={styles.input}
        value={lastName2}
        onChangeText={setLastName2}
        placeholder="Segundo apellido (opcional)"
      />
      <Text>CI*:</Text>
      <TextInput
        style={styles.input}
        value={ci}
        onChangeText={setCI}
        keyboardType="numeric"
        placeholder="Carnet de identidad"
      />
      <Text>Dirección*:</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Dirección"
      />
      <Text>Contraseña*:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Contraseña"
      />
      <Button title="Registrarse" onPress={handleRegister} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
