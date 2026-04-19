import type { ComponentType, SVGProps } from "react";
import {
  IconActivity,
  IconAdjustmentsHorizontal,
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconBackhoe,
  IconBarbell,
  IconBell,
  IconBook,
  IconBookmark,
  IconBriefcase,
  IconBrush,
  IconBuilding,
  IconChalkboardTeacher,
  IconBuildingArch,
  IconBuildingBank,
  IconBuildingCottage,
  IconBuildingEstate,
  IconBuildingFactory2,
  IconBuildingHospital,
  IconBuildingSkyscraper,
  IconBuildingStore,
  IconCalendar,
  IconCalendarEvent,
  IconCamera,
  IconCar,
  IconCarGarage,
  IconCash,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheck,
  IconCircleDashed,
  IconClipboardText,
  IconCircleX,
  IconClock,
  IconCoin,
  IconCopy,
  IconCreditCard,
  IconCrop,
  IconCurrencyDollar,
  IconDeviceDesktop,
  IconDeviceGamepad2,
  IconDeviceMobile,
  IconDoorExit,
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconFileDescription,
  IconFilter,
  IconGauge,
  IconGavel,
  IconGlobe,
  IconHash,
  IconHeart,
  IconHelpCircle,
  IconHome,
  IconHomeBolt,
  IconHomeDollar,
  IconInfoCircle,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLink,
  IconLock,
  IconMail,
  IconMailOpened,
  IconMapPin,
  IconMenu2,
  IconMessage,
  IconMoon,
  IconMovie,
  IconPaperclip,
  IconParkingCircle,
  IconPencil,
  IconPhone,
  IconPhoto,
  IconPick,
  IconPill,
  IconPlane,
  IconPlus,
  IconPokerChip,
  IconQrcode,
  IconReceipt,
  IconRefresh,
  IconRuler,
  IconScale,
  IconSchool,
  IconSearch,
  IconSend,
  IconSettings,
  IconShare,
  IconShieldCheck,
  IconShoppingBag,
  IconSparkles,
  IconSun,
  IconTag,
  IconTicket,
  IconTools,
  IconToolsKitchen2,
  IconTrash,
  IconTrendingUp,
  IconTruck,
  IconTruckDelivery,
  IconUpload,
  IconUser,
  IconUserCircle,
  IconUserPlus,
  IconUsers,
  IconWorld,
  IconX,
} from "@tabler/icons-react";

export type PremiumIcon = ComponentType<SVGProps<SVGSVGElement>>;

const wrap = (Icon: PremiumIcon): PremiumIcon => Icon;

// Alert & Status
export const AlertOctagon = wrap(IconAlertTriangle);
export const CheckCircle = wrap(IconCircleCheck);
export const Info = wrap(IconInfoCircle);
export const Shield = wrap(IconShieldCheck);
export const XCircle = wrap(IconCircleX);

// Arrows & Navigation
export const ArrowLeft = wrap(IconArrowLeft);
export const ArrowRight = wrap(IconArrowRight);
export const ArrowUp = wrap(IconArrowUp);
export const ChevronDown = wrap(IconChevronDown);
export const ChevronLeft = wrap(IconChevronLeft);
export const ChevronRight = wrap(IconChevronRight);
export const ChevronsLeft = wrap(IconChevronsLeft);
export const ChevronsRight = wrap(IconChevronsRight);
export const SidebarCollapse = wrap(IconLayoutSidebarLeftCollapse);
export const SidebarExpand = wrap(IconLayoutSidebarLeftExpand);
export const ExternalLink = wrap(IconExternalLink);

// Actions
export const Check = wrap(IconCheck);
export const Copy = wrap(IconCopy);
export const Crop = wrap(IconCrop);
export const Download = wrap(IconDownload);
export const Eye = wrap(IconEye);
export const EyeOff = wrap(IconEyeOff);
export const LogOut = wrap(IconDoorExit);
export const Menu = wrap(IconMenu2);
export const Plus = wrap(IconPlus);
export const RotateCcw = wrap(IconRefresh);
export const Search = wrap(IconSearch);
export const Trash = wrap(IconTrash);
export const Upload = wrap(IconUpload);
export const X = wrap(IconX);

// Communication
export const Mail = wrap(IconMail);
export const MailOpen = wrap(IconMailOpened);
export const MessageSquare = wrap(IconMessage);
export const Phone = wrap(IconPhone);
export const Send = wrap(IconSend);

// Commerce & Money
export const BanknotesIcon = wrap(IconCash);
export const Coins = wrap(IconCoin);
export const CreditCard = wrap(IconCreditCard);
export const DollarSign = wrap(IconCurrencyDollar);
export const Receipt = wrap(IconReceipt);
export const ShoppingBag = wrap(IconShoppingBag);
export const Tag = wrap(IconTag);
export const Ticket = wrap(IconTicket);
export const TicketCheck = wrap(IconTicket);

// Buildings & Places
export const Building = wrap(IconBuilding);
export const Building2 = wrap(IconBuildingBank);
export const BuildingLibraryIcon = wrap(IconBuildingBank);
export const BuildingOfficeIcon = wrap(IconBuilding);
export const BuildingStorefrontIcon = wrap(IconBuildingStore);
export const Factory = wrap(IconBuilding);
export const HomeIcon = wrap(IconHome);
export const House = wrap(IconHome);
export const Hotel = wrap(IconBuilding);
export const Landmark = wrap(IconBuildingBank);
export const Store = wrap(IconBuildingStore);
export const University = wrap(IconSchool);

// Business & Industry
export const Briefcase = wrap(IconBriefcase);
export const Car = wrap(IconCar);
export const ClipboardText = wrap(IconClipboardText);
export const Laptop = wrap(IconDeviceDesktop);
export const DeviceMobile = wrap(IconDeviceMobile);
export const Stethoscope = wrap(IconHeart);
export const Truck = wrap(IconTruck);
export const Utensils = wrap(IconTools);
export const Plane = wrap(IconPlane);
export const Gamepad2 = wrap(IconDeviceGamepad2);
export const BookOpen = wrap(IconBook);
export const CalendarDays = wrap(IconCalendar);
export const GraduationCap = wrap(IconSchool);

// Industry-specific icons
export const Activity = wrap(IconActivity);
export const Backhoe = wrap(IconBackhoe);
export const Barbell = wrap(IconBarbell);
export const ChalkboardTeacher = wrap(IconChalkboardTeacher);
export const BuildingArch = wrap(IconBuildingArch);
export const BuildingCottage = wrap(IconBuildingCottage);
export const BuildingEstate = wrap(IconBuildingEstate);
export const BuildingFactory2 = wrap(IconBuildingFactory2);
export const BuildingHospital = wrap(IconBuildingHospital);
export const BuildingSkyscraper = wrap(IconBuildingSkyscraper);
export const CalendarEvent = wrap(IconCalendarEvent);
export const CarGarage = wrap(IconCarGarage);
export const HomeBolt = wrap(IconHomeBolt);
export const HomeDollar = wrap(IconHomeDollar);
export const Movie = wrap(IconMovie);
export const ParkingCircle = wrap(IconParkingCircle);
export const Pick = wrap(IconPick);
export const Pill = wrap(IconPill);
export const PokerChip = wrap(IconPokerChip);
export const ToolsKitchen2 = wrap(IconToolsKitchen2);
export const TruckDelivery = wrap(IconTruckDelivery);

// UI Elements
export const Bell = wrap(IconBell);
export const Bookmark = wrap(IconBookmark);
export const Calendar = wrap(IconCalendar);
export const Clock = wrap(IconClock);
export const Filter = wrap(IconFilter);
export const Hash = wrap(IconHash);
export const Heart = wrap(IconHeart);
export const HelpCircle = wrap(IconHelpCircle);
export const LayoutDashboard = wrap(IconLayoutDashboard);
export const LinkIcon = wrap(IconLink);
export const Lock = wrap(IconLock);
export const MapPin = wrap(IconMapPin);
export const Moon = wrap(IconMoon);
export const Navigation = wrap(IconMapPin);
export const Palette = wrap(IconBrush);
export const Paperclip = wrap(IconPaperclip);
export const QrCode = wrap(IconQrcode);
export const Settings = wrap(IconSettings);
export const Settings2 = wrap(IconTools);
export const Share2 = wrap(IconShare);
export const SlidersHorizontal = wrap(IconAdjustmentsHorizontal);
export const Sparkles = wrap(IconSparkles);
export const Sun = wrap(IconSun);
export const TrendingUp = wrap(IconTrendingUp);

// Media
export const Camera = wrap(IconCamera);
export const FileText = wrap(IconFileDescription);
export const ImageIcon = wrap(IconPhoto);
export const PhotoIcon = wrap(IconPhoto);

// Editing
export const Edit = wrap(IconEdit);
export const Edit3 = wrap(IconPencil);
export const PenLine = wrap(IconPencil);
export const Pencil = wrap(IconPencil);

// Users
export const User = wrap(IconUser);
export const UserCircle = wrap(IconUserCircle);
export const UserPlus = wrap(IconUserPlus);
export const Users = wrap(IconUsers);

// Gauge/Stats
export const Gauge = wrap(IconGauge);

// Legal
export const Ruler = wrap(IconRuler);
export const Scale = wrap(IconScale);
export const Weight = wrap(IconScale);
export const Gavel = wrap(IconGavel);

// Misc
export const Award = wrap(IconCircleCheck);
export const Circle = wrap(IconCoin);
export const CircleDashed = wrap(IconCircleDashed);
export const Globe = wrap(IconGlobe);
export const Radius = wrap(IconCoin);
export const World = wrap(IconWorld);

// Social Icons - Official Brand Logos
export const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export const MicrosoftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 21 21" width="24" height="24" {...props}>
    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
  </svg>
);

export const FacebookIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 36 36" width="24" height="24" {...props}>
    <path fill="#0866FF" d="M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z" />
    <path fill="#fff" d="M13.651 35.471v-11.97H9.936V18.5h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18.5h5.81l-.996 5H19.14v11.97h-5.49Z" />
  </svg>
);
