import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { IconAlertCircle, IconCircleCheck, IconHelpCircle } from '@/components/Icons';

type MessageType = 'error' | 'success' | 'warning' | 'info';

interface AuthMessageProps {
  type: MessageType;
  message: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fontSize?: number;
}

export const AuthMessage: React.FC<AuthMessageProps> = ({
  type,
  message,
  style,
  textStyle,
  fontSize,
}) => {
  const messageFontSize = fontSize || 14;
  const iconSize = 20;

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
