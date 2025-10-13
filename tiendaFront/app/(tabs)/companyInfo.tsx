//app/(tabs)/opAdmin/company/companyInfo.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Company1, companyData } from "../data/company";
import { API } from "../ip/IpDirection";

export default function CompanyInfo() {
  const [company, setCompany] = useState<Company1 | null>(
    companyData[0] || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/company`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setCompany(data[0]);
        else if (data?.CompanyID) setCompany(data);
        else if (companyData.length > 0) setCompany(companyData[0]);
      })
      .catch((err) => {
        console.error(err);
        Alert.alert(
          "Aviso",
          "No se pudo conectar con el servidor. Se mostrará la información local."
        );
        if (companyData.length > 0) setCompany(companyData[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Cargando información...</Text>
      </View>
    );
  }

  if (!company) {
    return (
      <View style={styles.center}>
        <Text>No hay información disponible de la empresa.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["#007AFF", "#00C6FF"]} style={styles.header}>
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, type: "timing", duration: 600 }}
          style={styles.logoContainer}
        >
          {company.Logo ? (
            <Image source={{ uri: company.Logo }} style={styles.logo} />
          ) : (
            <Ionicons name="business-outline" size={80} color="#fff" />
          )}
          <Text style={styles.companyName}>{company.Name}</Text>
        </MotiView>
      </LinearGradient>

      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 400, type: "timing", duration: 600 }}
        style={styles.infoCard}
      >
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={24} color="#007AFF" />
          <View style={styles.textContainer}>
            <Text style={styles.infoTitle}>Teléfono</Text>
            <Text style={styles.infoValue}>
              {company.Phone || "No especificado"}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={24} color="#007AFF" />
          <View style={styles.textContainer}>
            <Text style={styles.infoTitle}>Dirección</Text>
            <Text style={styles.infoValue}>
              {company.Address || "No especificada"}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <View style={styles.textContainer}>
            <Text style={styles.infoTitle}>Última actualización</Text>
            <Text style={styles.infoValue}>
              {new Date(company.UpdatedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </MotiView>

      <Text style={styles.footerText}>
        © {new Date().getFullYear()} {company.Name}. Todos los derechos
        reservados.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  header: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
  },
  companyName: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  textContainer: {
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 15,
    color: "#666",
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  footerText: {
    textAlign: "center",
    color: "#888",
    marginTop: 30,
    marginBottom: 20,
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
