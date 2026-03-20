import { PrismaClient } from "@prisma/client";
import { products } from "../lib/products";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting product seeding...\n");

  // Seed new products
  console.log("📦 Seeding products...\n");

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        weight: 0.00001, // 0.01g per card in kg
        deviceType: product.deviceType,
        images: product.images,
        features: product.features,
        stock: product.stock,
        isCustomizable: product.isCustomizable || false,
        color: product.color || null,
      },
    });
    console.log(`  ✓ Seeded: ${created.name} (${created.slug}) - 100g`);
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
