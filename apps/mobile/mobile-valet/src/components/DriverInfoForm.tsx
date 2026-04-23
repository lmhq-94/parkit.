import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';
import { formatPhoneWithCountryCode } from '@/lib/phoneInternational';
import { IconUser, IconMail, IconPhone } from '@/components/Icons';

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
    inputBg: string;
    inputBorder: string;
  };
  fonts: {
    secondary: number;
    body: number;
    status: number;
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
    stepExplain: {
      fontSize: Math.round(F.secondary * 0.65),
      fontWeight: '600',
      color: C.textMuted,
      marginTop: -4,
      marginBottom: S.md,
      lineHeight: 22,
    },
    inputLabel: {
      fontSize: Math.round(F.status * 0.6),
      fontWeight: '500',
      color: C.text,
      marginBottom: 6,
    },
    nameInputContainer: {
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.inputBorder,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      marginBottom: 16,
    },
    nameInputWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      gap: 8,
      height: 48,
    },
    nameSeparator: {
      width: 1,
      height: '60%',
      backgroundColor: C.inputBorder,
      opacity: 0.5,
    },
    nameInput: {
      flex: 1,
      fontSize: Math.round(F.status * 0.6),
      color: C.text,
      paddingVertical: 12,
      letterSpacing: 0.3,
    },
    inputContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    input: {
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingLeft: 48,
      fontSize: Math.round(F.status * 0.6),
      fontWeight: '600',
      color: C.text,
      marginBottom: S.sm,
      height: 48,
    },
    inputIcon: {
      position: 'absolute',
      left: 16,
      top: '50%',
      marginTop: -16,
      zIndex: 1,
    },
  });

  return (
    <>
      <Text style={styles.stepExplain}>{t(locale, 'receive.wizardDriverHelp')}</Text>

      <Text style={styles.inputLabel}>{t(locale, 'receive.labelFullName')}</Text>
      <View style={styles.nameInputContainer}>
        <View style={styles.nameInputWrapper}>
          <IconUser size={20} color={C.textMuted} />
          <TextInput
            style={styles.nameInput}
            value={firstName}
            onChangeText={onFirstNameChange}
            placeholder={t(locale, 'receive.placeholderFirst')}
            placeholderTextColor={C.textSubtle}
            autoCapitalize="words"
            maxFontSizeMultiplier={2}
            autoComplete="given-name"
          />
        </View>
        <View style={styles.nameSeparator} />
        <View style={styles.nameInputWrapper}>
          <IconUser size={20} color={C.textMuted} />
          <TextInput
            style={styles.nameInput}
            value={lastName}
            onChangeText={onLastNameChange}
            placeholder={t(locale, 'receive.placeholderLast')}
            placeholderTextColor={C.textSubtle}
            autoCapitalize="words"
            maxFontSizeMultiplier={2}
            autoComplete="family-name"
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>{t(locale, 'receive.labelEmail')}</Text>
      <View style={styles.inputContainer}>
        <IconMail size={20} color={C.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={onEmailChange}
          placeholder={t(locale, 'auth.email.placeholder')}
          placeholderTextColor={C.textSubtle}
          keyboardType="email-address"
          autoCapitalize="none"
          maxFontSizeMultiplier={2}
          autoComplete="email"
        />
      </View>

      <Text style={styles.inputLabel}>{t(locale, 'receive.labelPhoneOptional')}</Text>
      <View style={styles.inputContainer}>
        <IconPhone size={20} color={C.textMuted} style={styles.inputIcon} />
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
      </View>
    </>
  );
}
