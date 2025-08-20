import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { productos as productosGlobales, Producto } from '../data/products';
import { useProductos } from '../../hooks/UseProducts';

export default function EmployeeHome() {
  const { productos, agregarProducto, editarProducto, eliminarProducto } = useProductos(productosGlobales);

  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [categoria, setCategoria] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const handleAgregar = () => {
    if (!nombre || !precio || !descripcion || !imagen || !categoria) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (editandoId) {
      // Editar producto existente usando id + Partial<Producto>
      editarProducto(editandoId, {
        nombre,
        precio,
        descripcion,
        imagen,
        categoria,
      });
      setEditandoId(null);
    } else {
      // Agregar nuevo producto
      const nuevoProducto: Producto = {
        id: Math.random().toString(),
        nombre,
        precio,
        descripcion,
        imagen,
        categoria,
      };
      agregarProducto(nuevoProducto);
    }

    // Limpiar formulario
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setImagen('');
    setCategoria('');
  };

  const handleEditar = (producto: Producto) => {
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setDescripcion(producto.descripcion || '');
    setImagen(producto.imagen);
    setCategoria(producto.categoria);
    setEditandoId(producto.id);
  };

  const handleEliminar = (id: string) => {
    eliminarProducto(id);
    if (editandoId === id) setEditandoId(null); // cancelar edición si se eliminó
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Empleado - Gestionar Productos</Text>

      {/* Formulario */}
      <View style={styles.form}>
        <TextInput placeholder="Nombre" style={styles.input} value={nombre} onChangeText={setNombre} />
        <TextInput placeholder="Precio" style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" />
        <TextInput placeholder="Descripción" style={styles.input} value={descripcion} onChangeText={setDescripcion} />
        <TextInput placeholder="URL de la imagen" style={styles.input} value={imagen} onChangeText={setImagen} />
        <TextInput placeholder="Categoría" style={styles.input} value={categoria} onChangeText={setCategoria} />

        <TouchableOpacity style={styles.button} onPress={handleAgregar}>
          <Text style={styles.buttonText}>{editandoId ? 'Guardar Cambios' : 'Agregar Producto'}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.imagen }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.nombre}</Text>
              <Text style={styles.productPrice}>{item.precio}</Text>
              <Text style={styles.productCategory}>Categoría: {item.categoria}</Text>
              {item.descripcion && <Text style={styles.productDesc}>{item.descripcion}</Text>}

              <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <TouchableOpacity style={[styles.deleteButton, { marginRight: 10 }]} onPress={() => handleEliminar(item.id)}>
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.editButton} onPress={() => handleEditar(item)}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', margin: 15 },
  form: { paddingHorizontal: 20, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  button: { backgroundColor: '#1E90FF', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: { width: 80, height: 80, borderRadius: 10, marginRight: 15 },
  productInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600' },
  productPrice: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  productCategory: { fontSize: 14, fontStyle: 'italic', marginTop: 2 },
  productDesc: { fontSize: 14, color: '#555', marginTop: 2 },
  deleteButton: { padding: 6, backgroundColor: '#FF4500', borderRadius: 6, alignItems: 'center', width: '50%' },
  deleteButtonText: { color: '#fff', fontWeight: 'bold' },
  editButton: { padding: 6, backgroundColor: '#32CD32', borderRadius: 6, alignItems: 'center', width: '50%' },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
});
