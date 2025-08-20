import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';// npm inst all @react-native-picker/picker
import { useCarrito } from '../../hooks/UseCarrito';

export default function Payment() {
  const { carrito, limpiarCarrito } = useCarrito();
  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'qr'>('tarjeta');

  // Datos tarjeta
  const [nombreTarjeta, setNombreTarjeta] = useState('');
  const [numTarjeta, setNumTarjeta] = useState('');
  const [mesExp, setMesExp] = useState('');
  const [anioExp, setAnioExp] = useState('');
  const [cvv, setCvv] = useState('');

  // Datos dirección
  const [calle, setCalle] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [ciudad, setCiudad] = useState('Cochabamba');

  // Calcular total
  const total = carrito.reduce((sum, item) => {
    const precioNum = parseFloat(item.precio.replace(/[^\d.]/g, '')) || 0;
    return sum + precioNum;
  }, 0);

  const handlePay = () => {
    if (metodoPago === 'tarjeta' && (!nombreTarjeta || !numTarjeta || !mesExp || !anioExp || !cvv || !calle || !codigoPostal || !ciudad)) {
      Alert.alert('Error', 'Completa todos los datos de la tarjeta y dirección');
      return;
    }

    const factura = {
      id: Math.floor(Math.random() * 1000000),
      productos: carrito,
      total,
      metodo: metodoPago === 'tarjeta' ? 'Tarjeta de crédito' : 'QR',
      fecha: new Date().toLocaleString(),
      direccion: { calle, codigoPostal, ciudad }
    };

    Alert.alert(
      'Pago realizado',
      `Factura #${factura.id}\nMétodo: ${factura.metodo}\nTotal: ${factura.total} Bs\nCiudad: ${factura.direccion.ciudad}`,
      [{ text: 'Aceptar', onPress: () => limpiarCarrito() }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pago</Text>

      <Text style={styles.sectionTitle}>Método de pago</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.methodButton, metodoPago === 'tarjeta' && styles.selectedButton]}
          onPress={() => setMetodoPago('tarjeta')}
        >
          <Text style={styles.methodText}>Tarjeta de crédito</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.methodButton, metodoPago === 'qr' && styles.selectedButton]}
          onPress={() => setMetodoPago('qr')}
        >
          <Text style={styles.methodText}>QR</Text>
        </TouchableOpacity>
      </View>

      {metodoPago === 'tarjeta' && (
        <View style={styles.form}>
          <TextInput
            placeholder="Nombre en la tarjeta"
            style={styles.input}
            value={nombreTarjeta}
            onChangeText={setNombreTarjeta}
          />
          <TextInput
            placeholder="Número de tarjeta"
            style={styles.input}
            value={numTarjeta}
            onChangeText={setNumTarjeta}
            keyboardType="numeric"
            maxLength={16}
          />
          <View style={styles.row}>
            <TextInput
              placeholder="MM"
              style={[styles.input, styles.halfInput]}
              value={mesExp}
              onChangeText={setMesExp}
              keyboardType="numeric"
              maxLength={2}
            />
            <TextInput
              placeholder="AA"
              style={[styles.input, styles.halfInput]}
              value={anioExp}
              onChangeText={setAnioExp}
              keyboardType="numeric"
              maxLength={2}
            />
            <TextInput
              placeholder="CVV"
              style={[styles.input, styles.halfInput]}
              value={cvv}
              onChangeText={setCvv}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <Text style={styles.sectionTitle}>Dirección de envío</Text>
          <TextInput
            placeholder="Calle"
            style={styles.input}
            value={calle}
            onChangeText={setCalle}
          />
          <TextInput
            placeholder="Código postal"
            style={styles.input}
            value={codigoPostal}
            onChangeText={setCodigoPostal}
            keyboardType="numeric"
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={ciudad}
              onValueChange={(itemValue) => setCiudad(itemValue)}
              style={Platform.OS === 'ios' ? { flex: 1 } : {}}
            >
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

      <Text style={styles.sectionTitle}>Productos</Text>
      {carrito.length === 0 ? (
        <Text style={{ marginHorizontal: 20 }}>No hay productos en el carrito</Text>
      ) : (
        <FlatList
          data={carrito}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Text>
                {item.nombre} - {item.precio}
              </Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 20 },
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
});
