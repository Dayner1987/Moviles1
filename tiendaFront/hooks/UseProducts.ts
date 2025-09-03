// app/hooks/useProductos.ts
import { useState } from 'react';
import { Producto } from '../app/data/products';

export const useProductos = (initialProducts: Producto[]) => {
  const [productos, setProductos] = useState<Producto[]>(initialProducts);

  // Agregar un producto nuevo
  const agregarProducto = (producto: Producto) => {
    setProductos(prev => [...prev, producto]);
  };

  // Editar un producto existente por ProductsID
  const editarProducto = (ProductsID: number, datos: Partial<Producto>) => {
    setProductos(prev =>
      prev.map(p => (p.ProductsID === ProductsID ? { ...p, ...datos } : p))
    );
  };

  // Eliminar un producto por ProductsID
  const eliminarProducto = (ProductsID: number) => {
    setProductos(prev => prev.filter(p => p.ProductsID !== ProductsID));
  };

  return {
    productos,
    agregarProducto,
    editarProducto,
    eliminarProducto,
  };
};
