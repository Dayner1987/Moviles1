// UserCon.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
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
import { API } from "../../ip/IpDirection";
import { useStatus } from "../../../hooks/UseStatus";

export default function UserCon() {
  const { user, setUser } = useStatus(); // <--- usamos el hook global
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({
    Name1: "",
    Name2: "",
    LastName1: "",
    LastName2: "",
    CI: "",
    Address: "",
    Password: "",
    Email: "",
  });

  useEffect(() => {
    fetchUser();
  }, [user]); // <--- se ejecuta cuando cambia user

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/users/${user?.id}`);
      if (!res.ok) throw new Error("Error al obtener info del usuario");
      const data = await res.json();
      setForm({
        Name1: data.Name1 || "",
        Name2: data.Name2 || "",
        LastName1: data.LastName1 || "",
        LastName2: data.LastName2 || "",
        CI: data.CI || "",
        Address: data.Address || "",
        Password: "",
        Email: data.Email || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null); // <--- esto actualiza globalmente todas las pantallas
    setEditing(false);
    Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente");
  };

  const handleUpdate = async () => {
    if (!user) return;

    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al actualizar usuario");

      Alert.alert("Éxito", "Datos actualizados correctamente");
      setEditing(false);
      fetchUser();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo actualizar la información");
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6200EE" />;

  if (!user)
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Necesitas iniciar sesión para ver esta información</Text>
      </View>
    );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Información del Usuario</Text>

        {editing ? (
          <>
            {Object.keys(form).map((key) => (
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
            ))}

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
            </View>

            <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>Actualizar Información</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#FF6347" }]}
              onPress={handleLogout}
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
  container: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: { fontSize: 18, fontWeight: "bold", color: "#555" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  infoContainer: { marginBottom: 20 },
  infoText: { fontSize: 16, marginBottom: 8 },
  inputContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10, fontSize: 16 },
  button: { backgroundColor: "#6200EE", padding: 12, borderRadius: 8, alignItems: "center", marginVertical: 8 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
