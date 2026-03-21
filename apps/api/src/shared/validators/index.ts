import { z } from "zod";

// Companies
export const CreateCompanySchema = z.object({
  legalName: z.string().min(1, "Legal name required"),
  taxId: z.string().min(1, "Tax ID required"),
  industry: z.string().min(1, "Industry required"),
  commercialName: z.string().optional(),
  countryCode: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  legalAddress: z.string().optional(),
  requiresCustomerApp: z.boolean().optional(),
});

// logoImageUrl y bannerImageUrl pueden ser data URLs en base64 (muy largas)
const BrandingConfigSchema = z
  .object({
    bannerImageUrl: z.union([z.string(), z.null()]).optional(),
    logoImageUrl: z.union([z.string(), z.null()]).optional(),
    primaryColor: z.union([z.string(), z.null()]).optional(),
    primaryColorDark: z.union([z.string(), z.null()]).optional(),
    secondaryColor: z.union([z.string(), z.null()]).optional(),
    secondaryColorDark: z.union([z.string(), z.null()]).optional(),
    tertiaryColor: z.union([z.string(), z.null()]).optional(),
    tertiaryColorDark: z.union([z.string(), z.null()]).optional(),
  })
  .optional();

export const UpdateCompanySchema = z.object({
  legalName: z.string().min(1).optional(),
  taxId: z.string().min(1).optional(),
  industry: z.string().min(1).optional(),
  commercialName: z.string().optional(),
  countryCode: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  legalAddress: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "INACTIVE"]).optional(),
  brandingConfig: BrandingConfigSchema,
  requiresCustomerApp: z.boolean().optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;

// Security rules for new passwords (set password, reset password). Must match frontend validation.
const PASSWORD_MIN_LENGTH = 8;
const hasUppercase = (s: string) => /[A-Z]/.test(s);
const hasLowercase = (s: string) => /[a-z]/.test(s);
const hasNumber = (s: string) => /\d/.test(s);
const hasSpecialChar = (s: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(s);

export const securePasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "Password must be at least 8 characters")
  .refine(hasUppercase, "Password must contain at least one uppercase letter")
  .refine(hasLowercase, "Password must contain at least one lowercase letter")
  .refine(hasNumber, "Password must contain at least one number")
  .refine(hasSpecialChar, "Password must contain at least one special character (!@#$%^&* etc.)");

export const PASSWORD_SECURITY = {
  minLength: PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
} as const;

// Users (optional password: when provided must meet secure password rules)
export const CreateUserSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  password: z
    .union([securePasswordSchema, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null ? undefined : v)),
  systemRole: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"]).optional(),
});

export const CreateSuperAdminSchema = z.object({
  email: z.string().email("Invalid email"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  password: z
    .union([securePasswordSchema, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" || v === null ? undefined : v)),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  systemRole: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"]).optional(),
  avatarUrl: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  avatarUrl: z.string().optional(),
  appPreferences: z
    .object({
      theme: z.enum(["light", "dark"]).optional(),
      locale: z.enum(["es", "en"]).optional(),
    })
    .optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Valets: crear por userId (usuario existente) o por datos de usuario (crear User + Valet)
export const CreateValetSchema = z
  .object({
    userId: z.string().min(1).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email("Invalid email").optional(),
    password: z.string().optional(),
    licenseNumber: z.string().min(1, "License number required"),
    licenseExpiry: z.string().min(1, "License expiry required"),
    currentParkingId: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.userId && !data.firstName && !data.lastName && !data.email) ||
      (!data.userId && data.firstName && data.lastName && data.email),
    { message: "Provide either userId (existing user) or firstName, lastName and email (new user)" }
  );

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

export const AddVehicleToUserSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID required"),
  isPrimary: z.boolean().optional(),
});

export type CreateClientInput = z.infer<typeof CreateClientSchema>;
export type UpdateClientInput = z.infer<typeof UpdateClientSchema>;

const VehicleDimensionsSchema = z.object({
  lengthCm: z.number().positive().optional(),
  widthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
}).optional();

const VehicleDimensionsRequiredSchema = z.object({
  lengthCm: z.number().positive("Length is required"),
  widthCm: z.number().positive("Width is required"),
  heightCm: z.number().positive("Height is required"),
  weightKg: z.number().positive("Weight is required"),
});

// Vehicles
export const CreateVehicleSchema = z.object({
  plate: z.string().min(1, "Plate required"),
  countryCode: z.string().default("CR"),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  dimensions: VehicleDimensionsRequiredSchema,
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
const SlotTypeEnum = z.enum(["REGULAR", "PREMIUM", "ELECTRIC", "HANDICAPPED"]);

export const CreateParkingSlotSchema = z.object({
  label: z.string().min(1, "Slot label required"),
  slotType: SlotTypeEnum.optional().default("REGULAR"),
});

export const CreateParkingSchema = z.object({
  name: z.string().min(1, "Parking name required"),
  address: z.string().min(1, "Address required"),
  type: z.string().min(1, "Type required"),
  slots: z.array(CreateParkingSlotSchema).min(1, "At least one slot required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  geofenceRadius: z.number().optional(),
  freeBenefitHours: z.number().int().min(0).optional(),
  pricePerExtraHour: z.number().min(0).optional(),
});

export const UpdateParkingSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  type: z.string().optional(),
  totalSlots: z.number().positive("Total slots must be positive").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  freeBenefitHours: z.number().int().min(0).optional(),
  pricePerExtraHour: z.number().min(0).optional(),
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
  receptorValetId: z.string().min(1, "Receptor valet required"),
  driverValetId: z.string().optional(),
  delivererValetId: z.string().optional(),
});

export const UpdateTicketSchema = z.object({
  status: z.string().optional(),
  slotId: z.string().optional(),
  parkingId: z.string().optional(),
  vehicleId: z.string().optional(),
  clientId: z.string().optional(),
  entryTime: z.string().optional(),
  exitTime: z.string().optional(),
  receptorValetId: z.string().optional(),
  driverValetId: z.string().optional().nullable(),
  delivererValetId: z.string().optional().nullable(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;

// Auth (web + mobile)
export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Customer registration (mobile / public signup)
export const RegisterSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  companyId: z.string().uuid().nullable().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// Passwordless login (OTP)
export const RequestOtpSchema = z.object({
  email: z.string().email("Invalid email"),
  purpose: z.string().optional().default("LOGIN"),
  channel: z.string().optional().default("EMAIL"),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid email"),
  code: z.string().min(4, "Code required"),
  purpose: z.string().optional().default("LOGIN"),
});

export type RequestOtpInput = z.infer<typeof RequestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;

// Invitations (accept invite: set password via email link)
export const AcceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token required"),
  password: securePasswordSchema,
});

export type AcceptInvitationInput = z.infer<typeof AcceptInvitationSchema>;

// Valet self-registration (public, no auth)
export const RegisterValetSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  licenseNumber: z.string().min(1, "License number required").optional(),
  licenseExpiry: z.string().min(1, "License expiry required").optional(),
});

export type RegisterValetInput = z.infer<typeof RegisterValetSchema>;
