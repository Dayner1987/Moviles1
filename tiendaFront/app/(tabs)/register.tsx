import React, { useState } from 'react';
import { Alert } from 'react-native';
import RegisterForm from '../../components/forms/RegisterForm';
import { API } from '../ip/IpDirection';

export default function Register() {
  const [name, setName] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [email, setEmail] = useState('');
  const [ci, setCI] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    // Validar campos obligatorios
    if (!name || !lastName1 || !email || !ci || !address || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar');
      }

      const data = await response.json();
      Alert.alert('Éxito', `Usuario ${data.user?.Name1 || name} registrado correctamente`);
      
      // Reset form
      setName('');
      setLastName1('');
      setLastName2('');
      setEmail('');
      setCI('');
      setAddress('');
      setPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <RegisterForm
      name={name}
      setName={setName}
      lastName1={lastName1}
      setLastName1={setLastName1}
      lastName2={lastName2}
      setLastName2={setLastName2}
      email={email}
      setEmail={setEmail}
      ci={ci}
      setCI={setCI}
      address={address}
      setAddress={setAddress}
      password={password}
      setPassword={setPassword}
      onSubmit={handleRegister}
    />
  );
}
