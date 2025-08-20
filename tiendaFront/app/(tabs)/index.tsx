import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { productos, Producto } from '../data/products';
import { useCarrito } from '../../hooks/UseCarrito'; // ajusta la ruta según tu estructura

export default function Home() {
  const { carrito, agregarAlCarrito } = useCarrito();

  const handleBuy = (item: Producto) => {
    agregarAlCarrito(item);
    Alert.alert('Carrito', `Has agregado: ${item.nombre} por ${item.precio}`);
  };

  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/LogoFinal.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.navTitle}>HairLux</Text>
        </View>

        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.hamburger}>
          <View style={styles.bar}></View>
          <View style={styles.bar}></View>
          <View style={styles.bar}></View>
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/login')}>
            <Text style={styles.navButtonText}>Ingresar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/register')}>
            <Text style={styles.navButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Contador carrito */}
      <Text style={styles.cartInfo}>Productos en carrito: {carrito.length}</Text>

      {/* Lista de productos */}
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.imagen }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nombre}</Text>
              <Text style={styles.productPrice}>{item.precio}</Text>
              <Text style={styles.productCategory}>Categoría: {item.categoria}</Text>
              <TouchableOpacity style={styles.buyButton} onPress={() => handleBuy(item)}>
                <Text style={styles.buyButtonText}>Agregar al carrito</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#32CD32',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 100, height: 80, marginRight: 4 },
  navTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  hamburger: { padding: 10, justifyContent: 'center' },
  bar: { width: 25, height: 3, backgroundColor: '#f5f5f5', marginVertical: 3, borderRadius: 2 },
  dropdownMenu: { backgroundColor: '#DFFFE0', flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 5, paddingHorizontal: 15 },
  navButton: { marginVertical: 5, padding: 8, backgroundColor: '#00BFFF', borderRadius: 6, width: '100%' },
  navButtonText: { color: '#fff', fontWeight: 'bold' },
  cartInfo: { fontSize: 16, fontWeight: '600', marginHorizontal: 15, marginBottom: 10 },
  productCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 12, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
  productImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600' },
  productPrice: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
  productCategory: { fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  buyButton: { marginTop: 8, padding: 8, backgroundColor: '#32CD32', borderRadius: 6, alignItems: 'center', width: '50%' },
  buyButtonText: { color: '#fff', fontWeight: 'bold' },
});
