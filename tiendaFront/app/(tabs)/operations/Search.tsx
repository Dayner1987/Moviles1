import { API } from "@/app/ip/IpDirection";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Producto } from "@/app/data/products";
import { Usuario } from "@/app/data/users";

export default function Search() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Obtener datos de la API
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

  // Filtrar por buscador
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
      {/* Buscador */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar productos o usuarios..."
        value={query}
        onChangeText={setQuery}
      />

      {/* Botón opcional para volver atrás */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

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
    padding: 12,
    backgroundColor: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  backBtn: {
    marginBottom: 15,
  },
  backText: {
    color: "blue",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
