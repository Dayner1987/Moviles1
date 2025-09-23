import { API } from "@/app/ip/IpDirection";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Orders() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  // 🔹 Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar los usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 Cargar categorías con productos
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API}/categories`);
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        Alert.alert("Error", "No se pudieron cargar las categorías");
      }
    };
    fetchCategorias();
  }, []);

  // 🔹 Añadir al carrito
  const handleBuy = (producto: any) => {
    setCarrito([...carrito, producto]);
    setTotal(prev => prev + producto.Price);
  };

  // 🔹 Vaciar carrito
  const limpiarCarrito = () => {
    setCarrito([]);
    setTotal(0);
  };

const confirmarOrden = async () => {
  if (!selectedUser) {
    Alert.alert("Error", "Selecciona un cliente primero");
    return;
  }

  if (carrito.length === 0) {
    Alert.alert("Error", "Carrito vacío");
    return;
  }

  try {
    // Preparar los productos del carrito
    const productos = carrito.map((p) => ({
      ProductID: p.ProductsID,
      Quantity: 1, // Si manejas cantidades, cámbialo aquí
      Price: p.Price, // Debe llamarse Price, no United_price
    }));

    // Llamada al backend
    const res = await fetch(`${API}/orders/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        UserID: selectedUser,
        productos, // 🔹 aquí debe ir "productos", no "items"
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error backend:", errorText);
      Alert.alert("Error", "No se pudo registrar la orden");
      return;
    }

    const data = await res.json();
    console.log("Orden creada:", data);

    Alert.alert("Éxito", "Orden registrada correctamente");
    limpiarCarrito();
  } catch (error) {
    console.error("Error confirmando orden:", error);
    Alert.alert("Error", "No se pudo registrar la orden");
  }
};

  return (
    <ScrollView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Nueva Orden</Text>
      </View>

      {/* Selección de usuario */}
      <Text style={styles.header}>Seleccionar Cliente</Text>
      {loadingUsers ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.usersList}>
          {users.map(u => (
            <TouchableOpacity
              key={u.clientID}
              style={[styles.userBtn, selectedUser === u.clientID && styles.userSelected]}
              onPress={() => setSelectedUser(u.clientID)}
            >
              <Text style={styles.userText}>{u.Name1} {u.LastName1}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.userBtn, { backgroundColor: "#4CAF50" }]}
            onPress={() => router.push("/register")}
          >
            <Text style={{ color: "#fff" }}>+ Nuevo Cliente</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Categorías */}
      <Text style={styles.header}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categorias.map(c => (
          <TouchableOpacity
            key={c.CategoriesID}
            style={[styles.categoryBtn, categoriaSeleccionada === c.CategoriesID && styles.categorySelected]}
            onPress={() => setCategoriaSeleccionada(categoriaSeleccionada === c.CategoriesID ? null : c.CategoriesID)}
          >
            <Text style={categoriaSeleccionada === c.CategoriesID ? styles.categoryTextSelected : styles.categoryText}>
              {c.Name_categories}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Productos */}
      {categoriaSeleccionada &&
        categorias.find(c => c.CategoriesID === categoriaSeleccionada)?.products.map((p: any) => (
          <View key={p.ProductsID} style={styles.productCard}>
            {p.imageUri && <Image source={{ uri: `${API}${p.imageUri}` }} style={styles.productImage} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{p.Name_product}</Text>
              <Text style={styles.productPrice}>{p.Price} Bs</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => handleBuy(p)}>
                <Text style={styles.addBtnText}>Añadir al carrito</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      {/* Carrito */}
      <Text style={styles.header}>Carrito</Text>
      {carrito.length === 0 ? (
        <Text style={{ marginHorizontal: 20 }}>Carrito vacío</Text>
      ) : (
        carrito.map(item => (
          <View key={item.ProductsID} style={styles.cartItem}>
            {item.imageUri && <Image source={{ uri: `${API}${item.imageUri}` }} style={styles.cartImage} />}
            <Text style={{ flex: 1, marginLeft: 10 }}>
              {item.Name_product} - {item.Price} Bs
            </Text>
          </View>
        ))
      )}
      {carrito.length > 0 && (
        <View style={styles.cartFooter}>
          <Text style={styles.totalText}>Total: {total.toFixed(2)} Bs</Text>
          <TouchableOpacity style={styles.clearBtn} onPress={limpiarCarrito}>
            <Text style={styles.clearBtnText}>Vaciar carrito</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.payBtn} onPress={confirmarOrden}>
            <Text style={styles.payBtnText}>Confirmar Orden</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", margin: 5, marginTop: 20 },
  navbar: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#eee" },
  backBtn: { marginRight: 10 },
  backText: { fontSize: 20 },
  navTitle: { fontSize: 18, fontWeight: "bold" },
  header: { fontSize: 16, fontWeight: "bold", margin: 15 },
  usersList: { paddingHorizontal: 10 },
  userBtn: { padding: 10, backgroundColor: "#ddd", borderRadius: 10, marginRight: 10 },
  userSelected: { backgroundColor: "#2196F3" },
  userText: { color: "#000" },
  categories: { paddingHorizontal: 10, marginBottom: 10 },
  categoryBtn: { padding: 10, borderRadius: 10, backgroundColor: "#ddd", marginRight: 10 },
  categorySelected: { backgroundColor: "#2196F3" },
  categoryText: { color: "#000" },
  categoryTextSelected: { color: "#fff" },
  productCard: { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  productImage: { width: 60, height: 60, marginRight: 10 },
  productName: { fontSize: 14, fontWeight: "bold" },
  productPrice: { color: "green", marginBottom: 5 },
  addBtn: { backgroundColor: "#2196F3", padding: 5, borderRadius: 5 },
  addBtnText: { color: "#fff", textAlign: "center" },
  cartItem: { flexDirection: "row", alignItems: "center", padding: 10 },
  cartImage: { width: 40, height: 40 },
  cartFooter: { flexDirection: "row", alignItems: "center", padding: 15 },
  totalText: { flex: 1, fontWeight: "bold", fontSize: 16 },
  clearBtn: { backgroundColor: "#f44336", padding: 10, borderRadius: 10, marginRight: 10 },
  clearBtnText: { color: "#fff" },
  payBtn: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 10 },
  payBtnText: { color: "#fff" },
});
