import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { IconAlertCircle, IconCircleCheck, IconHelpCircle } from './Icons';
import { useAccessibilityStore } from '@/lib/store';
import { useValetTheme } from '@/theme/valetTheme';

type MessageType = 'error' | 'success' | 'warning' | 'info';

interface AuthMessageProps {
  type: MessageType;
  message: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AuthMessage: React.FC<AuthMessageProps> = ({
  type,
  message,
  style,
  textStyle,
}) => {
  const { textScale } = useAccessibilityStore();
  const theme = useValetTheme();
  const F = theme.font;

  const messageFontSize = Math.round(F.status * 0.55 * textScale);
  const iconSize = 20 * textScale;

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <IconAlertCircle size={iconSize} color="#EF4444" />;
      case 'success':
        return <IconCircleCheck size={iconSize} color="#10B981" />;
      case 'warning':
        return <IconAlertCircle size={iconSize} color="#F59E0B" />;
      case 'info':
        return <IconHelpCircle size={iconSize} color="#3B82F6" />;
      default:
        return <IconAlertCircle size={iconSize} color="#EF4444" />;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'error':
        return '#EF4444';
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'info':
        return '#3B82F6';
      default:
        return '#EF4444';
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text
        style={[
          styles.messageText,
          { 
            color: getTextColor(),
            fontSize: messageFontSize,
            lineHeight: messageFontSize * 1.4,
          },
          textStyle,
        ]}
        numberOfLines={4}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  messageText: {
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
});
