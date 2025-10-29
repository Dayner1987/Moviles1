import { useEffect, useState } from 'react';
import { Producto } from '../app/data/products';

let carritoGlobal: (Producto & { cartId: string })[] = [];
let suscriptores: ((carrito: (Producto & { cartId: string })[]) => void)[] = [];

export const useCarrito = () => {
  const [carrito, setCarrito] = useState<typeof carritoGlobal>(carritoGlobal);

  const notificarCambio = (nuevoCarrito: typeof carritoGlobal) => {
    suscriptores.forEach(fn => fn(nuevoCarrito));
  };

  useEffect(() => {
    const suscriptor = (nuevoCarrito: typeof carritoGlobal) => setCarrito([...nuevoCarrito]);
    suscriptores.push(suscriptor);

    return () => {
      suscriptores = suscriptores.filter(fn => fn !== suscriptor);
    };
  }, []);

  const agregarAlCarrito = (producto: Producto) => {
    const productoConId = { ...producto, cartId: `${producto.ProductsID}-${Date.now()}-${Math.random()}` };
    carritoGlobal = [...carritoGlobal, productoConId];
    notificarCambio(carritoGlobal);
  };

  const eliminarDelCarrito = (cartId: string) => {
    carritoGlobal = carritoGlobal.filter(item => item.cartId !== cartId);
    notificarCambio(carritoGlobal);
  };

  const limpiarCarrito = () => {
    carritoGlobal = [];
    notificarCambio(carritoGlobal);
  };

  return { carrito, agregarAlCarrito, eliminarDelCarrito, limpiarCarrito };
};
