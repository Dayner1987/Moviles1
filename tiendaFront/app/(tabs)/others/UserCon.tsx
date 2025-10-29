import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { MaterialIcons } from "@expo/vector-icons";
import { useStatus } from "../../../hooks/UseStatus";
import { API } from "../../ip/IpDirection";

export default function UserCon() {
  const { user, setUser, loading } = useStatus();
  const [editing, setEditing] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    Name1: "",
    Name2: "",
    LastName1: "",
    LastName2: "",
    CI: "",
    Address: "",
    Password: "",
    Email: "",
    Roles_RolesID: 0,
    RoleName: "",
  });

  const router = useRouter();

  // Función para cargar datos del usuario manualmente
  const loadUserData = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${API}/users/${user.id}`);
      if (!res.ok) throw new Error("Error al obtener info del usuario");
      const data = await res.json();

      setForm({
        Name1: data.Name1 || "",
        Name2: data.Name2 || "",
        LastName1: data.LastName1 || "",
        LastName2: data.LastName2 || "",
        CI: String(data.CI) || "",
        Address: data.Address || "",
        Password: "",
        Email: data.Email || "",
        Roles_RolesID: data.Roles_RolesID || 0,
        RoleName: data.roles?.NameRol || "",
      });
    } catch (err) {
      console.error(err);
      setWarning("⚠️ No se pudo cargar la información del usuario");
    }
  };

  // Llamar loadUserData directamente si hay usuario y no estamos editando
  if (user && !editing && form.CI === "") {
    loadUserData();
  }

  const confirmLogout = () => {
    Alert.alert(
      "¿Seguro que quieres cerrar sesión?",
      "Perderás el acceso hasta volver a iniciar sesión.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, cerrar sesión", style: "destructive", onPress: handleLogout },
      ],
      { cancelable: true }
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
    setEditing(false);
    Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente");
    router.push("/"); // Redirige al Home
  };

  const validateForm = () => {
    if (!form.Name1 || !form.LastName1 || !form.CI || !form.Email) {
      setWarning("⚠️ Faltan campos obligatorios");
      return false;
    }

    if (isNaN(Number(form.CI))) {
      setWarning("⚠️ El CI debe ser numérico");
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!user) return;
    setWarning(null);

    if (!validateForm()) return;

    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.includes("CI")) {
          setWarning("⚠️ Este CI ya está registrado por otro usuario");
        } else {
          setWarning("⚠️ No se pudo actualizar la información");
        }
        return;
      }

      Alert.alert("Éxito", "Datos actualizados correctamente");
      setEditing(false);
      loadUserData();
    } catch (err) {
      console.error(err);
      setWarning("⚠️ Error de conexión al actualizar usuario");
    }
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6200EE" />;

  if (!user)
    return (
      <View style={styles.center}>
        <LottieView
          source={require("../../../assets/fonts/Profile.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.message}>Necesitas iniciar sesión</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/(tabs)/login")}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#999" }]}
          onPress={() => router.push("/(tabs)/register")}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.lottieContainer}>
          <LottieView
            source={require("../../../assets/fonts/Profile.json")}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </View>

        <Text style={styles.title}>Información del Usuario</Text>

        {warning && (
          <Animatable.View animation="shake" duration={800} style={styles.warningBox}>
            <Text style={styles.warningText}>
              <MaterialIcons name="warning" size={18} color="#856404" /> {warning}
            </Text>
          </Animatable.View>
        )}

        {editing ? (
          <>
            {Object.keys(form).map(
              (key) =>
                key !== "RoleName" &&
                key !== "Roles_RolesID" && (
                  <View key={key} style={styles.inputContainer}>
                    <Text style={styles.label}>{key}</Text>
                    <TextInput
                      style={styles.input}
                      value={form[key]}
                      onChangeText={(text) => setForm({ ...form, [key]: text })}
                      secureTextEntry={key === "Password"}
                      keyboardType={key === "CI" ? "numeric" : "default"}
                    />
                  </View>
                )
            )}

            <TouchableOpacity style={styles.button} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Guardar Cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#999" }]}
              onPress={() => setEditing(false)}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                Nombre: {form.Name1} {form.Name2}
              </Text>
              <Text style={styles.infoText}>
                Apellido: {form.LastName1} {form.LastName2}
              </Text>
              <Text style={styles.infoText}>CI: {form.CI}</Text>
              <Text style={styles.infoText}>Email: {form.Email}</Text>
              <Text style={styles.infoText}>Dirección: {form.Address}</Text>
              <Text style={styles.infoText}>Rol: {form.RoleName}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>Actualizar Información</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#FF6347" }]}
              onPress={confirmLogout}
            >
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40, alignItems: "center" },
  lottieContainer: { marginBottom: 20, alignItems: "center", justifyContent: "center" },
  warningBox: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffecb5",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  warningText: { color: "#856404", textAlign: "center", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: { fontSize: 18, fontWeight: "bold", color: "#555", marginBottom: 20, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  infoContainer: { marginBottom: 20, width: "100%", alignItems: "center" },
  infoText: { fontSize: 16, marginBottom: 8, textAlign: "center" },
  inputContainer: { marginBottom: 12, width: "100%" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, fontSize: 16 },
  button: {
    backgroundColor: "#6200EE",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
    width: 200,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16, textAlign: "center" },
});
