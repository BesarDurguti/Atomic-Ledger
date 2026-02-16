import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log("Usage: npx tsx prisma/seed.ts <name> <email> <password>");
    console.log('Example: npx tsx prisma/seed.ts "Besar" "besar@test.com" "password123"');
    process.exit(1);
  }

  const [name, email, password] = args;

  // Create user
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, password: hashPassword(password) },
    create: {
      name,
      email,
      password: hashPassword(password),
    },
  });

  console.log(`User created: ${user.name} (${user.email})`);

  // Seed default categories for this user
  const defaultCategories = [
    { name: "Para ne Banke", type: "ASSET" },
    { name: "Para Cash", type: "ASSET" },
    { name: "Qiraja", type: "EXPENSE" },
    { name: "Rryma", type: "EXPENSE" },
    { name: "Ushqimi", type: "EXPENSE" },
    { name: "Benzina", type: "EXPENSE" },
    { name: "Paga", type: "REVENUE" },
    { name: "Freelance", type: "REVENUE" },
    { name: "Kredia e Bankes", type: "LIABILITY" },
  ];

  // Delete existing categories for this user before re-seeding
  await prisma.category.deleteMany({ where: { userId: user.id } });

  for (const cat of defaultCategories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        type: cat.type,
        userId: user.id,
      },
    });
  }

  console.log(`Created ${defaultCategories.length} default categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
