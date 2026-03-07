import { z } from "zod";

// Companies
export const CreateCompanySchema = z.object({
  legalName: z.string().min(1, "Legal name required"),
  taxId: z.string().min(1, "Tax ID required"),
  commercialName: z.string().optional(),
  countryCode: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  legalAddress: z.string().optional(),
});

export const UpdateCompanySchema = z.object({
  legalName: z.string().min(1).optional(),
  taxId: z.string().min(1).optional(),
  commercialName: z.string().optional(),
  countryCode: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  legalAddress: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"]).optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;

// Users
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  systemRole: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"]).optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  systemRole: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"]).optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Valets
export const CreateValetSchema = z.object({
  userId: z.string().min(1, "User ID required"),
  licenseNumber: z.string().min(1, "License number required"),
  licenseExpiry: z.string().datetime("Invalid datetime"),
  currentParkingId: z.string().optional(),
});

export const UpdateValetSchema = z.object({
  licenseNumber: z.string().min(1).optional(),
  licenseExpiry: z.string().datetime("Invalid datetime").optional(),
  currentParkingId: z.string().optional(),
  ratingAvg: z.number().optional(),
});

export type CreateValetInput = z.infer<typeof CreateValetSchema>;
export type UpdateValetInput = z.infer<typeof UpdateValetSchema>;

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

const VehicleDimensionsSchema = z.object({
  lengthCm: z.number().positive().optional(),
  widthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
}).optional();

// Vehicles
export const CreateVehicleSchema = z.object({
  plate: z.string().min(1, "Plate required"),
  countryCode: z.string().default("CR"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  dimensions: VehicleDimensionsSchema,
});

export const UpdateVehicleSchema = z.object({
  plate: z.string().min(1).optional(),
  countryCode: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  dimensions: VehicleDimensionsSchema,
});

export type CreateVehicleInput = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof UpdateVehicleSchema>;

// Parkings
export const CreateParkingSchema = z.object({
  name: z.string().min(1, "Parking name required"),
  address: z.string().min(1, "Address required"),
  type: z.string().min(1, "Type required"),
  totalSlots: z.number().positive("Total slots must be positive"),
  requiresBooking: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const UpdateParkingSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  type: z.string().optional(),
  totalSlots: z.number().positive("Total slots must be positive").optional(),
  requiresBooking: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CreateParkingInput = z.infer<typeof CreateParkingSchema>;
export type UpdateParkingInput = z.infer<typeof UpdateParkingSchema>;

// Bookings
export const CreateBookingSchema = z.object({
  clientId: z.string().min(1, "Client ID required"),
  parkingId: z.string().min(1, "Parking ID required"),
  vehicleId: z.string().min(1, "Vehicle ID required"),
  scheduledEntryTime: z.string().datetime("Invalid datetime"),
  scheduledExitTime: z.string().datetime("Invalid datetime").optional(),
});

export const UpdateBookingSchema = z.object({
  status: z.string().optional(),
  scheduledEntryTime: z.string().datetime().optional(),
  scheduledExitTime: z.string().datetime().optional(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type UpdateBookingInput = z.infer<typeof UpdateBookingSchema>;

// Tickets
export const CreateTicketSchema = z.object({
  bookingId: z.string().optional(),
  clientId: z.string().min(1, "Client ID required"),
  parkingId: z.string().min(1, "Parking ID required"),
  vehicleId: z.string().min(1, "Vehicle ID required"),
  slotId: z.string().optional(),
});

export const UpdateTicketSchema = z.object({
  status: z.string().optional(),
  slotId: z.string().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;

// Auth
export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
