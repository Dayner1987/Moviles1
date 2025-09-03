import express, { Request, Response } from 'express';
import { PrismaClient } from './generated/prisma/index.js';
import bcrypt from 'bcrypt';
import path from 'path';
import multer from 'multer';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Carpeta pública para servir imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // carpeta donde se guardan
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
//login
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { CI: Number(identifier) },
          { Email: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    let role = '';
    if (user.Roles_RolesID === 1) role = 'Cliente';
    else if (user.Roles_RolesID === 2) role = 'Empleado';
    else if (user.Roles_RolesID === 3) role = 'Administrador';

    res.json({ id: user.clientID, role });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
//enviar a correo electronico 
app.post('/enviar-factura', async (req, res) => {
  const { email, html } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'Gmail', // o tu proveedor SMTP
    auth: {
      user: 'tuemail@gmail.com',
      pass: 'tucontraseña'
    }
  });

  try {
    await transporter.sendMail({
      from: '"Hairlux" <tuemail@gmail.com>',
      to: email,
      subject: 'Tu factura electrónica Hairlux',
      html
    });
    res.status(200).send({ ok: true });
  } catch (err) {
  if (err instanceof Error) {
    res.status(500).send({ ok: false, error: err.message });
  } else {
    res.status(500).send({ ok: false, error: String(err) });
  }
}

});
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
//tener categoria
app.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.categories.findMany({ include: { products: true } });// mejor ordenador para la mas reciente
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

// Agregar productos

app.post('/products', async (req: Request, res: Response) => {
  try {
    const { Name_product, Price, Description, Amount, CategoryID, imageUri } = req.body;

    const product = await prisma.products.create({
      data: {
        Name_product,
        Price: parseFloat(Price),
        Description,
        Amount: parseInt(Amount),
        CategoryID: parseInt(CategoryID),
        imageUri, // directamente la URI
      },
    });

    res.status(201).json(product);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});




app.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.products.findMany();
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
      Email,
      Address,
      Password,
    } = req.body;

    // Validación de campos obligatorios
    if (!Roles_RolesID || !Name1 || !LastName1 || !CI || !Email || !Address || !Password) {
      return res.status(400).json({ error: 'Faltan datos obligatorios.' });
    }

    // Validación extra (opcional pero útil)
    if (typeof CI !== 'number' || CI <= 0) {
      return res.status(400).json({ error: 'CI inválido.' });
    }

    // Verifica si el CI o el Email ya existen
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { CI: CI },
          { Email: Email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'CI o Email ya están registrados.' });
    }

    // Encriptar la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    // Crear el usuario
    const newUser = await prisma.users.create({
      data: {
        Roles_RolesID,
        Name1,
        Name2,
        LastName1,
        LastName2,
        CI,
        Email,
        Address,
        Password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'Usuario creado correctamente.',
      user: {
        clientID: newUser.clientID,
        Name1: newUser.Name1,
        LastName1: newUser.LastName1,
        Email: newUser.Email,
        RoleID: newUser.Roles_RolesID,
      },
    });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Error al crear el usuario: ' + e.message });
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

app.listen(3000, '0.0.0.0', () => {
  console.log('Servidor corriendo en http://10.122.24.181:3000');
});

