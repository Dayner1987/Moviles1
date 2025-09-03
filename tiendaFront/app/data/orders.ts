import { Producto } from './products';
import { Usuario } from './users';
import { OrderStatus } from './orderStatus';

export type Order = {
  OrdersID: number;
  ProductID: number;
  UserID: number;
  Date_order: string; // o Date
  United_price: number;
  StatusOrderID: number;
  product?: Producto; // opcional
  user?: Usuario;     // opcional
  status?: OrderStatus; // opcional
};

// Array vacío
export const orders: Order[] = [];
