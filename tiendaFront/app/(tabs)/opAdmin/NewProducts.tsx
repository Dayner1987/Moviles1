import React, { useState, useEffect } from 'react';
import { API } from "@/app/ip/IpDirection";
import { Producto } from "@/app/data/products";
import * as ImagePicker from 'expo-image-picker';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  FlatList, Alert, Image, ScrollView 
} from 'react-native';


export default function NewProducts() {
  // Estados de productos
    // -------------------------------
    const [productos, setProductos] = useState<Producto[]>([]);
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [amount, setAmount] = useState('');
    const [categoryID, setCategoryID] = useState('');
    const [imageUri, setImageUri] = useState('');
    const [editId, setEditId] = useState<number | null>(null);
      // -------------------------------
      // Cargar datos
      // -------------------------------
      useEffect(() => {
        fetch(`${API}/products`)
          .then(res => res.json())
          .then(data => setProductos(data))
          .catch(() => Alert.alert('Error', 'No se pudieron cargar los productos'));
    
      }, []);
      // -------------------------------
     // Funciones productos
    // -------------------------------
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
            const url = editId
              ? `${API}/products/${editId}`
              : `${API}/products`;
        
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
      }//-------------------------
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
                  fetch(`http://10.122.24.181:3000/products/${id}`, { method: 'DELETE' })
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
    <ScrollView style={{ flex: 1, padding: 15 }}>
      <Text>Panel de Administración</Text>

      {/* Productos */}
      <Text>Gestión de Productos</Text>

      {/* Formulario productos */}
      <View>
        <Text>Nombre</Text>
        <TextInput value={nombre} onChangeText={setNombre} />

        <Text>Precio</Text>
        <TextInput value={precio} onChangeText={setPrecio} keyboardType="numeric" />

        <Text>Descripción (opcional)</Text>
        <TextInput value={descripcion} onChangeText={setDescripcion} />

        <Text>Cantidad</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" />

        <Text>Category ID</Text>
        <TextInput value={categoryID} onChangeText={setCategoryID} keyboardType="numeric" />

        <TouchableOpacity onPress={pickImage}>
          <Text>{imageUri ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
        </TouchableOpacity>

        {imageUri ? <Image source={{ uri: imageUri }} style={{ height: 100 }} /> : null}

        <TouchableOpacity onPress={guardarProducto}>
          <Text>{editId ? 'Actualizar Producto' : 'Crear Producto'}</Text>
        </TouchableOpacity>

        {editId && (
          <TouchableOpacity onPress={resetForm}>
            <Text>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={productos}
        keyExtractor={item => String(item.ProductsID ?? Math.random())}
        renderItem={({ item }) => (
          <View>
            <Text>{item.Name_product}</Text>
            <Text>Precio: {item.Price}</Text>
            <Text>Cantidad: {item.Amount}</Text>
            <Text>Categoría ID: {item.CategoryID}</Text>
            {item.Description && <Text>Descripción: {item.Description}</Text>}
            {item.imageUri && <Image source={{ uri: item.imageUri }} style={{ height: 80 }} />}
            <View>
              <TouchableOpacity onPress={() => editarProducto(item)}>
                <Text>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => eliminarProducto(item.ProductsID)}>
                <Text>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}