import {
  Car,
  ShoppingBag,
  Stethoscope,
  Hotel,
  Plane,
  Building,
  Building2,
  House,
  GraduationCap,
  CalendarDays,
  Landmark,
  Factory,
  Truck,
  Laptop,
  Utensils,
  Gamepad2,
  BookOpen,
  Store,
  University,
  type LucideIcon,
} from "lucide-react";

export type IndustryValue =
  | "PARKING_OPERATOR"
  | "MALL"
  | "SUPERMARKET_RETAIL_CHAIN"
  | "HOSPITAL_CLINIC"
  | "HOTEL"
  | "AIRPORT"
  | "OFFICE_BUILDING"
  | "RESIDENTIAL"
  | "UNIVERSITY_SCHOOL"
  | "EVENT_VENUE"
  | "MUNICIPALITY"
  | "INDUSTRIAL_MANUFACTURING"
  | "LOGISTICS_WAREHOUSING"
  | "BANKING_FINANCIAL"
  | "TECH"
  | "RESTAURANTS_FOOD"
  | "ENTERTAINMENT_LEISURE"
  | "EDUCATION"
  | "OTHER";

export const INDUSTRY_ICONS: Record<IndustryValue, LucideIcon> = {
  AIRPORT: Plane,
  BANKING_FINANCIAL: Landmark,
  MALL: ShoppingBag,
  EVENT_VENUE: CalendarDays,
  OFFICE_BUILDING: Building,
  EDUCATION: BookOpen,
  ENTERTAINMENT_LEISURE: Gamepad2,
  HOSPITAL_CLINIC: Stethoscope,
  HOTEL: Hotel,
  INDUSTRIAL_MANUFACTURING: Factory,
  LOGISTICS_WAREHOUSING: Truck,
  MUNICIPALITY: University,
  PARKING_OPERATOR: Car,
  RESIDENTIAL: House,
  RESTAURANTS_FOOD: Utensils,
  SUPERMARKET_RETAIL_CHAIN: Store,
  TECH: Laptop,
  UNIVERSITY_SCHOOL: GraduationCap,
  OTHER: Building2,
};

export function getIndustryIcon(
  industry: string | null | undefined,
): LucideIcon {
  if (!industry) return Building2;
  const normalized = industry.trim().toUpperCase();
  return INDUSTRY_ICONS[normalized as IndustryValue] || Building2;
}
