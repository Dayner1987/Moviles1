import { Usuario } from "@/app/data/users";
import { API } from "@/app/ip/IpDirection";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';


export default function NewUsers() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [refreshing, setRefreshing] = useState(false);
const flatListRef = useRef<FlatList>(null);


  // Formulario
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

  // UI
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<number | null>(null);

  // Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsuarios(data);
    } catch (e) {
      setErrorMsg('No se pudieron cargar los usuarios!');
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsuarios();
    setRefreshing(false);
  };

  const resetUsuarioForm = () => {
    setName1(''); setName2(''); setLastName1(''); setLastName2('');
    setCi(''); setEmail(''); setAddress(''); setPassword(''); setRoleID('');
    setEditUserId(null);
    setErrorMsg('');
  };

const guardarUsuario = async () => {
  // 1️⃣ Validar campos obligatorios
  if (!name1 || !lastName1 || !ci || !email || !address || !password || !roleID) {
    setErrorMsg('Complete todos los campos!!!');
    return;
  }

  // 2️⃣ Validar CI como número válido (6 a 10 dígitos)
  if (!/^\d{6,10}$/.test(ci)) {
    setErrorMsg('CI entre 7 a 10 digitos!');
    return;
  }

  // 3️⃣ Validar email más estrictamente
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailRegex.test(email)) {
    setErrorMsg('Ingrese un Email Valido!');
    return;
  }

  // 4️⃣ Validar contraseña mínima con al menos una letra y un número
  const passRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
  if (!passRegex.test(password)) {
    setErrorMsg('contraseña minimo 6 caracteres !!');
    return;
  }

  // 5️⃣ Validar que rol sea 1 o 2
  if (!(roleID === '1' || roleID === '2')) {
    setErrorMsg('Seleccione rol valido');
    return;
  }

  // 6️⃣ Crear objeto usuario
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

  try {
    // 7️⃣ Determinar método y URL según si es actualización o creación
    const method = editUserId !== null ? 'PUT' : 'POST';
    const url = editUserId !== null ? `${API}/users/${editUserId}` : `${API}/users`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Error al guardar usuario');
    }

    const data = await res.json();

    // 8️⃣ Actualizar lista de usuarios localmente
   

if (editUserId !== null) {
  // Actualiza usuario existente en la lista local
  setUsuarios(usuarios.map(u => (u.clientID === editUserId ? data : u)));
} else {
  // Agrega nuevo usuario
  setUsuarios([...usuarios, data]); // NOTA: no data.user, porque tu backend ya devuelve el usuario completo
}


    // 9️⃣ Mostrar éxito y resetear formulario
    setShowSuccess(true);
    resetUsuarioForm();
  } catch (err: any) {
    ToastAndroid.show(err.message, ToastAndroid.SHORT);
  }
};


const editarUsuario = (u: Usuario) => {
  setName1(u.Name1); setName2(u.Name2 || '');
  setLastName1(u.LastName1); setLastName2(u.LastName2 || '');
  setCi(u.CI.toString()); setEmail(u.Email); setAddress(u.Address);
  setPassword(u.Password); setRoleID(u.Roles_RolesID.toString());
  setEditUserId(u.clientID);

  // Scroll al header (y arriba del todo)
  flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
};


  const confirmarEliminarUsuario = (id: number) => {
    setUsuarioAEliminar(id);
    setShowDeleteConfirm(true);
  };

// Estado para alerta de eliminación exitosa
const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

// Función eliminarUsuario modificada
const eliminarUsuario = async () => {
  if (usuarioAEliminar === null) return;

  try {
    const res = await fetch(`${API}/users/${usuarioAEliminar}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('No se pudo eliminar el usuario');

    setUsuarios(usuarios.filter(u => u.clientID !== usuarioAEliminar));
    if (editUserId === usuarioAEliminar) resetUsuarioForm();
    setShowDeleteConfirm(false);

    // Mostrar alerta de éxito de eliminación
    setShowDeleteSuccess(true);
  } catch {
    setShowDeleteConfirm(false);
    ToastAndroid.show('No se pudo eliminar el usuario', ToastAndroid.SHORT);
  }
};

// Estado para alerta de éxito de eliminación

// Función de eliminación real
const confirmarEliminarReal = async () => {
  if (usuarioAEliminar === null) return;

  try {
    const res = await fetch(`${API}/users/${usuarioAEliminar}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('No se pudo eliminar el usuario');

    setUsuarios(usuarios.filter(u => u.clientID !== usuarioAEliminar));
    if (editUserId === usuarioAEliminar) resetUsuarioForm();

    // Mostrar animación de éxito
    setShowDeleteConfirm(false);
    setShowDeleteSuccess(true);
  } catch {
    setShowDeleteConfirm(false);
   ToastAndroid.show('No se pudo eliminar el usuario', ToastAndroid.SHORT);
  }
};

  return (
  <>
    <FlatList
    ref={flatListRef}
      data={usuarios}
      keyExtractor={item => String(item.clientID)}
      ListHeaderComponent={
        <>
          {/* Navbar */}
          <View style={styles.navbar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.navTitle}>AdminHairlux</Text>
            <View style={{ width: 40 }} />
          </View>

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
          <Text>  </Text>
{errorMsg ? (
            <Animatable.View animation="shake" style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </Animatable.View>
          ) : null}
            
            <TouchableOpacity style={styles.saveButton} onPress={guardarUsuario}>
              
              <Text style={styles.saveButtonText}>{editUserId !== null ? 'Actualizar Usuario' : 'Crear Usuario'}</Text>
            </TouchableOpacity>
            {editUserId !== null && (
              <TouchableOpacity style={styles.cancelButton} onPress={resetUsuarioForm}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      }
      //datos usuario
renderItem={({ item }) => (
  <View style={styles.userCard}>
    <View style={styles.userRow}>
      {/* Datos del usuario */}
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>
          {`${item.Name1} ${item.Name2 || ''} ${item.LastName1} ${item.LastName2 || ''}`}
        </Text>
        <Text>CI: {item.CI}</Text>
        <Text>Email: {item.Email}</Text>
        <Text>Dirección: {item.Address}</Text>
        <Text>Rol: {item.Roles_RolesID === 1 ? 'Cliente' : 'Empleado'}</Text>
      </View>

      {/* Botones juntos a la derecha */}
      <View style={styles.cardButtonsRow}>
        <TouchableOpacity onPress={() => confirmarEliminarUsuario(item.clientID)}>
          <Image
            source={require('../../../assets/images/eliminar.png')}
            style={styles.iconButton}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => editarUsuario(item)}>
          <Image
            source={require('../../../assets/images/editar.png')}
            style={styles.iconButton}
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}


      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />

    {/* Confirmación eliminación: primer paso */}
{showDeleteConfirm && (
  <View style={styles.overlay}>
    <View style={styles.confirmBox}>
      <Image
        source={require('../../../assets/images/eliminar.png')}
        style={{ width: 100, height: 100, marginBottom: 15, alignSelf: 'center' }}
      />
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 10 }}>
        ¿Estás seguro que deseas eliminar este usuario?
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: '#ccc', flex: 0.48 }]}
          onPress={() => setShowDeleteConfirm(false)}
        >
          <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: '#FF4500', flex: 0.48 }]}
          onPress={confirmarEliminarReal}
        >
          <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold' }}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
)}

{/* Alerta de éxito: segundo paso */}
{showDeleteSuccess && (
  <View style={styles.successOverlay}>
    <View style={styles.successBox}>
      <LottieView
        source={require('../../../assets/fonts/delete.json')} // tu Lottie
        autoPlay
        loop={false}
        style={{ width: 200, height: 200, alignSelf: 'center' }}
      />
      <Text style={styles.successText}>Usuario eliminado con éxito!</Text>
      <TouchableOpacity
        onPress={() => setShowDeleteSuccess(false)}
        style={styles.successButton}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

{/* Alerta de éxito para crear/actualizar usuario */}
{showSuccess && (
  <View style={styles.successOverlay}>
    <View style={styles.successBox}>
      <LottieView
        source={require('../../../assets/fonts/newu.json')} // tu Lottie para éxito
        autoPlay
        loop={false}
        style={{ width: 200, height: 200, alignSelf: 'center' }}
      />
      <Text style={styles.successText}>
        {editUserId !== null ? 'Usuario Restrado con Exito!' : 'Usuario Restrado con Exito!'}
      </Text>
      <Text style={{ textAlign: 'center', marginBottom: 10 }}>
        
      </Text>
      <TouchableOpacity
        onPress={() => setShowSuccess(false)}
        style={styles.successButton}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

  </>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#f5f0f8ff', // un gris muy suave de fondo
  },

  navbar: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#e42584ff',
  height: 100, // por ejemplo 80px de altura
  paddingHorizontal: 15, // opcional para margen lateral
},

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  backText: { fontSize: 22, color: '#6200EE' },

  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: '700',
    color: '#ffffffff',
  },

  form: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    color: '#444',
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginTop: 5,
    backgroundColor: '#FAFAFA',
  },

  saveButton: {
    marginTop: 15,
    backgroundColor: '#32CD32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  cancelButton: {
    marginTop: 10,
    backgroundColor: '#FF8C00',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  errorBox: {
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  errorText: {
    color: '#D8000C',
    fontWeight: 'bold',
  },

  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },

  userName: {
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 5,
    color: '#2C3E50',
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 15,
  },

  iconButton: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmBox: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },

  confirmButton: {
    backgroundColor: '#FF4500',
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },

  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },

  successBox: {
    width: 260,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },

  successText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 15,
    color: '#2C3E50',
    textAlign: 'center',
  },

  successButton: {
    backgroundColor: '#32CD32',
    padding: 12,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
});

