import { API } from '@/app/ip/IpDirection';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Animatable from 'react-native-animatable';
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
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Cargar categorías al inicio
  useEffect(() => {
    fetch(`${API}/categories`)
      .then(res => res.json())
      .then(data => {
        const categoriasData: CategoriaConProductos[] = data.map((c: any) => ({
          CategoriesID: c.CategoriesID,
          Name_categories: c.Name_categories,
          products: c.products || [],
        }));
        setCategorias(categoriasData);
      });
  }, []);

  // Selección de imagen
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Necesitas permiso para acceder a imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) setImage(result.assets[0]);
  };

  // Guardar producto
  const handleSave = async () => {
    if (!name || !price || !amount || (!selectedCategory && !newCategory.trim())) {
      setErrorMsg('Completa todos los campos  ');
      return;
    }

    try {
      let categoryID: number | null = selectedCategory ?? null;

      // Crear nueva categoría si se ingresó
      if (newCategory.trim() !== '') {
        const resCat = await fetch(`${API}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Name_categories: newCategory.trim() }),
        });
        const dataCat = await resCat.json();
        if (!dataCat || !dataCat.CategoriesID) {
          setErrorMsg('Error, no se pudo crear la categoría  ');
          return;
        }
        categoryID = Number(dataCat.CategoriesID);
      }

      if (categoryID === null || categoryID === undefined) {
        setErrorMsg('Selecciona una categoría válida  ');
        return;
      }

      // Crear FormData para envío con imagen
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

      // Mostrar alerta de éxito
      setShowSuccess(true);

      // Reset form
      setName(''); 
      setPrice(''); 
      setDescription(''); 
      setAmount('');
      setSelectedCategory(null); 
      setNewCategory('');
      setImage(null);
      setErrorMsg('');
    } catch (e) {
      console.error(e);
      setErrorMsg('No se pudo guardar el producto');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ALERTA DE ÉXITO */}
        {showSuccess && (
          <View style={styles.successOverlay}>
            <View style={styles.successBox}>
              <Image
                source={require('../../../assets/images/ci.png')} // 🔹 Pones tu imagen aquí
                style={{ width: 100, height: 100, marginBottom: 10 }}
              />
              <Text style={styles.successText}>Producto agregado con éxito!</Text>
              <TouchableOpacity onPress={() => setShowSuccess(false)} style={styles.successButton}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="-- Selecciona una categoría --" value={null} />
              {categorias.map(c => (
                <Picker.Item key={c.CategoriesID} label={c.Name_categories} value={c.CategoriesID} />
              ))}
            </Picker>
          </View>

          <TextInput
            placeholder="O agregar nueva categoría"
            style={styles.input}
            value={newCategory}
            onChangeText={setNewCategory}
          />

          {errorMsg ? (
            <Animatable.View animation="shake" style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
            </Animatable.View>
          ) : null}

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
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginVertical: 5, overflow: 'hidden' },
  picker: { height: 50, width: '100%' },
  imageButton: { backgroundColor: '#03A9F4', padding: 12, borderRadius: 6, marginTop: 10 },
  imageButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  imagePreview: { width: 100, height: 100, marginVertical: 10, borderRadius: 6 },
  saveButton: { backgroundColor: '#6200EE', padding: 14, borderRadius: 8, marginTop: 15 },
  saveButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  errorBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#fdecea', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#f5c6cb' },
  errorIcon: { width: 20, height: 20, borderRadius: 4, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  errorIconText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  errorText: { color: '#db0a0aff', fontSize: 14, fontWeight: '600' },

  // Estilos alerta de éxito
  successOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  successButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});
