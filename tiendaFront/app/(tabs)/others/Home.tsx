// app/(tabs)/index.tsx
import { router } from 'expo-router';
import React from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Producto } from '../../../app/data/products';
import { CategoriaConProductos } from '../../data/categories';
import { API } from '../../ip/IpDirection';

export default function Home() {
  const [categorias, setCategorias] = React.useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<number | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Obtener categorías
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
      // Seleccionar automáticamente la primera categoría
      if (categoriasData.length > 0) setCategoriaSeleccionada(categoriasData[0].CategoriesID);
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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
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
            <Text style={styles.noResults}>No se encontró nada...</Text>
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
                    style={styles.productoImagen}
                  />
                  <View style={styles.productoInfo}>
                    <Text style={styles.productoNombre}>{p.Name_product}</Text>
                    <Text style={styles.productoDescripcion}>{p.Description}</Text>
                    <Text style={styles.productoCantidad}>Cantidad: {p.Amount}</Text>
                    <Text style={styles.productoPrecio}>Precio: {p.Price} Bs</Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Crear cuenta / Iniciar sesión */}
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Mejora tu experiencia</Text>
          <View style={styles.authButtons}>
            <TouchableOpacity style={styles.authButton} onPress={() => router.push('/(tabs)/register')}>
              <Image
                source={require('../../../assets/images/register.png')}
                style={styles.authIcon}
              />
              <Text style={styles.authText}>Crear cuenta</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.authButton} onPress={() => router.push('/(tabs)/login')}>
              <Image
                source={require('../../../assets/images/login.png')}
                style={styles.authIcon}
              />
              <Text style={styles.authText}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabla de promociones */}
{/* Tabla de promociones */}
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 20 }}>
  <View style={styles.promoContainer}>
    <TouchableOpacity
      style={styles.promoCard}
      onPress={() => {
        // Mostrar la primera categoría
        if (categorias.length > 0) setCategoriaSeleccionada(categorias[0].CategoriesID);
      }}
    >
      <Image source={require('../../../assets/images/productos.png')} style={styles.promoIcon} />
      <Text style={styles.promoText}>Productos</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.promoCard}
      onPress={() => {
        // Seleccionar la categoría que tenga el producto más caro
        let maxPriceProduct: Producto | null = null;
        let maxCategoryId: number | null = null;
        categorias.forEach((cat) => {
          cat.products.forEach((p) => {
            if (!maxPriceProduct || p.Price > maxPriceProduct.Price) {
              maxPriceProduct = p;
              maxCategoryId = cat.CategoriesID;
            }
          });
        });
        if (maxCategoryId) setCategoriaSeleccionada(maxCategoryId);
      }}
    >
      <Image source={require('../../../assets/images/stock.png')} style={styles.promoIcon} />
      <Text style={styles.promoText}>Stock</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.promoCard}
      onPress={() => {
        // Seleccionar la categoría que tenga el producto más barato
        let minPriceProduct: Producto | null = null;
        let minCategoryId: number | null = null;
        categorias.forEach((cat) => {
          cat.products.forEach((p) => {
            if (!minPriceProduct || p.Price < minPriceProduct.Price) {
              minPriceProduct = p;
              minCategoryId = cat.CategoriesID;
            }
          });
        });
        if (minCategoryId) setCategoriaSeleccionada(minCategoryId);
      }}
    >
      <Image source={require('../../../assets/images/promociones.png')} style={styles.promoIcon} />
      <Text style={styles.promoText}>Promociones</Text>
    </TouchableOpacity>
  </View>
</ScrollView>



      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  container2: { margin: 15 },

  searchInput: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 15 },

  categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 20 },
  categoriaItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, margin: 5, backgroundColor: '#EDE7F6', minWidth: '28%', alignItems: 'center' },
  categoriaSeleccionada: { backgroundColor: '#6200EE' },
  categoriaText: { color: '#000', fontWeight: '500' },
  categoriaTextSeleccionada: { color: '#fff', fontWeight: '600' },

  productosContainer: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  productoItem: { flexDirection: 'row', padding: 12, borderRadius: 12, marginBottom: 10, backgroundColor: '#f9f9f9', elevation: 2 },
  productoImagen: { width: 120, height: 120, borderRadius: 12, marginRight: 12 },
  productoInfo: { flex: 1 },
  productoNombre: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  productoDescripcion: { fontStyle: 'italic', color: '#555', marginBottom: 4 },
  productoCantidad: { color: '#333', marginBottom: 2 },
  productoPrecio: { fontWeight: '700', color: '#6200EE' },

  noResults: { marginTop: 20, fontStyle: 'italic', color: '#555', textAlign: 'center' },
/////inicio sesion
  authContainer: { marginTop: 20, alignItems: 'center' },
  authTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  authButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  authButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#cdc4f5ff', padding: 12, borderRadius: 12, flex: 1, marginHorizontal: 5 },
  authIcon: { width: 50, height: 50, marginRight: 10 },
  authText: { fontWeight: '700', fontSize: 16 },

  ////columna 3
  promoContainer: {
  flexDirection: 'row',
  paddingHorizontal: 10,
  gap: 12,
},

promoCard: {
  width: 120,
  height: 120,
  backgroundColor: '#e6d7ff',
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  elevation: 2,
},

promoIcon: { width: 50, height: 50, marginBottom: 8 },
promoText: { fontWeight: '700', fontSize: 14, textAlign: 'center' },

});
