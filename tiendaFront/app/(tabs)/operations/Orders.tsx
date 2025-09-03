import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import { Order } from '../../data/orders'; // Ajusta el path según tu estructura

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://10.122.24.181:3000/orders'); // Cambia TU_API por la URL correcta
      if (!res.ok) throw new Error('Error fetching orders');
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (order: Order) => {
    try {
      const res = await fetch(`http://10.122.24.181:3000/orders/${order.OrdersID}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: true }),
      });
      if (!res.ok) throw new Error('Error actualizando estado');
      Alert.alert('Éxito', 'Estado actualizado a entregado');
      fetchOrders();
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      const res = await fetch(`/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error eliminando orden');
      Alert.alert('Éxito', 'Orden eliminada');
      fetchOrders();
    } catch {
      Alert.alert('Error', 'No se pudo eliminar la orden');
    }
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderContainer}>
      <Text style={styles.title}>Orden #{item.OrdersID}</Text>
      <Text>Fecha: {new Date(item.Date_order).toLocaleDateString()}</Text>
      <Text>Precio: ${item.United_price.toFixed(2)}</Text>
      <Text>Producto: {item.product?.Name_product || 'N/A'}</Text>
      <Text>Usuario: {item.user?.Name1} {item.user?.LastName1}</Text>
      <Text>Email: {item.user?.Email}</Text>
      <Text>Estado: {item.status?.estado ? 'Entregado' : 'Pendiente'}</Text>

      {!item.status?.estado && (
        <Button title="Marcar como entregado" onPress={() => updateStatus(item)} />
      )}

      <Button
        title="Eliminar Orden"
        color="red"
        onPress={() => {
          Alert.alert(
            'Confirmar',
            '¿Seguro quieres eliminar esta orden?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Eliminar', style: 'destructive', onPress: () => deleteOrder(item.OrdersID) },
            ]
          );
        }}
      />
    </View>
  );

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Listado de Órdenes</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item.OrdersID.toString()}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchOrders}
        ListEmptyComponent={<Text>No hay órdenes para mostrar.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  orderContainer: {
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  title: { fontWeight: 'bold', fontSize: 18 },
});
