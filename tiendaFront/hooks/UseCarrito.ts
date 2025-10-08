// hooks/UseCarrito.ts
import { useEffect, useState } from 'react';
import { Producto } from '../app/data/products';

// Estado global para el carrito
let carritoGlobal: Producto[] = [];
let suscriptores: ((carrito: Producto[]) => void)[] = [];

export const useCarrito = () => {
  const [carrito, setCarrito] = useState<Producto[]>(carritoGlobal);

  // Función para notificar a todos los componentes
  const notificarCambio = (nuevoCarrito: Producto[]) => {
    suscriptores.forEach(fn => fn(nuevoCarrito));
  };

  // Suscribirse a los cambios del carrito
  useEffect(() => {
    const suscriptor = (nuevoCarrito: Producto[]) => setCarrito([...nuevoCarrito]);
    suscriptores.push(suscriptor);

    return () => {
      suscriptores = suscriptores.filter(fn => fn !== suscriptor);
    };
  }, []);

  const agregarAlCarrito = (producto: Producto) => {
    const yaEnCarrito = carritoGlobal.some(item => item.ProductsID === producto.ProductsID);
    if (!yaEnCarrito) {
      carritoGlobal = [...carritoGlobal, producto];
      notificarCambio(carritoGlobal);
    }
  };

  const limpiarCarrito = () => {
    carritoGlobal = [];
    notificarCambio(carritoGlobal);
  };

  return { carrito, agregarAlCarrito, limpiarCarrito };
};
