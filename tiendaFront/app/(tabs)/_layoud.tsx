import { Slot, Link } from 'expo-router';
import { View, StyleSheet, Text, Pressable, Image } from 'react-native';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Link href="/" asChild>
          <Pressable>
            <Text style={styles.navText}>Inicio</Text>
          </Pressable>
        </Link>

        <Link href="/login" asChild>
          <Pressable>
            <Text style={styles.navText}>Login</Text>
          </Pressable>
        </Link>

        <Link href="/register" asChild>
          <Pressable>
            <Text style={styles.navText}>Register</Text>
          </Pressable>
        </Link>
      </View>

      {/* Marca de agua global */}
      <Image
        source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd5c2jYcdK0l12b0r_ETLfEPaVqYqoqi_zlg&s' }}
        style={styles.watermark}
        resizeMode="contain"
      />

      {/* Aquí van todas las pantallas */}
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#32CD32',
    zIndex: 2, // Navbar por encima de la marca
  },
  navText: { fontSize: 16 },

  watermark: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    width: '100%',
    height: '40%',
    opacity: 0.1,
    zIndex: 0,
  },
});
