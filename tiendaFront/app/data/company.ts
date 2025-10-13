//app/data0company.ts
export type Company1 = {
  CompanyID: number;
  Name: string;          // Nombre de la empresa
  QRImage?: string;      // Ruta o URL del código QR
  Logo?: string;         // Logo de la empresa
  Phone?: string;        // Teléfono de contacto
  Address?: string;      // Dirección del local
  UpdatedAt: string;     // Fecha de última actualización (ISO string)
  CreatedAt: string;     // Fecha de creación (ISO string)
};

// Array vacío que luego se llenará con la información del backend
export const companyData: Company1[] = [];
import { Producto } from './products'; // <-- Importa correctamente

export type CategoriaConProductos = {
  CategoriesID: number;
  Name_categories: string;
  products: Producto[]; // Referencia al tipo de products.ts
};

export const categorias: CategoriaConProductos[] = [];
const _dummy = () => null;
export default _dummy;
