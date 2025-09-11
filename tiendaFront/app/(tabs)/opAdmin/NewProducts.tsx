import React, { useState, useEffect } from 'react';
import { API } from "@/app/ip/IpDirection";
import { Producto } from "@/app/data/products";
import * as ImagePicker from 'expo-image-picker';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, Alert, Image, ScrollView 
} from 'react-native';
import { router } from 'expo-router';

export default function NewProducts() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los productos'));
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const resetForm = () => {
    setNombre('');
    setPrecio('');
    setDescripcion('');
    setAmount('');
    setCategoryID('');
    setImageUri('');
    setEditId(null);
  };

  const guardarProducto = () => {
    if (!nombre || !precio || !amount || !categoryID) {
      Alert.alert('Error', 'Complete todos los campos obligatorios');
      return;
    }

    const prodData = {
      Name_product: nombre,
      Price: parseFloat(precio),
      Description: descripcion || undefined,
      Amount: parseInt(amount),
      CategoryID: parseInt(categoryID),
      imageUri: imageUri || undefined,
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/products/${editId}` : `${API}/products`;

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodData),
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al guardar');
        return res.json();
      })
      .then(data => {
        if (editId) {
          setProductos(productos.map(p => (p.ProductsID === editId ? data : p)));
          Alert.alert('Éxito', 'Producto actualizado');
        } else {
          setProductos([...productos, data]);
          Alert.alert('Éxito', 'Producto creado');
        }
        resetForm();
      })
      .catch(() => Alert.alert('Error', 'No se pudo guardar el producto'));
  };

  const editarProducto = (p: Producto) => {
    setNombre(p.Name_product);
    setPrecio(p.Price.toString());
    setDescripcion(p.Description || '');
    setAmount(p.Amount.toString());
    setCategoryID(p.CategoryID.toString());
    setImageUri(p.imageUri || '');
    setEditId(p.ProductsID);
  };

  const eliminarProducto = (id: number) => {
    Alert.alert('Eliminar producto', '¿Está seguro?', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        onPress: () => {
          fetch(`${API}/products/${id}`, { method: 'DELETE' })
            .then(res => {
              if (!res.ok) throw new Error();
              setProductos(productos.filter(p => p.ProductsID !== id));
              if (editId === id) resetForm();
              Alert.alert('Éxito', 'Producto eliminado');
            })
            .catch(() => Alert.alert('Error', 'No se pudo eliminar el producto'));
        },
      },
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

      <Text style={styles.header}>Gestión de Productos</Text>

      {/* Formulario */}
      <View style={styles.form}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />

        <Text style={styles.label}>Precio</Text>
        <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" />

        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} />

        <Text style={styles.label}>Cantidad</Text>
        <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />

        <Text style={styles.label}>Category ID</Text>
        <TextInput style={styles.input} value={categoryID} onChangeText={setCategoryID} keyboardType="numeric" />

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>{imageUri ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
        </TouchableOpacity>

        {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}

        <TouchableOpacity style={styles.saveButton} onPress={guardarProducto}>
          <Text style={styles.saveButtonText}>{editId ? 'Actualizar Producto' : 'Crear Producto'}</Text>
        </TouchableOpacity>

        {editId && (
          <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productos}
        keyExtractor={item => String(item.ProductsID ?? Math.random())}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.productImage} />}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.Name_product}</Text>
              <Text style={styles.productPrice}>Precio: ${item.Price}</Text>
              <Text>Cantidad: {item.Amount}</Text>
              <Text>Categoría ID: {item.CategoryID}</Text>
              {item.Description && <Text>Descripción: {item.Description}</Text>}
              <View style={styles.cardButtons}>
                <TouchableOpacity style={styles.editButton} onPress={() => editarProducto(item)}>
                  <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarProducto(item.ProductsID)}>
                  <Text style={styles.buttonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f9f9f9' ,marginTop:20},
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
  imageButton: { marginTop: 10, backgroundColor: '#6200EE', padding: 10, borderRadius: 8, alignItems: 'center' },
  imageButtonText: { color: '#fff', fontWeight: 'bold' },
  previewImage: { height: 100, width: '100%', marginTop: 10, borderRadius: 8 },
  saveButton: { marginTop: 15, backgroundColor: '#32CD32', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { marginTop: 10, backgroundColor: '#FF8C00', padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 12, elevation: 2 },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  productInfo: { flex: 1 },
  productName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  productPrice: { color: '#32CD32', marginBottom: 4 },
  cardButtons: { flexDirection: 'row', marginTop: 8, justifyContent: 'space-between' },
  editButton: { backgroundColor: '#FFA500', padding: 6, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  deleteButton: { backgroundColor: '#FF4500', padding: 6, borderRadius: 6, flex: 0.48, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
