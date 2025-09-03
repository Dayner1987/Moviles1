import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { CategoriaConProductos } from '../../data/categories';

import { productos, Producto } from '../../data/products';
import ProductList from '../../../components/ProductList';

export default function AddProducts() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');
 
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
 
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    fetch('http://10.122.24.181:3000/categories')
      .then(res => res.json())
      .then(data => {
        const categoriasData: CategoriaConProductos[] = data.map((c: any) => ({
          id: c.CategoriesID,
          nombre: c.Name_categories,
          products: c.products || [],
        }));
        setCategorias(categoriasData);
      });

      
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitas permisos para acceder a las imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSave = async () => {
    if (!name || !price || !amount || (!selectedCategory && !newCategory) ) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      let categoryID = selectedCategory;
      if (newCategory) {
        const resCat = await fetch('http://10.122.24.181:3000/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Name_categories: newCategory })
        });
        const dataCat = await resCat.json();
        categoryID = dataCat.CategoriesID;
      }



      const formData = new FormData();
      formData.append('Name_product', name);
      formData.append('Price', price);
      formData.append('Description', description);
      formData.append('Amount', amount);
      formData.append('CategoryID', categoryID!.toString());
      

      if (image) {
        // @ts-ignore
        formData.append('image', {
          uri: image.uri,
          name: `photo.${image.uri.split('.').pop()}`,
          type: 'image/jpeg'
        });
      }

      const response = await fetch('http://10.122.24.181:3000/products', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const nuevoProducto = await response.json();

      const nuevo: Producto = {
        ProductsID: nuevoProducto.ProductsID,
        Name_product: name,
        Price: parseFloat(price),
        Description: description,
        Amount: parseInt(amount),
        CategoryID: categoryID!,
       
        imageUri: nuevoProducto.imageUri,
      };
      productos.push(nuevo);

      Alert.alert('Éxito', 'Producto agregado');
      setName(''); setPrice(''); setDescription(''); setAmount('');
      setSelectedCategory(null); setNewCategory('');
   
      setImage(null);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={{ flex: 1, backgroundColor: '#f0f0f0' }} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient colors={['#9C27B0', '#6200EE']} style={{ padding: 15, paddingTop: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#6200EE' }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>HairLux</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={{ padding: 15, backgroundColor: '#f5f5f5', borderRadius: 10, margin: 10 }}>
          <Text>Nombre del producto</Text>
          <TextInput style={{ backgroundColor:'#fff', borderRadius:6, padding:8, marginVertical:5 }} value={name} onChangeText={setName} />

          <Text>Precio</Text>
          <TextInput style={{ backgroundColor:'#fff', borderRadius:6, padding:8, marginVertical:5 }} keyboardType="numeric" value={price} onChangeText={setPrice} />

          <Text>Descripción</Text>
          <TextInput style={{ backgroundColor:'#fff', borderRadius:6, padding:8, marginVertical:5 }} value={description} onChangeText={setDescription} />

          <Text>Cantidad</Text>
          <TextInput style={{ backgroundColor:'#fff', borderRadius:6, padding:8, marginVertical:5 }} keyboardType="numeric" value={amount} onChangeText={setAmount} />

          <Text>Selecciona categoría existente</Text>
          {categorias.map(c => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.id)}
              style={{
                padding: 8, marginVertical: 4, borderWidth: 1, borderRadius: 6,
                borderColor: selectedCategory === c.id ? '#6200EE' : '#ccc',
                backgroundColor: selectedCategory === c.id ? '#EDE7F6' : '#fff'
              }}
            >
              <Text>{c.nombre}</Text>
            </TouchableOpacity>
          ))}
          <TextInput placeholder="O agregar nueva categoría" style={{ backgroundColor:'#fff', borderRadius:6, padding:8, marginVertical:5 }} value={newCategory} onChangeText={setNewCategory} />

          <TouchableOpacity onPress={pickImage} style={{ backgroundColor: '#03A9F4', padding: 12, borderRadius: 6, marginTop: 10 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
              {image ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Text>
          </TouchableOpacity>

          {image && (
            <Image source={{ uri: image.uri }} style={{ width: 100, height: 100, marginVertical: 10, borderRadius: 6 }} />
          )}

          <TouchableOpacity onPress={handleSave} style={{ backgroundColor: '#6200EE', padding: 14, borderRadius: 8, marginTop: 15 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Guardar producto</Text>
          </TouchableOpacity>

          {productos.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <ProductList productos={productos} />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
