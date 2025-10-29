import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LottieView from "lottie-react-native";
import { jwtDecode } from "jwt-decode";
import { useStatus } from "../../../hooks/UseStatus";
import { API } from "../../ip/IpDirection";
import { Order } from "../../data/orders";
import { JwtPayload } from "../../data/jwtPayload";

export default function OrdersClient() {
  const { user, setUser, loading: loadingUser } = useStatus();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Carga automática del token si el usuario no está en el contexto global
  useEffect(() => {
    const loadUserFromToken = async () => {
      if (user) return; // ya existe, no hacemos nada

      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decoded = jwtDecode<JwtPayload>(token);
          if (decoded.role?.toLowerCase() === "cliente") {
            setUser(decoded);
          }
        }
      } catch (err) {
        console.warn("Error al verificar token:", err);
      }
    };

    loadUserFromToken();
  }, []);

  // 🔹 Cargar órdenes del cliente cuando haya usuario
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
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrders(user.id);
  }, [user]);

  const renderItem = ({ item }: { item: Order }) => {
    const isCompleted = item.order_status?.estado;
    const total =
      item.items?.reduce((sum, i) => sum + i.Price * i.Quantity, 0) || 0;

    return (
      <View style={styles.orderCard}>
        <View style={styles.header}>
          <Text style={styles.date}>
            {new Date(item.Date_order).toLocaleString()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isCompleted ? "#32CD32" : "#FF6347" },
            ]}
          >
            <Text style={styles.statusText}>
              {isCompleted ? "Completada" : "Pendiente"}
            </Text>
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

  // 🔹 Si no hay usuario o no es cliente
  if (!user || user.role?.toLowerCase() !== "cliente") {
    return (
      <View style={styles.container}>
        <LottieView
          source={require("../../../assets/fonts/505Error.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.textoAviso}>
          Debes iniciar sesión como cliente para ver tus órdenes.
        </Text>
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No hay órdenes registradas</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  date: { fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontWeight: "bold" },
  itemsContainer: { marginBottom: 10 },
  itemText: { fontSize: 16, marginBottom: 2 },
  totalText: { fontWeight: "700", fontSize: 16, textAlign: "right" },

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  lottie: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  textoAviso: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    textAlign: "center",
  },
});
