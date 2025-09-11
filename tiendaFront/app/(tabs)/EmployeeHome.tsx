// app/(tabs)/ClientHome.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { CategoriaConProductos } from '../data/categories';
import { Producto } from '../data/products';
import { API } from '../ip/IpDirection';

export default function ClientHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

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
      
          imageUri: p.imageUri, // <-- imágenes incluidas
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
        categoria.nombre.toLowerCase().includes(search.toLowerCase()) ||
        categoria.products.length > 0
    );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>HairLux</Text>
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.hamburger}>
          <View style={styles.bar}></View>
          <View style={styles.bar}></View>
          <View style={styles.bar}></View>
        </TouchableOpacity>
      </View>

      {menuOpen && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/login')}>
            <Text style={styles.navButtonText}>Ingresar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.push('/register')}>
            <Text style={styles.navButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      )}

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
                    key={categoria.id}
                    onPress={() =>
                      setCategoriaSeleccionada(
                        categoriaSeleccionada === categoria.id ? null : categoria.id
                      )
                    }
                    style={[
                      styles.categoriaItem,
                      categoriaSeleccionada === categoria.id && styles.categoriaSeleccionada,
                    ]}
                  >
                    <Text
                      style={
                        categoriaSeleccionada === categoria.id
                          ? styles.categoriaTextSeleccionada
                          : styles.categoriaText
                      }
                    >
                      {categoria.nombre}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResults}>No se encontró nada....</Text>
              )}
            </View>
      
            {/* Productos de la categoría seleccionada */}
            {categoriaSeleccionada && (
              <View style={styles.productosContainer}>
                <Text style={styles.sectionTitle}>
                  Productos de {categorias.find(c => c.id === categoriaSeleccionada)?.nombre}
                </Text>
                {categorias
                  .find((c) => c.id === categoriaSeleccionada)
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

      {/* Botones 2x2 */}
      <View style={styles.botonesGrid}>
        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/(tabs)/opAdmin/NewProducts')}
        >
          <Image
            source={require('../../assets/images/products.png')}
            style={styles.botonImagen}
            resizeMode="contain"
          />
          <Text style={styles.botonTexto}>Gestionar productos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/(tabs)/operations/AddProducts')}
        >
          <Image
            source={require('../../assets/images/EditProducts.png')}
            style={styles.botonImagen}
            resizeMode="contain"
          />
          <Text style={styles.botonTexto}>Agregar producto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/(tabs)/operations/Orders')}
        >
          <Image
            source={require('../../assets/images/Ordes.jpeg')}
            style={styles.botonImagen}
            resizeMode="contain"
          />
          <Text style={styles.botonTexto}>Órdenes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/')}
        >
          <Image
            source={require('../../assets/images/products.png')}
            style={styles.botonImagen}
            resizeMode="contain"
          />
          <Text style={styles.botonTexto}>Gestionar productos</Text>
        </TouchableOpacity>
         <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/(tabs)/operations/Search')}
        >
          <Image
            source={require('../../assets/images/search.png')}
            style={styles.botonImagen}
            resizeMode="contain"
          />
          <Text style={styles.botonTexto}>Gestionar productos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 ,marginTop:20},
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 22,
    color: '#fff',
  },
  navTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  hamburger: { padding: 5 },
  bar: { width: 25, height: 3, backgroundColor: '#fff', marginVertical: 2, borderRadius: 2 },
  dropdownMenu: { backgroundColor: '#E0E0E0', padding: 10, borderRadius: 8, marginBottom: 10 },
  navButton: { padding: 8, backgroundColor: '#6200EE', marginVertical: 4, borderRadius: 6 },
  navButtonText: { color: '#fff', fontWeight: 'bold' },
  searchInput: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  categoriaContainer: { marginBottom: 15 },
  categoriaItem: { padding: 10, borderRadius: 8, backgroundColor: '#EDE7F6' },
  categoriaSeleccionada: { backgroundColor: '#6200EE' },
  categoriaText: { color: '#000', fontWeight: 'bold' },
  categoriaTextSeleccionada: { color: '#fff', fontWeight: 'bold' },
  productoItem: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginTop: 5 },
  productoNombre: { fontWeight: 'bold', fontSize: 16 },
  productoPrecio: { fontWeight: '600' },
  productoDescripcion: { fontStyle: 'italic', color: '#555' },
  productoCantidad: { color: '#333', fontWeight: '500' },
  productosContainer: { marginTop: 20 },
  botonesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  noResults: { marginTop: 20, fontStyle: 'italic', color: '#555' },
   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
    categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  
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
