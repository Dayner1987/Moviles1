import { API } from "@/app/ip/IpDirection";
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, Alert, ScrollView 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Usuario } from "@/app/data/users";
   
export default function NewUsers() {
// -------------------------------
   // Estados de usuarios
   // -------------------------------
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

  // -------------------------------
    // Cargar datos
    // -------------------------------
    useEffect(() => {
      fetch(`${API}/users`)
        .then(res => res.json())
        .then(data => setUsuarios(data))
        .catch(() => Alert.alert('Error', 'No se pudieron cargar los usuarios'));
    }, []);

    // -------------------------------
    // Funciones usuarios
    // -------------------------------
    const resetUsuarioForm = () => {
      setName1('');
      setName2('');
      setLastName1('');
      setLastName2('');
      setCi('');
      setEmail('');
      setAddress('');
      setPassword('');
      setRoleID('');
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
    
        if (editUserId !== null) {
          fetch(`${API}/users/${editUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          })
            .then(res => {
              if (!res.ok) throw new Error('Error al actualizar');
              return res.json();
            })
            .then(updatedUser => {
              setUsuarios(usuarios.map(u => (u.clientID === editUserId ? updatedUser : u)));
              resetUsuarioForm();
              Alert.alert('Éxito', 'Usuario actualizado');
            })
            .catch(() => Alert.alert('Error', 'No se pudo actualizar el usuario'));
        } else {
          fetch(`${API}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          })
            .then(res => {
              if (!res.ok) throw new Error('Error al crear');
              return res.json();
            })
            .then(newUser => {
              setUsuarios([...usuarios, newUser]);
              resetUsuarioForm();
              Alert.alert('Éxito', 'Usuario creado');
            })
            .catch(() => Alert.alert('Error', 'No se pudo crear el usuario'));
        }
      };
    
      const editarUsuario = (u: Usuario) => {
        setName1(u.Name1);
        setName2(u.Name2 || '');
        setLastName1(u.LastName1);
        setLastName2(u.LastName2 || '');
        setCi(u.CI.toString());
        setEmail(u.Email);
        setAddress(u.Address);
        setPassword(u.Password);
        setRoleID(u.Roles_RolesID.toString());
        setEditUserId(u.clientID);
      };
    
      const eliminarUsuario = (id: number) => {
        Alert.alert('Eliminar usuario', '¿Está seguro?', [
          { text: 'Cancelar' },
          {
            text: 'Eliminar',
            onPress: () => {
              fetch(`${API}/users/${id}`, { method: 'DELETE' })
                .then(res => {
                  if (!res.ok) throw new Error('Error al eliminar');
                  setUsuarios(usuarios.filter(u => u.clientID !== id));
                  if (editUserId === id) resetUsuarioForm();
                  Alert.alert('Éxito', 'Usuario eliminado');
                })
                .catch(() => Alert.alert('Error', 'No se pudo eliminar el usuario'));
            },
          },
        ]);
      };

     return (
        <ScrollView style={{ flex: 1, padding: 15 }}>
      <Text>Panel de Administración</Text>

      {/* Usuarios */}
      <Text>Gestión de Usuarios</Text>
      <View>
        <Text>Primer Nombre</Text>
        <TextInput value={name1} onChangeText={setName1} />

        <Text>Segundo Nombre (opcional)</Text>
        <TextInput value={name2} onChangeText={setName2} />

        <Text>Primer Apellido</Text>
        <TextInput value={lastName1} onChangeText={setLastName1} />

        <Text>Segundo Apellido (opcional)</Text>
        <TextInput value={lastName2} onChangeText={setLastName2} />

        <Text>CI</Text>
        <TextInput value={ci} onChangeText={setCi} keyboardType="numeric" />

        <Text>Email</Text>
        <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text>Dirección</Text>
        <TextInput value={address} onChangeText={setAddress} />

        <Text>Contraseña</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry={false} />

        <Text>Rol</Text>
        <Picker selectedValue={roleID} onValueChange={setRoleID}>
          <Picker.Item label="Seleccione rol..." value="" />
          <Picker.Item label="Cliente" value="1" />
          <Picker.Item label="Empleado" value="2" />
        </Picker>

        <View>
          <TouchableOpacity onPress={guardarUsuario}>
            <Text>{editUserId !== null ? 'Actualizar Usuario' : 'Crear Usuario'}</Text>
          </TouchableOpacity>

          {editUserId !== null && (
            <TouchableOpacity onPress={resetUsuarioForm}>
              <Text>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={usuarios}
        keyExtractor={item => String(item.clientID ?? Math.random())}
        renderItem={({ item }) => (
          <View>
            <Text>
              {`${item.Name1} ${item.Name2 || ''} ${item.LastName1} ${item.LastName2 || ''}`}
            </Text>
            <Text>CI: {item.CI}</Text>
            <Text>Email: {item.Email}</Text>
            <Text>Dirección: {item.Address}</Text>
            <Text>Rol: {item.Roles_RolesID === 1 ? 'Cliente' : 'Empleado'}</Text>
            <View>
              <TouchableOpacity onPress={() => editarUsuario(item)}>
                <Text>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarUsuario(item.clientID)}>
                <Text>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
      );
}