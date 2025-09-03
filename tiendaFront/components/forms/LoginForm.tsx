import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; // Importar router para el back

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
      {/* Navbar */}
      <LinearGradient
        colors={['#9C27B0', '#6200EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.navbar}
      >
        <View style={styles.navbarRow}>
          {/* Botón de retroceso en recuadro */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <View style={styles.backCircle}>
              <Text style={styles.backText}>←</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.navbarTitle}>HairLux</Text>

          {/* Espacio para equilibrar el navbar */}
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Imagen */}
      <Image
        source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5vNoBbjGdp2SSLCFtOjHlXAolAkkZJ3_t6w&s' }}
        style={styles.avatar}
      />

      <Text style={styles.label}>Correo Electronico o CI:</Text>
      <TextInput
        style={styles.input}
        value={ci}
        onChangeText={setCI}
        placeholder="Correo/ci"
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
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#f5f5f5', marginTop:40 },
  navbar: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6200EE',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  navbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  navbarTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  // Botón de retroceso
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
    marginBottom: 15,
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
});
