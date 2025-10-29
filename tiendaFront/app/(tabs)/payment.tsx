import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCarrito } from '../../hooks/UseCarrito';
import { Company1, companyData } from '../data/company'; // ✅ Importa la empresa
import { JwtPayload } from '../data/jwtPayload';
import { API } from '../ip/IpDirection';

export default function Payment() {
  const { carrito, limpiarCarrito } = useCarrito();
  const [metodoPago, setMetodoPago] = useState<'qr' | 'efectivo'>('qr');
  const [refreshing, setRefreshing] = useState(false);
  const [cliente, setCliente] = useState<JwtPayload | null>(null);
  const [empresa, setEmpresa] = useState<Company1 | null>(null); // ✅ empresa
  const total = carrito.reduce((sum, item) => sum + item.Price, 0);

  useEffect(() => {
    obtenerCliente();
    obtenerEmpresa();
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

  const obtenerEmpresa = async () => {
    try {
      // Si companyData ya tiene la información, úsala directamente
      if (companyData.length > 0) {
        setEmpresa(companyData[0]);
        return;
      }

      // Si no, trae la empresa desde el backend
      const res = await fetch(`${API}/company`);
      if (res.ok) {
        const data = await res.json();
        setEmpresa(data[0]);
      } else {
        console.error('Error al obtener datos de empresa:', await res.text());
      }
    } catch (error) {
      console.error('Error al cargar empresa:', error);
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
          direccion: empresa?.Address || 'Entrega en el local',
        }),
      });

      if (!res.ok) {
        console.error('Error creando orden:', await res.text());
        Alert.alert('Error', 'No se pudo crear la orden');
        return;
      }

      limpiarCarrito();
      Alert.alert(
        'Éxito',
        `Pago registrado. Retira tus productos en ${empresa?.Address || 'el local de la empresa'}.`
      );
      router.push('/(tabs)/others/Home');
    } catch (error) {
      console.error('Error al crear la orden:', error);
      Alert.alert('Error', 'Ocurrió un problema al procesar el pago');
    }
  };

  // Header de la lista
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
              uri:
                empresa?.QRImage ||
                'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagoEnLocal',
            }}
            style={{ width: 200, height: 200, marginTop: 40, borderRadius: 10 }}
          />
          {empresa?.Address && (
            <Text style={{ marginTop: 10, textAlign: 'center' }}>
              Dirección: {empresa.Address}
            </Text>
          )}
        </View>
      )}

      {metodoPago === 'efectivo' && cliente && (
        <View style={{ marginHorizontal: 20, marginVertical: 10 }}>
          <Text style={styles.sectionTitle}>Datos del cliente</Text>
          <Text style={styles.clientText}>Nombre: {cliente.name}</Text>
          <Text style={styles.clientText}>Correo: {cliente.email || 'Sin correo'}</Text>
          <Text style={styles.clientText}>Rol: {cliente.role}</Text>
          <Text style={styles.clientText}>
            Entrega: {empresa?.Address || 'En el local de la empresa'}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Productos</Text>
      {carrito.length === 0 && <Text style={{ marginHorizontal: 20 }}>No hay productos en el carrito</Text>}
    </View>
  );

  // Footer con botón de pago
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
