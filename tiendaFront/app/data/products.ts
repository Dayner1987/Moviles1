export type Producto = {
  ProductsID: number;
  Name_product: string;
  Price: number;
  Description?: string;
  Amount: number;
  CategoryID: number;
  imageUri?: string;
  categories?: {
    CategoriesID: number;
    Name_categories: string;
  };
};


// Array vacío que se llenará desde el backend
export const productos: Producto[] = [];
const _dummy = () => null;
export default _dummy;
