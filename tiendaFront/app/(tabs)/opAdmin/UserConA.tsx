// app/(tabs)/opAdmin/AdminHome.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CategoriaConProductos } from '../../data/categories';
import { Producto } from '../../data/products';
import { API } from '../../ip/IpDirection';

export default function UserConA() {
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

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
      console.error('Error al obtener categorías:', e);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategorias();
    setRefreshing(false);
  };

  const categoriasFiltradas = categorias
    .map((categoria) => ({
      ...categoria,
      products: categoria.products.filter((p) =>
        p.Name_product.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(
      (categoria) =>
        categoria.Name_categories.toLowerCase().includes(search.toLowerCase()) ||
        categoria.products.length > 0
    );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Buscador */}
      <TextInput
        placeholder="Buscar categorías o productos..."
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
      />

      {/* Lista de categorías */}
      <View style={styles.categoriasContainer}>
        {categoriasFiltradas.length > 0 ? (
          categoriasFiltradas.map((categoria) => (
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
          <Text style={styles.noResults}>No se encontró nada...</Text>
        )}
      </View>

      {/* Productos de la categoría seleccionada */}
      {categoriaSeleccionada && (
        <View style={styles.productosContainer}>
          <Text style={styles.sectionTitle}>
            Productos de {categorias.find(c => c.CategoriesID === categoriaSeleccionada)?.Name_categories}
          </Text>
          {categorias
            .find((c) => c.CategoriesID === categoriaSeleccionada)
            ?.products.filter((p) =>
              p.Name_product.toLowerCase().includes(search.toLowerCase())
            )
            .map((p: Producto) => (
              <View key={p.ProductsID} style={styles.productoItem}>
                {p.imageUri && (
                  <Image
                    source={{ uri: `${API}${p.imageUri.startsWith('/') ? '' : '/'}${p.imageUri}` }}
                    style={{ width: '100%', height: 150, borderRadius: 6, marginBottom: 6 }}
                  />
                )}
                <Text style={styles.productoNombre}>{p.Name_product}</Text>
                <Text style={styles.productoDescripcion}>{p.Description}</Text>
                <Text style={styles.productoCantidad}>Cantidad disponible: {p.Amount}</Text>
                <Text style={styles.productoPrecio}>Precio: {p.Price} Bs</Text>
              </View>
            ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 HairLux. Todos los derechos reservados.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 20 },
  searchInput: { marginTop: 15, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
  categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  categoriaItem: { padding: 10, borderRadius: 8, margin: 5, backgroundColor: '#EDE7F6' },
  categoriaSeleccionada: { backgroundColor: '#6200EE' },
  categoriaText: { color: '#000', fontWeight: 'bold' },
  categoriaTextSeleccionada: { color: '#fff', fontWeight: 'bold' },
  productosContainer: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  productoItem: { padding: 12, borderRadius: 12, marginBottom: 10, backgroundColor: '#fff', elevation: 2 },
  productoNombre: { fontWeight: 'bold' },
  productoDescripcion: { fontStyle: 'italic', color: '#555' },
  productoCantidad: { color: '#333', marginTop: 4 },
  productoPrecio: { fontWeight: 'bold', marginTop: 4 },
  noResults: { marginTop: 20, fontStyle: 'italic', color: '#555' },
  footer: { marginTop: 30, alignItems: 'center', paddingVertical: 10 },
  footerText: { fontSize: 12, color: '#888' },
  botonesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  boton: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    padding: 10,
  },
  botonImagen: { width: 50, height: 50, marginBottom: 8 },
  botonTexto: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
