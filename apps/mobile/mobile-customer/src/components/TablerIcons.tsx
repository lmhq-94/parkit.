import React from 'react';
import { Svg, SvgProps, Path } from 'react-native-svg';

interface IconProps extends SvgProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const createIcon = (paths: string[], displayName: string): React.FC<IconProps> => {
  const Component = ({ size = 24, color = 'currentColor', strokeWidth = 2, ...props }: IconProps) => (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
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
export const IconArrowLeft = createIcon(['M5 12l14 0', 'M5 12l4 0', 'M5 12l4 -4', 'M5 12l4 4'], 'IconArrowLeft');
export const IconArrowBack = createIcon(['M5 12l14 0', 'M5 12l4 0', 'M5 12l4 -4', 'M5 12l4 4'], 'IconArrowBack');
export const IconCircleArrowLeft: React.FC<IconProps> = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M12 2a10 10 0 0 1 .324 19.995l-.324 .005l-.324 -.005a10 10 0 0 1 .324 -19.995zm.707 5.293a1 1 0 0 0 -1.414 0l-4 4a1.048 1.048 0 0 0 -.083 .094l-.064 .092l-.052 .098l-.044 .11l-.03 .112l-.017 .126l-.003 .075l.004 .09l.007 .058l.025 .118l.035 .105l.054 .113l.043 .07l.071 .095l.054 .058l4 4l.094 .083a1 1 0 0 0 1.32 -1.497l-2.292 -2.293h5.585l.117 -.007a1 1 0 0 0 -.117 -1.993h-5.586l2.293 -2.293l.083 -.094a1 1 0 0 0 -.083 -1.32z"
      fill={color}
    />
  </Svg>
);
IconCircleArrowLeft.displayName = 'IconCircleArrowLeft';
export const IconMail = createIcon(['M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z', 'M3 7l9 6l9 -6'], 'IconMail');
export const IconEye = createIcon(['M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6'], 'IconEye');
export const IconEyeOff = createIcon(['M10.585 10.587a2 2 0 0 0 2.829 2.828', 'M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87', 'M3 3l18 18'], 'IconEyeOff');
export const IconAlertCircle = createIcon(['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 9v4', 'M12 16v.01'], 'IconAlertCircle');
