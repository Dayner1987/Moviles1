// app/(tabs)/operations/EmployeeHome.tsx
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { CategoriaConProductos } from '../../data/categories';
import { Producto } from '../../data/products';
import { API } from '../../ip/IpDirection';
import { router } from 'expo-router';
export default function EmployeeHome() {
  // Estado y referencias
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
const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
const [errorMsg, setErrorMsg] = useState('');
const [showSuccess, setShowSuccess] = useState(false);
const [newCategory, setNewCategory] = useState('');
const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
const scrollRef = React.useRef<ScrollView>(null);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [productoAEliminar, setProductoAEliminar] = useState<number | null>(null);

const [pickerVisible, setPickerVisible] = useState(false);
const [tempCategory, setTempCategory] = useState<number | null>(categoryID ? parseInt(categoryID) : null);

const [showSaveSuccess, setShowSaveSuccess] = useState(false);
const [savedProduct, setSavedProduct] = useState<Producto | null>(null);

// ----------------------
// Editar producto: llena formulario y hace scroll al top
const editarProducto = (p: Producto) => {
  setNombre(p.Name_product);
  setPrecio(p.Price.toString());
  setDescripcion(p.Description || '');
  setAmount(p.Amount.toString());
  setCategoryID(p.CategoryID.toString());
  setSelectedCategory(p.CategoryID); // ✅ mantiene su categoría real
  setImageUri(p.imageUri ?? '');
  setEditId(p.ProductsID);

  setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
};

// ----------------------
// Guardar o actualizar producto
const guardarProducto = async () => {
  const categoriaValida =
    selectedCategory ||
    (categoryID && categoryID !== '') ||
    (newCategory && newCategory.trim() !== '');

  if (!nombre.trim() || !precio.trim() || !amount.trim() || !categoriaValida) {
    setErrorMsg('Completa todos los campos');
    return;
  }

  const precioNum = parseFloat(precio);
  const amountNum = parseInt(amount, 10);
  if (isNaN(precioNum) || isNaN(amountNum)) {
    setErrorMsg('Precio y cantidad deben ser válidos');
    return;
  }

  try {
    let categoryToUse = selectedCategory?.toString() || categoryID;

    if (newCategory && newCategory.trim() !== '') {
      const resCat = await fetch(`${API}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name_categories: newCategory.trim() }),
      });

      if (!resCat.ok) throw new Error('Error al crear nueva categoría');
      const newCatData = await resCat.json();

      setCategorias((prev) => [...prev, { ...newCatData, products: [] }]);
      categoryToUse = newCatData.CategoriesID.toString();
      setSelectedCategory(newCatData.CategoriesID);
      setNewCategory('');
    }

    const categoryIdNum = parseInt(categoryToUse || '0', 10);
    if (categoryIdNum === 0) {
      setErrorMsg('Selecciona una categoría válida');
      return;
    }

    const formData = new FormData();
    formData.append('Name_product', nombre.trim());
    formData.append('Price', precioNum.toString());
    formData.append('Description', descripcion?.trim() || '');
    formData.append('Amount', amountNum.toString());
    formData.append('CategoryID', categoryIdNum.toString());

    if (imageUri) {
      const filename = imageUri.split('/').pop()!;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : 'jpg';
      const type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
      formData.append('image', {
        uri: imageUri.startsWith('file://') ? imageUri : 'file://' + imageUri,
        name: filename,
        type,
      } as any);
    }

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API}/products/${editId}` : `${API}/products`;
    const response = await fetch(url, { method, body: formData, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Error al guardar el producto');
    const data = await response.json();

    // ✅ Actualizar productos globales
    setProductos((prev) =>
      editId
        ? prev.map((p) => (p.ProductsID === editId ? data : p))
        : [...prev, data]
    );

   setCategorias((prev) => {
  let updated = prev.map((cat) => {
    if (cat.CategoriesID === data.CategoryID) {
      const productsUpdated = editId
        ? cat.products.map((p) =>
            p.ProductsID === data.ProductsID ? data : p
          )
        : [...cat.products, data];
      return { ...cat, products: productsUpdated };
    }
    return cat;
  });

  // Si la categoría no existía, la agregamos
  if (!updated.some((cat) => cat.CategoriesID === data.CategoryID)) {
    updated = [
      ...updated,
      {
        CategoriesID: data.CategoryID,
        Name_categories: data.Category?.Name_categories || newCategory.trim(),
        products: [data],
      },
    ];
  }

  return [...updated]; // 🔁 fuerza re-render
});


    // ✅ Si estás viendo esa categoría, refresca la vista al instante
    if (categoriaSeleccionada === data.CategoryID) {
      setCategoriaSeleccionada(null);
      setTimeout(() => setCategoriaSeleccionada(data.CategoryID), 100);
    }

    setSavedProduct(data);
    setShowSaveSuccess(true);
    resetForm();
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
    setErrorMsg('');

    console.log('✅ Producto guardado/actualizado correctamente:', data);
  } catch (error) {
    console.error('❌ Error guardarProducto:', error);
    setErrorMsg('No se pudo guardar el producto');
  }
};


// ---------------------


// ----------------------
// Confirmación de eliminación
const confirmarEliminarProducto = (id: number) => {
  setProductoAEliminar(id);
  setShowDeleteConfirm(true);
};

// ----------------------
// Eliminar producto
const eliminarProducto = async () => {
  if (productoAEliminar === null) return;

  try {
    const response = await fetch(`${API}/products/${productoAEliminar}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar producto');

    setProductos(productos.filter(p => p.ProductsID !== productoAEliminar));
    setShowDeleteConfirm(false);
    setShowSuccess(true);
  } catch (error: any) {
    console.error(error);
    setShowDeleteConfirm(false);
  }
  setCategorias((prev) =>
    prev.map((cat) => ({
      ...cat,
      products: cat.products.filter((p) => p.ProductsID !== productoAEliminar),
    }))
  );
  
};

// ----------------------
// Cargar categorías al iniciar
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
  fetchCategorias();
}, []);

// ----------------------
// Cargar productos al iniciar
useEffect(() => {
  const fetchProductos = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProductos(data);
    } catch {
      setErrorMsg('No se pudieron cargar los productos');
    }
  };
  setCategoryID('');
  fetchProductos();
}, []);

// ----------------------
// Selección de imagen
const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    setErrorMsg('Necesitas acceso a las imágenes');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: 'images', // <- minúscula para que TypeScript acepte
    quality: 1,
  });

  if (!result.canceled) setImageUri(result.assets[0].uri);
};


// ----------------------
// Refresh manual
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

// ----------------------
// Resetear formulario
const resetForm = () => {
  setNombre('');
  setPrecio('');
  setDescripcion('');
  setAmount('');
  setCategoryID('');
  setImageUri('');
  setEditId(null);
};


 return (
  <>
    <ScrollView
    ref={scrollRef}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={styles.container2}>
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
        <TouchableOpacity
  style={styles.categoryButton}
  onPress={() => setPickerVisible(true)}
>
  <Text>{selectedCategory
    ? categorias.find(c => c.CategoriesID === selectedCategory)?.Name_categories
    : 'Selecciona categoría'}</Text>
</TouchableOpacity>

<Modal visible={pickerVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.CategoriesID.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryItemModal,
              tempCategory === item.CategoriesID && styles.categoryItemSelected
            ]}
            onPress={() => setTempCategory(item.CategoriesID)}
          >
            <Text>{item.Name_categories}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => { setSelectedCategory(tempCategory); setPickerVisible(false); }}
        >
          <Text>Aceptar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.modalButton}
          onPress={() => { setTempCategory(selectedCategory); setPickerVisible(false); }}
        >
          <Text>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
               <TextInput
                            placeholder="o agregar nueva categoría"
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
</View>
      {/* Lista de categorías */}
      <View style={styles.container2}>
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
</View>
      {/* Productos */}
      {categoriaSeleccionada && (
        <View style={styles.productosContainer&&styles.container2}>
          <Text style={styles.sectionTitle}>
            Productos de {categorias.find(c => c.CategoriesID === categoriaSeleccionada)?.Name_categories}
          </Text>
          {categorias
            .find(c => c.CategoriesID === categoriaSeleccionada)
  ?.products?.map((p: Producto) => (
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
  {/* ALERTA DE ÉXITO CREAR/ACTUALIZAR */}
{showSaveSuccess && savedProduct && (
  <View style={styles.successOverlay}>
    <View style={styles.successBox}>
      <LottieView
        source={require('../../../assets/fonts/add.json')} // puedes cambiar por otra animación si quieres
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
      <Text style={styles.successText}>
        Producto {editId ? 'actualizado' : 'creado'} con éxito!
      </Text>
      <TouchableOpacity
        onPress={() => setShowSaveSuccess(false)}
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
  container: { flex: 1, padding: 0, backgroundColor: '#f9f9f9' },
    container2:{margin: 13},
  form: { backgroundColor: '#fff', padding: 15, borderRadius: 10, elevation: 2 },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginTop: 5 },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginTop: 5 },
  imageButton: { marginTop: 10, backgroundColor: '#04a4d4ff', padding: 10, borderRadius: 8, alignItems: 'center' },
  imageButtonText: { color: '#ffffffff', fontWeight: 'bold' },
  previewImage: { width: 180, height: 180, marginTop: 10, borderRadius: 8 },
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
  
categoryItemSelected: {
  backgroundColor: '#6200EE',
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalButton: {
  padding: 12,
  backgroundColor: '#6200EE',
  borderRadius: 8,
  minWidth: '40%',
  alignItems: 'center',
},

modalContent: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 15,
  padding: 20,
  maxHeight: 400, // mayor altura
},
categoryItemModal: {
  paddingVertical: 12,
  paddingHorizontal: 10,
  borderRadius: 12,
  marginVertical: 5,
  backgroundColor: '#EDE7F6',
  alignItems: 'center',
},
categoryButton: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  marginTop: 5,
  justifyContent: 'center',
},

});