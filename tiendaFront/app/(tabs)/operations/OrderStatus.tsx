// app/(tabs)/operations/OrderStatus.tsx
import { API } from "@/app/ip/IpDirection";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LottieView from "lottie-react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
type User = {
  clientID: number;
  Name1: string;
  Name2?: string;
  LastName1: string;
  LastName2?: string;
  CI?: string;
};

type OrderItem = {
  id: number;
  Quantity: number;
  Price: number;
  product: { Name_product: string };
};

type OrderStatusType = { estado: boolean };

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
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  // 🔹 Cargar órdenes
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/orders`);
      const data: Order[] = await res.json();

      // Pendientes primero
      const sorted = data.sort((a, b) => {
        if (a.order_status?.estado === b.order_status?.estado) return 0;
        return a.order_status?.estado ? 1 : -1;
      });
      setOrders(sorted);
    } catch {
      console.log("Error al cargar órdenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  
useFocusEffect(
  useCallback(() => {
    fetchOrders();
  }, [])
);
  // 🔹 Obtener lista de clientes únicos ordenados por la fecha más reciente
  const clientes = Array.from(
    new Map(
      orders
        .sort(
          (a, b) =>
            new Date(b.Date_order).getTime() -
            new Date(a.Date_order).getTime()
        )
        .map((o) => [o.users.clientID, o.users])
    ).values()
  );

  // 🔹 Filtrar clientes
  const query = search.trim().toLowerCase();
  const clientesFiltrados = clientes.filter((u) => {
    const fullName = `${u.Name1} ${u.LastName1}`.toLowerCase();
    const ciString = String(u.CI ?? "");
    return fullName.includes(query) || ciString.includes(search.trim());
  });

  // 🔹 Marcar orden como entregada
const markAsDelivered = async (id: number, currentState: boolean) => {
  try {
    const res = await fetch(`${API}/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: !currentState }), // cambia al opuesto
    });

    if (!res.ok) throw new Error("No se pudo actualizar");

    // Animación + refresco
    setShowSuccessAnim(true);
    setTimeout(() => {
      setShowSuccessAnim(false);
      fetchOrders();
    }, 2500);
  } catch (error) {
    console.log("Error al actualizar orden:", error);
  }
};


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text>Cargando órdenes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animación global de éxito */}
      {showSuccessAnim && (
        <View style={styles.overlay}>
          <LottieView
            source={require("../../../assets/fonts/add.json")}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
        </View>
      )}

      <ScrollView>
       

        {/* Lottie inicial */}
        {!selectedClient && search.length === 0 && (
          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <LottieView
              source={require("../../../assets/fonts/payments.json")}
              autoPlay
              loop
              style={{ width: 260, height: 260 }}
            />
            <Text style={{ color: "#666", fontStyle: "italic" }}>
              
            </Text>
          </View>
        )}
         {/* Buscador */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente por nombre o CI..."
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              setSelectedClient(null);
            }}
          />
        </View>

        {/* Lista de clientes */}
        {!selectedClient && (
          <View style={styles.clientList}>
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((c) => (
                <TouchableOpacity
                  key={c.clientID}
                  style={styles.clientCard}
                  onPress={() => setSelectedClient(c)}
                >
                  <Ionicons
                    name="person-circle-outline"
                    size={40}
                    color="#6200EE"
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.clientName}>
                      {c.Name1} {c.LastName1}
                    </Text>
                    <Text style={styles.clientCI}>
                      CI: {c.CI || "No registrado"}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ alignItems: "center", marginVertical: 20 }}>
                <LottieView
                  source={require("../../../assets/fonts/Error404.json")}
                  autoPlay
                  loop
                  style={{ width: 180, height: 180 }}
                />
                <Text style={{ color: "#999" }}>
                  No se encontraron coincidencias
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Órdenes del cliente seleccionado */}
        {selectedClient && (
          <View>
            <Text style={styles.sectionTitle}>
              Órdenes de {selectedClient.Name1} {selectedClient.LastName1}
            </Text>

            {orders.filter(
              (o) => o.users.clientID === selectedClient.clientID
            ).length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <LottieView
                  source={require("../../../assets/fonts/505Error.json")}
                  autoPlay
                  loop
                  style={{ width: 180, height: 180 }}
                />
                <Text style={{ color: "#666" }}>
                  Este cliente no tiene órdenes registradas
                </Text>
              </View>
            ) : (
              orders
                .filter((o) => o.users.clientID === selectedClient.clientID)
                .map((order) => (
                  <View key={order.OrdersID} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.orderId}>
                        Orden #{order.OrdersID}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          order.order_status?.estado
                            ? styles.badgeDelivered
                            : styles.badgePending,
                        ]}
                      >
                        <Text style={styles.badgeText}>
                          {order.order_status?.estado
                            ? "Entregada ✅"
                            : "Pendiente ⏳"}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.text}>
                      <Text style={styles.label}>Fecha:</Text>{" "}
                      {new Date(order.Date_order).toLocaleDateString()}
                    </Text>

                    <Text style={[styles.label, { marginTop: 8 }]}>
                      Productos:
                    </Text>
                    {order.items.map((item, index) => (
                      <Text
                        key={item.id ?? `${order.OrdersID}-${index}`}
                        style={styles.text}
                      >
                        • {item.product?.Name_product} x{item.Quantity} —{" "}
                        {item.Price} Bs
                      </Text>
                    ))}

                    <Text
                      style={[
                        styles.text,
                        { fontWeight: "bold", marginTop: 5 },
                      ]}
                    >
                      Total:{" "}
                      {order.items.reduce(
                        (sum, item) => sum + item.Price * item.Quantity,
                        0
                      )}{" "}
                      Bs
                    </Text>

                   <TouchableOpacity
  style={styles.imageButton}
  onPress={() =>
    markAsDelivered(order.OrdersID, order.order_status?.estado)
  }
>
  <Image
    source={
      order.order_status?.estado
        ? require("../../../assets/images/pending.png")
        : require("../../../assets/images/complete.png")
    }
    style={styles.imageIcon}
  />
</TouchableOpacity>

                  </View>
                ))
            )}

            <TouchableOpacity
              style={styles.backClientBtn}
              onPress={() => setSelectedClient(null)}
            >
              <Ionicons
                name="arrow-back-circle-outline"
                size={24}
                color="#fff"
              />
              <Text style={styles.backClientText}>Volver a clientes</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9f9f9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, padding: 8, fontSize: 16 },
  icon: { marginRight: 8 },
  clientList: { marginVertical: 10 },
  clientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  clientName: { fontSize: 16, fontWeight: "bold" },
  clientCI: { color: "#555", fontSize: 14 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 10,
  },
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
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  badgePending: { backgroundColor: "#ffcccc" },
  badgeDelivered: { backgroundColor: "#c8f7c5" },
  badgeText: { fontWeight: "bold", color: "#333" },
  text: { fontSize: 15, marginBottom: 4, color: "#444" },
  label: { fontWeight: "bold", color: "#000" },
  imageButton: { marginTop: 12, alignItems: "center" },
  imageIcon: { width: 80, height: 80 },
  backClientBtn: {
    backgroundColor: "#6200EE",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 20,
  },
  backClientText: { color: "#fff", marginLeft: 6, fontWeight: "bold" },
});
