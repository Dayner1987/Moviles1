import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
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
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { CategoriaConProductos } from '../../data/categories';
import { Producto } from '../../data/products';
import { API } from '../../ip/IpDirection';

export default function NewProducts() {
  const [refreshing, setRefreshing] = useState(false);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryID, setCategoryID] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = React.useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
// Guardar producto
const guardarProducto = async () => {
  if (!nombre.trim() || !precio.trim() || !amount.trim() || (!selectedCategory && !newCategory.trim())) {
    setErrorMsg('Completa todos los campos');
    return;
  }

  const precioNum = parseFloat(precio);
  const amountNum = parseInt(amount);
  if (isNaN(precioNum) || isNaN(amountNum)) {
    setErrorMsg('Precio y cantidad deben ser válidos');
    return;
  }

  try {
    let categoryToUse = categoryID; // categoría existente

    // 🆕 Si el usuario escribió una nueva categoría:
    if (newCategory.trim()) {
      const resCat = await fetch(`${API}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name_categories: newCategory.trim() }),
      });

      if (!resCat.ok) throw new Error('Error al crear nueva categoría');
      const newCatData = await resCat.json();

      // asignamos el ID de la categoría creada
      categoryToUse = newCatData.CategoriesID.toString();

      // refrescamos lista de categorías
      setCategorias([...categorias, newCatData]);
      setNewCategory('');
    }

    // 🛒 Luego creamos el producto normalmente
    const prodData = {
      Name_product: nombre,
      Price: precioNum,
      Description: descripcion || undefined,
      Amount: amountNum,
      CategoryID: parseInt(categoryToUse),
      imageUri: imageUri || undefined,
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/products/${editId}` : `${API}/products`;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prodData),
    });

    if (!response.ok) throw new Error('Error al guardar el producto');
    const data = await response.json();

    if (editId) {
      setProductos(productos.map(p => p.ProductsID === editId ? data : p));
    } else {
      setProductos([...productos, data]);
    }

    resetForm();
  } catch (error) {
    console.error(error);
    setErrorMsg('No se pudo guardar el producto');
  }
};


// Editar producto: llena el formulario
const editarProducto = (p: Producto) => {
  setNombre(p.Name_product);
  setPrecio(p.Price.toString());
  setDescripcion(p.Description || '');
  setAmount(p.Amount.toString());
  setCategoryID(p.CategoryID.toString());
  setImageUri(p.imageUri || ''); // imagen puede estar vacía
  setEditId(p.ProductsID);

  // Opcional: puedes hacer scroll al formulario si la lista está larga
};

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<number | null>(null);
  

  const confirmarEliminarProducto = (id: number) => {
    setProductoAEliminar(id);
    setShowDeleteConfirm(true);
  };
// Eliminar producto
const eliminarProducto = async () => {
    if (productoAEliminar === null) return;

    try {
      const response = await fetch(`${API}/products/${productoAEliminar}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error al eliminar producto');

      setProductos(productos.filter(p => p.ProductsID !== productoAEliminar));
      setShowDeleteConfirm(false);
      setShowSuccess(true); // mostrar animación de éxito
    } catch (error: any) {
      console.error(error);
      setShowDeleteConfirm(false);
    }
  };

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API}/categories`);
        const data = await res.json();
        setCategorias(data);
      } catch (e) {
        console.error(e);
      }
    };
    setCategoryID('');
    fetchCategorias();
  }, []);


  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API}/products`);
        const data = await res.json();
        setProductos(data);
      } catch {
  
        setErrorMsg('No se pudieron cargar los procutos ');
      }
    };
    fetchProductos();
  }, []);

  // Seleccionar imagen
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Necesitas acceso a las imagenes  ');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

const onRefresh = async () => {
  setRefreshing(true);
  try {
    const resProductos = await fetch(`${API}/products`);
    const dataProductos = await resProductos.json();
    setProductos(dataProductos);

    const resCategorias = await fetch(`${API}/categories`);
    const dataCategorias = await resCategorias.json();
    setCategorias(dataCategorias);

  } catch (error) {
    console.error('Error al refrescar:', error);
  }
  setRefreshing(false);
};

  // Reset form
  const resetForm = () => {
    setNombre(''); setPrecio(''); setDescripcion(''); setAmount('');
    setCategoryID(''); setImageUri(''); setEditId(null);
  };


 return (
   <>
     <ScrollView
       style={styles.container}
       refreshControl={
         <RefreshControl
           refreshing={refreshing}
           onRefresh={onRefresh}
         />
       }
     >
       {/* Formulario */}
       <View style={styles.form}>
         <Text style={styles.label}>Nombre</Text>
         <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
 
         <Text style={styles.label}>Precio</Text>
         <TextInput style={styles.input} value={precio} onChangeText={setPrecio} keyboardType="numeric" />
 
         <Text style={styles.label}>Descripción</Text>
         <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} />
 
         <Text style={styles.label}>Cantidad</Text>
         <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" />
 
         <Text style={styles.label}>Categoría</Text>
         <Picker
           selectedValue={categoryID}
           onValueChange={(val) => setCategoryID(val)}
           style={styles.picker}
         >
           <Picker.Item label="Selecciona categoría" value="" />
           {categorias.map(c => (
             <Picker.Item key={c.CategoriesID} label={c.Name_categories} value={c.CategoriesID.toString()} />
           ))}
         </Picker>
 
                <TextInput
                             placeholder="agregar nueva categoría"
                             style={styles.input}
                             value={newCategory}
                             onChangeText={setNewCategory}
                           />
 
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
 
         {errorMsg && (
           <Animatable.View animation="shake" style={styles.errorBox}>
             <Text style={styles.errorText}>{errorMsg}</Text>
             <View style={styles.errorIcon}>
               <Text style={styles.errorIconText}>!</Text>
             </View>
           </Animatable.View>
         )}
       </View>
 
       {/* Lista de categorías */}
       <View style={styles.categoriasContainer}>
         {categorias.length > 0 ? (
           categorias.map((categoria) => (
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
           <Text style={styles.noResults}>No se encontró nada....</Text>
         )}
       </View>
 
       {/* Productos */}
       {categoriaSeleccionada && (
         <View style={styles.productosContainer}>
           <Text style={styles.sectionTitle}>
             Productos de {categorias.find(c => c.CategoriesID === categoriaSeleccionada)?.Name_categories}
           </Text>
           {categorias
             .find(c => c.CategoriesID === categoriaSeleccionada)
             ?.products.map((p: Producto) => (
               <View key={p.ProductsID} style={styles.productoItem}>
                 <Image
                   source={
                     p.imageUri
                       ? { uri: p.imageUri.startsWith('http') ? p.imageUri : `${API}${p.imageUri.startsWith('/') ? '' : '/'}${p.imageUri}` }
                       : require('../../../assets/images/noimg.png')
                   }
                   style={styles.productoImage}
                 />
                 <View style={styles.productoInfo}>
                   <Text style={styles.productoNombre}>{p.Name_product}</Text>
                   <Text style={styles.productoDescripcion}>{p.Description}</Text>
                   <Text style={styles.productoCantidad}>Cantidad: {p.Amount}</Text>
                   <Text style={styles.productoPrecio}>Precio: {p.Price} Bs</Text>
                 </View>
                 <View style={styles.productoIcons}>
                   <TouchableOpacity onPress={() => confirmarEliminarProducto(p.ProductsID)}>
                     <Image source={require('../../../assets/images/eliminar.png')} style={styles.iconoProducto} />
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() => editarProducto(p)}>
                     <Image source={require('../../../assets/images/editar.png')} style={styles.iconoProducto} />
                   </TouchableOpacity>
                 </View>
               </View>
             ))}
         </View>
       )}
     </ScrollView>
 
     {/* Confirmación de eliminación */}
     {showDeleteConfirm && (
       <View style={styles.overlay}>
         <View style={styles.confirmBox}>
           <Image source={require('../../../assets/images/eliminar.png')} style={{ width: 50, height: 50, alignSelf: 'center' }} />
           <Text style={{ fontSize: 16, textAlign: 'center', marginVertical: 10 }}>
             ¿Estás seguro que deseas eliminar este producto?
           </Text>
           <TouchableOpacity
             style={styles.confirmButton}
             onPress={eliminarProducto}
           >
             <Text style={{ color: '#fff', textAlign: 'center' }}>Eliminar</Text>
           </TouchableOpacity>
           <TouchableOpacity
             style={[styles.confirmButton, { backgroundColor: '#ccc', marginTop: 5 }]}
             onPress={() => setShowDeleteConfirm(false)}
           >
             <Text style={{ textAlign: 'center' }}>Cancelar</Text>
           </TouchableOpacity>
         </View>
       </View>
     )}
 
     {/* ALERTA DE ÉXITO */}
     {showSuccess && (
       <View style={styles.successOverlay}>
         <View style={styles.successBox}>
           <LottieView
             source={require('../../../assets/fonts/delete.json')}
             autoPlay
             loop={false}
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
           <Text style={styles.successText}>Producto eliminado con éxito!</Text>
           <TouchableOpacity onPress={() => setShowSuccess(false)} style={styles.successButton}>
             <Text style={{ color: '#fff', fontWeight: 'bold' }}>OK</Text>
           </TouchableOpacity>
         </View>
       </View>
     )}
   </>
 );

}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: '#f9f9f9' },
  
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginTop: 5 },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 5 },
  imageButton: { marginTop: 10, backgroundColor: '#04a4d4ff', padding: 10, borderRadius: 8, alignItems: 'center' },
  imageButtonText: { color: '#ffffffff', fontWeight: 'bold' },
  previewImage: { height: 100, width: '100%', marginTop: 10, borderRadius: 8 },
  saveButton: { marginTop: 15, backgroundColor: '#32CD32', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { marginTop: 10, backgroundColor: '#FF8C00', padding: 12, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#fff', fontWeight: 'bold' },
  productCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 12, alignItems: 'center', elevation: 2 },
  productName: { fontWeight: 'bold', fontSize: 16 },
  iconPlaceholder: { width: 40, height: 40, backgroundColor: '#ccc', borderRadius: 20, marginHorizontal: 5 },
  productosContainer: { marginTop: 20 },
productoItem: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 10,
  marginBottom: 15,
  alignItems: 'center',
  elevation: 2,
},
productoImage: { width: 100, height: 100, borderRadius: 8, marginRight: 10 },
productoInfo: { flex: 1 },
productoNombre: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
productoDescripcion: { fontSize: 14, color: '#555', marginBottom: 4 },
productoCantidad: { fontSize: 13, color: '#777' },
productoPrecio: { fontSize: 14, fontWeight: '600', marginTop: 4 },
productoIcons: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10, // para separar los iconos
},
iconoProducto: { width: 50, height: 50 },


searchInput: { marginTop: 15, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },

  categoriasContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginTop: 20 },
  categoriaItem: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: 8, margin: 5, backgroundColor: '#EDE7F6', minWidth: '28%', alignItems: 'center' },
  categoriaSeleccionada: { backgroundColor: '#6200EE' },
  categoriaText: { color: '#000' },
  categoriaTextSeleccionada: { color: '#fff' },

  noResults: { marginTop: 20, fontStyle: 'italic', color: '#555' },
sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
 errorBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: '#fdecea', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#f5c6cb' },
  errorIcon: { width: 20, height: 20, borderRadius: 4, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  errorIconText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  errorText: { color: '#db0a0aff', fontSize: 14, fontWeight: '600' },
  
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  successOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  successText: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },

  overlay: {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999, // <- agrega zIndex alto
},
confirmBox: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 20,
  alignItems: 'center',
  elevation: 10,   // <- agrega para Android
},
confirmButton: {
  width: '100%',
  backgroundColor: '#d9534f',
  paddingVertical: 12,
  borderRadius: 8,
  marginTop: 10,
},

  successButton: { marginTop: 10, backgroundColor: '#32CD32', padding: 12, borderRadius: 8, alignItems: 'center', width: '50%' },
});
