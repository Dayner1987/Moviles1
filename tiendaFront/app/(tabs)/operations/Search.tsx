import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { API } from "@/app/ip/IpDirection";
import { Usuario } from "@/app/data/users";

export default function Search() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        setUsuarios(data);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsuarios = usuarios.filter((u) =>
    u.Name1.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4500" />
        <Text style={styles.loadingText}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <LinearGradient
        colors={["#FF8C00", "#FF4500"]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.navbar}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backCircle}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Usuarios</Text>
      </LinearGradient>

      {/* Buscador */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre..."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
      />

      {/* Tabla con scroll horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Encabezado */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 1.8 }]}>CI</Text>
            <Text style={[styles.headerCell, { flex: 2.2 }]}>Nombre</Text>
            <Text style={[styles.headerCell, { flex: 2.2 }]}>Apellido</Text>
            <Text style={[styles.headerCell, { flex: 3 }]} numberOfLines={1}>
              Email
            </Text>
          </View>

          {/* Filas */}
          <FlatList
            data={filteredUsuarios}
            keyExtractor={(item) => item.clientID.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.8 }]}>{item.CI}</Text>
                <Text style={[styles.tableCell, { flex: 2.2 }]}>{item.Name1}</Text>
                <Text style={[styles.tableCell, { flex: 2.2 }]}>{item.LastName1}</Text>
                <Text style={[styles.tableCell, { flex: 3 }]} numberOfLines={1}>
                  {item.Email}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No se encontraron usuarios.</Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  backCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  backText: {
    fontSize: 18,
    color: "#FF4500",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#FF8C00",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerCell: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
    textAlign: "left",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableCell: {
    fontSize: 15,
    color: "#333",
    textAlign: "left",
    paddingRight: 14,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    fontSize: 16,
    color: "#999",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#444",
  },
});
