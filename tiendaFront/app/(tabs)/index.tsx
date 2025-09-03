// app/(tabs)/index.tsx
import React from 'react';
import { View,Text,TouchableOpacity,ScrollView, RefreshControl,StyleSheet,TextInput,Image} from 'react-native';
import { router } from 'expo-router';
import { CategoriaConProductos } from '../data/categories';
import { Producto } from '../../app/data/products';
import { API } from '../ip/IpDirection';


export default function Home() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [categorias, setCategorias] = React.useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<number | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');

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
        categoria.nombre.toLowerCase().includes(search.toLowerCase()) ||
        categoria.products.length > 0
    );

  // Productos destacados (top 3 más caros)
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
            source={require('../../assets/images/LogoFinal.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.navTitle}>HairLuxX</Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 20 },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#6200EE',
    position: 'relative',
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 90, height: 70, marginRight: 10 },
  navTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  hamburger: { position: 'absolute', right: 15, top: 15, justifyContent: 'center' },
  bar: { width: 25, height: 3, backgroundColor: '#fff', marginVertical: 3, borderRadius: 2 },
  dropdownMenu: {
    backgroundColor: '#fff',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 5,
  },
  navButton: { marginVertical: 5, padding: 8, backgroundColor: '#6200EE', borderRadius: 6, width: '100%' },
  navButtonText: { color: '#fff', fontWeight: 'bold' },
  searchInput: { marginTop: 15, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },


  categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20 },
  categoriaItem: { padding: 10, borderRadius: 8, margin: 5, backgroundColor: '#EDE7F6' },
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
});
