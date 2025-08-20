// app/(tabs)/AdminHome.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Alert, ScrollView } from 'react-native';
import { Producto, productos as productosIniciales } from '../data/products';

type Usuario = {
  id: string;
  nombre: string;
  ci: string;
  tipo: 'Cliente' | 'Empleado';
};

export default function AdminHome() {
  // Productos
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [userNombre, setUserNombre] = useState('');
  const [userCI, setUserCI] = useState('');
  const [userTipo, setUserTipo] = useState<'Cliente' | 'Empleado'>('Cliente');
  const [editUserId, setEditUserId] = useState<string | null>(null);

  // ---------- PRODUCTOS ----------
  const agregarProducto = () => {
    if (!nombre || !precio || !descripcion || !imagen || !categoria) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    const nuevoProducto: Producto = {
      id: editId ? editId : Math.random().toString(),
      nombre,
      precio,
      descripcion,
      imagen,
      categoria,
    };

    if (editId) {
      // Actualizar producto existente
      setProductos(productos.map(p => (p.id === editId ? nuevoProducto : p)));
      setEditId(null);
    } else {
      setProductos([...productos, nuevoProducto]);
    }

    // Limpiar formulario
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setImagen('');
    setCategoria('');
  };

  const editarProducto = (producto: Producto) => {
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setDescripcion(producto.descripcion || '');
    setImagen(producto.imagen);
    setCategoria(producto.categoria);
    setEditId(producto.id);
  };

  const eliminarProducto = (id: string) => {
    Alert.alert('Eliminar', '¿Estás seguro?', [
      { text: 'Cancelar' },
      { text: 'Eliminar', onPress: () => setProductos(productos.filter(p => p.id !== id)) },
    ]);
    if (editId === id) setEditId(null); // cancelar edición si se elimina
  };

  // ---------- USUARIOS ----------
  const agregarUsuario = () => {
    if (!userNombre || !userCI) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    const nuevoUsuario: Usuario = {
      id: editUserId ? editUserId : Math.random().toString(),
      nombre: userNombre,
      ci: userCI,
      tipo: userTipo,
    };

    if (editUserId) {
      setUsuarios(usuarios.map(u => (u.id === editUserId ? nuevoUsuario : u)));
      setEditUserId(null);
    } else {
      setUsuarios([...usuarios, nuevoUsuario]);
    }

    setUserNombre('');
    setUserCI('');
    setUserTipo('Cliente');
  };

  const editarUsuario = (usuario: Usuario) => {
    setUserNombre(usuario.nombre);
    setUserCI(usuario.ci);
    setUserTipo(usuario.tipo);
    setEditUserId(usuario.id);
  };

  const eliminarUsuario = (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
    if (editUserId === id) setEditUserId(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Administrador - Gestión Completa</Text>

      {/* ----------- FORMULARIO PRODUCTOS ----------- */}
      <Text style={styles.sectionTitle}>Productos</Text>
      <View style={styles.form}>
        <TextInput placeholder="Nombre" style={styles.input} value={nombre} onChangeText={setNombre} />
        <TextInput placeholder="Precio" style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" />
        <TextInput placeholder="Descripción" style={styles.input} value={descripcion} onChangeText={setDescripcion} />
        <TextInput placeholder="URL de la imagen" style={styles.input} value={imagen} onChangeText={setImagen} />
        <TextInput placeholder="Categoría" style={styles.input} value={categoria} onChangeText={setCategoria} />
        <TouchableOpacity style={styles.button} onPress={agregarProducto}>
          <Text style={styles.buttonText}>{editId ? 'Actualizar Producto' : 'Agregar Producto'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={productos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.imagen }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nombre}</Text>
              <Text style={styles.productPrice}>{item.precio}</Text>
              <Text style={styles.productCategory}>Categoría: {item.categoria}</Text>
              {item.descripcion && <Text style={styles.productDesc}>{item.descripcion}</Text>}
              <View style={styles.buttonsRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => editarProducto(item)}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarProducto(item.id)}>
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      {/* ----------- FORMULARIO USUARIOS ----------- */}
      <Text style={styles.sectionTitle}>Usuarios</Text>
      <View style={styles.form}>
        <TextInput placeholder="Nombre" style={styles.input} value={userNombre} onChangeText={setUserNombre} />
        <TextInput placeholder="CI" style={styles.input} value={userCI} onChangeText={setUserCI} />
        <Text style={{ marginBottom: 5 }}>Tipo de usuario:</Text>
        <View style={{ flexDirection: 'row', marginBottom: 10 }}>
          <TouchableOpacity
            style={[styles.tipoButton, userTipo === 'Cliente' && styles.tipoButtonSelected]}
            onPress={() => setUserTipo('Cliente')}
          >
            <Text style={styles.buttonText}>Cliente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tipoButton, userTipo === 'Empleado' && styles.tipoButtonSelected]}
            onPress={() => setUserTipo('Empleado')}
          >
            <Text style={styles.buttonText}>Empleado</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={agregarUsuario}>
          <Text style={styles.buttonText}>{editUserId ? 'Actualizar Usuario' : 'Agregar Usuario'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={usuarios}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{item.nombre} ({item.tipo})</Text>
            <Text>CI: {item.ci}</Text>
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
              <TouchableOpacity style={[styles.editButton, { marginRight: 10 }]} onPress={() => editarUsuario(item)}>
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarUsuario(item.id)}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingBottom: 50 },
  title: { fontSize: 22, fontWeight: 'bold', margin: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 20, marginTop: 20, marginBottom: 5 },
  form: { paddingHorizontal: 20, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  button: { backgroundColor: '#FF8C00', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  productCard: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 12, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width:0, height:2 }, shadowRadius:4, elevation:3 },
  productImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600' },
  productPrice: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  productCategory: { fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  productDesc: { fontSize: 14, color: '#555', marginTop: 2 },
  buttonsRow: { flexDirection: 'row', marginTop: 8 },
  editButton: { backgroundColor: '#1E90FF', padding: 6, borderRadius: 6, alignItems: 'center', width: 100 },
  deleteButton: { backgroundColor: '#FF4500', padding: 6, borderRadius: 6, alignItems: 'center', width: 100 },
  userCard: { backgroundColor:'#fff', padding:12, borderRadius:10, marginHorizontal:20, marginBottom:10 },
  userName: { fontWeight:'bold', fontSize:16 },
  tipoButton: { backgroundColor:'#ccc', flex:1, padding:8, alignItems:'center', marginRight:5, borderRadius:6 },
  tipoButtonSelected: { backgroundColor:'#32CD32' },
});
