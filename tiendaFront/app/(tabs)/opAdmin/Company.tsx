//app/(tabs)/opAdmin/company/company.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API } from "../../ip/IpDirection";
import { Company1, companyData } from "../../data/company";
import { MotiView } from "moti";

export default function Company() {
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState<Company1>({
  CompanyID: 0,
  Name: "",       // Nombre de la empresa
  QRImage: "",      // Ruta o URL del código QR
  Logo: "",         // Logo de la empresa
  Phone: "",        // Teléfono de contacto
  Address: "",      // Dirección del local
  UpdatedAt: "",     // Fecha de última actualización (ISO string)
  CreatedAt: ""
});

  // 🔹 Función para cargar info de backend
  const loadCompany = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/company`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) setCompany(data[0]);
      else if (data?.CompanyID) setCompany(data);
      else if (companyData.length > 0) setCompany(companyData[0]);
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Error",
        "No se pudo conectar al backend. Se usarán datos locales."
      );
      if (companyData.length > 0) setCompany(companyData[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, []);

  const handleChange = (field: keyof Company1, value: string) => {
    if (!company) return;
    setCompany({ ...company, [field]: value });
  };

  const handleImagePick = async (field: "Logo" | "QRImage") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && company) {
      const uri = result.assets[0].uri;
      setCompany({ ...company, [field]: uri });
    }
  };

  const handleSave = async () => {
    if (!company?.Name) {
      Alert.alert("Error", "El nombre de la empresa es obligatorio.");
      return;
    }

    setSaving(true);
    try {
      const method = company.CompanyID ? "PUT" : "POST";
      const url = company.CompanyID
        ? `${API}/company/${company.CompanyID}`
        : `${API}/company`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al guardar");

      Alert.alert("Éxito", "Información actualizada correctamente");
      setCompany(data);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Sin conexión",
        "No se pudo conectar al servidor. Se guardará localmente."
      );
      companyData[0] = company!;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Cargando información...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Gestión de Información de la Empresa</Text>

      <TouchableOpacity style={styles.updateButton} onPress={loadCompany}>
        <Text style={styles.updateButtonText}>🔄 Actualizar información</Text>
      </TouchableOpacity>

      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.formContainer}
      >
        <Text style={styles.label}>Nombre de la empresa</Text>
        <TextInput
          style={styles.input}
          value={company?.Name || ""}
          onChangeText={(t) => handleChange("Name", t)}
          placeholder="Ej. Mi Empresa S.A."
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={company?.Phone || ""}
          onChangeText={(t) => handleChange("Phone", t)}
          placeholder="Ej. +591 71234567"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={company?.Address || ""}
          onChangeText={(t) => handleChange("Address", t)}
          placeholder="Ej. Calle Falsa 123"
        />

        <Text style={styles.label}>Logo</Text>
        <TouchableOpacity onPress={() => handleImagePick("Logo")}>
          {company?.Logo ? (
            <Image source={{ uri: company.Logo }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>Seleccionar Logo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Código QR</Text>
        <TouchableOpacity onPress={() => handleImagePick("QRImage")}>
          {company?.QRImage ? (
            <Image source={{ uri: company.QRImage }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text>Seleccionar QR</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Text>
        </TouchableOpacity>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#222",
  },
  updateButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: "flex-start",
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    backgroundColor: "#f1f1f1",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 15,
    marginTop: 25,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
