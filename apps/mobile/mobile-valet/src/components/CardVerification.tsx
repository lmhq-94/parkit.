import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { t } from '@/lib/i18n';
import { IconCircleCheck, IconShieldCheck, IconAlertCircle, IconArrowRight, IconScan, IconExternalLink, IconCard } from '@/components/TablerIcons';
import type { Locale } from '@parkit/shared';
import api from '@/lib/api';
import { messageFromAxios } from "@parkit/shared";
import { CardScanner } from './CardScanner';

interface CardVerificationProps {
  locale: Locale;
  onVerified: () => void;
  onCancel: () => void;
  isDark: boolean;
  cardVerificationStarted: boolean;
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
    button: number;
    title: number;
    status: number;
  };
  space: {
    sm: number;
    md: number;
    xs: number;
    lg: number;
  };
}

export function CardVerification({
  locale,
  onVerified,
  onCancel,
  isDark,
  cardVerificationStarted,
  colors: C,
  fonts: F,
  space: S,
}: CardVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [_scanSuccess, setScanSuccess] = useState(false);

  const startVerification = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ data?: { url?: string } }>(
        '/payments/card-verification/session',
        { locale }
      );
      const url = res.data?.data?.url;
      if (!url) throw new Error('No checkout URL');
      
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error('Cannot open checkout URL');
      
      await Linking.openURL(url);
    } catch (e) {
      const msg = messageFromAxios(e);
      setError(
        msg === 'NETWORK_ERROR'
          ? t(locale, 'common.networkError')
          : msg || t(locale, 'receive.cardVerifyError')
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  const handleContinue = useCallback(() => {
    if (cardVerificationStarted) {
      onVerified();
    }
  }, [cardVerificationStarted, onVerified]);

  const handleCardScanned = useCallback(() => {
    setScanSuccess(true);
    setShowScanner(false);
    void startVerification();
  }, [startVerification]);

  const handleStartScan = useCallback(() => {
    setShowScanner(true);
  }, []);

  const handleScannerClose = useCallback(() => {
    setShowScanner(false);
  }, []);

  const handleScannerCancel = useCallback(() => {
    setShowScanner(false);
  }, []);

  const scanGradient = isDark
    ? (['#10B981', '#059669'] as [string, string])
    : (['#059669', '#047857'] as [string, string]);

  if (showScanner) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#FFFFFF' }}>
        <CardScanner
          locale={locale}
          isDark={isDark}
          visible={showScanner}
          embedded={true}
          onClose={handleScannerClose}
          onCardScanned={handleCardScanned}
          onCancel={handleScannerCancel}
          colors={{
            primary: C.primary,
            text: C.text,
            textMuted: C.textMuted,
            card: C.card,
            border: C.border,
          }}
          fonts={{ secondary: F.secondary, body: F.body, button: F.button, title: F.title, status: F.status }}
          space={{ sm: S.sm, md: S.md, lg: S.lg }}
        />
      </View>
    );
  }

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
    premiumShell: {
      borderRadius: 20,
      padding: 2,
      marginBottom: S.lg,
    },
    innerCard: {
      backgroundColor: C.card,
      borderRadius: 18,
      padding: S.md + 4,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: S.md,
    },
    iconBubble: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(14, 165, 233, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    textCol: {
      flex: 1,
    },
    cardTitle: {
      fontSize: F.secondary - 1,
      fontWeight: '800',
      color: C.text,
      marginBottom: 4,
    },
    cardBody: {
      fontSize: F.secondary,
      color: C.textMuted,
      lineHeight: 20,
    },
    badgeRow: {
      flexDirection: 'row',
      gap: S.sm,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    badgeSuccess: {
      backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    badgePending: {
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
    },
    badgeText: {
      fontSize: Math.round(F.secondary * 0.75),
      fontWeight: '800',
      color: '#2563EB',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    badgeTextSuccess: {
      color: '#059669',
    },
    badgeTextPending: {
      color: '#D97706',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    verifiedText: {
      fontSize: Math.round(F.secondary * 0.75),
      color: '#059669',
      fontWeight: '800',
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderRadius: 12,
      padding: S.md,
      marginBottom: S.md,
    },
    errorText: {
      fontSize: F.secondary,
      color: '#EF4444',
      marginLeft: 8,
      flex: 1,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: S.md,
      marginBottom: S.md,
    },
    cancelBtn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: C.border,
    },
    cancelBtnText: {
      fontSize: F.secondary - 1,
      fontWeight: '800',
      color: isDark ? '#CBD5E1' : '#475569',
    },
    primaryBtn: {
      flex: 1.5,
      height: 48,
      borderRadius: 14,
      overflow: 'hidden',
    },
    btnDisabled: {
      opacity: 0.55,
    },
    pressed: {
      opacity: 0.9,
    },
    primaryBtnBg: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: S.sm,
    },
    primaryBtnText: {
      fontSize: F.secondary - 1,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    hintText: {
      fontSize: F.secondary,
      color: C.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

  const gradientColors = isDark
    ? (['#38BDF8', '#6366F1', '#2DD4BF'] as [string, string, string])
    : (['#0EA5E9', '#4F46E5', '#10B981'] as [string, string, string]);

  const buttonGradient = isDark
    ? (['#0EA5E9', '#2563EB'] as [string, string])
    : (['#0284C7', '#1D4ED8'] as [string, string]);

  return (
    <>
      <Text style={styles.sectionLabel}>{t(locale, 'receive.wizardCardTitle')}</Text>
      <Text style={styles.stepExplain}>{t(locale, 'receive.wizardCardHelp')}</Text>

      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.premiumShell}>
        <View style={styles.innerCard}>
          <View style={styles.cardRow}>
            <View style={styles.iconBubble}>
              {cardVerificationStarted ? <IconCircleCheck size={26} color="#10B981" /> : <IconCard size={26} color={C.primary} />}
            </View>
            <View style={styles.textCol}>
              <Text style={styles.cardTitle}>
                {t(locale, 'receive.cardVerifyOnHoldTitle')}
              </Text>
              <Text style={styles.cardBody}>
                {t(locale, 'receive.cardVerifyOnHoldBody')}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, cardVerificationStarted && styles.badgeSuccess]}>
              <Text style={[styles.badgeText, cardVerificationStarted && styles.badgeTextSuccess]}>
                {cardVerificationStarted ? t(locale, 'common.successTitle') : t(locale, 'receive.cardVerifyBadge')}
              </Text>
            </View>
            {cardVerificationStarted ? (
              <View style={styles.verifiedBadge}>
                <IconShieldCheck size={14} color="#10B981" />
                <Text style={styles.verifiedText}>{t(locale, 'receive.cardVerifyStarted')}</Text>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgePending]}>
                <Text style={[styles.badgeText, styles.badgeTextPending]}>
                  {t(locale, 'common.loading')}
                </Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {error && (
        <View style={styles.errorContainer}>
          <IconAlertCircle size={18} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressed]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelBtnText}>
            {t(locale, 'common.back')}
          </Text>
        </Pressable>

        {cardVerificationStarted ? (
          <Pressable
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtnBg}
            >
              <IconArrowRight size={18} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>{t(locale, 'common.next')}</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, { flex: 1 }, loading && styles.btnDisabled, pressed && styles.pressed]}
              onPress={handleStartScan}
              disabled={loading}
            >
              <LinearGradient
                colors={scanGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtnBg}
              >
                <IconScan size={18} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>{t(locale, 'receive.cardScanButton')}</Text>
              </LinearGradient>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.primaryBtn, { flex: 1.5 }, loading && styles.btnDisabled, pressed && styles.pressed]}
              onPress={startVerification}
              disabled={loading}
            >
              <LinearGradient
                colors={buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtnBg}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <IconExternalLink size={18} color="#FFFFFF" />
                    <Text style={styles.primaryBtnText}>{t(locale, 'receive.cardVerifyStart')}</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </>
        )}
      </View>

      <Text style={styles.hintText}>
        {cardVerificationStarted
          ? t(locale, 'receive.cardVerifyStartedHint')
          : t(locale, 'receive.cardVerifyOptionalHint')}
      </Text>
    </>
  );
}
