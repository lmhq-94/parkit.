import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Share,
} from 'react-native';
import { IconAlertCircle, IconClose, IconQrCode, IconCar, IconPrint, IconShare } from '@/components/Icons';
import QRCode from 'qrcode';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';

interface TicketQRPanelProps {
  locale: Locale;
  isDark: boolean;
  ticketCode: string;
  keyCode?: string;
  vehiclePlate?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  driverName?: string;
  parkingName?: string;
  timestamp: string;
  colors: {
    primary: string;
    success: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    card: string;
    border: string;
  };
  fonts: {
    secondary: number;
    body: number;
    button: number;
    title: number;
  };
  space: {
    sm: number;
    md: number;
    lg: number;
    xs: number;
  };
  onClose?: () => void;
  onPrint?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const QR_SIZE = Math.min(screenWidth * 0.7, 280);

interface QRData {
  ticketCode: string;
  keyCode?: string;
  plate?: string;
  vehicle?: string;
  driver?: string;
  parking?: string;
  timestamp: string;
  type: 'PARKIT_TICKET';
}

export function TicketQRPanel({
  locale,
  isDark,
  ticketCode,
  keyCode,
  vehiclePlate,
  vehicleBrand,
  vehicleModel,
  driverName,
  parkingName,
  timestamp,
  colors: C,
  fonts: F,
  space: S,
  onClose,
  onPrint,
}: TicketQRPanelProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [_scanSuccess, _setScanSuccess] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQR = useCallback(async () => {
    try {
      setGenerating(true);
      setError(null);

      const data: QRData = {
        ticketCode,
        keyCode,
        plate: vehiclePlate,
        vehicle: vehicleBrand && vehicleModel ? `${vehicleBrand} ${vehicleModel}` : undefined,
        driver: driverName,
        parking: parkingName,
        timestamp,
        type: 'PARKIT_TICKET',
      };

      const qrText = JSON.stringify(data);
      const dataUrl = await QRCode.toDataURL(qrText, {
        width: QR_SIZE,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      setQrDataUrl(dataUrl);
    } catch (err) {
      setError(t(locale, 'receive.qrGenerateError'));
    } finally {
      setGenerating(false);
    }
  }, [ticketCode, keyCode, vehiclePlate, vehicleBrand, vehicleModel, driverName, parkingName, timestamp, locale]);

  useEffect(() => {
    void generateQR();
  }, [generateQR]);

  const handleShare = useCallback(async () => {
    if (!qrDataUrl) return;

    try {
      const shareData = {
        title: t(locale, 'receive.ticketQrShareTitle'),
        message: `${t(locale, 'receive.ticketQrShareMessage')}\n\n${t(locale, 'receive.ticketCodeLabel')}: ${ticketCode}${keyCode && keyCode !== ticketCode ? `\n${t(locale, 'receive.keyCodeLabel')}: ${keyCode}` : ''}`,
      };

      await Share.share(shareData);
    } catch (err) {
      console.error('Share error:', err);
    }
  }, [qrDataUrl, ticketCode, keyCode, locale]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      padding: S.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: S.lg,
      paddingTop: S.sm,
    },
    headerTitle: {
      fontSize: F.secondary - 1,
      fontWeight: '800',
      color: C.text,
    },
    closeBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qrContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: S.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      alignItems: 'center',
    },
    qrImage: {
      width: QR_SIZE,
      height: QR_SIZE,
      borderRadius: 12,
    },
    qrPlaceholder: {
      width: QR_SIZE,
      height: QR_SIZE,
      borderRadius: 12,
      backgroundColor: '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    ticketInfo: {
      marginTop: S.lg,
      alignItems: 'center',
    },
    ticketCode: {
      fontSize: F.body + 4,
      fontWeight: '800',
      color: '#0F172A',
      marginBottom: S.xs,
    },
    ticketSubtitle: {
      fontSize: F.secondary,
      color: '#64748B',
      textAlign: 'center',
    },
    vehicleInfo: {
      marginTop: S.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: S.sm,
    },
    vehicleText: {
      fontSize: F.secondary,
      color: '#475569',
      fontWeight: '600',
    },
    footer: {
      marginTop: S.lg,
      gap: S.md,
    },
    actionBtn: {
      height: 56,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: S.sm,
    },
    primaryBtn: {
      backgroundColor: C.primary,
    },
    secondaryBtn: {
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      borderWidth: 2,
      borderColor: C.border,
    },
    primaryBtnText: {
      fontSize: F.secondary - 1,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    secondaryBtnText: {
      fontSize: F.secondary - 1,
      fontWeight: '800',
      color: isDark ? '#CBD5E1' : '#475569',
    },
    errorContainer: {
      padding: S.lg,
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 16,
      alignItems: 'center',
    },
    errorText: {
      fontSize: F.secondary,
      color: '#EF4444',
      textAlign: 'center',
      marginTop: S.sm,
    },
    retryBtn: {
      marginTop: S.md,
      paddingHorizontal: S.lg,
      paddingVertical: S.sm,
      backgroundColor: C.primary,
      borderRadius: 12,
    },
    retryText: {
      fontSize: F.secondary - 1,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

  if (generating) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={[styles.ticketSubtitle, { marginTop: S.md }]}>
            {t(locale, 'receive.qrGenerating')}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <IconAlertCircle size={48} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={generateQR}>
              <Text style={styles.retryText}>{t(locale, 'common.retry')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t(locale, 'receive.ticketQrTitle')}</Text>
        {onClose && (
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <IconClose size={24} color={C.text} />
          </Pressable>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.qrContainer}>
          {qrDataUrl ? (
            <>
              {/* eslint-disable-next-line @typescript-eslint/no-require-imports */}
              <Text style={{ display: 'none' }}>QR Placeholder</Text>
              <View style={[styles.qrPlaceholder, { backgroundColor: '#FFFFFF' }]}>
                <IconQrCode size={QR_SIZE * 0.6} color="#0F172A" />
              </View>
            </>
          ) : (
            <View style={styles.qrPlaceholder}>
              <IconQrCode size={48} color="#94A3B8" />
            </View>
          )}

          <View style={styles.ticketInfo}>
            <Text style={styles.ticketCode}>{ticketCode}</Text>
            {keyCode && keyCode !== ticketCode && (
              <Text style={styles.ticketSubtitle}>
                {t(locale, 'receive.keyCodeLabel')}: {keyCode}
              </Text>
            )}
            {vehiclePlate && (
              <View style={styles.vehicleInfo}>
                <IconCar size={18} color="#64748B" />
                <Text style={styles.vehicleText}>
                  {vehicleBrand} {vehicleModel} • {vehiclePlate}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {onPrint && (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.secondaryBtn, pressed && { opacity: 0.9 }]}
            onPress={onPrint}
          >
            <IconPrint size={20} color={isDark ? '#CBD5E1' : '#475569'} />
            <Text style={styles.secondaryBtnText}>{t(locale, 'receive.printTicket')}</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.primaryBtn, pressed && { opacity: 0.9 }]}
          onPress={handleShare}
        >
          <IconShare size={20} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>{t(locale, 'receive.shareTicket')}</Text>
        </Pressable>
      </View>
    </View>
  );
}
