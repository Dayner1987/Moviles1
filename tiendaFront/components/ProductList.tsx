// app/components/ProductList.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import { Producto } from '../app/data/products';

type Props = {
  productos: Producto[];
};

export default function ProductList({ productos }: Props) {
  return (
    <FlatList
      data={productos}
      keyExtractor={(item) => item.ProductsID.toString()}
      renderItem={({ item }) => (
        <View style={styles.productoItem}>
          <Text style={styles.productoNombre}>
            {item.Name_product} - ${item.Price}
          </Text>
          <Text style={styles.productoDescripcion}>{item.Description}</Text>
          <Text style={styles.productoCantidad}>Cantidad disponible: {item.Amount}</Text>

          {item.imageUri && (
            <Image
             source={{ uri: `http://10.122.24.181:3000${item.imageUri.startsWith('/') ? '' : '/'}${item.imageUri}` }}

              style={styles.productoImagen}
            />
          )}
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  productoItem: { padding: 12, borderRadius: 12, marginBottom: 10, backgroundColor: '#fff', elevation: 2 },
  productoNombre: { fontWeight: 'bold' },
  productoDescripcion: { fontStyle: 'italic', color: '#555' },
  productoCantidad: { color: '#333', marginTop: 4 },
  productoImagen: { width: 100, height: 100, marginTop: 5, borderRadius: 6 },
});
