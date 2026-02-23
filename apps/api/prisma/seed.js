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

  const company = await prisma.company.upsert({
    where: { taxId: "3-101-999999" },
    update: {
      legalName: "Parkit Costa Rica S.A.",
      commercialName: "Parkit",
      status: "ACTIVE",
      timezone: "America/Costa_Rica",
      billingEmail: "billing@parkit.cr",
      contactPhone: "+50622223333",
      legalAddress: "San Jose, Costa Rica",
    },
    create: {
      id: "f6a4b5f9-0d84-4352-a67f-f3ad6eb5c701",
      legalName: "Parkit Costa Rica S.A.",
      commercialName: "Parkit",
      taxId: "3-101-999999",
      countryCode: "CR",
      currency: "CRC",
      timezone: "America/Costa_Rica",
      billingEmail: "billing@parkit.cr",
      contactPhone: "+50622223333",
      legalAddress: "San Jose, Costa Rica",
      status: "ACTIVE",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@parkit.cr" },
    update: {
      companyId: company.id,
      firstName: "Ana",
      lastName: "Campos",
      passwordHash,
      systemRole: "ADMIN",
      timezone: "America/Costa_Rica",
      isActive: true,
    },
    create: {
      id: "a7f4c8a4-5f24-4b66-9f84-c5db0f8e6a01",
      companyId: company.id,
      firstName: "Ana",
      lastName: "Campos",
      email: "admin@parkit.cr",
      passwordHash,
      systemRole: "ADMIN",
      timezone: "America/Costa_Rica",
      isActive: true,
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: "cliente@parkit.cr" },
    update: {
      companyId: company.id,
      firstName: "Luis",
      lastName: "Herrera",
      passwordHash,
      systemRole: "CUSTOMER",
      timezone: "America/Costa_Rica",
      isActive: true,
    },
    create: {
      id: "31f90f2e-b6e4-49d5-9227-c3537fc6dd02",
      companyId: company.id,
      firstName: "Luis",
      lastName: "Herrera",
      email: "cliente@parkit.cr",
      passwordHash,
      systemRole: "CUSTOMER",
      timezone: "America/Costa_Rica",
      isActive: true,
    },
  });

  const valetUser = await prisma.user.upsert({
    where: { email: "valet@parkit.cr" },
    update: {
      companyId: company.id,
      firstName: "Marco",
      lastName: "Solis",
      passwordHash,
      systemRole: "STAFF",
      timezone: "America/Costa_Rica",
      isActive: true,
    },
    create: {
      id: "2a224dbc-c9f3-4885-9c4f-40464e66d703",
      companyId: company.id,
      firstName: "Marco",
      lastName: "Solis",
      email: "valet@parkit.cr",
      passwordHash,
      systemRole: "STAFF",
      timezone: "America/Costa_Rica",
      isActive: true,
    },
  });

  const client = await prisma.client.upsert({
    where: { governmentId: "1-1234-5678" },
    update: {
      companyId: company.id,
      userId: clientUser.id,
      emergencyPhone: { name: "Laura Herrera", phone: "+50688887777" },
    },
    create: {
      id: "88d68b68-cfe4-4f89-b448-8f5c92e1bd04",
      companyId: company.id,
      userId: clientUser.id,
      governmentId: "1-1234-5678",
      emergencyPhone: { name: "Laura Herrera", phone: "+50688887777" },
    },
  });

  const valet = await prisma.valet.upsert({
    where: { userId: valetUser.id },
    update: {
      companyId: company.id,
      currentStatus: "AVAILABLE",
      ratingAvg: 4.9,
      licenseNumber: "B2-123456",
      licenseExpiry: new Date("2028-12-31T00:00:00.000Z"),
    },
    create: {
      id: "44180eef-3884-4489-b2ac-56640ed73f05",
      companyId: company.id,
      userId: valetUser.id,
      currentStatus: "AVAILABLE",
      ratingAvg: 4.9,
      licenseNumber: "B2-123456",
      licenseExpiry: new Date("2028-12-31T00:00:00.000Z"),
    },
  });

  const parking = await prisma.parking.upsert({
    where: { id: "23f2f4f6-f269-4660-bec1-b160487cb906" },
    update: {
      companyId: company.id,
      name: "Parqueo Central Escalante",
      address: "Barrio Escalante, San Jose",
      latitude: 9.9323,
      longitude: -84.0652,
      geofenceRadius: 80,
      type: "COVERED",
      totalSlots: 6,
      requiresBooking: true,
    },
    create: {
      id: "23f2f4f6-f269-4660-bec1-b160487cb906",
      companyId: company.id,
      name: "Parqueo Central Escalante",
      address: "Barrio Escalante, San Jose",
      latitude: 9.9323,
      longitude: -84.0652,
      geofenceRadius: 80,
      type: "COVERED",
      totalSlots: 6,
      requiresBooking: true,
    },
  });

  const slotA01 = await prisma.parkingSlot.upsert({
    where: { id: "3778d663-62f1-44b4-b3e6-69f338443107" },
    update: {
      parkingId: parking.id,
      label: "A-01",
      slotType: "REGULAR",
      isAvailable: false,
    },
    create: {
      id: "3778d663-62f1-44b4-b3e6-69f338443107",
      parkingId: parking.id,
      label: "A-01",
      slotType: "REGULAR",
      isAvailable: false,
    },
  });

  await prisma.parkingSlot.upsert({
    where: { id: "bb2a6373-066e-4318-8d59-85deecaf5708" },
    update: {
      parkingId: parking.id,
      label: "A-02",
      slotType: "REGULAR",
      isAvailable: true,
    },
    create: {
      id: "bb2a6373-066e-4318-8d59-85deecaf5708",
      parkingId: parking.id,
      label: "A-02",
      slotType: "REGULAR",
      isAvailable: true,
    },
  });

  await prisma.parkingSlot.upsert({
    where: { id: "cf5606e6-c7e4-4e9d-a994-aaddc98f2509" },
    update: {
      parkingId: parking.id,
      label: "A-03",
      slotType: "ELECTRIC",
      isAvailable: true,
    },
    create: {
      id: "cf5606e6-c7e4-4e9d-a994-aaddc98f2509",
      parkingId: parking.id,
      label: "A-03",
      slotType: "ELECTRIC",
      isAvailable: true,
    },
  });

  const vehicle = await prisma.vehicle.upsert({
    where: {
      plate_countryCode: {
        plate: "ABC123",
        countryCode: "CR",
      },
    },
    update: {
      companyId: company.id,
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      dimensions: { color: "Blanco", type: "Sedan" },
    },
    create: {
      id: "4a3a3599-f7f0-4d9c-b0e8-8bd4108ee10a",
      companyId: company.id,
      countryCode: "CR",
      plate: "ABC123",
      brand: "Toyota",
      model: "Corolla",
      year: 2022,
      dimensions: { color: "Blanco", type: "Sedan" },
    },
  });

  await prisma.clientVehicle.upsert({
    where: { id: "851d569c-5028-4ea3-bb2d-f89fe4bb010b" },
    update: {
      clientId: client.id,
      vehicleId: vehicle.id,
      isPrimary: true,
    },
    create: {
      id: "851d569c-5028-4ea3-bb2d-f89fe4bb010b",
      clientId: client.id,
      vehicleId: vehicle.id,
      isPrimary: true,
    },
  });

  const booking = await prisma.booking.upsert({
    where: { id: "3e973a01-fc48-4d9f-8b64-ec97b2212f0c" },
    update: {
      companyId: company.id,
      clientId: client.id,
      vehicleId: vehicle.id,
      parkingId: parking.id,
      scheduledEntryTime: new Date("2026-02-23T15:00:00.000Z"),
      scheduledExitTime: new Date("2026-02-23T21:00:00.000Z"),
      status: "CHECKED_IN",
      qrCodeReference: "BK-2026-0001",
    },
    create: {
      id: "3e973a01-fc48-4d9f-8b64-ec97b2212f0c",
      companyId: company.id,
      clientId: client.id,
      vehicleId: vehicle.id,
      parkingId: parking.id,
      scheduledEntryTime: new Date("2026-02-23T15:00:00.000Z"),
      scheduledExitTime: new Date("2026-02-23T21:00:00.000Z"),
      status: "CHECKED_IN",
      qrCodeReference: "BK-2026-0001",
    },
  });

  const ticket = await prisma.ticket.upsert({
    where: { id: "2b9e2715-c0ef-4bf8-95cb-ac53c8764a0d" },
    update: {
      companyId: company.id,
      bookingId: booking.id,
      parkingId: parking.id,
      vehicleId: vehicle.id,
      clientId: client.id,
      slotId: slotA01.id,
      status: "PARKED",
      entryTime: new Date("2026-02-23T15:05:00.000Z"),
      exitTime: null,
    },
    create: {
      id: "2b9e2715-c0ef-4bf8-95cb-ac53c8764a0d",
      companyId: company.id,
      bookingId: booking.id,
      parkingId: parking.id,
      vehicleId: vehicle.id,
      clientId: client.id,
      slotId: slotA01.id,
      status: "PARKED",
      entryTime: new Date("2026-02-23T15:05:00.000Z"),
      exitTime: null,
    },
  });

  await prisma.ticketAssignment.upsert({
    where: { id: "fda8f18d-6149-44fb-a5de-6caad0537010" },
    update: {
      ticketId: ticket.id,
      valetId: valet.id,
      role: "DRIVER",
      assignedAt: new Date("2026-02-23T15:06:00.000Z"),
    },
    create: {
      id: "fda8f18d-6149-44fb-a5de-6caad0537010",
      ticketId: ticket.id,
      valetId: valet.id,
      role: "DRIVER",
      assignedAt: new Date("2026-02-23T15:06:00.000Z"),
    },
  });

  await prisma.auditLog.upsert({
    where: { id: "0f4c08d3-26db-4f89-bdc3-2d6246b4ff11" },
    update: {
      ticketId: ticket.id,
      userId: adminUser.id,
      action: "seed.ticket.created",
      metadata: { source: "prisma-seed" },
    },
    create: {
      id: "0f4c08d3-26db-4f89-bdc3-2d6246b4ff11",
      ticketId: ticket.id,
      userId: adminUser.id,
      action: "seed.ticket.created",
      metadata: { source: "prisma-seed" },
    },
  });

  await prisma.notificationLog.upsert({
    where: { id: "d5f28d1d-bd5d-4890-ad56-f0f4a0988f12" },
    update: {
      userId: clientUser.id,
      title: "Reserva confirmada",
      body: "Tu vehiculo fue recibido y ticket creado en Parqueo Central Escalante.",
      type: "PUSH",
      status: "DELIVERED",
    },
    create: {
      id: "d5f28d1d-bd5d-4890-ad56-f0f4a0988f12",
      userId: clientUser.id,
      title: "Reserva confirmada",
      body: "Tu vehiculo fue recibido y ticket creado en Parqueo Central Escalante.",
      type: "PUSH",
      status: "DELIVERED",
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
