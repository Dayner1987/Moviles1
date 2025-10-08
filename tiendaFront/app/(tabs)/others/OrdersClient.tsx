// app/(tabs)/others/OrdersClient.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Order } from "../../data/orders";
import { useStatus } from "../../../hooks/UseStatus"; // <-- hook global
import { API } from "../../ip/IpDirection";

export default function OrdersClient() {
  const { user, loading: loadingUser } = useStatus(); // <--- observamos el estado de sesión

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (userId: number) => {
    try {
      const res = await fetch(`${API}/orders/user/${userId}`);
      if (!res.ok) throw new Error("Error al obtener órdenes");

      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error al obtener órdenes:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (user) {
      fetchOrders(user.id);
    } else {
      // Si no hay usuario, limpiar las órdenes
      setOrders([]);
      setLoading(false);
    }
  }, [user]); // <-- se ejecuta cada vez que cambia el usuario

  const renderItem = ({ item }: { item: Order }) => {
    const isCompleted = item.order_status?.estado;
    const total = item.items?.reduce((sum, i) => sum + i.Price * i.Quantity, 0) || 0;

    return (
      <View style={styles.orderCard}>
        <View style={styles.header}>
          <Text style={styles.date}>{new Date(item.Date_order).toLocaleString()}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isCompleted ? "#32CD32" : "#FF6347" },
            ]}
          >
            <Text style={styles.statusText}>{isCompleted ? "Completada" : "Pendiente"}</Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {item.items?.map((i) => (
            <Text key={i.id} style={styles.itemText}>
              {i.product?.Name_product} x{i.Quantity} - {i.Price * i.Quantity} Bs
            </Text>
          ))}
        </View>

        <Text style={styles.totalText}>Total: {total} Bs</Text>
      </View>
    );
  };

  if (loadingUser || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Necesitas iniciar sesión para ver tus órdenes</Text>
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No hay órdenes pendientes</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.OrdersID.toString()}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#555" },
  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  date: { fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontWeight: "bold" },
  itemsContainer: { marginBottom: 10 },
  itemText: { fontSize: 16, marginBottom: 2 },
  totalText: { fontWeight: "700", fontSize: 16, textAlign: "right" },
});
