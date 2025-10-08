// app/(tabs)/PayClient.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from "react-native";
import { CategoriaConProductos } from "../../data/categories";
import { API } from "../../ip/IpDirection";
import { router } from "expo-router";
import { useCarrito } from "../../../hooks/UseCarrito";
import { useStatus } from "../../../hooks/UseStatus"; // <-- hook global

export default function PayClient() {
  const { user, loading: loadingUser } = useStatus(); // <-- detecta login/logout en tiempo real
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

  const { carrito, agregarAlCarrito } = useCarrito();

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();

      const categoriasData: CategoriaConProductos[] = data.map((c: any) => ({
        CategoriesID: c.CategoriesID,
        Name_categories: c.Name_categories,
        products:
          c.products?.map((p: any) => ({
            ProductsID: p.ProductsID,
            Name_product: p.Name_product,
            Price: p.Price,
            Description: p.Description,
            Amount: p.Amount,
            CategoryID: p.CategoryID,
            imageUri: p.imageUri,
          })) || [],
      }));

      setCategorias(categoriasData);
      if (categoriasData.length > 0) setCategoriaSeleccionada(categoriasData[0].CategoriesID);
    } catch (e) {
      console.error("Error al obtener categorías:", e);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Mostrar aviso si no hay usuario o no es cliente
  if (loadingUser) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!user || user.role !== "Cliente") {
    return (
      <View style={styles.container}>
        <Text style={styles.textoAviso}>
          Debes iniciar sesión como cliente para ver los productos y comprar.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Categorías: FlatList horizontal */}
      <FlatList
        data={categorias}
        horizontal
        keyExtractor={(item) => item.CategoriesID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              setCategoriaSeleccionada(
                categoriaSeleccionada === item.CategoriesID ? null : item.CategoriesID
              )
            }
            style={[
              styles.categoriaItem,
              categoriaSeleccionada === item.CategoriesID && styles.categoriaSeleccionada,
            ]}
          >
            <Text
              style={
                categoriaSeleccionada === item.CategoriesID
                  ? styles.categoriaTextSeleccionada
                  : styles.categoriaText
              }
            >
              {item.Name_categories}
            </Text>
          </TouchableOpacity>
        )}
        style={{ maxHeight: 60, marginBottom: 10 }}
        showsHorizontalScrollIndicator={false}
      />

      {/* Productos: FlatList vertical */}
      <FlatList
        data={
          categoriaSeleccionada
            ? categorias.find((c) => c.CategoriesID === categoriaSeleccionada)?.products || []
            : []
        }
        keyExtractor={(item) => item.ProductsID.toString()}
        renderItem={({ item }) => (
          <View style={styles.productoItem}>
            <Image
              source={
                item.imageUri
                  ? { uri: `${API}${item.imageUri.startsWith("/") ? "" : "/"}${item.imageUri}` }
                  : require("../../../assets/images/noimg.png")
              }
              style={styles.productoImagen}
            />
            <View style={styles.productoInfo}>
              <Text style={styles.productoNombre}>{item.Name_product}</Text>
              <Text style={styles.productoDescripcion}>{item.Description}</Text>
              <Text style={styles.productoCantidad}>Cantidad: {item.Amount}</Text>
              <Text style={styles.productoPrecio}>{item.Price} Bs</Text>
            </View>
            <TouchableOpacity onPress={() => agregarAlCarrito(item)}>
              <Ionicons name="cart-outline" size={32} color="#6200EE" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          carrito.length > 0 ? (
            <View style={styles.carritoContainer}>
              <Text style={styles.sectionTitle}>Carrito</Text>
              {carrito.map((p) => (
                <View key={p.ProductsID} style={{ marginBottom: 5 }}>
                  <Text>
                    {p.Name_product} - {p.Price} Bs
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                style={styles.buttonPagar}
                onPress={() => router.push("/(tabs)/payment")}
              >
                <Text style={styles.buttonText}>Ir a pagar</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  categoriaItem: { padding: 10, borderRadius: 8, marginHorizontal: 5, backgroundColor: "#EDE7F6" ,marginVertical:7},
  categoriaSeleccionada: { backgroundColor: "#6200EE" },
  categoriaText: { color: "#000", fontWeight: "500" },
  categoriaTextSeleccionada: { color: "#fff", fontWeight: "600" },
  productoItem: {
    flexDirection: "row",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  productoImagen: { width: 80, height: 80, borderRadius: 12, marginRight: 10 },
  productoInfo: { flex: 1 },
  productoNombre: { fontWeight: "700" },
  productoDescripcion: { fontStyle: "italic", color: "#555" },
  productoCantidad: { color: "#333" },
  productoPrecio: { fontWeight: "700", color: "#6200EE" },
  carritoContainer: { borderTopWidth: 1, borderColor: "#ccc", paddingTop: 10, marginTop: 10 },
  sectionTitle: { fontWeight: "700", fontSize: 18, marginBottom: 10 },
  buttonPagar: { backgroundColor: "#6200EE", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  textoAviso: { fontSize: 18, textAlign: "center", marginTop: 50 },
});
