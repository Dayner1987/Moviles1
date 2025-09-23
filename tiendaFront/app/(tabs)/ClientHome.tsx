// app/(tabs)/ClientHome.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCarrito } from '../../hooks/UseCarrito';
import { CategoriaConProductos } from '../data/categories';
import { Producto } from '../data/products';
import { API } from '../ip/IpDirection';
import { Usuario } from '../data/users';

export default function ClientHome() {
  const { carrito, agregarAlCarrito, limpiarCarrito } = useCarrito();
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  
  // Datos del Usuario
  const [cliente, setCliente] = useState<Usuario | null>(null);
  const [menuClienteAbierto, setMenuClienteAbierto] = useState(false);

  // Cargar datos del usuario desde la API
  
const fetchCliente = async () => {
  try {
    const res = await fetch(`${API}/users/1`);

    if (!res.ok) {
      console.error('Error al obtener el usuario:', res.status, res.statusText);
      return;
    }

    const data: Usuario = await res.json(); // parsea JSON directamente
    setCliente(data);

  } catch (e) {
    console.error('Error conectando al API:', e);
  }
};


  // Cargar categorías
  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      const categoriasData: CategoriaConProductos[] = data.map((c: any) => ({
        CategoriesID: c.CategoriesID,
        Name_categories: c.Name_categories,
        products: c.products?.map((p: any) => ({
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
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchCliente();
  }, []);

  const handleBuy = (item: Producto) => {
    agregarAlCarrito(item);
  };

  const total = carrito.reduce((sum, item) => sum + item.Price, 0);
//// 
  return (
    <ScrollView style={styles.container}>
      
      {/* Navbar */}
      <View style={styles.navbarContainer}>
        <View style={styles.navbar}>
          {/* Botón de retroceso */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          {/* Título */}
          <Text style={styles.navTitle}>HairLux</Text>

          {/* Imagen de usuario */}
          <TouchableOpacity onPress={() => setMenuClienteAbierto(!menuClienteAbierto)}>
            <Image
              source={require('../../assets/images/client.png')}
              style={styles.userImage}
            />
          </TouchableOpacity>
        </View>

        {/* Dropdown de cliente */}
        {menuClienteAbierto && cliente && (
          <View style={styles.dropdownCliente}>
            <Text style={styles.dropdownText}>
              Nombre: {cliente.Name1} {cliente.Name2 || ''} {cliente.LastName1} {cliente.LastName2 || ''}
            </Text>
            <Text style={styles.dropdownText}>CI: {cliente.CI}</Text>
            <Text style={styles.dropdownText}>Email: {cliente.Email}</Text>
            <Text style={styles.dropdownText}>Dirección: {cliente.Address}</Text>
            <Text style={styles.dropdownText}>Rol: {cliente.role?.NameRol || 'Cliente'}</Text>
          </View>
        )}
      </View>

      {/* Categorías */}
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
        categorias.find(c => c.CategoriesID === categoriaSeleccionada)?.products.map(p => (
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
          <TouchableOpacity style={styles.payBtn} onPress={() => router.push('/payment')}>
            <Text style={styles.payBtnText}>Ir a pagar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', marginTop: 30, margin: 0 },
  navbarContainer: { position: 'relative', zIndex: 10 },
  navbar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f5f5f5' },
  backBtn: { padding: 5 },
  backText: { fontSize: 24, color: '#6200EE' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#6200EE' },
  userImage: { width: 40, height: 40, borderRadius: 20 },
  dropdownCliente: {
    position: 'absolute',
    top: 60,
    right: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  dropdownText: { fontSize: 14, marginBottom: 4 },

  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  categories: { flexDirection: 'row', marginBottom: 15 },
  categoryBtn: { padding: 10, backgroundColor: '#eee', borderRadius: 8, marginRight: 10 },
  categorySelected: { backgroundColor: '#6200EE' },
  categoryText: { color: '#000' },
  categoryTextSelected: { color: '#fff' },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 10, elevation: 2 },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  productName: { fontWeight: 'bold', fontSize: 16 },
  productPrice: { color: '#32CD32', marginVertical: 5 },
  addBtn: { backgroundColor: '#32CD32', padding: 8, borderRadius: 6, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderRadius: 6, marginBottom: 5 },
  cartImage: { width: 50, height: 50, borderRadius: 6 },
  cartFooter: { marginTop: 15 },
  totalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  clearBtn: { backgroundColor: 'red', padding: 10, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  clearBtnText: { color: '#fff', fontWeight: 'bold' },
  payBtn: { backgroundColor: '#FF8C00', padding: 10, borderRadius: 6, alignItems: 'center', marginBottom: 20 },
  payBtnText: { color: '#fff', fontWeight: 'bold' },
});
