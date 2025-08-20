// app/hooks/useProductos.ts
import { useState } from 'react';
import { Producto } from '../app/data/products';

export const useProductos = (initialProducts: Producto[]) => {
  const [productos, setProductos] = useState<Producto[]>(initialProducts);

  // Agregar un producto nuevo
  const agregarProducto = (producto: Producto) => {
    setProductos(prev => [...prev, producto]);
  };

  // Editar un producto existente por id
  const editarProducto = (id: string, datos: Partial<Producto>) => {
    setProductos(prev =>
      prev.map(p => (p.id === id ? { ...p, ...datos } : p))
    );
  };

  // Eliminar un producto por id
  const eliminarProducto = (id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  return {
    productos,
    agregarProducto,
    editarProducto,
    eliminarProducto,
  };
};
