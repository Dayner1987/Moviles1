import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
// Importa Producto desde products
import { Producto } from "../../data/products";
import { CategoriaConProductos } from "../../data/categories";

import { API } from "../../ip/IpDirection";
import { useStatus } from "../../../hooks/UseStatus";
import { Company1, companyData } from "../../data/company";

export default function Home() {
  const router = useRouter();
  const { user, loading: loadingUser } = useStatus();

  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const [company, setCompany] = useState<Company1 | null>(companyData[0] || null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  // 🔹 Obtener información de la empresa
  const fetchCompany = async () => {
    setLoadingCompany(true);
    try {
      const res = await fetch(`${API}/company`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setCompany(data[0]);
      else if (data?.CompanyID) setCompany(data);
      else if (companyData.length > 0) setCompany(companyData[0]);
    } catch (err) {
      console.error("Error al obtener empresa:", err);
      Alert.alert(
        "Error",
        "No se pudo cargar la información de la empresa. Se usarán datos locales."
      );
      if (companyData.length > 0) setCompany(companyData[0]);
    } finally {
      setLoadingCompany(false);
    }
  };

  // 🔹 Obtener categorías y productos
  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();

      const categoriasData: CategoriaConProductos[] = data.map((c: any) => ({
        CategoriesID: c.CategoriesID,
        Name_categories: c.Name_categories,
        products:
          c.products?.map((p: any) => ({
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
      if (categoriasData.length > 0)
        setCategoriaSeleccionada(categoriasData[0].CategoriesID);
    } catch (e) {
      console.error("Error al obtener categorías:", e);
    }
  };

  useEffect(() => {
    fetchCompany();
    fetchCategorias();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompany();
    await fetchCategorias();
    setRefreshing(false);
  };

  const categoriasFiltradas = categorias.filter((c) =>
    c.Name_categories.toLowerCase().includes(search.toLowerCase()) ||
    c.products.some((p) =>
      p.Name_product.toLowerCase().includes(search.toLowerCase())
    )
  );
  

  if (loadingUser || loadingCompany) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TextInput
          placeholder="Buscar categorías o productos..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      {/* Promociones */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 20 }}>
        <View style={styles.promoContainer}>
          <TouchableOpacity
            style={styles.promoCard}
            onPress={() => {
              if (categorias.length > 0) setCategoriaSeleccionada(categorias[0].CategoriesID);
            }}
          >
            <Image source={require('../../../assets/images/productos.png')} style={styles.promoIcon} />
            <Text style={styles.promoText}>Productos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.promoCard}
            onPress={() => {
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

      {/* Categorías */}
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

      {/* Empresa */}
      <View style={styles.companyCard}>
        {company?.Logo ? (
          <Image source={{ uri: company.Logo }} style={styles.companyLogo} />
        ) : (
          <View style={[styles.companyLogo, styles.logoPlaceholder]}>
            <Text>Logo</Text>
          </View>
        )}
        <Text style={styles.companyName}>{company?.Name || "Mi Empresa"}</Text>
        <TouchableOpacity
          style={styles.moreInfoButton}
          onPress={() => router.push("/(tabs)/companyInfo")}
        >
          <Text style={styles.moreInfoText}>Más información</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador y auth */}
      <View style={styles.container2}>
        
        {!user && (
          <View style={styles.authContainer}>
            <Text style={styles.authTitle}>Mejora tu experiencia</Text>
            <View style={styles.authButtons}>
              <TouchableOpacity
                style={styles.authButton}
                onPress={() => router.push("/(tabs)/register")}
              >
                <Image
                  source={require("../../../assets/images/register.png")}
                  style={styles.authIcon}
                />
                <Text style={styles.authText}>Crear cuenta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.authButton}
                onPress={() => router.push("/(tabs)/login")}
              >
                <Image
                  source={require("../../../assets/images/login.png")}
                  style={styles.authIcon}
                />
                <Text style={styles.authText}>Inicio sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff",margin :10},
  container2: { margin: 20 },
  searchInput: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
  },

  // 🔹 Estilos info empresa
  companyCard: {
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    padding: 15,
    margin: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  companyLogo: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  companyName: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  moreInfoButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  moreInfoText: { color: "#fff", fontWeight: "600" },

  // 🔹 Sección login / registro
  authContainer: { marginTop: 20, alignItems: "center" },
  authTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  authButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  authButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#cdc4f5ff",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  authIcon: { width: 40, height: 40, marginRight: 10 },
  authText: { fontWeight: "700", fontSize: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoPlaceholder: {
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#e0e0e0",
},
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
