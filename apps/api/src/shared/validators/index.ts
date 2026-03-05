import { z } from "zod";

// Companies
export const CreateCompanySchema = z.object({
  legalName: z.string().min(1, "Legal name required"),
  taxId: z.string().min(1, "Tax ID required"),
  commercialName: z.string().optional(),
  countryCode: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  billingEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  legalAddress: z.string().optional(),
});

export const UpdateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;

// Users
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name required"),
  role: z.string().min(1, "Role required"),
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Clients
export const CreateClientSchema = z.object({
  name: z.string().min(1, "Client name required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
});

export const UpdateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

// Vehicles
export const CreateVehicleSchema = z.object({
  plate: z.string().min(1, "Plate required"),
  countryCode: z.string().default("CR"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  color: z.string().optional(),
});

export const UpdateVehicleSchema = z.object({
  plate: z.string().min(1).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  color: z.string().optional(),
});

export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;

// Parkings
export const CreateParkingSchema = z.object({
  name: z.string().min(1, "Parking name required"),
  address: z.string().min(1, "Address required"),
  type: z.string().min(1, "Type required"),
  capacity: z.number().positive("Capacity must be positive"),
});

export const UpdateParkingSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  type: z.string().optional(),
  capacity: z.number().positive().optional(),
});

export type CreateParkingInput = z.infer<typeof CreateParkingSchema>;
export type UpdateParkingInput = z.infer<typeof UpdateParkingSchema>;

// Bookings
export const CreateBookingSchema = z.object({
  clientId: z.string().min(1, "Client ID required"),
  parkingId: z.string().min(1, "Parking ID required"),
  vehicleId: z.string().min(1, "Vehicle ID required"),
  startTime: z.string().datetime("Invalid datetime"),
  endTime: z.string().datetime("Invalid datetime").optional(),
});

export const UpdateBookingSchema = z.object({
  status: z.string().optional(),
  endTime: z.string().datetime().optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;

// Tickets
export const CreateTicketSchema = z.object({
  bookingId: z.string().optional(),
  clientId: z.string().min(1, "Client ID required"),
  parkingId: z.string().min(1, "Parking ID required"),
  vehicleId: z.string().min(1, "Vehicle ID required"),
  entryTime: z.string().datetime("Invalid datetime"),
});

export const UpdateTicketSchema = z.object({
  status: z.string().optional(),
  exitTime: z.string().datetime().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;

// Auth
export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
