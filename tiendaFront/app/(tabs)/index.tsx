import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a la app</Text>
      <Text style={styles.subtitle}>Usa el menú para ingresar o registrarte</Text>

      <View style={styles.menu}>
        <Button title="Ingresar" onPress={() => router.push('/login')} />
        <View style={{ height: 10 }} />
        <Button title="Registrarse" onPress={() => router.push('/register')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, marginBottom: 10 },
  subtitle: { textAlign: 'center', marginBottom: 20 },
  menu: { width: '100%' },
});
