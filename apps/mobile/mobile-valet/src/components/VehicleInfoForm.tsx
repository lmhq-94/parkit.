import React from 'react';
import { Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';
import { IconChevronDown } from '@/components/TablerIcons';

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
    textMuted: string;
    card: string;
    border: string;
    text: string;
  };
  fonts: {
    secondary: number;
  };
  space: {
    sm: number;
    md: number;
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
  fonts: F,
  space: S,
}: VehicleInfoFormProps) {
  const styles = StyleSheet.create({
    stepExplain: {
      fontSize: Math.round(F.secondary * 0.65),
      fontWeight: '600',
      color: C.textMuted,
      marginBottom: S.md,
      lineHeight: 22,
    },
    input: {
      backgroundColor: C.card,
      borderRadius: 14,
      paddingHorizontal: S.md,
      paddingVertical: 14,
      fontSize: Math.round(F.secondary * 0.65),
      color: C.text,
      borderWidth: 2,
      borderColor: C.border,
      marginBottom: S.sm,
    },
    selectInputContainer: {
      position: 'relative',
      marginBottom: S.sm,
    },
    selectInput: {
      backgroundColor: C.card,
      borderRadius: 14,
      paddingHorizontal: S.md,
      paddingVertical: 14,
      fontSize: Math.round(F.secondary * 0.65),
      color: C.text,
      borderWidth: 2,
      borderColor: C.border,
      paddingRight: 40,
    },
    selectIcon: {
      position: 'absolute',
      right: S.md,
      top: '50%',
      transform: [{ translateY: -10 }],
    },
  });

  return (
    <>
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
          <IconChevronDown size={20} color="#64748B" style={styles.selectIcon} />
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
          <IconChevronDown size={20} color="#64748B" style={styles.selectIcon} />
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
          <IconChevronDown size={20} color="#64748B" style={styles.selectIcon} />
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
