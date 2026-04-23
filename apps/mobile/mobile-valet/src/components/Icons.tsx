import React from 'react';
import { Svg, SvgProps, Path } from 'react-native-svg';

interface IconProps extends SvgProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const createIcon = (paths: string[], displayName: string, fill = false): React.FC<IconProps> => {
  const Component = ({ size = 24, color = 'currentColor', strokeWidth = 2, ...props }: IconProps) => (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? color : "none"}
      stroke={fill ? "none" : color}
      strokeWidth={fill ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths.map((path, index) => (
        <Path key={index} d={path} />
      ))}
    </Svg>
  );
  Component.displayName = displayName;
  return Component;
};

export const IconCheck = createIcon(['M5 12l5 5l10 -10'], 'IconCheck');
export const IconChevronLeft = createIcon(['M15 6l-6 6l6 6'], 'IconChevronLeft');
export const IconChevronRight = createIcon(['M9 6l6 6l-6 6'], 'IconChevronRight');
export const IconArrowLeft = createIcon(['M5 12l14 0', 'M5 12l4 0', 'M5 12l4 -4', 'M5 12l4 4'], 'IconArrowLeft');
export const IconArrowRight = createIcon(['M5 12h14', 'M13 6l6 6', 'M13 18l6 -6'], 'IconArrowRight');
export const IconArrowBack = createIcon(['M5 12l14 0', 'M5 12l4 0', 'M5 12l4 -4', 'M5 12l4 4'], 'IconArrowBack');
export const IconMail = createIcon(['M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z', 'M3 7l9 6l9 -6'], 'IconMail');
export const IconEye = createIcon(['M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6'], 'IconEye');
export const IconEyeOff = createIcon(['M10.585 10.587a2 2 0 0 0 2.829 2.828', 'M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87', 'M3 3l18 18'], 'IconEyeOff');
export const IconAlertCircle = createIcon(['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 9v4', 'M12 16v.01'], 'IconAlertCircle');
export const IconCar = createIcon(['M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5'], 'IconCar');
export const IconQrCode = createIcon(['M4 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z', 'M14 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z', 'M4 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z', 'M17 17l0 .01', 'M21 17l0 .01', 'M21 13l0 .01', 'M17 13l0 .01', 'M17 21l0 .01'], 'IconQrCode');
export const IconPulse = createIcon(['M3 12h4l3 8l4 -16l3 8h4'], 'IconPulse');
export const IconClose = createIcon(['M6 6l12 12', 'M18 6l-12 12'], 'IconClose');
export const IconRefresh = createIcon(['M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4', 'M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4'], 'IconRefresh');
export const IconHandStop = createIcon(['M18 11v-6a2 2 0 0 0 -2 -2', 'M14 10v-5a2 2 0 0 0 -2 -2', 'M10 10v-5a2 2 0 0 0 -2 -2', 'M6 11v-5a2 2 0 0 0 -2 -2', 'M10 17v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-5h-10z'], 'IconHandStop');
export const IconUser = createIcon(['M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0', 'M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2'], 'IconUser');
export const IconCamera = createIcon(['M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2', 'M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0'], 'IconCamera');
export const IconPlus = createIcon(['M12 5l0 14', 'M5 12l14 0'], 'IconPlus');
export const IconEdit = createIcon(['M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1', 'M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z', 'M16 5l3 3'], 'IconEdit');
export const IconTrash = createIcon(['M4 7h16', 'M10 11v6', 'M14 11v6', 'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12', 'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3'], 'IconTrash');
export const IconLogout = createIcon(['M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2', 'M7 12h14l-3 -3m3 3l-3 3'], 'IconLogout');
export const IconHelpCircle = createIcon(['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M12 17a1 1 0 0 1 1 -1h1a1 1 0 0 0 1 -1v-1a2 2 0 0 0 -2 -2h-1a2 2 0 0 0 -2 2v1'], 'IconHelpCircle');
export const IconSettings = createIcon(['M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z', 'M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0'], 'IconSettings');
export const IconScan = createIcon(['M4 7v-1a2 2 0 0 1 2 -2h2', 'M4 17v1a2 2 0 0 0 2 2h2', 'M20 7v-1a2 2 0 0 0 -2 -2h-2', 'M20 17v1a2 2 0 0 1 -2 2h-2', 'M7 12h10'], 'IconScan');
export const IconShieldCheck = createIcon(['M12 3a12 12 0 0 0 3.918 7.417l.07 .028l.007 .002c.027 .01 .055 .02 .082 .03l.07 .028a12 12 0 0 0 8.753 0l.07 -.028a2.03 2.03 0 0 0 .152 -.06l.07 -.028a12 12 0 0 0 3.918 -7.417', 'M9 12l2 2l4 -4'], 'IconShieldCheck');
export const IconPrint = createIcon(['M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-2', 'M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4', 'M7 17a2 2 0 0 1 -2 -2v-4a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2', 'M7 17v-1a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v1', 'M9 9h6'], 'IconPrint');
export const IconShare = createIcon(['M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M13 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M13 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M8 7l4 -4l4 4', 'M16 3v9a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2v-2'], 'IconShare');
export const IconUndo = createIcon(['M3 7v6h6', 'M3 13a9 9 0 1 0 3 -7.7l3.5 -3.5'], 'IconUndo');
export const IconCard = createIcon(['M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z', 'M3 10h18', 'M7 15h.01', 'M11 15h2'], 'IconCard');
export const IconCreditCard = createIcon(['M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z', 'M3 10h18', 'M7 15h.01', 'M11 15h2'], 'IconCreditCard');
export const IconCircleX = createIcon(['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M10 10l4 4m0 -4l-4 4'], 'IconCircleX');
export const IconCircleCheck = createIcon(['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M9 12l2 2l4 -4'], 'IconCircleCheck');
export const IconArrowUndo = createIcon(['M9 14l-4 -4', 'M5 10l4 -4', 'M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-9'], 'IconArrowUndo');
export const IconExternalLink = createIcon(['M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6', 'M11 13l9 -4', 'M20 3v4h-4', 'M13 13l9 4'], 'IconExternalLink');
export const IconHelp = createIcon(['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M12 17a1 1 0 0 1 1 -1h1a1 1 0 0 0 1 -1v-1a2 2 0 0 0 -2 -2h-1a2 2 0 0 0 -2 2v1'], 'IconHelp');
export const IconAdd = createIcon(['M12 5l0 14', 'M5 12l14 0'], 'IconAdd');
export const IconMinus = createIcon(['M5 12l14 0'], 'IconMinus');
export const IconPhoto = createIcon(['M15 8h.01', 'M12 20h-7a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h11a2 2 0 0 1 2 2v5', 'M9 13l2 2l4 -4'], 'IconPhoto');
export const IconGallery = createIcon(['M15 8h.01', 'M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12', 'M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5', 'M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3'], 'IconGallery');
export const IconLicense = createIcon(['M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z', 'M8 12h8', 'M12 12v-3'], 'IconLicense');
export const IconLicensePlate = createIcon(['M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z', 'M6 8v.01', 'M18 8v.01', 'M6 15v.01', 'M18 15v.01'], 'IconLicensePlate');
export const IconCalendar = createIcon(['M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z', 'M16 3v4', 'M8 3v4', 'M4 14h16', 'M4 18h2', 'M18 18h2', 'M10 18h4'], 'IconCalendar');
export const IconX = createIcon(['M6 6l12 12', 'M18 6l-12 12'], 'IconX');
export const IconList = createIcon(['M9 6l11 0', 'M9 12l11 0', 'M9 18l11 0', 'M5 6l0 .01', 'M5 12l0 .01', 'M5 18l0 .01'], 'IconList');
export const IconUsers = createIcon(['M9 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0', 'M3 20v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2', 'M16 3.13a4 4 0 0 1 0 7.75', 'M21 20v-2a4 4 0 0 0 -3 -3.85'], 'IconUsers');
export const IconUsersGroup = createIcon(['M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1', 'M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M17 10h2a2 2 0 0 1 2 2v1', 'M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M3 13v-1a2 2 0 0 1 2 -2h2'], 'IconUsersGroup');
export const IconCash = createIcon(['M7 15h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v3', 'M7 10a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8', 'M12 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0'], 'IconCash');
export const IconChevronDown = createIcon(['M6 9l6 6l6 -6'], 'IconChevronDown');
export const IconMapPin = createIcon(['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 17.75l4.75 -4.75a7.5 7.5 0 1 0 -9.5 0l4.75 4.75'], 'IconMapPin');
export const IconLocationFilled = createIcon(['M20.891 2.006l.106 -.006l.13 .008l.09 .016l.123 .035l.107 .046l.1 .057l.09 .067l.082 .075l.052 .059l.082 .116l.052 .096c.047 .1 .077 .206 .09 .316l.005 .106c0 .075 -.008 .149 -.024 .22l-.035 .123l-6.532 18.077a1.55 1.55 0 0 1 -1.409 .903a1.547 1.547 0 0 1 -1.329 -.747l-.065 -.127l-3.352 -6.702l-6.67 -3.336a1.55 1.55 0 0 1 -.898 -1.259l-.006 -.149c0 -.56 .301 -1.072 .841 -1.37l.14 -.07l18.017 -6.506l.106 -.03l.108 -.018z'], 'IconLocationFilled');
export const IconCircleArrowLeft = createIcon(['M12 2a10 10 0 0 1 .324 19.995l-.324 .005l-.324 -.005a10 10 0 0 1 .324 -19.995zm.707 5.293a1 1 0 0 0 -1.414 0l-4 4a1.048 1.048 0 0 0 -.083 .094l-.064 .092l-.052 .098l-.044 .11l-.03 .112l-.017 .126l-.003 .075l.004 .09l.007 .058l.025 .118l.035 .105l.054 .113l.043 .07l.071 .095l.054 .058l4 4l.094 .083a1 1 0 0 0 1.32 -1.497l-2.292 -2.293h5.585l.117 -.007a1 1 0 0 0 -.117 -1.993h-5.586l2.293 -2.293l.083 -.094a1 1 0 0 0 -.083 -1.32z'], 'IconCircleArrowLeft', true);
export const IconBell = createIcon(['M12 2a3 3 0 0 0 -3 3v7a5 5 0 0 0 -5 5v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1 -1v-2a5 5 0 0 0 -5 -5v-7a3 3 0 0 0 -3 -3z', 'M21 12a9 9 0 0 1 -9 9', 'M21 12v7a2 2 0 0 0 -2 2h-1'], 'IconBell');
export const IconTicket = createIcon(['M15 5l0 2', 'M15 11l0 2', 'M15 17l0 2', 'M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-3a2 2 0 0 0 0 -4v-3a2 2 0 0 1 2 -2'], 'IconTicket');
export const IconBuilding = createIcon(['M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z', 'M9 7v1', 'M9 10v1', 'M9 13v1', 'M9 16v1', 'M15 7v1', 'M15 10v1', 'M15 13v1', 'M15 16v1'], 'IconBuilding');
export const IconResize = createIcon(['M4 5m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z', 'M4 10l16 0', 'M10 4l0 16'], 'IconResize');
export const IconCheckbox = createIcon(['M7 3a4 4 0 0 1 4 4m0 -4a4 4 0 0 1 4 4m-4 -4v8', 'M7 7h10', 'M7 7l2 2l4 -4'], 'IconCheckbox');
export const IconSquare = createIcon(['M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z'], 'IconSquare');
export const IconClock = createIcon(['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 12l3 2'], 'IconClock');
export const IconHourglass = createIcon(['M6 5v4', 'M18 5v4', 'M12 17v4', 'M6 15v4', 'M18 15v4', 'M6 5l12 0', 'M6 9l12 0', 'M6 15l12 0', 'M6 19l12 0'], 'IconHourglass');
export const IconKey = createIcon(['M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0', 'M15 9h.01'], 'IconKey');
export const IconKeyOff = createIcon(['M10.17 6.159l2.316 -2.316a2.877 2.877 0 0 1 4.069 0l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.33 2.33', 'M14.931 14.948a2.863 2.863 0 0 1 -1.486 -.79l-.301 -.302l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.863 2.863 0 0 1 -.794 -1.504', 'M15 9h.01', 'M3 3l18 18'], 'IconKeyOff');
export const IconLock = createIcon(['M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6', 'M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0', 'M8 11v-4a4 4 0 1 1 8 0v4'], 'IconLock');
export const IconClipboardText = createIcon(['M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2', 'M9 5a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2', 'M9 12h6', 'M9 16h6'], 'IconClipboardText');
export const IconPhone = createIcon(['M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2'], 'IconPhone');
export const IconTag = createIcon(['M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3'], 'IconTag');
export const IconPalette = createIcon(['M12 21a9 9 0 0 1 0 -18c4.97 0 9 3.582 9 8c0 1.06 -.474 2.078 -1.318 2.828c-.844 .75 -1.989 1.172 -3.182 1.172h-2.5a2 2 0 0 0 -1 3.75a1.3 1.3 0 0 1 -1 2.25', 'M7.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M11.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0', 'M15.5 10.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0'], 'IconPalette');
export const IconHome2 = createIcon(['M5 12l-2 0l9 -9l9 9l-2 0', 'M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7', 'M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6'], 'IconHome2');
export const IconSquareRoundedArrowLeft = createIcon(['M12 8l-4 4l4 4', 'M16 12h-8', 'M12 3c7.2 0 9 1.8 9 9c0 7.2 -1.8 9 -9 9c-7.2 0 -9 -1.8 -9 -9c0 -7.2 1.8 -9 9 -9'], 'IconSquareRoundedArrowLeft');
export const IconSteeringWheel = createIcon(['M17 3.34a10 10 0 1 1 -15 8.66l.005 -.324a10 10 0 0 1 14.995 -8.336', 'M4 12a8 8 0 0 0 7 7.937v-5.107a3 3 0 0 1 -1.898 -2.05l-5.07 -1.504q -.031 .36 -.032 .725', 'M20 11.275l-5.069 1.503a3 3 0 0 1 -1.897 2.051v5.108a8 8 0 0 0 6.985 -8.422', 'M8.033 5.071a8 8 0 0 0 -3.536 4.244l4.812 1.426a3 3 0 0 1 5.448 0l4.812 -1.426a8 8 0 0 0 -11.536 -4.244'], 'IconSteeringWheel', true);
export const IconSteeringWheelOutline = createIcon(['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M10 12a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M12 14l0 7', 'M10 12l-6.75 -2', 'M14 12l6.75 -2'], 'IconSteeringWheelOutline');
export const IconTrafficCone = createIcon(['M4 20l16 0', 'M9.4 10l5.2 0', 'M7.8 15l8.4 0', 'M6 20l5 -15h2l5 15'], 'IconTrafficCone');
export const IconCarOff = createIcon(['M5 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M15 17a2 2 0 1 0 4 0a2 2 0 1 0 -4 0', 'M5 17h-2v-6l2 -5h1m4 0h4l4 5h1a2 2 0 0 1 2 2v4m-6 0h-6m-6 -6h8m4 0h3m-6 -3v-2', 'M3 3l18 18'], 'IconCarOff');
