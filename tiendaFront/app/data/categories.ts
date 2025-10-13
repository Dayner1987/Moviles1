import { Producto } from './products'; // <-- Importa correctamente

export type CategoriaConProductos = {
  CategoriesID: number;
  Name_categories: string;
  products: Producto[]; // Referencia al tipo de products.ts
};

export const categorias: CategoriaConProductos[] = [];
const _dummy = () => null;
export default _dummy;
