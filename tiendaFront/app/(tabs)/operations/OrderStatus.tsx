import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { API } from "@/app/ip/IpDirection";
import { OrderItem } from "@/app/data/orders";

// Tipos
type User = {
  Name1: string;
  Name2?: string;
  LastName1: string;
  LastName2?: string;
};

type OrderStatusType = {
  estado: boolean;
};

type Order = {
  OrdersID: number;
  Date_order: string;
  users: User;
  order_status: OrderStatusType;
  items: OrderItem[];
};

export default function OrderStatus() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔹 Cargar órdenes pendientes
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/orders`);
      const data: Order[] = await res.json();

      // Solo pendientes
      const pendingOrders = data.filter(order => order.order_status?.estado === false);
      setOrders(pendingOrders);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Marcar como completada
  const markAsDelivered = async (id: number) => {
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: true }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar");

      Alert.alert("✅ Orden marcada como entregada");
      fetchOrders(); // recargar lista
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la orden");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔹 Filtrar órdenes por cliente o producto
  const filteredOrders = orders.filter(order =>
    `${order.users.Name1} ${order.users.LastName1}`.toLowerCase().includes(search.toLowerCase()) ||
    order.items.some(item => item.product?.Name_product.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando órdenes...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Órdenes pendientes</Text>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#555" style={styles.icon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente o producto..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filteredOrders.length === 0 ? (
        <Text style={styles.empty}>No hay órdenes pendientes 🎉</Text>
      ) : (
        filteredOrders.map(order => (
          <View key={order.OrdersID} style={styles.card}>
            <Text style={styles.text}>
              <Text style={styles.label}>Cliente:</Text>{" "}
              {order.users.Name1} {order.users.Name2 || ""} {order.users.LastName1} {order.users.LastName2 || ""}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Fecha:</Text>{" "}
              {new Date(order.Date_order).toLocaleDateString()}
            </Text>

            {/* Productos */}
            <Text style={[styles.label, { marginTop: 8 }]}>Productos:</Text>
           {order.items.map((item, index) => (
  <Text key={item.id ?? `${order.OrdersID}-${index}`} style={styles.text}>
    • {item.product?.Name_product} x{item.Quantity} — {item.Price} Bs
  </Text>
))}

          

            {/* Total */}
            <Text style={[styles.text, { fontWeight: "bold", marginTop: 5 }]}>
              Total:{" "}
              {order.items.reduce((sum, item) => sum + item.Price * item.Quantity, 0)} Bs
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => markAsDelivered(order.OrdersID)}
            >
              <Text style={styles.buttonText}>Marcar como entregada</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  empty: { textAlign: "center", marginTop: 20, fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  text: { fontSize: 16, marginBottom: 4 },
  label: { fontWeight: "bold" },
  button: {
    marginTop: 10,
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchInput: { flex: 1, padding: 8, fontSize: 16 },
  icon: { marginRight: 8 },
});
