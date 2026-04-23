import React from 'react';
import { View, Text, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { IconCircleCheck, IconCar, IconLicensePlate } from '@/components/Icons';
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
  length?: number | null;
  width?: number | null;
  height?: number | null;
  weight?: number | null;
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
    inputBg: string;
    inputBorder: string;
    [key: string]: string;
  };
  fonts: {
    secondary: number;
    body: number;
    status: number;
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
      fontSize: Math.round(F.secondary * 0.65),
      fontWeight: '800',
      color: C.text,
      marginBottom: S.md,
      letterSpacing: 0.6,
    },
    stepExplain: {
      fontSize: Math.round(F.secondary * 0.6),
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
    inputContainer: {
      position: 'relative',
      marginBottom: 16,
    },
    inputIcon: {
      position: 'absolute',
      left: 16,
      top: '50%',
      marginTop: -16,
      zIndex: 1,
    },
    row: {
      flexDirection: 'row',
      gap: S.sm,
      alignItems: 'center',
      marginBottom: S.md,
    },
    inlineLoadingText: {
      fontSize: Math.round(F.secondary * 0.6),
      color: C.textSubtle,
      lineHeight: 20,
      marginBottom: 0,
    },
    card: {
      backgroundColor: C.card,
      borderRadius: 24,
      padding: 20,
      borderWidth: 0,
      marginBottom: S.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
      elevation: 2,
    },
    vehicleFoundCard: {
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.15)',
    },
    vehicleNotFoundCard: {
      backgroundColor: 'rgba(249, 115, 22, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(249, 115, 22, 0.15)',
    },
    vehicleFoundHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: 16,
    },
    vehicleFoundIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    vehicleNotFoundHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    vehicleNotFoundIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(249, 115, 22, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    vehicleFoundTitle: {
      fontSize: Math.round(F.secondary * 0.7),
      fontWeight: '700',
      color: C.text,
      marginBottom: 4,
      flex: 1,
    },
    vehicleFoundSubtitle: {
      fontSize: Math.round(F.secondary * 0.6),
      fontWeight: '500',
      color: C.success,
    },
    vehicleNotFoundTitle: {
      fontSize: Math.round(F.secondary * 0.7),
      fontWeight: '700',
      color: C.text,
      marginBottom: 4,
      flex: 1,
    },
    vehicleNotFoundSubtitle: {
      fontSize: Math.round(F.secondary * 0.6),
      fontWeight: '500',
      color: C.warning,
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
      fontSize: Math.round(F.secondary * 0.6),
      fontWeight: '700',
      color: C.textMuted,
      letterSpacing: 0.4,
    },
    vehicleSummaryValue: {
      flex: 1,
      textAlign: 'right',
      fontSize: Math.round(F.secondary * 0.6),
      fontWeight: '800',
      color: C.text,
    },
    cardHint: {
      fontSize: Math.round(F.secondary * 0.6),
      color: C.textMuted,
      marginTop: S.sm,
      lineHeight: 22,
    },
  });

  return (
    <>
      <Text style={styles.stepExplain}>{t(locale, 'receive.wizardPlateHelp')}</Text>

      <Text style={styles.inputLabel}>{t(locale, 'receive.labelPlate')}</Text>
      <View style={styles.inputContainer}>
        <IconLicensePlate size={20} color={C.textMuted} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={plate}
          onChangeText={handleChange}
          placeholder={t(locale, 'receive.placeholderPlate')}
          placeholderTextColor={C.textSubtle}
          autoCapitalize="characters"
          maxFontSizeMultiplier={2}
        />
      </View>

      {lookupLoading && (
        <View style={styles.row}>
          <ActivityIndicator size="small" color={C.primary} />
          <Text style={styles.inlineLoadingText}>{t(locale, 'receive.lookupInlineLoading')}</Text>
        </View>
      )}

      {vehicleResolved && vehicle && (
        <View style={[styles.card, styles.vehicleFoundCard]}>
          <View style={styles.vehicleFoundHeader}>
            <View style={styles.vehicleFoundIcon}>
              <IconCircleCheck size={20} color={C.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleFoundTitle} numberOfLines={1}>{t(locale, 'receive.foundVehicle')}</Text>
              <Text style={styles.vehicleFoundSubtitle} numberOfLines={1}>{formatPlate(vehicle.plate)}</Text>
            </View>
          </View>
          <View style={styles.vehicleSummaryRow}>
            <Text style={styles.vehicleSummaryLabel}>{t(locale, 'receive.wizardVehicleTitle')}</Text>
            <Text style={styles.vehicleSummaryValue}>
              {vehicle.brand} {vehicle.model}
            </Text>
          </View>
          {(vehicle.length || vehicle.width || vehicle.height || vehicle.weight) && (
            <View style={styles.vehicleSummaryRow}>
              <Text style={styles.vehicleSummaryLabel}>Dimensiones</Text>
              <Text style={styles.vehicleSummaryValue}>
                {vehicle.length && `${vehicle.length}m`} {vehicle.width && `× ${vehicle.width}m`} {vehicle.height && `× ${vehicle.height}m`}
                {vehicle.weight && (vehicle.length || vehicle.width || vehicle.height) ? ' | ' : ''}
                {vehicle.weight && `${vehicle.weight}kg`}
              </Text>
            </View>
          )}
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
          <View style={styles.vehicleNotFoundHeader}>
            <View style={styles.vehicleNotFoundIcon}>
              <IconCar size={20} color={C.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vehicleNotFoundTitle} numberOfLines={1}>{t(locale, 'receive.newVehicleTitle')}</Text>
              <Text style={styles.vehicleNotFoundSubtitle} numberOfLines={2}>{t(locale, 'receive.newVehicleHint')}</Text>
            </View>
          </View>
        </View>
      )}
    </>
  );
}
