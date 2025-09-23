import { Producto } from './products';
import { Usuario } from './users';
import { OrderStatus } from './orderStatus';

export type OrderItem = {
  id: number;
  OrderID: number;
  ProductID: number;
  Quantity: number;
  Price: number;
  product?: Producto; // detalle del producto
};

export type Order = {
  OrdersID: number;
  UserID: number;
  Date_order: string; // puedes manejarlo como string ISO o Date
  United_price: number;
  StatusOrderID: number;
  users?: Usuario;         // relación con el cliente
  order_status?: OrderStatus;   // estado de la orden
  items?: OrderItem[];    // productos dentro de la orden
};

// Array vacío
export const orders: Order[] = [];
