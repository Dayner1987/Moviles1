import { Producto } from './products'; // <-- Importa correctamente

export type CategoriaConProductos = {
  id: number;
  nombre: string;
  products: Producto[]; // Referencia al tipo de products.ts
};

export const categorias: CategoriaConProductos[] = [];
