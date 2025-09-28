// app/(tabs)/index.tsx
import { router } from 'expo-router';
import React from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Producto } from '../../data/products';
import { CategoriaConProductos } from '../../data/categories';
import { API } from '../../ip/IpDirection';



export default function Home() {
  const [categorias, setCategorias] = React.useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<number | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [menuOpen, setMenuOpen] = React.useState(false);

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

  React.useEffect(() => {
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

  const productosDestacados = categorias
    .flatMap((c) => c.products)
    .sort((a, b) => b.Price - a.Price)
    .slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/LogoFinal.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.navTitle}>HairLuxX</Text>

        {/* Botón hamburguesa */}
        <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.hamburger}>
          <View style={styles.bar}></View>
          <View style={styles.bar}></View>
          <View style={styles.bar}></View>
        </TouchableOpacity>
      </View>

      {/* Menú desplegable */}
      {menuOpen && (
       <View style={styles.dropdownMenu}>
  <TouchableOpacity
    style={styles.boton}
    onPress={() => router.push('/(tabs)/login')}
  >
    <Image
      source={require('../../../assets/images/login.png')}
      style={styles.botonImagen}
      resizeMode="contain"
    />
    <Text style={styles.botonTexto}>Inicio Sesión</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.boton}
    onPress={() => router.push('/(tabs)/register')}
  >
    <Image
      source={require('../../../assets/images/register.png')}
      style={styles.botonImagen}
      resizeMode="contain"
    />
    <Text style={styles.botonTexto}>Registrarse</Text>
  </TouchableOpacity>
</View>

      )}

      <View style={styles.container2}>
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
            <Text style={styles.noResults}>No se encontró nada....</Text>
          )}
        </View>

        {/* Productos */}
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
                  <Image
                    source={
                      p.imageUri
                        ? { uri: `${API}${p.imageUri.startsWith('/') ? '' : '/'}${p.imageUri}` }
                        : require('../../../assets/images/noimg.png')
                    }
                    style={{ width: '50%', height: 150, borderRadius: 6, marginBottom: 6 }}
                  />
                  <Text style={styles.productoNombre}>{p.Name_product}</Text>
                  <Text style={styles.productoDescripcion}>{p.Description}</Text>
                  <Text style={styles.productoCantidad}>Cantidad disponible: {p.Amount}</Text>
                  <Text style={styles.productoPrecio}>Precio: {p.Price} Bs</Text>
                </View>
              ))}
          </View>
        )}

        {/* Productos destacados */}
        <View style={styles.destacadosContainer}>
          <Text style={styles.sectionTitle}>Productos destacados</Text>
          {productosDestacados.map((p: Producto) => (
            <View key={p.ProductsID} style={styles.productoDestacado}>
              <Text style={styles.productoNombre}>{p.Name_product} - {p.Price} Bs</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 HairLux. Todos los derechos reservados.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, margin: 0, marginTop: 0 },
  container2: { margin: 15 },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: '#6200EE',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 80, height: 90},

 navTitle: {
  color: '#fff',
  fontSize: 30,
  fontWeight: 'bold',
  position: 'absolute',
  left: 10,
  right: 0,
  textAlign: 'center',
},

  hamburger: {
  padding: 10,
  position: 'absolute',
  right: 15,
  top: 40,
  zIndex: 10,
},

  bar: { width: 25, height: 3, backgroundColor: '#fff', marginVertical: 2, borderRadius: 2 },

 dropdownMenu: {
  backgroundColor: '#f5f5f5',
  flexDirection: 'row',          // <- fila para que queden lado a lado
  justifyContent: 'space-between', // <- separa los botones
  flexWrap: 'wrap',              // <- si hay más botones bajan a otra fila
  paddingVertical: 10,
  paddingHorizontal: 10,
  borderRadius: 8,
  marginTop: 5,
},


  buttonsContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navButton: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#BB86FC',
    borderRadius: 6,
    flexDirection: 'row',
    gap: 4,
  },
  navButtonText: { color: '#fff', fontWeight: 'bold' },
  buttonIcon: { width: 24, height: 24 },

  searchInput: { marginTop: 15, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },

  categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginTop: 20 },
  categoriaItem: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, margin: 5, backgroundColor: '#EDE7F6', minWidth: '28%', alignItems: 'center' },
  categoriaSeleccionada: { backgroundColor: '#6200EE' },
  categoriaText: { color: '#000' },
  categoriaTextSeleccionada: { color: '#fff' },

  productosContainer: { marginTop: 20 },
  productoItem: { padding: 12, borderRadius: 12, marginBottom: 10, backgroundColor: '#fff', elevation: 2 },
  productoNombre: { fontWeight: 'bold' },
  productoDescripcion: { fontStyle: 'italic', color: '#555' },
  productoCantidad: { color: '#333', marginTop: 4 },
  productoPrecio: { fontWeight: 'bold', marginTop: 4 },

  noResults: { marginTop: 20, fontStyle: 'italic', color: '#555' },

  destacadosContainer: { marginTop: 20 },
  productoDestacado: { padding: 10, marginBottom: 8, backgroundColor: '#FFE082', borderRadius: 8 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },

  footer: { marginTop: 30, alignItems: 'center', paddingVertical: 10 },
  footerText: { fontSize: 12, color: '#888' },
  
boton: {
  width: '48%',                   // para que dos quepan en la misma fila
  height: 120,
  borderRadius: 12,
  backgroundColor: '#cdc4f5ff',
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

botonImagen: {
  width: 70,
  height: 70,
  marginBottom: 8,
},

botonTexto: {
  fontWeight: 'bold',
  textAlign: 'center',
}

});