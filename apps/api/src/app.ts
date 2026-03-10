import compression from "compression";
import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import companyRoutes from "./modules/companies/companies.routes";
import usersRoutes from "./modules/users/users.routes";
import auditRoutes from "./modules/audit/audit.routes";
import bookingsRoutes from "./modules/bookings/bookings.routes";
import clientsRoutes from "./modules/clients/clients.routes";
import notificationsRoutes from "./modules/notifications/notifications.routes";
import parkingsRoutes from "./modules/parkings/parkings.routes";
import ticketsRoutes from "./modules/tickets/tickets.routes";
import valetsRoutes from "./modules/valets/valets.routes";
import vehiclesRoutes from "./modules/vehicles/vehicles.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";

export const app = express();

app.use(compression());

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-company-id"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Límite alto para PATCH /companies/me con brandingConfig (imágenes en base64); 50mb para no truncar
app.use(express.json({ limit: "50mb" }));

app.get("/health", (_, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/auth", authRoutes);
app.use("/companies", companyRoutes);
app.use("/users", usersRoutes);
app.use("/audit", auditRoutes);
app.use("/bookings", bookingsRoutes);
app.use("/clients", clientsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/parkings", parkingsRoutes);
app.use("/tickets", ticketsRoutes);
app.use("/valets", valetsRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/dashboard", dashboardRoutes);
