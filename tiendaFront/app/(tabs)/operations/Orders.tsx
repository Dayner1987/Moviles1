import { API } from "@/app/ip/IpDirection";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import LottieView from "lottie-react-native";

export default function Orders() {
  const router = useRouter();

  // Estados
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [showSuccess, setShowSuccess] = useState(false); // Modal Lottie

  // 🔹 Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.log("Error cargando usuarios");
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
        console.log("Error cargando categorías");
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

  // 🔹 Confirmar orden
  const confirmarOrden = async () => {
    if (!selectedUser) return;
    if (carrito.length === 0) return;

    try {
      const productos = carrito.map(p => ({
        ProductID: p.ProductsID,
        Quantity: p.Quantity ?? 1,
        Price: p.Price,
      }));

      const res = await fetch(`${API}/orders/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserID: selectedUser, productos }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error backend:", errorText);
        return;
      }

      const data = await res.json();
      console.log("Orden creada:", data);

      setShowSuccess(true); // mostrar modal Lottie
      limpiarCarrito();

      setTimeout(() => setShowSuccess(false), 2500); // cerrar modal automáticamente
    } catch (error) {
      console.error("Error confirmando orden:", error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Nueva Orden</Text>
      </View>

      {/* Modal Lottie */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("../../../assets/fonts/add.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
            <Text style={styles.lottieText}>Orden tomada con éxito</Text>
          </View>
        </View>
      </Modal>

      {/* Selección de usuario */}
      <Text style={styles.sectionTitle}>Seleccionar Cliente</Text>
      {loadingUsers ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ marginVertical: 20 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {users.map(u => (
            <TouchableOpacity
              key={u.clientID}
              style={[styles.userBtn, selectedUser === u.clientID && styles.userSelected]}
              onPress={() => setSelectedUser(u.clientID)}
            >
              <Text style={selectedUser === u.clientID ? styles.userTextSelected : styles.userText}>
                {u.Name1} {u.LastName1}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.userBtn, styles.newUserBtn]}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.newUserText}>+ Nuevo Cliente</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Categorías */}
      <Text style={styles.sectionTitle}>Categorías</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              {/* Imagen del producto */}
              {p.imageUri && <Image source={{ uri: `${API}${p.imageUri}` }} style={styles.productImage} />}

              {/* Datos del producto */}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.productName}>{p.Name_product}</Text>
                <Text style={styles.productPrice}>{p.Price} Bs</Text>
                {p.Quantity !== undefined && <Text style={styles.productQuantity}>Cantidad: {p.Quantity}</Text>}
              </View>

              {/* Botón como imagen a la derecha */}
              <TouchableOpacity onPress={() => handleBuy(p)} style={{ padding: 5 }}>
                <Image source={require("../../../assets/images/car.png")} style={styles.addImageBtn} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

      {/* Carrito */}
      <Text style={styles.sectionTitle}>Carrito</Text>
      {carrito.length === 0 ? (
        <Text style={styles.emptyCartText}>Carrito vacío</Text>
      ) : (
        carrito.map(item => (
          <View key={item.ProductsID} style={styles.cartItem}>
            {item.imageUri && <Image source={{ uri: `${API}${item.imageUri}` }} style={styles.cartImage} />}
            <Text style={{ flex: 1, marginLeft: 10 }}>{item.Name_product} - {item.Price} Bs</Text>
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
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 20 },

  navbar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  backBtn: { marginRight: 10 },
  backText: { fontSize: 22 },
  navTitle: { fontSize: 18, fontWeight: "bold", color: "#6200EE" },

  sectionTitle: { fontSize: 16, fontWeight: "bold", marginHorizontal: 15, marginVertical: 10, color: "#333" },
  horizontalScroll: { paddingHorizontal: 10 },

  userBtn: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  userSelected: { backgroundColor: "#6200EE" },
  userText: { color: "#000", fontWeight: "500" },
  userTextSelected: { color: "#fff", fontWeight: "600" },
  newUserBtn: { backgroundColor: "#4CAF50" },
  newUserText: { color: "#fff", fontWeight: "bold" },

  categoryBtn: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categorySelected: { backgroundColor: "#6200EE" },
  categoryText: { color: "#000", fontWeight: "500" },
  categoryTextSelected: { color: "#fff", fontWeight: "600" },

  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 7,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: { width: 60, height: 60, borderRadius: 8 },
  productName: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  productPrice: { color: "#4CAF50", marginBottom: 6 },
  productQuantity: { fontSize: 12, color: "#666" },
  addImageBtn: { width: 35, height: 35 },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  cartImage: { width: 40, height: 40, borderRadius: 5 },
  emptyCartText: { marginHorizontal: 20, fontStyle: "italic", color: "#666" },

  cartFooter: { flexDirection: "row", alignItems: "center", marginHorizontal: 15, marginVertical: 15 },
  totalText: { flex: 1, fontWeight: "bold", fontSize: 16, color: "#333" },
  clearBtn: { backgroundColor: "#f44336", padding: 10, borderRadius: 10, marginRight: 10 },
  clearBtnText: { color: "#fff", fontWeight: "600" },
  payBtn: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 10 },
  payBtnText: { color: "#fff", fontWeight: "600" },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  lottieContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 20, alignItems: "center" },
  lottie: { width: 250, height: 250, marginBottom: 20, borderRadius: 75, borderWidth: 3, borderColor: "#6200EE" },
  lottieText: { fontSize: 18, fontWeight: "bold", color: "#6200EE" },
});
