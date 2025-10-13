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
const _dummy = () => null;
export default _dummy;
