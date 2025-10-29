// app/(tabs)/operations/Search.tsx
import { Producto } from "@/app/data/products";
import { Usuario } from "@/app/data/users";
import { API } from "@/app/ip/IpDirection";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SearchDashboard() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [queryUser, setQueryUser] = useState("");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [queryProduct, setQueryProduct] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();

    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtrado
  const filteredUsers = usuarios.filter(
    (u) =>
      u.Name1.toLowerCase().includes(queryUser.toLowerCase()) ||
      u.LastName1.toLowerCase().includes(queryUser.toLowerCase()) ||
      String(u.CI).includes(queryUser.trim())
  );

  const filteredProducts = productos.filter((p) =>
    p.Name_product.toLowerCase().includes(queryProduct.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Lottie central */}
      <View style={styles.lottieContainer}>
        <LottieView
          source={require("../../../assets/fonts/Profile.json")}
          autoPlay
          loop
          style={{ width: 250, height: 250 }}
        />
        <Text style={{ color: "#666", fontStyle: "italic" }}>
        </Text>
      </View>

      {/* ===== Usuarios ===== */}
      <View style={[styles.card, { backgroundColor: "#f3e5f5" }]}>
        <Text style={styles.cardTitle}>Usuarios</Text>
        <TextInput
          style={[styles.searchInput, { borderColor: "#646464ff" }]}
          placeholder="Buscar usuario por nombre, apellido o CI..."
          placeholderTextColor="#706c6cff"
          value={queryUser}
          onChangeText={setQueryUser}
        />

        {/* Encabezado */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.col, { flex: 2 }]}>Carnet    </Text>
          <Text style={[styles.col, { flex: 3 }]}>  Nombre</Text>
          <Text style={[styles.col, { flex: 3 }]}>Apellido</Text>
          <Text style={[styles.col, { flex: 5 }]}>Email</Text>
        </View>

        {loadingUsers ? (
          <ActivityIndicator size="large" color="#9c27b0" style={{ margin: 10 }} />
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              source={require("../../../assets/fonts/Error404.json")}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.emptyText}>No se encontraron usuarios</Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 300 }}>
            {filteredUsers.map((u) => (
              <View key={u.clientID} style={styles.tableRow}>
              <Text style={[styles.col, { flex: 3 }]}>{u.CI}</Text>
<Text style={[styles.col, { flex: 3 }]}>{u.Name1}</Text>
<Text style={[styles.col, { flex: 3 }]}>{u.LastName1}</Text>
<Text style={[styles.col, { flex: 5 }]}>{u.Email}</Text>

              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ===== Productos ===== */}
      <View style={[styles.card, { backgroundColor: "#e1bee7" }]}>
        <Text style={styles.cardTitle}>Productos</Text>
        <TextInput
          style={[styles.searchInput, { borderColor: "#6b6b6bff" }]}
          placeholder="Buscar producto por nombre..."
          placeholderTextColor="#818081ff"
          value={queryProduct}
          onChangeText={setQueryProduct}
        />

        {/* Encabezado */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.col, { flex: 3 }]}>Nombre</Text>
          <Text style={[styles.col, { flex: 2 }]}>Precio</Text>
          <Text style={[styles.col, { flex: 4 }]}>Categoría</Text>
          <Text style={[styles.col, { flex: 2 }]}>Cantidad</Text>
        </View>

        {loadingProducts ? (
          <ActivityIndicator size="large" color="#7b1fa2" style={{ margin: 10 }} />
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              source={require("../../../assets/fonts/505Error.json")}
              autoPlay
              loop
              style={{ width: 120, height: 120 }}
            />
            <Text style={styles.emptyText}>No se encontraron productos</Text>
          </View>
        ) : (
          <ScrollView style={{ maxHeight: 300 }}>
            {filteredProducts.map((p) => (
              <View key={p.ProductsID} style={styles.tableRow}>
                <Text style={[styles.col, { flex: 3 }]}>{p.Name_product}</Text>
                <Text style={[styles.col, { flex: 2 }]}>{p.Price} Bs</Text>
                <Text style={[styles.col, { flex: 4 }]}>{p.categories?.Name_categories || "-"}</Text>
                <Text style={[styles.col, { flex: 2 }]}>{p.Amount}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  lottieContainer: { alignItems: "center", marginBottom: 15 },

  card: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#4a148c",
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 16, // más espacio vertical
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },

  tableHeader: {
    backgroundColor: "#cc87e7ff", // violeta claro
    borderBottomWidth: 2,
    borderBottomColor: "#c007e0ff", // violeta oscuro
  },

  col: {
    fontSize: 15,
    color: "#333",
    flexShrink: 1, // evita que se rompa el texto
  },

  emptyContainer: {
    alignItems: "center",
    marginVertical: 10,
  },

  emptyText: {
    color: "#999",
    fontSize: 15,
  },

  // Scroll para la tabla
  tableScroll: {
    maxHeight: 300, // ajusta la altura visible
    borderRadius: 8,
    backgroundColor: "#ffffffff", // ligero violeta para diferenciar filas
  },
});
