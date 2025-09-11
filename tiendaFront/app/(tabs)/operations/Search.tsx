import { Producto } from "@/app/data/products";
import { Usuario } from "@/app/data/users";
import { API } from "@/app/ip/IpDirection";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Search() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProductos = await fetch(`${API}/products`);
        const dataProductos = await resProductos.json();

        const resUsuarios = await fetch(`${API}/users`);
        const dataUsuarios = await resUsuarios.json();

        setProductos(dataProductos);
        setUsuarios(dataUsuarios);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProductos = productos.filter((p) =>
    p.Name_product.toLowerCase().includes(query.toLowerCase())
  );
  const filteredUsuarios = usuarios.filter((u) =>
    u.Name1.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navbar con degradado */}
      <LinearGradient
        colors={["#FF8C00", "#FF4500"]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.navbar}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backCircle}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.navTitle}>HairLux Search</Text>
      </LinearGradient>

      {/* Buscador */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar productos o usuarios..."
        value={query}
        onChangeText={setQuery}
      />

      {/* Lista de Usuarios */}
      <Text style={styles.sectionTitle}>Usuarios</Text>
      <FlatList
        data={filteredUsuarios}
        keyExtractor={(item) => item.clientID.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.clientID}</Text>
            <Text style={styles.cell}>{item.Name1}</Text>
            <Text style={styles.cell}>{item.Email}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No hay usuarios encontrados</Text>}
      />

      {/* Lista de Productos */}
      <Text style={styles.sectionTitle}>Productos</Text>
      <FlatList
        data={filteredProductos}
        keyExtractor={(item) => item.ProductsID.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.ProductsID}</Text>
            <Text style={styles.cell}>{item.Name_product}</Text>
            <Text style={styles.cell}>{item.Price}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No hay productos encontrados</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 12,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backText: {
    fontSize: 20,
    color: "#FF4500",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  cell: {
    flex: 1,
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
