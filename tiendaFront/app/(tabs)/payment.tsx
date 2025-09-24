import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useCarrito } from '../../hooks/UseCarrito';
import { API } from '../ip/IpDirection';
import { router } from 'expo-router';

export default function Payment() {
  const { carrito, limpiarCarrito } = useCarrito();
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'qr' | 'efectivo'>('tarjeta');

  // Estados extra
  const [menuOpen, setMenuOpen] = useState(false);
  const [cliente, setCliente] = useState<any>(null); // 👈 deberías traerlo de tu API o contexto
  const [refreshing, setRefreshing] = useState(false);

  // Datos tarjeta
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [numTarjeta, setNumTarjeta] = useState('');
  const [mesExp, setMesExp] = useState('');
  const [anioExp, setAnioExp] = useState('');
  const [cvv, setCvv] = useState('');

  // Dirección
  const [calle, setCalle] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [ciudad, setCiudad] = useState('Cochabamba');

  // Calcular total
  const total = carrito.reduce((sum, item) => sum + item.Price, 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePay = async () => {
    if (
      metodoPago === 'tarjeta' &&
      (!nombreTarjeta || !numTarjeta || !mesExp || !anioExp || !cvv || !calle || !codigoPostal || !ciudad)
    ) {
      alert('Completa todos los datos de la tarjeta y dirección');
      return;
    }

    if (carrito.length === 0) {
      alert('El carrito está vacío');
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
          UserID: 1,
          productos,
          metodoPago,
          direccion: `${calle}, ${codigoPostal}, ${ciudad}`,
        }),
      });

      if (!res.ok) {
        console.error('Error creando orden:', await res.text());
        alert('No se pudo crear la orden');
        return;
      }

      limpiarCarrito();
      alert('Pago realizado y orden creada');
    } catch (error) {
      console.error('Error al crear la orden:', error);
      alert('Ocurrió un problema al procesar el pago');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>HairLux</Text>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.hamburger}>
          <View style={styles.bar}></View>
          <View style={styles.bar}></View>
          <View style={styles.bar}></View>
        </TouchableOpacity>
      </View>

      {/* Menú desplegable */}
      {menuOpen && cliente && (
        <View style={styles.dropdownMenu}>
          <Image source={require('../../assets/images/client.png')} style={styles.dropdownUserImage} />
          <Text style={styles.dropdownText}>
            Nombre: {cliente.Name1} {cliente.LastName1} {cliente.LastName2 || ''}
          </Text>
          <Text style={styles.dropdownText}>CI: {cliente.CI}</Text>
          <Text style={styles.dropdownText}>Email: {cliente.Email}</Text>
          <Text style={styles.dropdownText}>Dirección: {cliente.Address}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.statusDot} />
            <Text style={styles.dropdownTextHighlight}> Rol: {cliente.role?.NameRol || 'Cliente'}</Text>
          </View>
        </View>
      )}

      <View>
        <Text style={styles.title}>Pago</Text>

        {/* Métodos de pago */}
        <Text style={styles.sectionTitle}>Método de pago</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.methodButton, metodoPago === 'tarjeta' && styles.selectedButton]}
            onPress={() => setMetodoPago('tarjeta')}
          >
            <Text style={styles.methodText}>Tarjeta</Text>
          </TouchableOpacity>
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

        {/* Formulario según método */}
        {metodoPago === 'tarjeta' && (
          <View style={styles.form}>
            <TextInput placeholder="Nombre en la tarjeta" style={styles.input} value={nombreTarjeta} onChangeText={setNombreTarjeta} />
            <TextInput placeholder="Número de tarjeta" style={styles.input} value={numTarjeta} onChangeText={setNumTarjeta} keyboardType="numeric" maxLength={16} />
            <View style={styles.row}>
              <TextInput placeholder="MM" style={[styles.input, styles.halfInput]} value={mesExp} onChangeText={setMesExp} keyboardType="numeric" maxLength={2} />
              <TextInput placeholder="AA" style={[styles.input, styles.halfInput]} value={anioExp} onChangeText={setAnioExp} keyboardType="numeric" maxLength={2} />
              <TextInput placeholder="CVV" style={[styles.input, styles.halfInput]} value={cvv} onChangeText={setCvv} keyboardType="numeric" maxLength={4} />
            </View>

            <Text style={styles.sectionTitle}>Dirección de envío</Text>
            <TextInput placeholder="Calle" style={styles.input} value={calle} onChangeText={setCalle} />
            <TextInput placeholder="Código postal" style={styles.input} value={codigoPostal} onChangeText={setCodigoPostal} keyboardType="numeric" />
            <View style={styles.pickerContainer}>
              <Picker selectedValue={ciudad} onValueChange={setCiudad} style={Platform.OS === 'ios' ? { flex: 1 } : {}}>
                <Picker.Item label="Cochabamba" value="Cochabamba" />
                <Picker.Item label="Tarija" value="Tarija" />
                <Picker.Item label="La Paz" value="La Paz" />
                <Picker.Item label="Santa Cruz" value="Santa Cruz" />
              </Picker>
            </View>
          </View>
        )}

        {metodoPago === 'qr' && (
          <View style={{ marginHorizontal: 20, marginVertical: 10, alignItems: 'center' }}>
            <Text>Escanea este código QR para pagar:</Text>
            <Image
              source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PagoRandom' }}
              style={{ width: 150, height: 150, marginTop: 10 }}
            />
          </View>
        )}

        {metodoPago === 'efectivo' && (
          <View style={{ marginHorizontal: 20 }}>
            <Text>Pago en efectivo. Ingresa la dirección de entrega:</Text>
            <TextInput placeholder="Calle" style={styles.input} value={calle} onChangeText={setCalle} />
            <TextInput placeholder="Código postal" style={styles.input} value={codigoPostal} onChangeText={setCodigoPostal} />
            <View style={styles.pickerContainer}>
              <Picker selectedValue={ciudad} onValueChange={setCiudad} style={{ flex: 1 }}>
                <Picker.Item label="Cochabamba" value="Cochabamba" />
                <Picker.Item label="Tarija" value="Tarija" />
                <Picker.Item label="La Paz" value="La Paz" />
                <Picker.Item label="Santa Cruz" value="Santa Cruz" />
              </Picker>
            </View>
          </View>
        )}

        {/* Carrito */}
        <Text style={styles.sectionTitle}>Productos</Text>
        {carrito.length === 0 ? (
          <Text style={{ marginHorizontal: 20 }}>No hay productos en el carrito</Text>
        ) : (
          <FlatList
            data={carrito}
            keyExtractor={(item) => item.ProductsID.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text>{item.Name_product} - {item.Price} Bs</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <Text style={styles.totalText}>Total a pagar: {total} Bs</Text>
        <TouchableOpacity style={styles.payButton} onPress={handlePay}>
          <Text style={styles.payButtonText}>Finalizar pago</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, marginTop: 20 },
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
  form: { marginHorizontal: 20, marginVertical: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { flex: 1, marginRight: 10 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 10, overflow: 'hidden' },
  cartItem: { marginHorizontal: 20, paddingVertical: 4 },
  totalText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 20, marginVertical: 10 },
  payButton: { marginHorizontal: 20, backgroundColor: '#FF8C00', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 20 },
  payButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  dropdownMenu: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    justifyContent: 'flex-start',
  },
  dropdownUserImage: { width: 85, height: 85, marginBottom: 12 },
  dropdownText: { fontSize: 16, marginBottom: 6, color: '#1f2dadff', fontWeight: '600' },
  dropdownTextHighlight: { color: '#0dd32eff', fontWeight: '700' },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', marginRight: 6 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 22, color: '#fff' },
  navTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  hamburger: { padding: 5 },
  bar: { width: 25, height: 3, backgroundColor: '#fff', marginVertical: 2, borderRadius: 2 },
});
