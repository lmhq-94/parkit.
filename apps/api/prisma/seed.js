require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  const passwordHash = await bcrypt.hash("Parkit123!", 10);

  // Flujo: SUPER_ADMIN crea empresas por API, elige una en el company selector (x-company-id),
  // y todo lo que cree (usuarios, parkings, etc.) queda ligado a esa empresa.
  await prisma.user.upsert({
    where: { email: "superadmin@parkit.cr" },
    update: {
      companyId: null,
      firstName: "Parkit",
      lastName: "Admin",
      passwordHash,
      systemRole: "SUPER_ADMIN",
      timezone: "UTC",
      isActive: true,
    },
    create: {
      id: "b8e5d9b5-6g35-5c77-0g95-d6ec1g9f7b12",
      companyId: null,
      firstName: "Parkit",
      lastName: "Admin",
      email: "superadmin@parkit.cr",
      passwordHash,
      systemRole: "SUPER_ADMIN",
      timezone: "UTC",
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed successfully.");
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
