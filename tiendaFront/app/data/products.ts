import { CategoriaConProductos } from './categories';

export type Producto = {
  ProductsID: number;   // en lugar de ProductsID
  Name_product: string;
  Price: number;
  Description?: string;
  Amount: number;
  CategoryID: number;
  imageUri?: string;
  category?: CategoriaConProductos;
};



// Array vacío que se llenará desde el backend
export const productos: Producto[] = [];
