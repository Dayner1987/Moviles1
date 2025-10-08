// app/(tabs)/index.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CategoriaConProductos } from '../../data/categories';
import { API } from '../../ip/IpDirection';
import { useStatus } from '../../../hooks/UseStatus';

export default function Home() {
  const { user, loading: loadingUser } = useStatus(); // <--- Usamos el hook compartido

  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Cargar categorías (solo estado interno)
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
      if (categoriasData.length > 0) setCategoriaSeleccionada(categoriasData[0].CategoriesID);
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

  if (loadingUser) {
    return (
      <View style={styles.center}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container2}>
        <TextInput
          placeholder="Buscar categorías o productos..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {/* Solo mostrar login/registro si no hay usuario */}
        {!user && (
          <View style={styles.authContainer}>
            <Text style={styles.authTitle}>Mejora tu experiencia</Text>
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.authButton}
                onPress={() => router.push('/(tabs)/register')}
              >
                <Image
                  source={require('../../../assets/images/register.png')}
                  style={styles.authIcon}
                />
                <Text style={styles.authText}>Crear cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.authButton}
                onPress={() => router.push('/(tabs)/login')}
              >
                <Image
                  source={require('../../../assets/images/login.png')}
                  style={styles.authIcon}
                />
                <Text style={styles.authText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Las categorías se mantienen en estado pero no se muestran */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  container2: { margin: 15 },
  searchInput: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 15 },

  authContainer: { marginTop: 20, alignItems: 'center' },
  authTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  authButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  authButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#cdc4f5ff', padding: 12, borderRadius: 12, flex: 1, marginHorizontal: 5 },
  authIcon: { width: 50, height: 50, marginRight: 10 },
  authText: { fontWeight: '700', fontSize: 16 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
