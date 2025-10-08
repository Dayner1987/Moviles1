import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { useCarrito } from '../../hooks/UseCarrito';
import { JwtPayload } from '../data/jwtPayload';
import { API } from '../ip/IpDirection';
import { router } from 'expo-router';

export default function Payment() {
  const { carrito, limpiarCarrito } = useCarrito();
  const [metodoPago, setMetodoPago] = useState<'qr' | 'efectivo'>('qr');
  const [refreshing, setRefreshing] = useState(false);
  const [cliente, setCliente] = useState<JwtPayload | null>(null);

  const total = carrito.reduce((sum, item) => sum + item.Price, 0);

  useEffect(() => {
    obtenerCliente();
  }, []);

  const obtenerCliente = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode<JwtPayload>(token);
        setCliente(decoded);
      }
    } catch (err) {
      console.error('Error al obtener cliente:', err);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePay = async () => {
    if (carrito.length === 0) {
      Alert.alert('Atención', 'El carrito está vacío');
      return;
    }
    if (!cliente) {
      Alert.alert('Error', 'No se pudo obtener la información del cliente');
      return;
    }
    try {
      const productos = carrito.map((item) => ({
        ProductID: item.ProductsID,
        Quantity: 1,
        Price: item.Price,
      }));

      const res = await fetch(`${API}/orders/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          UserID: cliente.id,
          productos,
          metodoPago,
          direccion: 'Entrega en el local de la empresa',
        }),
      });

      if (!res.ok) {
        console.error('Error creando orden:', await res.text());
        Alert.alert('Error', 'No se pudo crear la orden');
        return;
      }

      limpiarCarrito();
      Alert.alert('Éxito', 'Pago registrado. Retira tus productos en el local.');
      router.push('/(tabs)/others/Home');
    } catch (error) {
      console.error('Error al crear la orden:', error);
      Alert.alert('Error', 'Ocurrió un problema al procesar el pago');
    }
  };

  // Componente header para FlatList
  const ListHeader = () => (
    <View>
      <Text style={styles.title}>Pago</Text>

      {/* Métodos de pago */}
      <Text style={styles.sectionTitle}>Método de pago</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.methodButton, metodoPago === 'qr' && styles.selectedButton]}
          onPress={() => setMetodoPago('qr')}
        >
          <Text style={styles.methodText}>QR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.methodButton, metodoPago === 'efectivo' && styles.selectedButton]}
          onPress={() => setMetodoPago('efectivo')}
        >
          <Text style={styles.methodText}>Efectivo</Text>
        </TouchableOpacity>
      </View>

      {metodoPago === 'qr' && (
        <View style={{ marginHorizontal: 20, marginVertical: 10, alignItems: 'center' }}>
          <Text>Escanea este código QR para pagar:</Text>
          <Image
            source={{
              uri: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagoEnLocal',
            }}
            style={{ width: 150, height: 150, marginTop: 10 }}
          />
        </View>
      )}

      {metodoPago === 'efectivo' && cliente && (
        <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
          <Text style={styles.sectionTitle}>Datos del cliente</Text>
          <Text style={styles.clientText}>Nombre: {cliente.name}</Text>
          <Text style={styles.clientText}>Correo: {cliente.email || 'Sin correo'}</Text>
          <Text style={styles.clientText}>Rol: {cliente.role}</Text>
          <Text style={styles.clientText}>Entrega: En el local de la empresa</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Productos</Text>
      {carrito.length === 0 && <Text style={{ marginHorizontal: 20 }}>No hay productos en el carrito</Text>}
    </View>
  );

  // Footer para FlatList (botón finalizar)
  const ListFooter = () => {
    if (carrito.length === 0) return null;
    return (
      <View style={{ marginVertical: 20, paddingHorizontal: 20 }}>
        <Text style={styles.totalText}>Total a pagar: {total} Bs</Text>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Finalizar pago</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      data={carrito}
      keyExtractor={(item) => item.ProductsID.toString()}
      renderItem={({ item }) => (
        <View style={styles.cartItem}>
          <Text>
            {item.Name_product} - {item.Price} Bs
          </Text>
        </View>
      )}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: 'bold', marginHorizontal: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginVertical: 10 },
  buttonRow: { flexDirection: 'row', marginHorizontal: 20 },
  methodButton: {
    flex: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: '#ddd',
    alignItems: 'center',
  },
  selectedButton: { backgroundColor: '#32CD32' },
  methodText: { fontWeight: 'bold', color: '#000' },
  clientText: { fontSize: 16, marginBottom: 4, marginLeft: 5 },
  cartItem: { marginHorizontal: 20, paddingVertical: 4 },
  totalText: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
  payButton: {
    backgroundColor: '#FF8C00',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
