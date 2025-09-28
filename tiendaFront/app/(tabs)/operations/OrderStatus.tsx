import { OrderItem } from "@/app/data/orders";
import { API } from "@/app/ip/IpDirection";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
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

  // 🔹 Cargar todas las órdenes
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/orders`);
      const data: Order[] = await res.json();

      // Ordenar: pendientes primero, entregadas después
      const sorted = data.sort((a, b) => {
        if (a.order_status?.estado === b.order_status?.estado) return 0;
        return a.order_status?.estado ? 1 : -1; // pendientes arriba
      });

      setOrders(sorted);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las órdenes");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Marcar como entregada
  const markAsDelivered = async (id: number) => {
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: true }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar");

      Alert.alert("✅ Orden marcada como entregada");
      fetchOrders();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la orden");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔹 Filtrar órdenes
  const filteredOrders = orders.filter(
    (order) =>
      `${order.users.Name1} ${order.users.LastName1}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.items.some((item) =>
        item.product?.Name_product
          .toLowerCase()
          .includes(search.toLowerCase())
      )
  );

  if (loading) {
    return (
      <View style={styles.center}>
        
        <ActivityIndicator size="large" color="#6200EE" />
        <Text>Cargando órdenes...</Text>
      </View>
    );
  }

  return (

    <ScrollView style={styles.container}>
{/* Navbar */}
<View style={styles.navbar}>
  <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
    <Ionicons name="arrow-back" size={28} color="#fff" />
  </TouchableOpacity>
  <Text style={styles.navTitle}>Gestión de Órdenes</Text>
</View>

      

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
        <Text style={styles.empty}>No hay órdenes registradas 📦</Text>
      ) : (
        filteredOrders.map((order) => (
          <View key={order.OrdersID} style={styles.card}>
            {/* Estado con badge */}
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>Orden #{order.OrdersID}</Text>
              <View
                style={[
                  styles.badge,
                  order.order_status?.estado
                    ? styles.badgeDelivered
                    : styles.badgePending,
                ]}
              >
                <Text style={styles.badgeText}>
                  {order.order_status?.estado ? "Entregada ✅" : "Pendiente ⏳"}
                </Text>
              </View>
            </View>

            {/* Cliente */}
            <Text style={styles.text}>
              <Text style={styles.label}>Cliente:</Text>{" "}
              {order.users.Name1} {order.users.Name2 || ""}{" "}
              {order.users.LastName1} {order.users.LastName2 || ""}
            </Text>

            {/* Fecha */}
            <Text style={styles.text}>
              <Text style={styles.label}>Fecha:</Text>{" "}
              {new Date(order.Date_order).toLocaleDateString()}
            </Text>

            {/* Productos */}
            <Text style={[styles.label, { marginTop: 8 }]}>Productos:</Text>
            {order.items.map((item, index) => (
              <Text
                key={item.id ?? `${order.OrdersID}-${index}`}
                style={styles.text}
              >
                • {item.product?.Name_product} x{item.Quantity} — {item.Price} Bs
              </Text>
            ))}

            {/* Total */}
            <Text style={[styles.text, { fontWeight: "bold", marginTop: 5 }]}>
              Total:{" "}
              {order.items.reduce(
                (sum, item) => sum + item.Price * item.Quantity,
                0
              )}{" "}
              Bs
            </Text>

            {/* Imagen en lugar de botón */}
            {!order.order_status?.estado && (
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => markAsDelivered(order.OrdersID)}
              >
                <Image
                  source={require("../../../assets/images/complete.png")}
                  style={styles.imageIcon}
                />
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  empty: { textAlign: "center", marginTop: 20, fontSize: 16, color: "#555" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: { fontSize: 16, fontWeight: "bold", color: "#6200EE" },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgePending: { backgroundColor: "#ffcccc" },
  badgeDelivered: { backgroundColor: "#c8f7c5" },
  badgeText: { fontWeight: "bold", color: "#333" },
  text: { fontSize: 15, marginBottom: 4, color: "#444" },
  label: { fontWeight: "bold", color: "#000" },

  // Imagen en vez de botón
  imageButton: {
    marginTop: 12,
    alignItems: "center",
  },
  imageIcon: {
    width: 85,
    height: 85,
    // verde para indicar "completar"
  },

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
  backButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#6200EE",
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  alignSelf: "flex-start",
  marginBottom: 12,
},
backText: {
  color: "#fff",
  marginLeft: 6,
  fontWeight: "bold",
},
navbar: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#6200EE",
  paddingVertical: 12,
  paddingHorizontal: 15,
  borderRadius: 8,
  marginBottom: 16,
},
navBack: {
  marginRight: 10,
},
navTitle: {
  flex: 1,
  color: "#fff",
  fontSize: 20,
  fontWeight: "bold",
  textAlign: "center",
},

});
