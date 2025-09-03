// app/(tabs)/ClientHome.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useCarrito } from '../../hooks/UseCarrito';
import { CategoriaConProductos } from '../data/categories';
import { Producto } from '../data/products';
import { API } from '../ip/IpDirection';

export default function ClientHome() {
  const { carrito, agregarAlCarrito, limpiarCarrito } = useCarrito();
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      const categoriasData: CategoriaConProductos[] = data.map((c: any) => ({
        id: c.CategoriesID,
        nombre: c.Name_categories,
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

  useEffect(() => { fetchCategorias(); }, []);

  const handleBuy = (item: Producto) => {
    agregarAlCarrito(item);
  };

  const total = carrito.reduce((sum, item) => sum + item.Price, 0);

  return (
    <ScrollView style={styles.container}>
      
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>HairLux</Text>
      </View>

      {/* Categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
        {categorias.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.categoryBtn, categoriaSeleccionada === c.id && styles.categorySelected]}
            onPress={() => setCategoriaSeleccionada(categoriaSeleccionada === c.id ? null : c.id)}
          >
            <Text style={categoriaSeleccionada === c.id ? styles.categoryTextSelected : styles.categoryText}>
              {c.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Productos */}
      {categoriaSeleccionada &&
        categorias.find(c => c.id === categoriaSeleccionada)?.products.map(p => (
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
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' ,marginTop:30,margin:0},
  navbar: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backBtn: { padding: 5 },
  backText: { fontSize: 24, color: '#6200EE' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#6200EE' },
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
  payBtn: { backgroundColor: '#FF8C00', padding: 10, borderRadius: 6, alignItems: 'center',marginBottom:20 },
  payBtnText: { color: '#fff', fontWeight: 'bold' ,marginBottom:20},
});
