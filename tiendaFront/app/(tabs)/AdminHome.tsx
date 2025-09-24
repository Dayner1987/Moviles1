// AdminHome.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, Alert, Image, ScrollView,RefreshControl
} from 'react-native';
import { CategoriaConProductos } from '../data/categories';
import { API } from '../ip/IpDirection';
import { Producto } from '../data/products';
import { router } from 'expo-router';


export default function AdminHome() {
  
 
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
            categoria.Name_categories.toLowerCase().includes(search.toLowerCase()) ||
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
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                       <View style={styles.backCircle}>
                         <Text style={styles.backText}>←</Text>
                       </View>
                     </TouchableOpacity>
   
           <Text style={styles.navTitle}>HairLuxX</Text>
   
         </View>
   
        
   
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
          {/*Botones*/}
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
                          <TouchableOpacity
                            style={styles.boton}
                            onPress={() => router.push('/(tabs)/opAdmin/NewUsers')}
                          >
                            <Image
                              source={require('../../assets/images/users.png')}
                              style={styles.botonImagen}
                              resizeMode="contain"
                            />
                            <Text style={styles.botonTexto}>Ganancias</Text>
                          </TouchableOpacity>
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
   backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  backText: { color: '#6200EE', fontSize: 24, fontWeight: 'bold' },
 backButton: { justifyContent: 'center', alignItems: 'center' },
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
