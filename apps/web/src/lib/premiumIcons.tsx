import type { ComponentType, SVGProps } from "react";
import {
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  Bars3CenterLeftIcon,
  BellAlertIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  BuildingOfficeIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CameraIcon,
  ChatBubbleOvalLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleStackIcon,
  ClockIcon,
  Cog6ToothIcon,
  Cog8ToothIcon,
  ComputerDesktopIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  GlobeAltIcon,
  HashtagIcon,
  HeartIcon,
  HomeIcon,
  InformationCircleIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MoonIcon,
  PaintBrushIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PlusIcon,
  PencilSquareIcon,
  PhoneIcon,
  QrCodeIcon,
  QuestionMarkCircleIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  ShareIcon,
  ShoppingBagIcon,
  SparklesIcon,
  Squares2X2Icon,
  SunIcon,
  TagIcon,
  TicketIcon,
  TrashIcon,
  TruckIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

export type PremiumIcon = ComponentType<SVGProps<SVGSVGElement>>;

const wrap = (Icon: PremiumIcon): PremiumIcon => Icon;

export const AlertOctagon = wrap(ExclamationTriangleIcon);
export const ArrowLeft = wrap(ArrowLeftIcon);
export const ArrowRight = wrap(ArrowRightIcon);
export const Award = wrap(CheckIcon);
export const Bell = wrap(BellAlertIcon);
export const BookOpen = wrap(BookOpenIcon);
export const Briefcase = wrap(BriefcaseIcon);
export const Building = wrap(BuildingOfficeIcon);
export const Building2 = wrap(BuildingLibraryIcon);
export const Calendar = wrap(CalendarDaysIcon);
export const CalendarDays = wrap(CalendarDaysIcon);
export const Camera = wrap(CameraIcon);
export const Car = wrap(TruckIcon);
export const Check = wrap(CheckIcon);
export const CheckCircle = wrap(CheckCircleIcon);
export const ChevronDown = wrap(ChevronDownIcon);
export const ChevronLeft = wrap(ChevronLeftIcon);
export const ChevronRight = wrap(ChevronRightIcon);
export const ChevronsLeft = wrap(ChevronDoubleLeftIcon);
export const ChevronsRight = wrap(ChevronDoubleRightIcon);
export const Circle = wrap(CircleStackIcon);
export const Clock = wrap(ClockIcon);
export const Coins = wrap(BanknotesIcon);
export const Copy = wrap(DocumentDuplicateIcon);
export const CreditCard = wrap(CreditCardIcon);
export const DollarSign = wrap(CurrencyDollarIcon);
export const Download = wrap(ArrowDownTrayIcon);
export const ExternalLink = wrap(ArrowTopRightOnSquareIcon);
export const Eye = wrap(EyeIcon);
export const EyeOff = wrap(EyeSlashIcon);
export const Factory = wrap(BuildingOfficeIcon);
export const Filter = wrap(FunnelIcon);
export const Gamepad2 = wrap(PhotoIcon);
export const Gavel = wrap(ScaleIcon);
export const Globe = wrap(GlobeAltIcon);
export const GraduationCap = wrap(AcademicCapIcon);
export const Hash = wrap(HashtagIcon);
export const HelpCircle = wrap(QuestionMarkCircleIcon);
export const Hotel = wrap(BuildingStorefrontIcon);
export const House = wrap(HomeIcon);
export const ImageIcon = wrap(PhotoIcon);
export const Info = wrap(InformationCircleIcon);
export const Landmark = wrap(BuildingLibraryIcon);
export const Laptop = wrap(ComputerDesktopIcon);
export const LayoutDashboard = wrap(Squares2X2Icon);
export const Lock = wrap(LockClosedIcon);
export const LogOut = wrap(ArrowRightOnRectangleIcon);
export const Mail = wrap(EnvelopeIcon);
export const MailOpen = wrap(EnvelopeOpenIcon);
export const MapPin = wrap(MapPinIcon);
export const Menu = wrap(Bars3CenterLeftIcon);
export const MessageSquare = wrap(ChatBubbleOvalLeftIcon);
export const Moon = wrap(MoonIcon);
export const Navigation = wrap(MapPinIcon);
export const Palette = wrap(PaintBrushIcon);
export const Pencil = wrap(PencilSquareIcon);
export const Phone = wrap(PhoneIcon);
export const Plane = wrap(PaperAirplaneIcon);
export const Plus = wrap(PlusIcon);
export const QrCode = wrap(QrCodeIcon);
export const Radius = wrap(CircleStackIcon);
export const Receipt = wrap(ReceiptPercentIcon);
export const RotateCcw = wrap(ArrowPathIcon);
export const Search = wrap(MagnifyingGlassIcon);
export const Settings = wrap(Cog6ToothIcon);
export const Settings2 = wrap(Cog8ToothIcon);
export const Share2 = wrap(ShareIcon);
export const Shield = wrap(ShieldCheckIcon);
export const ShoppingBag = wrap(ShoppingBagIcon);
export const SlidersHorizontal = wrap(AdjustmentsHorizontalIcon);
export const Sparkles = wrap(SparklesIcon);
export const Stethoscope = wrap(HeartIcon);
export const Store = wrap(BuildingStorefrontIcon);
export const Sun = wrap(SunIcon);
export const Tag = wrap(TagIcon);
export const TicketCheck = wrap(TicketIcon);
export const Trash = wrap(TrashIcon);
export const TrendingUp = wrap(ArrowTrendingUpIcon);
export const Truck = wrap(TruckIcon);
export const University = wrap(BuildingLibraryIcon);
export const Upload = wrap(ArrowUpTrayIcon);
export const User = wrap(UserIcon);
export const UserPlus = wrap(UserPlusIcon);
export const Users = wrap(UsersIcon);
export const Utensils = wrap(UsersIcon);
export const Weight = wrap(ScaleIcon);
export const X = wrap(XMarkIcon);
export const XCircle = wrap(XCircleIcon);
