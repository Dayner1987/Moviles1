// hooks/UseCarrito.ts
import { useState } from 'react';
import { Producto } from '../app/data/products';

let carritoGlobal: Producto[] = [];

export const useCarrito = () => {
  const [carrito, setCarrito] = useState<Producto[]>(carritoGlobal);

  const agregarAlCarrito = (item: Producto) => {
    carritoGlobal = [...carritoGlobal, item];
    setCarrito([...carritoGlobal]);
  };

  const limpiarCarrito = () => {
    carritoGlobal = [];
    setCarrito([]);
  };

  return { carrito, agregarAlCarrito, limpiarCarrito };
};
