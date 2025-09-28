import { Producto } from "@/app/data/products";
import { API } from "@/app/ip/IpDirection";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Search2() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  const filteredProductos = productos.filter((p) =>
    p.Name_product.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <LinearGradient
        colors={["#FFA500", "#FF6347"]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.navbar}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backCircle}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Buscar Productos</Text>
      </LinearGradient>

      {/* Buscador */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre del producto..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
      />

      {/* Tabla scrollable */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Encabezados */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Categoría</Text>
            <Text style={[styles.tableHeaderText, { flex: 3 }]}>Producto</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Precio</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Stock</Text>
            <Text style={[styles.tableHeaderText, { flex: 4 }]}>Descripción</Text>
          </View>

          {/* Lista de productos */}
          {filteredProductos.length > 0 ? (
            filteredProductos.map((item) => (
              <View key={item.ProductsID} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {item.categories?.Name_categories ?? "Sin categoría"}
                </Text>
                <Text style={[styles.tableCell, { flex: 3 }]}>
                  {item.Name_product}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  ${item.Price.toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  {item.Amount ?? "-"}
                </Text>
                <Text style={[styles.tableCell, { flex: 4 }]} numberOfLines={1}>
                  {item.Description ?? "Sin descripción"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No se encontraron productos.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  backText: {
    fontSize: 18,
    color: "#FF4500",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FF6347",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tableHeaderText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableCell: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
    color: "#999",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#444",
  },
});
