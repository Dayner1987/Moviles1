//app/data/users.ts
import { Rol } from './roles';

export type Usuario = {
  clientID: number;
  Roles_RolesID: number;
  Name1: string;
  Name2?: string;
  LastName1: string;
  LastName2?: string;
  CI: number;
  Email: string;
  Address: string;
  Password: string;
  role?: Rol; // opcional, relación con Rol
};

// Array vacío
export const users: Usuario[] = [];
const _dummy = () => null;
export default _dummy;
