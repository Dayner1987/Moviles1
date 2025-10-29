import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { jwtDecode } from "jwt-decode";
import { useCarrito } from "../../../hooks/UseCarrito";
import { CategoriaConProductos } from "../../data/categories";
import { API } from "../../ip/IpDirection";
import { JwtPayload } from "../../data/jwtPayload";

export default function PayClient() {
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCliente, setIsCliente] = useState(false);

  const { carrito, agregarAlCarrito, eliminarDelCarrito } = useCarrito();

  // 🔹 Cargar token y verificar si es cliente
  useEffect(() => {
    const verificarToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          setIsCliente(false);
          setLoading(false);
          return;
        }

        const decoded = jwtDecode<JwtPayload>(token);
        console.log("Token decodificado en PayClient:", decoded);

        if (decoded.role?.toLowerCase() === "cliente") {
          setIsCliente(true);
          await fetchCategorias();
        } else {
          setIsCliente(false);
        }
      } catch (e) {
        console.error("Error al verificar token:", e);
        setIsCliente(false);
      } finally {
        setLoading(false);
      }
    };

    verificarToken();
  }, []);

  // 🔹 Obtener categorías y productos
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando productos...</Text>
      </View>
    );
  }

  if (!isCliente) {
    return (
      <View style={styles.container}>
        <LottieView
          source={require("../../../assets/fonts/Error404.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.textoAviso}>
          Debes iniciar sesión como cliente para ver los productos y comprar.
        </Text>
      </View>
    );
  }

  // Calcular total
  const total = carrito.reduce((sum, item) => sum + item.Price, 0);

  return (
    <View style={styles.container}>
      {/* ======= CATEGORÍAS ======= */}
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

      {/* ======= PRODUCTOS ======= */}
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
              <Text style={styles.productoPrecio}>{item.Price} Bs</Text>
            </View>
            <TouchableOpacity onPress={() => agregarAlCarrito(item)}>
              <Ionicons name="cart-outline" size={30} color="#6200EE" />
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          carrito.length > 0 ? (
            <View style={styles.carritoContainer}>
              <Text style={styles.sectionTitle}>🛒 Tu carrito</Text>

              <ScrollView style={{ maxHeight: 220 }}>
                {carrito.map((p) => (
                  <View key={p.ProductsID} style={styles.carritoItem}>
                    <Image
                      source={
                        p.imageUri
                          ? { uri: `${API}${p.imageUri.startsWith("/") ? "" : "/"}${p.imageUri}` }
                          : require("../../../assets/images/noimg.png")
                      }
                      style={styles.carritoImg}
                    />
                    <View style={styles.carritoInfo}>
                      <Text style={styles.carritoNombre}>{p.Name_product}</Text>
                      <Text style={styles.carritoPrecio}>{p.Price} Bs</Text>
                    </View>
                    <TouchableOpacity onPress={() => eliminarDelCarrito(p.ProductsID)}>
                      <Ionicons name="trash-outline" size={26} color="#d32f2f" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total: {total} Bs</Text>
              </View>

              <TouchableOpacity
                style={styles.buttonPagar}
                onPress={() => router.push("/(tabs)/payment")}
              >
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Ir a pagar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.carritoVacio}>Tu carrito está vacío</Text>
          )
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#fff" },
  categoriaItem: {
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
    backgroundColor: "#EDE7F6",
    marginVertical: 7,
  },
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
    elevation: 1,
  },
  productoImagen: { width: 80, height: 80, borderRadius: 12, marginRight: 10 },
  productoInfo: { flex: 1 },
  productoNombre: { fontWeight: "700", fontSize: 16, color: "#333" },
  productoDescripcion: { fontStyle: "italic", color: "#666", fontSize: 13 },
  productoPrecio: { fontWeight: "700", color: "#6200EE", marginTop: 4 },
  carritoContainer: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderColor: "#ccc" },
  sectionTitle: { fontWeight: "700", fontSize: 18, marginBottom: 10, color: "#333" },
  carritoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: "#fafafa",
    borderRadius: 10,
    padding: 8,
    elevation: 1,
  },
  carritoImg: { width: 55, height: 55, borderRadius: 10, marginRight: 10 },
  carritoInfo: { flex: 1 },
  carritoNombre: { fontSize: 15, fontWeight: "600", color: "#222" },
  carritoPrecio: { color: "#6200EE", fontWeight: "bold" },
  carritoVacio: { textAlign: "center", marginTop: 20, fontStyle: "italic", color: "#666" },
  totalContainer: { marginTop: 10, marginBottom: 5, alignItems: "flex-end" },
  totalText: { fontSize: 17, fontWeight: "bold", color: "#000" },
  buttonPagar: {
    backgroundColor: "#6200EE",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 6 },
  textoAviso: { fontSize: 18, textAlign: "center", marginTop: 50 },
  lottie: {
    width: 320,
    height: 200,
    marginTop: 150,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
