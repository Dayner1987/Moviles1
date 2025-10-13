import { router } from "expo-router";
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
import { CategoriaConProductos } from "../../data/categories";
import { API } from "../../ip/IpDirection";
import { useStatus } from "../../../hooks/UseStatus";
import { Company1, companyData } from "../../data/company";

export default function Home() {
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

  // 🔹 Mostrar carga
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
      {/* 🔹 Información de la empresa */}
      {/* 🔹 Información de la empresa siempre visible */}
<View style={styles.companyCard}>
  {/* Si hay logo, mostrarlo; si no, placeholder */}
  {company?.Logo ? (
    <Image source={{ uri: company.Logo }} style={styles.companyLogo} />
  ) : (
    <View style={[styles.companyLogo, styles.logoPlaceholder]}>
      <Text>Logo</Text>
    </View>
  )}

  {/* Nombre de la empresa, si no hay, texto por defecto */}
  <Text style={styles.companyName}>{company?.Name || "Mi Empresa"}</Text>

  <TouchableOpacity
    style={styles.moreInfoButton}
    onPress={() => router.push("/(tabs)/companyInfo")}
  >
    <Text style={styles.moreInfoText}>Más información</Text>
  </TouchableOpacity>
</View>


      {/* 🔹 Buscador */}
      <View style={styles.container2}>
        <TextInput
          placeholder="Buscar categorías o productos..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />

        {/* 🔹 Mostrar login / registro solo si no hay usuario */}
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
                <Text style={styles.authText}>Iniciar sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  container2: { margin: 15 },
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
  authIcon: { width: 50, height: 50, marginRight: 10 },
  authText: { fontWeight: "700", fontSize: 16 },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logoPlaceholder: {
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#e0e0e0",
},

});
