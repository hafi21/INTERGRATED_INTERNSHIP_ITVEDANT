import bcrypt from "bcryptjs";
import { PrismaClient, ProductStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    categoryName: "Executive Essentials",
    description: "Premium office-ready gear and accessories for modern professionals.",
  },
  {
    categoryName: "Precision Tech",
    description: "High-performance devices engineered for smooth work and everyday flow.",
  },
  {
    categoryName: "Home Studio",
    description: "Minimal desk, decor, and lighting products for a refined setup.",
  },
];

const products = [
  {
    name: "Carbon Ledger Backpack",
    slug: "carbon-ledger-backpack",
    description: "Structured commuter backpack with padded laptop sleeve and quick-access essentials pocket.",
    price: 129.99,
    inventory: 18,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    featured: true,
    status: ProductStatus.ACTIVE,
    categoryName: "Executive Essentials",
  },
  {
    name: "Aureon Smart Folio",
    slug: "aureon-smart-folio",
    description: "Magnetic tablet folio with modular stand and premium vegan leather finish.",
    price: 89.0,
    inventory: 26,
    imageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80",
    featured: true,
    status: ProductStatus.ACTIVE,
    categoryName: "Executive Essentials",
  },
  {
    name: "Velocity Wireless Keyboard",
    slug: "velocity-wireless-keyboard",
    description: "Low-profile mechanical keyboard tuned for long sessions and clean desk setups.",
    price: 149.5,
    inventory: 14,
    imageUrl:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
    featured: true,
    status: ProductStatus.ACTIVE,
    categoryName: "Precision Tech",
  },
  {
    name: "Signal Desk Lamp",
    slug: "signal-desk-lamp",
    description: "Warm ambient lamp with touch dimming and sculpted aluminum body.",
    price: 74.0,
    inventory: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    featured: false,
    status: ProductStatus.ACTIVE,
    categoryName: "Home Studio",
  },
  {
    name: "Pulse Monitor Stand",
    slug: "pulse-monitor-stand",
    description: "Elevated display stand with integrated cable routing and storage tray.",
    price: 99.0,
    inventory: 21,
    imageUrl:
      "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=900&q=80",
    featured: false,
    status: ProductStatus.ACTIVE,
    categoryName: "Home Studio",
  },
  {
    name: "Vector Noise Cancel Earbuds",
    slug: "vector-noise-cancel-earbuds",
    description: "Compact audio companion with adaptive cancellation and fast pairing.",
    price: 159.0,
    inventory: 28,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    featured: true,
    status: ProductStatus.ACTIVE,
    categoryName: "Precision Tech",
  },
];

async function main() {
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash("Admin@123", 12);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 12);

  await prisma.user.createMany({
    data: [
      {
        fullName: "Admin User",
        email: "admin@aureon.com",
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
      },
      {
        fullName: "Aureon Customer",
        email: "customer@aureon.com",
        passwordHash: customerPasswordHash,
        role: UserRole.CUSTOMER,
      },
    ],
  });

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.create({
        data: category,
      }),
    ),
  );

  const categoryMap = new Map(
    createdCategories.map((category) => [category.categoryName, category.categoryId]),
  );

  await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          inventory: product.inventory,
          imageUrl: product.imageUrl,
          featured: product.featured,
          status: product.status,
          categoryId: categoryMap.get(product.categoryName)!,
        },
      }),
    ),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Database seeded successfully");
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
