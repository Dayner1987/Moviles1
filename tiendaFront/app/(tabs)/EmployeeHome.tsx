// app/(tabs)/ClientHome.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { CategoriaConProductos } from '../data/categories';
import { Producto } from '../data/products';
import { API } from '../ip/IpDirection';
import { Usuario } from '../data/users';

export default function ClientHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Datos del Usuario
    const [cliente, setCliente] = useState<Usuario | null>(null);
  
    // Cargar datos del usuario desde la API
    
  const fetchEmployee = async () => {
    try {
      const res = await fetch(`${API}/users/2`);
  
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
    fetchEmployee();
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

{/* Menú desplegable con datos del usuario */}

{menuOpen && cliente && (
  <View style={styles.dropdownMenu}>
    <Image
      source={require('../../assets/images/employe.png')}
      style={styles.dropdownUserImage}
    />
    <Text style={styles.dropdownText}>
      Nombre: {cliente.Name1} {cliente.LastName1} {cliente.LastName2 || ''}
    </Text>
    <Text style={styles.dropdownText}>CI: {cliente.CI}</Text>
    <Text style={styles.dropdownText}>Email: {cliente.Email}</Text>
    <Text style={styles.dropdownText}>Dirección: {cliente.Address}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={styles.statusDot} />
      <Text style={styles.dropdownTextHighlight}> Rol: {cliente.role?.NameRol || 'Empleado'}</Text>
    </View>
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
          onPress={() => router.push('/(tabs)/operations/OrderStatus')}
        >
          <Image
            source={require('../../assets/images/status.png')}
            style={styles.botonImagen}
            resizeMode="contain"
          />
          <Text style={styles.botonTexto}>Ordenes Pendientes</Text>
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
          <Text style={styles.botonTexto}>Busqueda Clientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/(tabs)/operations/Search2')}
        >
          <Image
            source={require('../../assets/images/search2.png')}
            style={styles.botonImagen}
            resizeMode="contain"
          />
          <Text style={styles.botonTexto}>Busqueda Productos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push('/(tabs)/opAdmin/EarNings')}
        >
          <Image
            source={require('../../assets/images/earning.png')}
            style={styles.botonImagen}
            resizeMode="contain"
          />
          <Text style={styles.botonTexto}>Ganancias</Text>
        </TouchableOpacity>
         <Text>© 2025 HairLux. Todos los derechos reservados.</Text>
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
 
  navButton: { padding: 8, backgroundColor: '#6200EE', marginVertical: 4, borderRadius: 6 },
  navButtonText: { color: '#fff', fontWeight: 'bold' },
  searchInput: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  
  productoItem: { padding: 10, backgroundColor: '#fff', borderRadius: 8, marginTop: 5 },
  productoNombre: { fontWeight: 'bold', fontSize: 16 },
  productoPrecio: { fontWeight: '600' },
  productoDescripcion: { fontStyle: 'italic', color: '#555' },
  productoCantidad: { color: '#333', fontWeight: '500' },
  productosContainer: { marginTop: 20 },
  botonesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  noResults: { marginTop: 20, fontStyle: 'italic', color: '#555' },
   sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
    
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
  // Estilos mejorados para el menú desplegable de usuario
dropdownMenu: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 16,
  marginBottom: 15,
  elevation: 8,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 8,
  justifyContent: 'flex-start',
},

dropdownUserImage: {
  width: 85,
  height: 85,

  marginBottom: 12,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
},

dropdownText: {
  fontSize: 16,
  marginBottom: 6,
  color: '#1f2dadff',
  fontWeight: '600',
  
},

dropdownTextHighlight: {
  color: '#0dd32eff',
  fontWeight: '700',
},
statusDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#4CAF50', // verde brillante
  marginRight: 6,
},
categoriasContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',           // permite varias filas
  justifyContent: 'flex-start', // se alinea desde la izquierda
  marginTop: 10,
},

categoriaItem: {
  paddingVertical: 8,
  paddingHorizontal:17,
  borderRadius: 10,
  backgroundColor: '#EDE7F6',
  margin: 7, // <- esto controla el espacio alrededor de cada chip
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'flex-start',
},

categoriaSeleccionada: {
  backgroundColor: '#6200EE',
},

categoriaText: { 
  color: '#000', 
  fontWeight: 'bold',
  textAlign: 'center',
},

categoriaTextSeleccionada: { 
  color: '#fff', 
  fontWeight: 'bold', 
  textAlign: 'center',
},

});
