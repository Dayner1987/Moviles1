import express from 'express';
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// 1.todos los productos 
app.get('/products', async (req, res) => {
  try {
    const products = await prisma.products.findMany();
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 2. Crear un nuevo usuario (cliente)
app.post('/users', async (req, res) => {
  try {
    const { Roles_RolesID, Name1, LastName1, CI, Address, Password } = req.body;
    const user = await prisma.users.create({
      data: { Roles_RolesID, Name1, LastName1, CI, Address, Password }
    });
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Crear un pedido (order)
app.post('/orders', async (req, res) => {
  try {
    const {
      Products_ProductsID,
      Products_Categories_CategoriesID,
      Users_clientID,
      Users_Roles_RolesID,
      Status_order,
      United_price,
    } = req.body;
    const order = await prisma.orders.create({
      data: {
        Products_ProductsID,
        Products_Categories_CategoriesID,
        Users_clientID,
        Users_Roles_RolesID,
        Date_order: new Date(),
        Status_order,
        United_price,
      },
    });
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
