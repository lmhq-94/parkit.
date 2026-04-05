import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';
import { formatPhoneWithCountryCode } from '@/lib/phoneInternational';

interface DriverInfoFormProps {
  locale: Locale;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  colors: {
    textSubtle: string;
    textMuted: string;
    card: string;
    border: string;
    text: string;
  };
  fonts: {
    secondary: number;
    body: number;
  };
  space: {
    sm: number;
    md: number;
  };
}

export function DriverInfoForm({
  locale,
  firstName,
  lastName,
  email,
  phone,
  countryCode,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  colors: C,
  fonts: F,
  space: S,
}: DriverInfoFormProps) {
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneWithCountryCode(value, countryCode);
    onPhoneChange(formatted);
  };

  const styles = StyleSheet.create({
    sectionLabel: {
      fontSize: F.secondary,
      fontWeight: '800',
      color: C.textMuted,
      marginBottom: S.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    stepExplain: {
      fontSize: F.secondary,
      color: C.textSubtle,
      marginTop: -4,
      marginBottom: S.md,
      lineHeight: 22,
    },
    input: {
      backgroundColor: C.card,
      borderWidth: 2,
      borderColor: C.border,
      borderRadius: 14,
      paddingHorizontal: S.md,
      paddingVertical: 14,
      fontSize: F.body,
      color: C.text,
      marginBottom: S.sm,
    },
  });

  return (
    <>
      <Text style={styles.sectionLabel}>{t(locale, 'receive.wizardDriverTitle')}</Text>
      <Text style={styles.stepExplain}>{t(locale, 'receive.wizardDriverHelp')}</Text>

      <TextInput
        style={styles.input}
        value={firstName}
        onChangeText={onFirstNameChange}
        placeholder={t(locale, 'receive.placeholderFirst')}
        placeholderTextColor={C.textSubtle}
        maxFontSizeMultiplier={2}
        autoComplete="given-name"
      />

      <TextInput
        style={styles.input}
        value={lastName}
        onChangeText={onLastNameChange}
        placeholder={t(locale, 'receive.placeholderLast')}
        placeholderTextColor={C.textSubtle}
        maxFontSizeMultiplier={2}
        autoComplete="family-name"
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={onEmailChange}
        placeholder={t(locale, 'receive.placeholderEmail')}
        placeholderTextColor={C.textSubtle}
        keyboardType="email-address"
        autoCapitalize="none"
        maxFontSizeMultiplier={2}
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={handlePhoneChange}
        placeholder={t(locale, 'receive.placeholderPhone')}
        placeholderTextColor={C.textSubtle}
        keyboardType="phone-pad"
        maxFontSizeMultiplier={2}
        autoComplete="tel"
      />
    </>
  );
}
