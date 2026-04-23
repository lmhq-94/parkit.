import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';
import { IconCard, IconCash } from '@/components/Icons';

interface ReceptionTypeSelectorProps {
  locale: Locale;
  isDark: boolean;
  receptionType: 'CARD' | 'DIRECT' | null;
  onSelect: (type: 'CARD' | 'DIRECT') => void;
}

export function ReceptionTypeSelector({
  locale,
  isDark,
  receptionType,
  onSelect,
}: ReceptionTypeSelectorProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>{t(locale, 'receive.wizardTypeTitle')}</Text>
      <Text style={styles.stepExplain}>{t(locale, 'receive.wizardTypeHelp')}</Text>
      <View style={styles.typeCardsGrid}>
        {/* Card Option */}
        <Pressable
          style={({ pressed }) => [
            styles.typeCard,
            receptionType === 'CARD' && styles.typeCardSelected,
            pressed && styles.pressed,
          ]}
          onPress={() => onSelect('CARD')}
          accessibilityRole="radio"
          accessibilityState={{ checked: receptionType === 'CARD' }}
        >
          <View style={[styles.typeCardIcon, receptionType === 'CARD' && styles.typeCardIconActive]}>
            <IconCard
              size={28}
              color={receptionType === 'CARD' ? '#fff' : isDark ? '#38BDF8' : '#1D4ED8'}
            />
          </View>
          <Text style={styles.typeCardTitle}>{t(locale, 'receive.typeCardTitle')}</Text>
          <Text style={styles.typeCardBody}>{t(locale, 'receive.typeCardBody')}</Text>
        </Pressable>

        {/* Direct/Cash Option */}
        <Pressable
          style={({ pressed }) => [
            styles.typeCard,
            receptionType === 'DIRECT' && styles.typeCardSelected,
            pressed && styles.pressed,
          ]}
          onPress={() => onSelect('DIRECT')}
          accessibilityRole="radio"
          accessibilityState={{ checked: receptionType === 'DIRECT' }}
        >
          <View style={[styles.typeCardIcon, receptionType === 'DIRECT' && styles.typeCardIconActive]}>
            <IconCash
              size={28}
              color={receptionType === 'DIRECT' ? '#fff' : isDark ? '#FBBF24' : '#D97706'}
            />
          </View>
          <Text style={styles.typeCardTitle}>{t(locale, 'receive.typeDirectTitle')}</Text>
          <Text style={styles.typeCardBody}>{t(locale, 'receive.typeDirectBody')}</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepExplain: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    lineHeight: 20,
  },
  typeCardsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  typeCardSelected: {
    backgroundColor: '#F1F5F9',
    borderColor: '#3B82F6',
  },
  typeCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  typeCardIconActive: {
    backgroundColor: '#3B82F6',
  },
  typeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeCardBody: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.8,
  },
});
