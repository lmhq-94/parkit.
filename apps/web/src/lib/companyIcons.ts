import {
  Activity,
  Backhoe,
  Barbell,
  Building,
  Building2,
  ChalkboardTeacher,
  BuildingArch,
  BuildingCottage,
  BuildingEstate,
  BuildingFactory2,
  BuildingHospital,
  BuildingSkyscraper,
  CalendarEvent,
  CarGarage,
  Gamepad2,
  HomeBolt,
  HomeDollar,
  Landmark,
  Laptop,
  Movie,
  ParkingCircle,
  Pick,
  Pill,
  Plane,
  PokerChip,
  ShoppingBag,
  Store,
  ToolsKitchen2,
  TruckDelivery,
  type PremiumIcon,
} from "@/lib/premiumIcons";

export type IndustryValue =
  | "AGRICULTURE"
  | "AIRPORT"
  | "AUTOMOTIVE"
  | "BANKING_FINANCIAL"
  | "CASINO_GAMING"
  | "CINEMA_THEATER"
  | "CONSTRUCTION"
  | "EDUCATION"
  | "ENERGY_UTILITIES"
  | "ENTERTAINMENT_LEISURE"
  | "EVENT_VENUE"
  | "GYM_SPORTS"
  | "HOSPITAL_CLINIC"
  | "HOTEL"
  | "INDUSTRIAL_MANUFACTURING"
  | "LOGISTICS_WAREHOUSING"
  | "MALL"
  | "MINING"
  | "MUNICIPALITY"
  | "OFFICE_BUILDING"
  | "PARKING_OPERATOR"
  | "PHARMACY"
  | "REAL_ESTATE"
  | "RESIDENTIAL"
  | "RESTAURANTS_FOOD"
  | "SUPERMARKET_RETAIL_CHAIN"
  | "TECH"
  | "UNIVERSITY_SCHOOL"
  | "OTHER";

export const INDUSTRY_ICONS: Record<IndustryValue, PremiumIcon> = {
  AGRICULTURE: BuildingCottage,
  AIRPORT: Plane,
  AUTOMOTIVE: CarGarage,
  BANKING_FINANCIAL: Landmark,
  CASINO_GAMING: PokerChip,
  CINEMA_THEATER: Movie,
  CONSTRUCTION: Backhoe,
  EDUCATION: ChalkboardTeacher,
  ENERGY_UTILITIES: HomeBolt,
  ENTERTAINMENT_LEISURE: Gamepad2,
  EVENT_VENUE: CalendarEvent,
  GYM_SPORTS: Barbell,
  HOSPITAL_CLINIC: BuildingHospital,
  HOTEL: BuildingSkyscraper,
  INDUSTRIAL_MANUFACTURING: BuildingFactory2,
  LOGISTICS_WAREHOUSING: TruckDelivery,
  MALL: ShoppingBag,
  MINING: Pick,
  MUNICIPALITY: BuildingArch,
  OFFICE_BUILDING: Building,
  PARKING_OPERATOR: ParkingCircle,
  PHARMACY: Pill,
  REAL_ESTATE: BuildingEstate,
  RESIDENTIAL: HomeDollar,
  RESTAURANTS_FOOD: ToolsKitchen2,
  SUPERMARKET_RETAIL_CHAIN: Store,
  TECH: Laptop,
  UNIVERSITY_SCHOOL: Building2,
  OTHER: Activity,
};

export function getIndustryIcon(
  industry: string | null | undefined,
): PremiumIcon {
  if (!industry) return Building2;
  const normalized = industry.trim().toUpperCase();
  return INDUSTRY_ICONS[normalized as IndustryValue] || Building2;
}
