import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

interface Props {
  ci: string;
  setCI: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: () => void;
}

const LoginForm: React.FC<Props> = ({ ci, setCI, password, setPassword, onSubmit }) => {
  return (
    <View style={styles.container}>
      {/* Imagen arriba del formulario */}
      <Image
        source={{ uri: 'https://th.bing.com/th?q=Perfil+Sin+Foto+Facebook&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&pid=InlineBlock&rm=3&mkt=es-XL&cc=BO&setlang=es&adlt=moderate&t=1&mw=247' }} 
        style={styles.avatar}
      />

      <Text style={styles.label}>CI:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={ci}
        onChangeText={setCI}
        placeholder="Ingresa tu CI"
      />

      <Text style={styles.label}>Contraseña:</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Ingresa tu contraseña"
      />

      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Ingresar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  avatar: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  label: { marginBottom: 5, fontWeight: '600', color: '#333', alignSelf: 'flex-start' },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbb',
    marginBottom: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
