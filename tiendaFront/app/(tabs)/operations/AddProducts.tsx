import { API } from '@/app/ip/IpDirection';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CategoriaConProductos } from '../../data/categories';
import { Producto, productos } from '../../data/products';

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
    fetch(`${API}/categories`)
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
    if (!name || !price || !amount || (!selectedCategory && !newCategory.trim())) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      let categoryID: number | null = selectedCategory ?? null;

      if (newCategory.trim() !== '') {
        const resCat = await fetch(`${API}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Name_categories: newCategory.trim() })
        });
        const dataCat = await resCat.json();
        if (!dataCat || !dataCat.CategoriesID) {
          Alert.alert('Error', 'No se pudo crear la categoría');
          return;
        }
        categoryID = Number(dataCat.CategoriesID);
      }

      if (categoryID === null || categoryID === undefined) {
        Alert.alert('Error', 'Selecciona o crea una categoría válida');
        return;
      }

      const formData = new FormData();
      formData.append('Name_product', name);
      formData.append('Price', price);
      formData.append('Description', description);
      formData.append('Amount', amount);
      formData.append('CategoryID', String(categoryID));

      if (image) {
        const uriParts = image.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: image.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`
        } as any);
      }

      const response = await fetch(`${API}/products`, {
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
        CategoryID: categoryID,
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient colors={['#9C27B0', '#6200EE']} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>HairLux</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <View style={styles.formContainer}>
          <Text>Nombre del producto</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text>Precio</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />

          <Text>Descripción</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} />

          <Text>Cantidad</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} />

          <Text>Selecciona categoría existente</Text>
          {categorias.map(c => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setSelectedCategory(c.id)}
              style={[styles.categoryButton, selectedCategory === c.id && styles.categorySelected]}
            >
              <Text>{c.nombre}</Text>
            </TouchableOpacity>
          ))}
          <TextInput placeholder="O agregar nueva categoría" style={styles.input} value={newCategory} onChangeText={setNewCategory} />

          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>{image ? 'Cambiar imagen' : 'Seleccionar imagen'}</Text>
          </TouchableOpacity>

          {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar producto</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  header: { padding: 15, paddingTop: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, fontWeight: 'bold', color: '#6200EE' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  formContainer: { padding: 15, backgroundColor: '#f5f5f5', borderRadius: 10, margin: 10 },
  input: { backgroundColor: '#fff', borderRadius: 6, padding: 8, marginVertical: 5 },
  categoryButton: { padding: 8, marginVertical: 4, borderWidth: 1, borderRadius: 6, borderColor: '#ccc', backgroundColor: '#fff' },
  categorySelected: { borderColor: '#6200EE', backgroundColor: '#EDE7F6' },
  imageButton: { backgroundColor: '#03A9F4', padding: 12, borderRadius: 6, marginTop: 10 },
  imageButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  imagePreview: { width: 100, height: 100, marginVertical: 10, borderRadius: 6 },
  saveButton: { backgroundColor: '#6200EE', padding: 14, borderRadius: 8, marginTop: 15 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
