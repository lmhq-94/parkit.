import React from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';
import { formatPlate } from '@parkit/shared';

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  color?: string | null;
  year?: number | null;
  owners?: Array<{
    client: {
      user: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
}

interface VehiclePlateInputProps {
  locale: Locale;
  plate: string;
  onPlateChange: (plate: string) => void;
  lookupLoading: boolean;
  vehicleResolved: boolean;
  vehicle: Vehicle | null;
  plateLooksValid: boolean;
  colors: {
    primary: string;
    success: string;
    warning: string;
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
    xs: number;
  };
}

export function VehiclePlateInput({
  locale,
  plate,
  onPlateChange,
  lookupLoading,
  vehicleResolved,
  vehicle,
  plateLooksValid,
  colors: C,
  fonts: F,
  space: S,
}: VehiclePlateInputProps) {
  const handleChange = (value: string) => {
    const formatted = formatPlate(value);
    onPlateChange(formatted);
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
    row: {
      flexDirection: 'row',
      gap: S.sm,
      alignItems: 'center',
      marginBottom: S.md,
    },
    inlineLoadingText: {
      fontSize: F.secondary,
      color: C.textSubtle,
      lineHeight: 20,
      marginBottom: 0,
    },
    card: {
      backgroundColor: C.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: S.md,
    },
    vehicleFoundCard: {
      borderColor: 'rgba(16, 185, 129, 0.35)',
      backgroundColor: 'rgba(16, 185, 129, 0.06)',
    },
    vehicleNotFoundCard: {
      borderColor: 'rgba(249, 115, 22, 0.35)',
      backgroundColor: 'rgba(249, 115, 22, 0.06)',
    },
    vehicleFoundHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: S.xs,
    },
    vehicleFoundBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: S.sm,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
    },
    vehicleNotFoundBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: S.sm,
      backgroundColor: 'rgba(249, 115, 22, 0.12)',
    },
    vehicleFoundBadgeText: {
      fontSize: Math.round(F.secondary * 0.75),
      fontWeight: '800',
      color: C.success,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    vehicleNotFoundBadgeText: {
      fontSize: Math.round(F.secondary * 0.75),
      fontWeight: '800',
      color: C.warning,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    vehicleSummaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: S.sm,
      paddingVertical: S.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(148, 163, 184, 0.35)',
    },
    vehicleSummaryRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    vehicleSummaryLabel: {
      flexShrink: 1,
      fontSize: Math.round(F.secondary * 0.8),
      fontWeight: '700',
      color: C.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    vehicleSummaryValue: {
      flex: 1,
      textAlign: 'right',
      fontSize: F.secondary,
      fontWeight: '800',
      color: C.text,
    },
    cardHint: {
      fontSize: F.secondary,
      color: C.textMuted,
      marginTop: S.sm,
      lineHeight: 22,
    },
  });

  return (
    <>
      <Text style={styles.sectionLabel}>{t(locale, 'receive.wizardPlateTitle')}</Text>
      <Text style={styles.stepExplain}>{t(locale, 'receive.wizardPlateHelp')}</Text>

      <TextInput
        style={styles.input}
        value={plate}
        onChangeText={handleChange}
        placeholder={t(locale, 'receive.placeholderPlate')}
        placeholderTextColor={C.textSubtle}
        autoCapitalize="characters"
        maxFontSizeMultiplier={2}
      />

      {lookupLoading && (
        <View style={styles.row}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={styles.inlineLoadingText}>{t(locale, 'receive.lookupInlineLoading')}</Text>
        </View>
      )}

      {vehicleResolved && vehicle && (
        <View style={[styles.card, styles.vehicleFoundCard]}>
          <View style={styles.vehicleFoundHeader}>
            <View style={styles.vehicleFoundBadge}>
              <Ionicons name="checkmark-circle" size={16} color={C.success} />
              <Text style={styles.vehicleFoundBadgeText}>{t(locale, 'receive.foundVehicle')}</Text>
            </View>
          </View>
          <View style={styles.vehicleSummaryRow}>
            <Text style={styles.vehicleSummaryLabel}>{t(locale, 'receive.wizardPlateTitle')}</Text>
            <Text style={styles.vehicleSummaryValue}>{formatPlate(vehicle.plate)}</Text>
          </View>
          <View style={styles.vehicleSummaryRow}>
            <Text style={styles.vehicleSummaryLabel}>{t(locale, 'receive.wizardVehicleTitle')}</Text>
            <Text style={styles.vehicleSummaryValue}>
              {vehicle.brand} {vehicle.model}
            </Text>
          </View>
          {vehicle.owners?.length ? (
            <View style={[styles.vehicleSummaryRow, styles.vehicleSummaryRowLast]}>
              <Text style={styles.vehicleSummaryLabel}>{t(locale, 'receive.foundOwner')}</Text>
              <Text style={styles.vehicleSummaryValue}>
                {vehicle.owners[0].client.user.firstName} {vehicle.owners[0].client.user.lastName}
              </Text>
            </View>
          ) : (
            <Text style={styles.cardHint}>{t(locale, 'receive.noOwnerHint')}</Text>
          )}
        </View>
      )}

      {vehicleResolved && !vehicle && plateLooksValid && (
        <View style={[styles.card, styles.vehicleNotFoundCard]}>
          <View style={styles.vehicleFoundHeader}>
            <View style={styles.vehicleNotFoundBadge}>
              <Ionicons name="alert-circle-outline" size={16} color={C.warning} />
              <Text style={styles.vehicleNotFoundBadgeText}>{t(locale, 'receive.newVehicleTitle')}</Text>
            </View>
          </View>
          <Text style={styles.cardHint}>{t(locale, 'receive.newVehicleHint')}</Text>
        </View>
      )}
    </>
  );
}
