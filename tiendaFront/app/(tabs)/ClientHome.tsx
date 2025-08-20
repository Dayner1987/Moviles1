// app/(tabs)/ClientHome.tsx
import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { productos, Producto } from '../data/products';
import { useCarrito } from '../../hooks/UseCarrito';

export default function ClientHome() {
  const { carrito, agregarAlCarrito } = useCarrito();

const handleBuy = (item: Producto) => {
  agregarAlCarrito(item);
  Alert.alert('Carrito', `Has agregado: ${item.nombre}`);
};


  const total = carrito.reduce((sum, item) => {
    const precioNum = parseFloat(item.precio.replace(/[^\d.]/g, '')) || 0;
    return sum + precioNum;
  }, 0);

  const handleGoToPay = () => {
    if (carrito.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de ir a pagar.');
      return;
    }
    router.push('/payment'); // Navega a la pantalla de pago
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, Cliente</Text>

      <Text style={styles.cartInfo}>Productos en carrito: {carrito.length}</Text>
      <Text style={styles.cartInfo}>Total: {total} Bs</Text>

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

      {/* Carrito */}
      <Text style={styles.sectionTitle}>Carrito de compras</Text>
      {carrito.length === 0 ? (
        <Text style={{ marginHorizontal: 20 }}>No hay productos en el carrito</Text>
      ) : (
        carrito.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Text>{item.nombre} - {item.precio}</Text>
          </View>
        ))
      )}

      {/* Botón ir a pagar */}
      {carrito.length > 0 && (
        <TouchableOpacity style={styles.payButton} onPress={handleGoToPay}>
          <Text style={styles.payButtonText}>Ir a pagar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5', 
    paddingTop: 10 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginHorizontal: 20, 
    marginBottom: 10, 
    color: '#333' 
  },
  cartInfo: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginHorizontal: 20, 
    marginBottom: 10, 
    color: '#555' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginHorizontal: 20, 
    marginTop: 20, 
    color: '#444' 
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  productImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 10, 
    marginRight: 15 
  },
  productInfo: { flex: 1 },
  productName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333' 
  },
  productPrice: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 4, 
    color: '#32CD32' 
  },
  productCategory: { 
    fontSize: 14, 
    fontStyle: 'italic', 
    marginTop: 2, 
    color: '#777' 
  },
  buyButton: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#32CD32',
    borderRadius: 8,
    alignItems: 'center',
    width: '60%',
    alignSelf: 'flex-start',
    shadowColor: '#32CD32',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 2,
  },
  buyButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  cartItem: { 
    marginHorizontal: 20, 
    paddingVertical: 6, 
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  cartItemText: {
    fontSize: 14,
    color: '#333',
  },
  totalText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginHorizontal: 20, 
    marginVertical: 10, 
    color: '#FF8C00' 
  },
  payButton: {
    marginHorizontal: 20,
    backgroundColor: '#FF8C00',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FF8C00',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  payButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

