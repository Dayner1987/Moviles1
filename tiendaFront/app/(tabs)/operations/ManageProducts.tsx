import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Producto } from '../../data/products';
import { CategoriaConProductos } from '../../data/categories';

export default function ManageProducts() {
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [editandoProducto, setEditandoProducto] = useState<Producto | null>(null);

  useEffect(() => {
    // Traer categorías con productos desde backend
    fetch('http://10.122.24.181:3000/products')
      .then(res => res.json())
      .then((data: any[]) => {
        // Agrupar productos por categoría
        const catMap: Record<number, CategoriaConProductos> = {};
        data.forEach(prod => {
          const catId = prod.CategoryID;
          if (!catMap[catId]) {
            catMap[catId] = { id: catId, nombre: prod.categories?.Name_categories || 'Sin categoría', products: [] };
          }
          catMap[catId].products.push(prod);
        });
        setCategorias(Object.values(catMap));
      });
  }, []);

  const guardarEdicion = async () => {
    if (!editandoProducto) return;

    try {
      const res = await fetch(`http://10.11.231.181:3000/products/${editandoProducto.ProductsID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name_product: editandoProducto.Name_product,
          Price: editandoProducto.Price,
          Description: editandoProducto.Description,
          Amount: editandoProducto.Amount,
          CategoryID: editandoProducto.CategoryID,
        }),
      });

      if (!res.ok) throw new Error('Error actualizando producto');
      const updated = await res.json();

      // Actualizar localmente
      setCategorias(prev =>
        prev.map(cat => ({
          ...cat,
          products: cat.products.map(p => (p.ProductsID === updated.ProductsID ? updated : p)),
        }))
      );
      setEditandoProducto(null);
      Alert.alert('Éxito', 'Producto actualizado');
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el producto');
    }
  };

  const eliminarProducto = async (id: number) => {
    try {
      const res = await fetch(`http://10.11.231.181:3000/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando producto');

      setCategorias(prev =>
        prev.map(cat => ({
          ...cat,
          products: cat.products.filter(p => p.ProductsID !== id),
        }))
      );
      if (editandoProducto?.ProductsID === id) setEditandoProducto(null);
      Alert.alert('Éxito', 'Producto eliminado');
    } catch (e) {
      Alert.alert('Error', 'No se pudo eliminar el producto');
    }
  };

  const renderProducto = ({ item }: { item: Producto }) => (
    <TouchableOpacity style={styles.productoItem} onPress={() => setEditandoProducto(item)}>
      <Text style={styles.productoNombre}>{item.Name_product}</Text>
      <Text>{item.Price} Bs</Text>
    </TouchableOpacity>
  );

  const renderCategoria = ({ item }: { item: CategoriaConProductos }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.categoriaNombre}>{item.nombre}</Text>
      <FlatList
        data={item.products}
        keyExtractor={(p) => p.ProductsID.toString()}
        renderItem={renderProducto}
        scrollEnabled={false}
      />
    </View>
  );

  const renderEditar = () => {
    if (!editandoProducto) return null;

    return (
      <View style={styles.editContainer}>
        <Text style={styles.editTitle}>Editar Producto</Text>

        <Text>Nombre</Text>
        <TextInput
          style={styles.input}
          value={editandoProducto.Name_product}
          onChangeText={(text) => setEditandoProducto({ ...editandoProducto, Name_product: text })}
        />

        <Text>Precio</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={editandoProducto.Price.toString()}
          onChangeText={(text) =>
            setEditandoProducto({ ...editandoProducto, Price: parseFloat(text) || 0 })
          }
        />

        <Text>Descripción</Text>
        <TextInput
          style={styles.input}
          value={editandoProducto.Description || ''}
          onChangeText={(text) => setEditandoProducto({ ...editandoProducto, Description: text })}
        />

        <Text>Cantidad</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={editandoProducto.Amount.toString()}
          onChangeText={(text) => setEditandoProducto({ ...editandoProducto, Amount: parseInt(text) || 0 })}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#4caf50' }]} onPress={guardarEdicion}>
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#f44336' }]}
            onPress={() =>
              Alert.alert('Confirmar', '¿Eliminar este producto?', [
                { text: 'Cancelar' },
                { text: 'Eliminar', onPress: () => eliminarProducto(editandoProducto.ProductsID) },
              ])
            }
          >
            <Text style={styles.buttonText}>Eliminar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: '#9e9e9e' }]} onPress={() => setEditandoProducto(null)}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f0f0f0' }} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>Gestionar Productos</Text>
      {renderEditar()}
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCategoria}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: 'bold', fontSize: 22, marginBottom: 16 },
  categoriaNombre: { fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#6200EE' },
  productoItem: { padding: 12, borderRadius: 8, marginBottom: 8, backgroundColor: '#fff', elevation: 2 },
  productoNombre: { fontWeight: 'bold', fontSize: 16 },
  editContainer: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginBottom: 20, elevation: 3 },
  editTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginVertical: 6, backgroundColor: '#f9f9f9' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6, flex: 1, marginHorizontal: 4 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
