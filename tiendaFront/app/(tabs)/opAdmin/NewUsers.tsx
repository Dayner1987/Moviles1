import { Usuario } from "@/app/data/users";
import { API } from "@/app/ip/IpDirection";
import { Picker } from '@react-native-picker/picker';
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
   
export default function NewUsers() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [lastName1, setLastName1] = useState('');
  const [lastName2, setLastName2] = useState('');
  const [ci, setCi] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [roleID, setRoleID] = useState('');
  const [editUserId, setEditUserId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/users`)
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los usuarios'));
  }, []);

  const resetUsuarioForm = () => {
    setName1(''); setName2(''); setLastName1(''); setLastName2('');
    setCi(''); setEmail(''); setAddress(''); setPassword(''); setRoleID('');
    setEditUserId(null);
  };

  const guardarUsuario = () => {
    if (!name1 || !lastName1 || !ci || !email || !address || !password || !roleID) {
      Alert.alert('Error', 'Complete todos los campos obligatorios');
      return;
    }

    const userData = {
      Name1: name1,
      Name2: name2 || undefined,
      LastName1: lastName1,
      LastName2: lastName2 || undefined,
      CI: parseInt(ci),
      Email: email,
      Address: address,
      Password: password,
      Roles_RolesID: parseInt(roleID),
    };

    const method = editUserId !== null ? 'PUT' : 'POST';
    const url = editUserId !== null ? `${API}/users/${editUserId}` : `${API}/users`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (editUserId !== null) {
          setUsuarios(usuarios.map(u => (u.clientID === editUserId ? data : u)));
          Alert.alert('Éxito', 'Usuario actualizado');
        } else {
          setUsuarios([...usuarios, data]);
          Alert.alert('Éxito', 'Usuario creado');
        }
        resetUsuarioForm();
      })
      .catch(() => Alert.alert('Error', 'No se pudo guardar el usuario'));
  };

  const editarUsuario = (u: Usuario) => {
    setName1(u.Name1); setName2(u.Name2 || '');
    setLastName1(u.LastName1); setLastName2(u.LastName2 || '');
    setCi(u.CI.toString()); setEmail(u.Email); setAddress(u.Address);
    setPassword(u.Password); setRoleID(u.Roles_RolesID.toString());
    setEditUserId(u.clientID);
  };

  const eliminarUsuario = (id: number) => {
    Alert.alert('Eliminar usuario', '¿Está seguro?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', onPress: () => {
        fetch(`${API}/users/${id}`, { method: 'DELETE' })
          .then(res => {
            if (!res.ok) throw new Error();
            setUsuarios(usuarios.filter(u => u.clientID !== id));
            if (editUserId === id) resetUsuarioForm();
            Alert.alert('Éxito', 'Usuario eliminado');
          })
          .catch(() => Alert.alert('Error', 'No se pudo eliminar el usuario'));
      }},
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backCircle}>
            <Text style={styles.backText}>←</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.navTitle}>AdminHairlux</Text>
      </View>

      <Text style={styles.header}>Gestión de Usuarios</Text>

      {/* Formulario */}
      <View style={styles.form}>
        <Text style={styles.label}>Primer Nombre</Text>
        <TextInput style={styles.input} value={name1} onChangeText={setName1} />

        <Text style={styles.label}>Segundo Nombre (opcional)</Text>
        <TextInput style={styles.input} value={name2} onChangeText={setName2} />

        <Text style={styles.label}>Primer Apellido</Text>
        <TextInput style={styles.input} value={lastName1} onChangeText={setLastName1} />

        <Text style={styles.label}>Segundo Apellido (opcional)</Text>
        <TextInput style={styles.input} value={lastName2} onChangeText={setLastName2} />

        <Text style={styles.label}>CI</Text>
        <TextInput style={styles.input} value={ci} onChangeText={setCi} keyboardType="numeric" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={styles.label}>Dirección</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

        <Text style={styles.label}>Rol</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={roleID} onValueChange={setRoleID}>
            <Picker.Item label="Seleccione rol..." value="" />
            <Picker.Item label="Cliente" value="1" />
            <Picker.Item label="Empleado" value="2" />
          </Picker>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.saveButton} onPress={guardarUsuario}>
            <Text style={styles.saveButtonText}>{editUserId !== null ? 'Actualizar Usuario' : 'Crear Usuario'}</Text>
          </TouchableOpacity>

          {editUserId !== null && (
            <TouchableOpacity style={styles.cancelButton} onPress={resetUsuarioForm}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de usuarios */}
      <FlatList
        data={usuarios}
        keyExtractor={item => String(item.clientID ?? Math.random())}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>
              {`${item.Name1} ${item.Name2 || ''} ${item.LastName1} ${item.LastName2 || ''}`}
            </Text>
            <Text>CI: {item.CI}</Text>
            <Text>Email: {item.Email}</Text>
            <Text>Dirección: {item.Address}</Text>
            <Text>Rol: {item.Roles_RolesID === 1 ? 'Cliente' : 'Empleado'}</Text>
            <View style={styles.cardButtons}>
              <TouchableOpacity style={styles.editButton} onPress={() => editarUsuario(item)}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarUsuario(item.clientID)}>
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f9f9f9',marginTop:20 },
  navbar: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backButton: { justifyContent: 'center', alignItems: 'center' },
  backCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', shadowColor: '#000',
    shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3, elevation: 3,
  },
  backText: { fontSize: 22, color: '#6200EE' },
  navTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#6200EE' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  form: { marginBottom: 20, backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginTop: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 5 },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  saveButton: { flex: 0.48, backgroundColor: '#32CD32', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { flex: 0.48, backgroundColor: '#FF8C00', padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  userCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, elevation: 2 },
  userName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  cardButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  editButton: { backgroundColor: '#FFA500', padding: 6, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  deleteButton: { backgroundColor: '#FF4500', padding: 6, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
