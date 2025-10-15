// hooks/useCarrito.ts
import { useEffect, useState } from 'react';
import { Producto } from '../app/data/products';

// Estado global para el carrito
let carritoGlobal: Producto[] = [];
let suscriptores: ((carrito: Producto[]) => void)[] = [];

export const useCarrito = () => {
  const [carrito, setCarrito] = useState<Producto[]>(carritoGlobal);

  // Notificar a todos los componentes
  const notificarCambio = (nuevoCarrito: Producto[]) => {
    suscriptores.forEach(fn => fn(nuevoCarrito));
  };

  // Suscribirse a los cambios
  useEffect(() => {
    const suscriptor = (nuevoCarrito: Producto[]) => setCarrito([...nuevoCarrito]);
    suscriptores.push(suscriptor);

    return () => {
      suscriptores = suscriptores.filter(fn => fn !== suscriptor);
    };
  }, []);

  // ➕ Agregar producto
  const agregarAlCarrito = (producto: Producto) => {
    const yaEnCarrito = carritoGlobal.some(item => item.ProductsID === producto.ProductsID);
    if (!yaEnCarrito) {
      carritoGlobal = [...carritoGlobal, producto];
      notificarCambio(carritoGlobal);
    }
  };

  // 🗑️ Eliminar producto
  const eliminarDelCarrito = (id: number) => {
    carritoGlobal = carritoGlobal.filter(item => item.ProductsID !== id);
    notificarCambio(carritoGlobal);
  };

  // 🧹 Limpiar todo
  const limpiarCarrito = () => {
    carritoGlobal = [];
    notificarCambio(carritoGlobal);
  };

  return { carrito, agregarAlCarrito, eliminarDelCarrito, limpiarCarrito };
};
