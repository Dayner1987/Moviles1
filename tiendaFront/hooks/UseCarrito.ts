// hooks/UseCarrito.ts
import { useState } from 'react';
import { Producto } from '../app/data/products';

// Estado global para el carrito
let carritoGlobal: Producto[] = [];

export const useCarrito = () => {
  const [carrito, setCarrito] = useState<Producto[]>(carritoGlobal);

  const agregarAlCarrito = (producto: Producto) => {
    // Verifica si ya está en el carrito (opcional, si quieres evitar duplicados)
    const yaEnCarrito = carritoGlobal.some(item => item.ProductsID === producto.ProductsID);
    if (!yaEnCarrito) {
      carritoGlobal = [...carritoGlobal, producto];
      setCarrito([...carritoGlobal]);
    }
  };

  const limpiarCarrito = () => {
    carritoGlobal = [];
    setCarrito([]);
  };

  return {
    carrito,
    agregarAlCarrito,
    limpiarCarrito
  };
};

