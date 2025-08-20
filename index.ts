import express, { Request, Response } from 'express';
import { PrismaClient } from './generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Crear categoría POST
app.post('/categories', async (req: Request, res: Response) => {
  try {
    const { Name_categories } = req.body;
    const newCategory = await prisma.categories.create({
      data: { Name_categories }
    });
    res.status(201).json(newCategory);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Listar categorías GET
app.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.categories.findMany({include:{products:true}});
    res.json(categories);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ACTUALIZAR CATEGORIA PUT 
app.put('/categories/:id', async (req: Request, res: Response) => {
  try {
    const CategoriesID = parseInt(req.params.id);
    const { Name_categories } = req.body;

    const updatedCategory = await prisma.categories.update({
      where: { CategoriesID },
      data: { Name_categories }
    });

    res.json(updatedCategory);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// ELIMINAR CATEGORIA 
app.delete('/categories/:id', async (req: Request, res: Response) => {
  try {
    const CategoriesID = parseInt(req.params.id);

    await prisma.categories.delete({
      where: { CategoriesID }
    });

    res.json({ message: 'Categoría eliminada correctamente.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Agregar producto
app.post('/products', async (req: Request, res: Response) => {
  try {
    const products = req.body;

    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'Se esperaba un array de productos.' });
    }

    const created = await prisma.products.createMany({
      data: products,
      skipDuplicates: true
    });

    res.status(201).json({ message: 'Productos creados exitosamente.', count: created.count });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// Obtener todos los productos GET
app.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.products.findMany({
      include: { categories: true }, // Opcional: incluir info de la categoría
    });
    res.json(products);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Actualizar un producto PUT
app.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const ProductsID = parseInt(req.params.id);
    const { CategoryID, Name_product, Price, Description, Amount } = req.body;

    const updatedProduct = await prisma.products.update({
      where: { ProductsID },
      data: { CategoryID, Name_product, Price, Description, Amount },
    });

    res.json(updatedProduct);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// delete productos
app.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const ProductsID = parseInt(req.params.id);

    await prisma.products.delete({
      where: { ProductsID }
    });

    res.json({ message: 'Producto eliminado correctamente.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// ---------------------
// CRUD EMPLEADOS (users)
// ---------------------

// Crear nuevo usuario con password encriptado
app.post('/users', async (req: Request, res: Response) => {
  try {
    const {
      Roles_RolesID,
      Name1,
      Name2,
      LastName1,
      LastName2,
      CI,
      Address,
      Password,
    } = req.body;

    if (!Roles_RolesID || !Name1 || !LastName1 || !CI || !Address || !Password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    // Encriptar password antes de guardar
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);
    console.log(hashedPassword);
    const newUser = await prisma.users.create({
      data: {
        Roles_RolesID,
        Name1,
        Name2,
        LastName1,
        LastName2,
        CI,
        Address,
        Password: hashedPassword,
      },
    });

    res.status(201).json(newUser);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// Listar USUARIOS
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      include: { roles: true },
    });
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Actualizar USUARIOS
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const clientID = parseInt(req.params.id);
    const { Roles_RolesID, Name1, Name2, LastName1, LastName2, CI, Address, Password } = req.body;

    const updatedUser = await prisma.users.update({
      where: { clientID },
      data: {
        Roles_RolesID,
        Name1,
        Name2,
        LastName1,
        LastName2,
        CI,
        Address,
        Password,
      },
    });

    res.json(updatedUser);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Eliminar USUARIOS
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const clientID = parseInt(req.params.id);
    await prisma.users.delete({ where: { clientID } });
    res.json({ message: 'Empleado eliminado correctamente.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ---------------------
// Suppliers 
// -----------------------

app.post('/suppliers', async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Faltan datos del proveedor.' });
    }

    const supplier = await prisma.suppliers.create({ // <-- suppliers plural
      data: { name, phone },
    });

    res.status(201).json(supplier);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Obtener todos los suppliers
app.get('/suppliers', async (req: Request, res: Response) => {
  try {
    const suppliers = await prisma.suppliers.findMany(); // <-- suppliers plural
    res.json(suppliers);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Actualizar supplier
app.put('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const idSuppliers = parseInt(req.params.id);
    const { name, phone } = req.body;

    const updated = await prisma.suppliers.update({ // <-- suppliers plural
      where: { idSuppliers },
      data: { name, phone },
    });

    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Eliminar supplier
app.delete('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const idSuppliers = parseInt(req.params.id);
    await prisma.suppliers.delete({ where: { idSuppliers } }); // <-- suppliers plural
    res.json({ message: 'Proveedor eliminado correctamente.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// ---------------------
// ROLES DE LOS USUARIOS 
// ---------------------

// Crear NUEVO ROL 
app.post('/roles', async (req: Request, res: Response) => {
  try {
    const { NameRol } = req.body;

    if (!NameRol) {
      return res.status(400).json({ error: 'El nombre del rol es obligatorio.' });
    }

    const newRole = await prisma.roles.create({
      data: { NameRol },
    });

    res.status(201).json(newRole);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// OBTENER LOS roles GET
app.get('/roles', async (req: Request, res: Response) => {
  try {
    const roles = await prisma.roles.findMany();
    res.json(roles);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
// actualiar ROL PUT
app.put('/roles/:id', async (req: Request, res: Response) => {
  try {
    const RolesID = parseInt(req.params.id);
    const { NameRol } = req.body;

    if (!NameRol) {
      return res.status(400).json({ error: 'El nombre del rol es obligatorio para la actualización.' });
    }

    const updatedRole = await prisma.roles.update({
      where: { RolesID },
      data: { NameRol },
    });

    res.json(updatedRole);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// ---------------------
// ORDERS CLIENTS
// ---------------------
// 📌 CREAR NUEVA ORDEN (inicializa estado como false automáticamente)
app.post('/orders', async (req: Request, res: Response) => {
  const { ProductID, UserID, Date_order, United_price } = req.body;

  try {
    const status = await prisma.order_status.create({
      data: { estado: false }, // Estado "pendiente"
    });

    const newOrder = await prisma.orders.create({
      data: {
        ProductID,
        UserID,
        Date_order: new Date(Date_order),
        United_price,
        StatusOrderID: status.idEstado,
      },
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 OBTENER TODAS LAS ÓRDENES
app.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        users: true,
        products: true,
        order_status: true,
      },
    });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 OBTENER UNA ORDEN POR ID
app.get('/orders/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const order = await prisma.orders.findUnique({
      where: { OrdersID: id },
      include: {
        users: true,
        products: true,
        order_status: true,
      },
    });

    if (!order) return res.status(404).json({ message: "Orden no encontrada" });

    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

//  ELIMINAR UNA ORDEN
app.delete('/orders/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const deletedOrder = await prisma.orders.delete({
      where: { OrdersID: id },
    });

    res.json({ message: "Orden eliminada", deletedOrder });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------
// ORDER STATUS
// ---------------------


// ACTUALIZAR ESTADO DE UNA ORDEN (order_status)
app.patch('/orders/:id/status', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body; // true o false

  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const order = await prisma.orders.findUnique({
      where: { OrdersID: id },
    });

    if (!order) return res.status(404).json({ message: "Orden no encontrada" });

    const updatedStatus = await prisma.order_status.update({
      where: { idEstado: order.StatusOrderID },
      data: { estado: Boolean(estado) },
    });

    res.json({ message: "Estado actualizado", status: updatedStatus });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------
// Iniciar servidor
// ---------------------

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
