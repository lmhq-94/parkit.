import React from 'react';
import { Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';

interface VehicleInfoFormProps {
  locale: Locale;
  brand: string;
  model: string;
  color: string;
  year: string;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onBrandPress?: () => void;
  onModelPress?: () => void;
  onColorPress?: () => void;
  colors: {
    textSubtle: string;
  };
}

export function VehicleInfoForm({
  locale,
  brand,
  model,
  color,
  year,
  onBrandChange,
  onModelChange,
  onColorChange,
  onYearChange,
  onBrandPress,
  onModelPress,
  onColorPress,
  colors: C,
}: VehicleInfoFormProps) {
  return (
    <>
      <Text style={styles.sectionLabel}>{t(locale, 'receive.wizardVehicleTitle')}</Text>
      <Text style={styles.stepExplain}>{t(locale, 'receive.wizardVehicleHelp')}</Text>

      {/* Brand */}
      <Pressable onPress={onBrandPress} style={styles.selectInputContainer}>
        <TextInput
          style={styles.selectInput}
          value={brand}
          onChangeText={onBrandChange}
          placeholder={t(locale, 'receive.placeholderBrand')}
          placeholderTextColor={C.textSubtle}
          maxFontSizeMultiplier={2}
          editable={!onBrandPress}
          pointerEvents={onBrandPress ? 'none' : 'auto'}
        />
        {onBrandPress && (
          <Ionicons name="chevron-down" size={20} color="#64748B" style={styles.selectIcon} />
        )}
      </Pressable>

      {/* Model */}
      <Pressable onPress={onModelPress} style={styles.selectInputContainer}>
        <TextInput
          style={styles.selectInput}
          value={model}
          onChangeText={onModelChange}
          placeholder={t(locale, 'receive.placeholderModel')}
          placeholderTextColor={C.textSubtle}
          maxFontSizeMultiplier={2}
          editable={!onModelPress}
          pointerEvents={onModelPress ? 'none' : 'auto'}
        />
        {onModelPress && (
          <Ionicons name="chevron-down" size={20} color="#64748B" style={styles.selectIcon} />
        )}
      </Pressable>

      {/* Color */}
      <Pressable onPress={onColorPress} style={styles.selectInputContainer}>
        <TextInput
          style={styles.selectInput}
          value={color}
          onChangeText={onColorChange}
          placeholder={t(locale, 'receive.placeholderColor')}
          placeholderTextColor={C.textSubtle}
          maxFontSizeMultiplier={2}
          editable={!onColorPress}
          pointerEvents={onColorPress ? 'none' : 'auto'}
        />
        {onColorPress && (
          <Ionicons name="chevron-down" size={20} color="#64748B" style={styles.selectIcon} />
        )}
      </Pressable>

      {/* Year */}
      <TextInput
        style={styles.input}
        value={year}
        onChangeText={onYearChange}
        placeholder={t(locale, 'receive.placeholderYear')}
        placeholderTextColor={C.textSubtle}
        keyboardType="number-pad"
        maxLength={4}
        maxFontSizeMultiplier={2}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
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
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  selectInputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  selectInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingRight: 40,
  },
  selectIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});
