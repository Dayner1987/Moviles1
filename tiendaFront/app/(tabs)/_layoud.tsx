import { Slot, Link } from 'expo-router';
import { View, StyleSheet, Text, Pressable } from 'react-native';

export default function TabsLayout() {
  return (
    <View style={styles.container}>
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
    backgroundColor: '#eee',
  },
  navText: { fontSize: 16 },
});
