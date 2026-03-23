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

  // Flow: SUPER_ADMIN creates companies via API, picks one in the company selector (x-company-id),
  // and everything created afterward (users, parkings, etc.) is linked to that company.
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
