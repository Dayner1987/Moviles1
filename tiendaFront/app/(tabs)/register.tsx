import React, { useState } from 'react';
import { Alert } from 'react-native';
import RegisterForm from '../../components/forms/RegisterForm';

export default function Register() {
  const [name, setName] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = () => {
    if (!name || !lastName1 || !lastName2 || !email) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    // Aquí puedes enviar los datos al backend usando fetch o axios
    Alert.alert('Registro exitoso', `Usuario ${name} registrado`);
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
      onSubmit={handleRegister}
    />
  );
}
