import { PrismaClient } from './generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  // Insertar un usuario
  await prisma.users.create({
    data: {
      Roles_RolesID: 1, 
      Name1: "Juan",
      LastName1: "Pérez",
      CI: 123456,
      Address: "Av. Central",
      Password: "1234"
    }
  });

  // Insertar una categoria
  await prisma.categories.create({
    data: {
      CategoriesID: 1,
      Name_categories: "Bebidas"
    }
  });

  // Insertar un producto
  await prisma.products.create({
    data: {
      Categories_CategoriesID: 1, 
      Name_product: "Coca Cola",
      Price: 5.0,
      Description: "Bebida gaseosa",
      Amount: 100
    }
  });

  // Insertar un pedido
  await prisma.orders.create({
    data: {
      Products_ProductsID: 1,
      Products_Categories_CategoriesID: 1,
      Users_clientID: 1,
      Users_Roles_RolesID: 1,
      Date_order: new Date(),
      Status_order: "En camino",
      United_price: 5.0
    }
  });

  // Consultar pedidos con relaciones
  const orders = await prisma.orders.findMany({
    include: {
      users: {
        include: { roles: true },
      },
      products: {
        include: { categories: true },
      },
    },
  });

  console.dir(orders, { depth: null });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
