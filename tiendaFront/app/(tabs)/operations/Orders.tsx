//app/(tabs)/operations/Ordrs.tsx
import { API } from "@/app/ip/IpDirection";
import { useRouter } from "expo-router";
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
  Modal,
} from "react-native";
import LottieView from "lottie-react-native";

export default function Orders() {
  const router = useRouter();

  // Estados
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const [showSuccess, setShowSuccess] = useState(false);

  // 🔹 Cargar usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.log("Error cargando usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // 🔹 Filtrar usuarios
  useEffect(() => {
  const query = searchQuery.trim().toLowerCase();

  const filtered = users.filter(u => {
    const fullName = `${u.Name1} ${u.LastName1}`.toLowerCase();
    const ciString = String(u.CI ?? ""); // convertimos CI a string para comparar correctamente
    return fullName.includes(query) || ciString.includes(searchQuery.trim());
  });

  setFilteredUsers(filtered);
}, [searchQuery, users]);


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
    if (!selectedUser || carrito.length === 0) return;

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

      setShowSuccess(true);
      limpiarCarrito();

      setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      console.error("Error confirmando orden:", error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      
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

      {/* Buscador de Clientes */}
      <Text style={styles.sectionTitle}>Buscar Cliente</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Nombre o CI..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Lista de clientes */}
      {loadingUsers ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ marginVertical: 25 }} />
      ) : filteredUsers.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {filteredUsers.map(u => (
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
        </ScrollView>
      ) : (
        <Text style={styles.noResults}>No se encontró ningún cliente</Text>
      )}

      {/* Botón registrar cliente */}
      <TouchableOpacity
        style={styles.newUserBtnBottom}
        onPress={() => router.push("/register")}
      >
        <Text style={styles.newUserText}>Registrar Nuevo Cliente</Text>
      </TouchableOpacity>

      {/* Lista de categorías */}
      <View style={styles.categoriasContainer}>
        {categorias.length > 0 ? (
          categorias.map(categoria => (
            <TouchableOpacity
              key={categoria.CategoriesID}
              onPress={() =>
                setCategoriaSeleccionada(
                  categoriaSeleccionada === categoria.CategoriesID ? null : categoria.CategoriesID
                )
              }
              style={[
                styles.categoriaItem,
                categoriaSeleccionada === categoria.CategoriesID && styles.categoriaSeleccionada,
              ]}
            >
              <Text
                style={
                  categoriaSeleccionada === categoria.CategoriesID
                    ? styles.categoriaTextSeleccionada
                    : styles.categoriaText
                }
              >
                {categoria.Name_categories}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResults}>No hay categorías...</Text>
        )}
      </View>

      {/* Productos */}
      {categoriaSeleccionada && (
        <View style={styles.productosContainer}>
          <Text style={styles.sectionTitle}>
            Productos de {categorias.find(c => c.CategoriesID === categoriaSeleccionada)?.Name_categories}
          </Text>
          {categorias
            .find(c => c.CategoriesID === categoriaSeleccionada)
            ?.products?.map((p: any) => (
              <View key={p.ProductsID} style={styles.productoItem}>
                <Image
                  source={
                    p.imageUri
                      ? { uri: p.imageUri.startsWith("http") ? p.imageUri : `${API}${p.imageUri}`} 
                      : require("../../../assets/images/noimg.png")
                  }
                  style={styles.productoImage}
                />
                <View style={styles.productoInfo}>
                  <Text style={styles.productoNombre}>{p.Name_product}</Text>
                  <Text style={styles.productoDescripcion}>{p.Description}</Text>
                  <Text style={styles.productoCantidad}>Cantidad: {p.Amount}</Text>
                  <Text style={styles.productoPrecio}>Precio: {p.Price} Bs</Text>
                </View>
                <TouchableOpacity onPress={() => handleBuy(p)}>
                  <Image source={require("../../../assets/images/car.png")} style={styles.addImageBtn} />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      )}

      {/* Carrito */}
      <Text style={styles.sectionTitle}>Carrito</Text>
      {carrito.length === 0 ? (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <LottieView
            source={require("../../../assets/fonts/carrito.json")}
            autoPlay
            loop
            style={{ width: 250, height: 250 }}
          />
          <Text style={{ color: "#666", fontStyle: "italic" }}>Carrito vacío !</Text>
        </View>
      ) :carrito.map((item, index) => (
  <View key={`${item.ProductsID}-${index}`} style={styles.cartItem}>
    {item.imageUri && <Image source={{ uri: `${API}${item.imageUri}` }} style={styles.cartImage} />}
    <Text style={{ flex: 1, marginLeft: 10 }}>{item.Name_product} - {item.Price} Bs</Text>
  </View>
))}

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
  container2:{margin: 10},
  
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginHorizontal: 15, marginVertical: 10, color: "#333" },

  searchInput: {
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

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
  newUserBtnBottom: {
    backgroundColor: "#4CAF50",
    marginHorizontal: 15,
    padding: 12,
    borderRadius: 15,
    marginVertical: 10,
    marginTop:10
  },
  newUserText: { color: "#fff", fontWeight: "bold", textAlign: "center" },

  categoriasContainer: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: 15, marginBottom: 10 },
  categoriaItem: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  categoriaSeleccionada: { backgroundColor: "#6200EE" },
  categoriaText: { color: "#000" },
  categoriaTextSeleccionada: { color: "#fff", fontWeight: "bold" },

  productosContainer: { marginHorizontal: 15 },
  productoItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  productoImage: { width: 60, height: 60, borderRadius: 8 },
  productoInfo: { flex: 1, marginLeft: 10 },
  productoNombre: { fontWeight: "bold", fontSize: 14 },
  productoDescripcion: { fontSize: 12, color: "#666" },
  productoCantidad: { fontSize: 12, color: "#666" },
  productoPrecio: { fontWeight: "bold", color: "#4CAF50" },
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
  cartFooter: { flexDirection: "row", alignItems: "center", marginHorizontal: 15, marginVertical: 15 },
  totalText: { flex: 1, fontWeight: "bold", fontSize: 16, color: "#333" },
  clearBtn: { backgroundColor: "#f44336", padding: 10, borderRadius: 10, marginRight: 10 },
  clearBtnText: { color: "#fff", fontWeight: "600" },
  payBtn: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 10 },
  payBtnText: { color: "#fff", fontWeight: "600" },

  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  lottieContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 20, alignItems: "center" },
  lottie: { width: 250, height: 250, marginBottom: 20 },
  lottieText: { fontSize: 18, fontWeight: "bold", color: "#6200EE" },

  noResults: { textAlign: "center", color: "#666", marginVertical: 10 },
});
