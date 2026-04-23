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

// logoImageUrl and bannerImageUrl can be very long base64 data URLs
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

export const securePasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "Password must be at least 8 characters")
  .refine(hasUppercase, "Password must contain at least one uppercase letter")
  .refine(hasLowercase, "Password must contain at least one lowercase letter")
  .refine(hasNumber, "Password must contain at least one number");

export const PASSWORD_SECURITY = {
  minLength: PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
} as const;

const optionalTrimmedNonEmpty = z.preprocess(
  (v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v !== "string") return v;
    const t = v.trim();
    return t === "" ? undefined : t;
  },
  z.string().optional()
);

// Users (optional password: when provided must meet secure password rules)
export const CreateUserSchema = z
  .object({
    email: z.string().email("Invalid email"),
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    password: z
      .union([securePasswordSchema, z.literal(""), z.null()])
      .optional()
      .transform((v) => (v === "" || v === null ? undefined : v)),
    systemRole: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF", "CUSTOMER"]).optional(),
    phone: optionalTrimmedNonEmpty,
    timezone: optionalTrimmedNonEmpty,
    /** Recepción walk-in: obliga a contraseña inmediata (no solo invitación por email). */
    walkInCustomer: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.walkInCustomer !== true) return;
    if (data.systemRole !== "CUSTOMER") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Walk-in vehicle intake must use CUSTOMER role",
        path: ["systemRole"],
      });
    }
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
  /** `null` removes the profile photo (same semantics as profile update). */
  avatarUrl: z.union([z.string(), z.null()]).optional(),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  /** `null` removes the avatar (mobile app / web). */
  avatarUrl: z.union([z.string(), z.null()]).optional(),
  pushToken: z.string().optional(),
  appPreferences: z
    .object({
      theme: z.enum(["light", "dark"]).optional(),
      locale: z.enum(["es", "en"]).optional(),
    })
    .optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// Valets: create via userId (existing user) or via user details (create User + Valet)
export const valetStaffRoleEnum = z.enum(["RECEPTIONIST", "DRIVER"]);

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
    staffRole: valetStaffRoleEnum,
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
  ratingAvg: z.number().min(0).max(5).nullable().optional(),
  staffRole: valetStaffRoleEnum.nullable().optional(),
});

/** Authenticated valet: role, optional license, and/or operating context (company + parking). */
export const UpdateValetMeSchema = z
  .object({
    staffRole: valetStaffRoleEnum.optional(),
    /** Comma-separated license types, same as web panel (e.g. "A1, B1"). */
    licenseNumber: z.union([z.string(), z.null()]).optional(),
    licenseExpiry: z.union([z.string().datetime(), z.null()]).optional(),
    /** Empresa en la que opera el valet (p. ej. flujo recepción / X-Company-Id). */
    companyId: z.union([z.string().uuid(), z.null()]).optional(),
    /** Parqueo físico actual para listados de disponibilidad. */
    currentParkingId: z.union([z.string().uuid(), z.null()]).optional(),
  })
  .refine(
    (d) =>
      d.staffRole !== undefined ||
      d.licenseNumber !== undefined ||
      d.licenseExpiry !== undefined ||
      d.companyId !== undefined ||
      d.currentParkingId !== undefined,
    { message: "At least one field is required" }
  );

export type CreateValetInput = z.infer<typeof CreateValetSchema>;
export type UpdateValetInput = z.infer<typeof UpdateValetSchema>;
export type UpdateValetMeInput = z.infer<typeof UpdateValetMeSchema>;

/** Presencia explícita del valet (p. ej. AWAY al cerrar sesión en la app). */
export const ValetMePresenceSchema = z.object({
  status: z.enum(["AWAY", "AVAILABLE"]),
});

export type ValetMePresenceInput = z.infer<typeof ValetMePresenceSchema>;

// Customers
export const CreateCustomerSchema = z.object({
  name: z.string().min(1, "Customer name required"),
  email: z.string().email("Invalid email").optional(),
  phone: z.string().optional(),
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const AddVehicleToUserSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID required"),
  isPrimary: z.boolean().optional(),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;

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
  color: z.string().optional(),
  year: z.number().optional(),
  dimensions: VehicleDimensionsRequiredSchema,
});

export const UpdateVehicleSchema = z.object({
  plate: z.string().min(1).optional(),
  countryCode: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
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
  dailyPricingConfig: z.record(z.object({
    freeBenefitMinutes: z.number().int().min(0),
    pricePerHour: z.number().min(0),
  })).optional(),
  freeBenefitMinutes: z.number().int().min(0).optional(),
  pricePerExtraHour: z.number().min(0).optional(),
});

export const UpdateParkingSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  type: z.string().optional(),
  totalSlots: z.number().positive("Total slots must be positive").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  freeBenefitMinutes: z.number().int().min(0).optional(),
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
const IntakeDamagePhotoSchema = z.object({
  url: z.string().min(1, "Photo URL required"),
  label: z.preprocess(
    (v) => (v === null || v === undefined ? undefined : v),
    z.string().optional()
  ),
});

/** IDs opcionales: clientes/envíos a veces mandan `null` explícito; Zod `.optional()` no acepta null. */
function optionalNonEmptyStringId() {
  return z.preprocess((v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v !== "string") return v;
    const t = v.trim();
    return t === "" ? undefined : t;
  }, z.string().min(1).optional());
}

function optionalTrimmedCode() {
  return z.preprocess((v) => {
    if (v === null || v === undefined) return undefined;
    if (typeof v !== "string") return v;
    const t = v.trim();
    return t === "" ? undefined : t;
  }, z.string().optional());
}

export const CreateTicketSchema = z.object({
  bookingId: optionalNonEmptyStringId(),
  clientId: z.string().min(1, "Client ID required"),
  parkingId: z.string().min(1, "Parking ID required"),
  vehicleId: z.string().min(1, "Vehicle ID required"),
  slotId: optionalNonEmptyStringId(),
  receptorValetId: z.string().min(1, "Receptor valet required"),
  driverValetId: optionalNonEmptyStringId(),
  delivererValetId: optionalNonEmptyStringId(),
  keyCode: optionalTrimmedCode(),
  ticketCode: optionalTrimmedCode(),
  intakeDamageReport: z.preprocess(
    (v) => (v === null ? undefined : v),
    z
      .object({
        description: z.preprocess(
          (v) => (v === null || v === undefined ? undefined : v),
          z.string().optional()
        ),
        photos: z.preprocess(
          (v) => (v === null || v === undefined ? undefined : v),
          z.array(IntakeDamagePhotoSchema).max(8).optional()
        ),
      })
      .optional()
  ),
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

export const UpdateParkingSlotSchema = z.object({
  isAvailable: z.boolean(),
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

export const RegisterInvitedSchema = z.object({
  token: z.string().min(1, "Invitation token required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  password: securePasswordSchema,
});

export type RegisterInvitedInput = z.infer<typeof RegisterInvitedSchema>;

export const InviteUserSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"]).default("CUSTOMER"),
});

export type InviteUserInput = z.infer<typeof InviteUserSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token required"),
  password: securePasswordSchema,
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

// Valet self-registration (public, no auth). License fields only if the client sends them; mobile-valet does not.
export const RegisterValetSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  staffRole: valetStaffRoleEnum,
  licenseNumber: z.string().trim().min(1).optional(),
  licenseExpiry: z.string().datetime().optional(),
});

export type RegisterValetInput = z.infer<typeof RegisterValetSchema>;
