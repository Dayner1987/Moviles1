import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from './generated/prisma/index.js';
import bcrypt from 'bcrypt';
import path from 'path';
import multer from 'multer';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
// CORRECTO en TypeScript
import { JwtPayload } from './JwtPayload.js';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(bodyParser.json());


declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // esto le dice a TS que req.user existe
    }
  }
}
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

////////////////
//JWT 
///////////

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_aqui';

app.post('/auth/login', async (req: Request, res: Response) => {
  const { identifier, password } = req.body; // puede ser email o CI

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Email/CI y contraseña son requeridos' });
  }

  try {
    let user;

    // Verificar si identifier es numérico (CI) o no (email)
    if (/^\d+$/.test(identifier)) {
      // Buscar por CI
      user = await prisma.users.findUnique({
        where: { CI: parseInt(identifier) },
        include: { roles: true },
      });
    } else {
      // Buscar por email
      user = await prisma.users.findUnique({
        where: { Email: identifier },
        include: { roles: true },
      });
    }

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Preparar payload JWT
    const payload: JwtPayload = {
      id: user.clientID,
      role:
        user.roles.RolesID === 1
          ? 'cliente'
          : user.roles.RolesID === 2
          ? 'empleado'
          : 'administrador',
      name: `${user.Name1} ${user.LastName1}`,
      email: user.Email,
    };

    // Generar token
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Autenticación exitosa',
      token,
      user: payload,
    });
  } catch (error) {
    console.error('Error en /auth/login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
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

// Obtener un usuario por ID
app.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const clientID = parseInt(req.params.id);
    if (isNaN(clientID)) return res.status(400).json({ error: 'ID inválido' });

    const user = await prisma.users.findUnique({
      where: { clientID },
      include: { roles: true }, // Incluimos el rol
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Excluir siempre la contraseña
    const { Password, ...safeUser } = user;

    res.json(safeUser);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
// Listar todos los usuarios
app.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      include: { roles: true }, // Incluye la relación roles
    });

    // Excluir Password
    const safeUsers = users.map(({ Password, ...user }) => user);

    res.json(safeUsers);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Actualizar usuario
app.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const clientID = parseInt(req.params.id);
    if (isNaN(clientID)) return res.status(400).json({ error: 'ID inválido' });

    const existingUser = await prisma.users.findUnique({ where: { clientID } });
    if (!existingUser) return res.status(404).json({ error: 'Usuario no encontrado' });

    const { Roles_RolesID, Name1, Name2, LastName1, LastName2, CI, Email, Address, Password } = req.body;

    let hashedPassword = existingUser.Password;
    if (Password && Password.trim() !== '') {
      hashedPassword = await bcrypt.hash(Password, 10);
    }

    const updatedUser = await prisma.users.update({
      where: { clientID },
      data: {
        Roles_RolesID: Roles_RolesID ?? existingUser.Roles_RolesID,
        Name1: Name1 ?? existingUser.Name1,
        Name2: Name2 ?? existingUser.Name2,
        LastName1: LastName1 ?? existingUser.LastName1,
        LastName2: LastName2 ?? existingUser.LastName2,
        CI: Number(CI) ?? existingUser.CI,
        Email: Email ?? existingUser.Email,
        Address: Address ?? existingUser.Address,
        Password: hashedPassword,
      },
    });

    const { Password: _, ...safeUser } = updatedUser;
    res.json({
      message: 'Usuario actualizado correctamente',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: error.message });
  }
});

// Eliminar usuario
app.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const clientID = parseInt(req.params.id);
    if (isNaN(clientID)) return res.status(400).json({ error: 'ID inválido' });

    await prisma.users.delete({ where: { clientID } });
    res.json({ message: 'Usuario eliminado correctamente.' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// ---------------------

// Agregar productos

app.post('/products', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { Name_product, Price, Description, Amount, CategoryID } = req.body;
    const imageUri = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.products.create({
      data: {
        Name_product,
        Price: parseFloat(Price),
        Description,
        Amount: parseInt(Amount),
        CategoryID: parseInt(CategoryID),
        imageUri,
      },
    });

    res.status(201).json(product);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        categories: true, // 👈 incluye la categoría relacionada
      },
    });
    res.json(products);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
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
    const categories = await prisma.categories.findMany({ include: { products: true } });
    res.json(categories);
  } catch (e: any) {
    console.error('Error en /categories:', e); // imprime el error completo en la consola
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

    const productos = await prisma.products.findMany({
      where: { CategoryID: CategoriesID },
    });

    if (productos.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar esta categoría porque tiene productos asociados.',
      });
    }

    await prisma.categories.delete({
      where: { CategoriesID },
    });

    res.json({ message: 'Categoría eliminada correctamente.' });
  } catch (e: any) {
    console.error('Error al eliminar categoría:', e);
    res.status(500).json({ error: e.message });
  }
});





// Actualizar un producto PUT
app.put('/products/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { Name_product, Price, Description, Amount, CategoryID } = req.body;
    const id = parseInt(req.params.id);

    // Obtener producto existente
    const existing = await prisma.products.findUnique({ where: { ProductsID: id } });
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

    // Si se sube nueva imagen, usarla; si no, mantener la anterior
    const imageUri = req.file ? `/uploads/${req.file.filename}` : existing.imageUri;

    const updated = await prisma.products.update({
      where: { ProductsID: id },
      data: {
        Name_product,
        Price: parseFloat(Price),
        Description,
        Amount: parseInt(Amount),
        CategoryID: parseInt(CategoryID),
        imageUri,
      },
    });

    res.json(updated);
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
// POST /orders
app.post('/orders', async (req: Request, res: Response) => {
  const { UserID, Date_order, products } = req.body;
  // products = [{ ProductID: 1, Quantity: 2 }, { ProductID: 3, Quantity: 1 }]

  try {
    // Crear estado inicial (pendiente)
    const status = await prisma.order_status.create({
      data: { estado: false },
    });

    // Calcular precio total
    const productData = await Promise.all(
      products.map(async (p: any) => {
        const prod = await prisma.products.findUnique({ where: { ProductsID: p.ProductID } });
        if (!prod) throw new Error(`Producto ${p.ProductID} no encontrado`);
        return {
          ProductID: p.ProductID,
          Quantity: p.Quantity,
          Price: prod.Price,
          subtotal: prod.Price * p.Quantity,
        };
      })
    );

    const total = productData.reduce((acc, p) => acc + p.subtotal, 0);

    // Crear orden
    const newOrder = await prisma.orders.create({
      data: {
        UserID,
        Date_order: new Date(Date_order),
        United_price: total,
        StatusOrderID: status.idEstado,
        items: {
          create: productData.map((p) => ({
            ProductID: p.ProductID,
            Quantity: p.Quantity,
            Price: p.Price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        users: true,
        order_status: true,
      },
    });

    res.status(201).json(newOrder);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /orders
app.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.orders.findMany({
      include: {
        users: true,
        items: { include: { product: true } },
        order_status: true,
      },
    });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// Endpoint para calcular ganancias con filtro de fechas
app.get('/orders/earnings', async (req: Request, res: Response) => {
  try {
    const { filter } = req.query as { filter?: string };
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (filter) {
      case 'hoy':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        break;
      case 'ayer':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'semana':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        break;
      case 'mes':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        break;
      default:
        startDate = new Date(0); // Desde siempre
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    }

    // Obtener IDs de status completados
    const completedStatusIDs = (
      await prisma.order_status.findMany({ where: { estado: true }, select: { idEstado: true } })
    ).map(s => s.idEstado);

    // Obtener órdenes completadas en el rango de fechas
    const completedOrders = await prisma.orders.findMany({
      where: {
        StatusOrderID: { in: completedStatusIDs },
        Date_order: { gte: startDate, lt: endDate },
      },
      select: {
        Date_order: true,
        items: { select: { Price: true, Quantity: true } },
      },
      orderBy: { Date_order: 'asc' },
    });

    let totalEarnings = 0;
    const daily: Record<string, number> = {};

    completedOrders.forEach(order => {
      const day = order.Date_order.toISOString().split('T')[0];
      const orderTotal = order.items.reduce((sum, item) => sum + item.Price * item.Quantity, 0);
      totalEarnings += orderTotal;
      daily[day] = (daily[day] || 0) + orderTotal;
    });

    res.json({ total: totalEarnings, daily });
  } catch (e: any) {
    console.error('Error en /orders/earnings:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// GET /orders/:id
app.get('/orders/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  try {
    const order = await prisma.orders.findUnique({
      where: { OrdersID: id },
      include: {
        users: true,
        items: { include: { product: true } },
        order_status: true,
      },
    });

    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /orders/:id/status
app.patch("/orders/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body; // true o false

  try {
    const updated = await prisma.orders.update({
      where: { OrdersID: id },
      data: {
        order_status: {
          update: { estado },
        },
      },
      include: {
        order_status: true, // opcional, para devolver el nuevo estado
      },
    });

    res.json({
      message: "Estado actualizado correctamente",
      estado: updated.order_status.estado,
    });
  } catch (error) {
    console.error("❌ Error al actualizar estado:", error);
    res.status(500).json({ error: "Error al actualizar el estado" });
  }
});

// 📌 CREAR ÓRDENES DESDE EL CARRITO
app.post('/orders/cart', async (req: Request, res: Response) => {
  const { UserID, productos, metodoPago, direccion } = req.body;
  // productos = [{ ProductID, Quantity, Price }]

  // 🔹 Validación de datos
  if (!UserID || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    // 1️⃣ Crear estado pendiente (o usar uno ya existente si prefieres)
    const status = await prisma.order_status.create({
      data: { estado: false }
    });

    // 2️⃣ Calcular total de la orden
    const total = productos.reduce((acc, p) => acc + (p.Price * (p.Quantity || 1)), 0);

    // 3️⃣ Crear la orden principal
    const order = await prisma.orders.create({
      data: {
        UserID,
        Date_order: new Date(),
        United_price: total,
        StatusOrderID: status.idEstado,
        // opcionalmente guarda método de pago o dirección si tienes estos campos en la tabla
        // metodoPago,
        // direccion,
        items: {
          create: productos.map((p) => ({
            ProductID: p.ProductID,
            Quantity: p.Quantity || 1,
            Price: p.Price,
          })),
        },
      },
      include: {
        items: { include: { product: true } }, // incluye info de productos
        users: true,
        order_status: true,
      },
    });

    res.status(201).json({
      message: "Orden creada correctamente",
      order
    });

  } catch (error: any) {
    console.error("Error creando orden:", error);
    res.status(500).json({ error: error.message });
  }
});

//obtener ordenes desde el cliente
// GET /orders/user/:userId
app.get('/orders/user/:userId', async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: "ID inválido" });

  try {
    const orders = await prisma.orders.findMany({
      where: { UserID: userId },
      include: {
        users: true,
        items: { include: { product: true } },
        order_status: true,
      },
      orderBy: { Date_order: 'desc' },
    });

    res.json(orders);
  } catch (error: any) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------
// Company
// ---------------------
//GET COMPANY
app.get("/company", async (req, res) => {
  try {
    const company = await prisma.company.findMany({
      orderBy: { CompanyID: "asc" },
    });

    if (!company || company.length === 0) {
      return res.status(404).json({ error: "No hay información registrada de la empresa." });
    }

    res.json(company);
  } catch (error) {
    console.error("Error al obtener la empresa:", error);
    res.status(500).json({ error: "Error al obtener la empresa" });
  }
});

// POST crear company (solo se debería usar una vez)
app.post("/company", async (req, res) => {
  try {
    const { Name, QRImage, Logo, Phone, Address } = req.body;

    // Verificamos si ya existe un registro
    const existing = await prisma.company.findFirst();
    if (existing) {
      return res.status(400).json({ error: "Ya existe una configuración de empresa, usa PUT para actualizarla" });
    }

    const newCompany = await prisma.company.create({
      data: {
        Name,
        QRImage,
        Logo,
        Phone,
        Address,
      },
    });

    res.json(newCompany);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la empresa" });
  }
});


// PUT actualizar company
app.put("/company/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, QRImage, Logo, Phone, Address } = req.body;

    const updatedCompany = await prisma.company.update({
      where: { CompanyID: parseInt(id) },
      data: {
        Name,
        QRImage,
        Logo,
        Phone,
        Address,
      },
    });

    res.json(updatedCompany);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la empresa" });
  }
});


// ---------------------
// Iniciar servidor
// ---------------------
app.listen(3000, '192.168.100.99', () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
