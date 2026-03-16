import { PrismaClient } from "@prisma/client";
import { products } from "../lib/products";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting product seeding...\n");

  // Clear existing order items first (due to foreign key constraints)
  await prisma.orderItem.deleteMany();
  console.log("✓ Cleared existing order items");

  // Clear existing products
  await prisma.product.deleteMany();
  console.log("✓ Cleared existing products\n");

  // Seed new products
  console.log("📦 Seeding products...\n");

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        deviceType: product.deviceType,
        images: product.images,
        features: product.features,
        stock: product.stock,
        isCustomizable: product.isCustomizable || false,
        color: product.color || null,
      },
    });
    console.log(`  ✓ Seeded: ${created.name} (${created.slug})`);
  }

  console.log(`\n✅ Successfully seeded ${products.length} products!`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
