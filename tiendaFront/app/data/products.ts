import { CategoriaConProductos } from './categories';


export type Producto = {
  ProductsID: number;
  Name_product: string;
  Price: number;
  Description?: string;
  Amount: number;
  CategoryID: number;
  imageUri?: string;
  category?: CategoriaConProductos; // <-- agregar opcional
           // <-- agregar opcional
};


// Array vacío que se llenará desde el backend
export const productos: Producto[] = [];
