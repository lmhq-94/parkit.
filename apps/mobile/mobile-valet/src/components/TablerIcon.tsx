import React from 'react';
import { Svg, SvgProps, Path } from 'react-native-svg';

interface TablerIconProps extends SvgProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function createTablerIcon(paths: string[]): React.FC<TablerIconProps> {
  return ({ size = 24, color = 'currentColor', strokeWidth = 2, ...props }: TablerIconProps) => (
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
}
