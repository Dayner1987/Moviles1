import { Producto } from "./products";

export type OrderItem = {
  id: number;
  OrderID: number;
  ProductID: number;
  Quantity: number;
  Price: number;
  order?: Producto;
  product?: Producto;
};
