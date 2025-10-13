// app/(tabs)/ClientHome.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  Image, 
  RefreshControl, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { CategoriaConProductos } from '../../data/categories';
import { Producto,productos } from '../../data/products';
import { API } from '../../ip/IpDirection';
import { Usuario } from '../../data/users';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Picker } from '@react-native-picker/picker';
import * as Animatable from 'react-native-animatable';

export default function ClientHome() {
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [cliente, setCliente] = useState<Usuario | null>(null);

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`${API}/users/2`);
      if (!res.ok) {
        console.error('Error al obtener el usuario:', res.status, res.statusText);
        return;
      }
      const data: Usuario = await res.json();
      setCliente(data);
    } catch (e) {
      console.error('Error conectando al API:', e);
    }
  };

  const fetchCategorias = async () => {
    try {
      const res = await fetch(`${API}/categories`);
      const data = await res.json();
      const categoriasData: CategoriaConProductos[] = data.map((c: any) => ({
        CategoriesID: c.CategoriesID,
        Name_categories: c.Name_categories,
        products: c.products?.map((p: any) => ({
          ProductsID: p.ProductsID,
          Name_product: p.Name_product,
          Price: p.Price,
          Description: p.Description,
          Amount: p.Amount,
          CategoryID: p.CategoryID,
          imageUri: p.imageUri,
        })) || [],
      }));
      setCategorias(categoriasData);
    } catch (e) {
      console.error('Error al obtener categorías:', e);
    }
  };

  useEffect(() => {
    fetchCategorias();
    fetchEmployee();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategorias();
    setRefreshing(false);
  };

  const categoriasFiltradas = categorias
    .map((categoria) => ({
      ...categoria,
      products: categoria.products.filter((p) =>
        p.Name_product.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(
      (categoria) =>
        categoria.Name_categories.toLowerCase().includes(search.toLowerCase()) ||
        categoria.products.length > 0
    );

    ////seccion añadir productos 
    const [name, setName] = useState('');
      const [price, setPrice] = useState('');
      const [description, setDescription] = useState('');
      const [amount, setAmount] = useState('');
      const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
      const [newCategory, setNewCategory] = useState('');
    
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
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Lista de categorías */}
        <View style={styles.categoriasContainer}>
          {categoriasFiltradas.length > 0 ? (
            categoriasFiltradas.map((categoria) => (
              <TouchableOpacity
                key={categoria.CategoriesID}
                onPress={() =>
                  setCategoriaSeleccionada(
                    categoriaSeleccionada === categoria.CategoriesID ? null : categoria.CategoriesID
                  )
                }
                style={[
                  styles.categoriaItem,
                  categoriaSeleccionada === categoria.CategoriesID && styles.categoriaSeleccionada,
                ]}
              >
                <Text
                  style={
                    categoriaSeleccionada === categoria.CategoriesID
                      ? styles.categoriaTextSeleccionada
                      : styles.categoriaText
                  }
                >
                  {categoria.Name_categories}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResults}>No se encontró nada...</Text>
          )}
        </View>

        {/* Productos */}
        {categoriaSeleccionada && (
          <View style={styles.productosContainer}>
            <Text style={styles.sectionTitle}>
              Productos de {categorias.find(c => c.CategoriesID === categoriaSeleccionada)?.Name_categories}
            </Text>
            {categorias
              .find((c) => c.CategoriesID === categoriaSeleccionada)
              ?.products.filter((p) =>
                p.Name_product.toLowerCase().includes(search.toLowerCase())
              )
              .map((p: Producto) => (
                <View key={p.ProductsID} style={styles.productoItem}>
                  <Image
                    source={
                      p.imageUri
                        ? { uri: `${API}${p.imageUri.startsWith('/') ? '' : '/'}${p.imageUri}` }
                        : require('../../../assets/images/noimg.png')
                    }
                    style={styles.productoImagen}
                  />
                  <View style={styles.productoInfo}>
                    <Text style={styles.productoNombre}>{p.Name_product}</Text>
                    <Text style={styles.productoDescripcion}>{p.Description}</Text>
                    <Text style={styles.productoCantidad}>Cantidad: {p.Amount}</Text>
                    <Text style={styles.productoPrecio}>Precio: {p.Price} Bs</Text>
                  </View>
                </View>
              ))}
          </View>
        )}
        {/*agregar productos*/}
         <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={80}
            >
              <ScrollView style={styles.container2} contentContainerStyle={{ paddingBottom: 180 }}>
                {/* ALERTA DE ÉXITO */}
                {showSuccess && (
                  <View style={styles.successOverlay}>
                    <View style={styles.successBox}>
                      <LottieView
                                  source={require('../../../assets/fonts/add.json')}
                                  autoPlay
                                  loop
                                  style={{
                                    width: 250,
                                    height: 250,
                                    marginBottom: 20,
                                    borderRadius: 75,
                                    borderWidth: 3,
                                    borderColor: '#6200EE',
                                    alignSelf: 'center',
                                  }}
                                />
                      <Text style={styles.successText}>Producto agregado con éxito!</Text>
                      <TouchableOpacity onPress={() => setShowSuccess(false)} style={styles.successButton}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>OK</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
        
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
                    placeholder="agregar nueva categoría"
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15, marginTop: 20 },
  container2:{margin: 0},
  searchInput: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 },
  categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: 20 },
  categoriaItem: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, margin: 5, backgroundColor: '#EDE7F6', minWidth: '28%', alignItems: 'center' },
  categoriaSeleccionada: { backgroundColor: '#6200EE' },
  categoriaText: { color: '#000', fontWeight: '500' },
  categoriaTextSeleccionada: { color: '#fff', fontWeight: '600' },

  productosContainer: { marginBottom: 30 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  productoItem: { flexDirection: 'row', padding: 12, borderRadius: 12, marginBottom: 10, backgroundColor: '#f9f9f9', elevation: 2 },
  productoImagen: { width: 120, height: 120, borderRadius: 12, marginRight: 12 },
  productoInfo: { flex: 1 },
  productoNombre: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  productoDescripcion: { fontStyle: 'italic', color: '#555', marginBottom: 4 },
  productoCantidad: { color: '#333', marginBottom: 2 },
  productoPrecio: { fontWeight: '700', color: '#6200EE' },
  noResults: { marginTop: 20, fontStyle: 'italic', color: '#555', textAlign: 'center' },

  ///añadir productos 

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
