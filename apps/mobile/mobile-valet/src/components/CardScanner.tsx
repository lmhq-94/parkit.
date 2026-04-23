import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';
import { useAccessibilityStore } from '@/lib/store';

interface CardScannerProps {
  locale: Locale;
  isDark: boolean;
  visible: boolean;
  onClose: () => void;
  onCardScanned: (cardData: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
  }) => void;
  onCancel: () => void;
  embedded?: boolean;
  colors: {
    primary: string;
    text: string;
    textMuted: string;
    card: string;
    border: string;
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
    lg: number;
  };
  scannedCardData: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
  } | null;
}

export function CardScanner({
  locale,
  isDark,
  visible,
  onClose,
  onCardScanned,
  onCancel,
  embedded = false,
  colors: C,
  fonts: F,
  space: S,
  scannedCardData,
}: CardScannerProps) {
  const { width: winW } = useWindowDimensions();
  const safeInsets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [guideText, setGuideText] = useState(t(locale, 'receive.cardScannerSubtitle'));
  const cameraRef = useRef<CameraView>(null);
  const { textScale } = useAccessibilityStore();

  const CORNER_LEN = 32;
  const CORNER_THICK = 2.5;
  const ACCENT_GLOW = "rgba(255, 255, 255, 0.6)";

  const cardWidth = Math.min(winW * 0.85, 340);
  const cardHeight = cardWidth * 0.63;
  const mask = "rgba(2, 6, 23, 0.45)";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 0,
      width: '100%',
      alignSelf: 'stretch',
      borderRadius: 0,
      overflow: 'hidden',
      backgroundColor: '#020617',
    },
    camera: {
      ...StyleSheet.absoluteFillObject,
    },
    screenHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: S.lg,
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(255,255,255,0.1)',
      backgroundColor: '#020617',
    },
    screenTitle: {
      fontSize: F.secondary - 1,
      fontWeight: '800',
      color: '#F8FAFC',
      flex: 1,
      textAlign: 'center',
    },
    maskColumn: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
    },
    maskBand: {
      flex: 1,
    },
    maskSide: {
      flex: 1,
    },
    frameLayer: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
    frameBox: {
      position: 'relative',
    },
    frameBorder: {
      ...StyleSheet.absoluteFillObject,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 12,
    },
    cornerTL: {
      position: 'absolute',
      width: CORNER_LEN,
      height: CORNER_LEN,
      borderColor: ACCENT_GLOW,
      top: -1,
      left: -1,
      borderTopWidth: CORNER_THICK,
      borderLeftWidth: CORNER_THICK,
      borderTopLeftRadius: 8,
    },
    cornerTR: {
      position: 'absolute',
      width: CORNER_LEN,
      height: CORNER_LEN,
      borderColor: ACCENT_GLOW,
      top: -1,
      right: -1,
      borderTopWidth: CORNER_THICK,
      borderRightWidth: CORNER_THICK,
      borderTopRightRadius: 8,
    },
    cornerBL: {
      position: 'absolute',
      width: CORNER_LEN,
      height: CORNER_LEN,
      borderColor: ACCENT_GLOW,
      bottom: -1,
      left: -1,
      borderBottomWidth: CORNER_THICK,
      borderLeftWidth: CORNER_THICK,
      borderBottomLeftRadius: 8,
    },
    cornerBR: {
      position: 'absolute',
      width: CORNER_LEN,
      height: CORNER_LEN,
      borderColor: ACCENT_GLOW,
      bottom: -1,
      right: -1,
      borderBottomWidth: CORNER_THICK,
      borderRightWidth: CORNER_THICK,
      borderBottomRightRadius: 8,
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: S.sm,
      paddingBottom: S.md,
      paddingHorizontal: S.lg,
      zIndex: 10,
    },
    headerGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    headerTitle: {
      fontSize: Math.round(F.status * 0.85),
      fontWeight: '800',
      color: '#F8FAFC',
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      marginTop: S.sm,
      lineHeight: 22,
      color: 'rgba(248, 250, 252, 0.72)',
      maxWidth: 320,
    },
    scannerContainer: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      alignItems: 'center',
      transform: [{ translateY: -(cardHeight / 2) }],
    },
    cardFrame: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: 16,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    fakeCardContainer: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      alignItems: 'center',
      marginTop: cardHeight * 0.6,
    },
    fakeCard: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: 16,
      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
      padding: 20,
      justifyContent: 'space-between',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: { elevation: 6 },
      }),
    },
    fakeCardChip: {
      width: 48,
      height: 36,
      borderRadius: 6,
      backgroundColor: isDark ? '#FCD34D' : '#D97706',
      opacity: 0.8,
    },
    fakeCardNumber: {
      fontWeight: '600',
      letterSpacing: 2,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    fakeCardNumberScanned: {
      color: '#F8FAFC',
    },
    fakeCardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    fakeCardLabel: {
      color: isDark ? '#64748B' : '#94A3B8',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    fakeCardValue: {
      fontWeight: '600',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    fakeCardValueScanned: {
      color: '#F8FAFC',
    },
    guideTextContainer: {
      position: 'absolute',
      bottom: S.lg + 80,
      left: S.lg,
      right: S.lg,
      alignItems: 'center',
    },
    guideText: {
      lineHeight: 22,
      color: 'rgba(248, 250, 252, 0.85)',
      textAlign: 'center',
    },
    scanningIndicator: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -25,
      marginTop: -25,
    },
    scanButtonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: S.lg,
      paddingBottom: Math.max(S.lg, 20),
      alignItems: 'center',
    },
    scanButton: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      height: 60,
      width: '100%',
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: C.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    scanButtonDisabled: {
      opacity: 0.55,
    },
    scanButtonText: {
      color: '#fff',
      fontWeight: '800',
    },
    footerRow: {
      flexDirection: 'row',
    },
    footerPrimaryBtn: {
      flex: 1,
    },
    primaryBtn: {
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      height: 60,
      flex: 1,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: C.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    primaryBtnDisabled: {
      opacity: 0.55,
    },
    primaryBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: F.secondary - 1,
    },
    pressed: {
      opacity: 0.9,
    },
    permissionOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    permissionSheet: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: S.md,
      paddingHorizontal: S.md,
      paddingBottom: Math.max(S.lg, safeInsets.bottom + S.md),
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
        },
        android: { elevation: 16 },
      }),
    },
    permissionSheetHeader: {
      alignItems: 'center',
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 0.5)',
      marginBottom: S.sm,
    },
    permissionSheetTitle: {
      fontWeight: '800',
      color: C.text,
    },
    permissionCancelBtn: {
      backgroundColor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(241, 245, 249, 0.8)',
      borderRadius: 14,
      paddingVertical: S.md,
      alignItems: 'center',
      marginBottom: S.sm,
    },
    permissionCancelText: {
      fontWeight: '800',
      color: C.text,
    },
    permissionActionBtn: {
      backgroundColor: C.primary,
      borderRadius: 14,
      paddingVertical: S.md,
      alignItems: 'center',
      marginBottom: S.sm,
    },
    permissionActionText: {
      fontWeight: '800',
      color: '#fff',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      flex: 1,
      overflow: 'hidden',
    },
  });

  const formatCardNumber = (num: string) => {
    return num.replace(/(\d{4})/g, '$1 ').trim();
  };

  const extractCardData = useCallback((text: string) => {    
    // Extract card number - buscar 15-19 dígitos consecutivos
    const digitsOnly = text.replace(/\D/g, '');    
    let number = '';

    const cardPattern = /(\d{15,19})/g;
    const matches = digitsOnly.match(cardPattern);
    
    if (matches) {
      const sixteen = matches.find(m => m.length === 16);
      number = sixteen || matches.reduce((a, b) => a.length >= b.length ? a : b, '');
    }
    
    if (!number) {
      const groupPattern = /(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/;
      const groupMatch = text.match(groupPattern);
      if (groupMatch) {
        number = groupMatch.slice(1).join('');
      }
    }

    // Extract expiry date (MM/YY o MM-YY)
    const expiryMatch = text.match(/(0[1-9]|1[0-2])\s*[/-]\s*(\d{2,4})/);
    let expiryMonth = '';
    let expiryYear = '';
    if (expiryMatch) {
      expiryMonth = expiryMatch[1];
      const year = expiryMatch[2];
      expiryYear = year.length === 2 ? `20${year}` : year;
    }

    return { number, expiryMonth, expiryYear };
  }, []);

  const handleScan = useCallback(async () => {
    if (!cameraRef.current || scanning) return;

    setScanning(true);
    setGuideText(t(locale, 'receive.scanningCard'));

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (photo?.uri) {
        const result = await TextRecognition.recognize(photo.uri);
        const fullText = result.text;

        const cardData = extractCardData(fullText);

        if (cardData.number.length >= 15 && cardData.number.length <= 19) {
          onCardScanned(cardData);
          setGuideText(t(locale, 'receive.cardScannedSuccess'));
        } else {
          setGuideText(t(locale, 'receive.scanCardRetry'));
        }
      }
    } catch (error) {
      setGuideText(t(locale, 'receive.scanCardError'));
    } finally {
      setScanning(false);
    }
  }, [cameraRef, scanning, extractCardData, locale, onCardScanned]);

  const handleCancel = useCallback(() => {
    onCancel();
    onClose();
  }, [onCancel, onClose]);

  // Auto-scan effect: escanea automáticamente cada 2 segundos
  useEffect(() => {
    if (!permission?.granted || scanning || scannedCardData) return;
    
    const interval = setInterval(() => {
      void handleScan();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [permission?.granted, scanning, scannedCardData, handleScan]);

  if (!visible) return null;

  const permissionContent = !permission?.granted ? (
    <View style={styles.permissionOverlay}>
      <View style={styles.permissionSheet}>
        <View style={styles.permissionSheetHeader}>
          <Text style={[styles.permissionSheetTitle, { fontSize: Math.round(F.status * 0.65 * textScale) }]}>
            {t(locale, 'receive.cameraPermissionNeeded')}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.permissionActionBtn, pressed && { opacity: 0.9 }]}
          onPress={requestPermission}
        >
          <Text style={[styles.permissionActionText, { fontSize: Math.round(F.status * 0.65 * textScale) }]}>
            {t(locale, 'common.allow')}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.permissionCancelBtn, pressed && { opacity: 0.8 }]}
          onPress={handleCancel}
        >
          <Text style={[styles.permissionCancelText, { fontSize: Math.round(F.status * 0.65 * textScale) }]}>
            {t(locale, 'common.cancel')}
          </Text>
        </Pressable>
      </View>
    </View>
  ) : null;

  const scannerContent = permission?.granted ? (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
      />

      {/* Viñeta suave en bordes */}
      <LinearGradient
        colors={['rgba(2,6,23,0.55)', 'transparent', 'rgba(2,6,23,0.45)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Máscara con "agujero" central */}
      <View style={styles.maskColumn} pointerEvents="none">
        <View style={[styles.maskBand, { backgroundColor: mask }]} />
        <View style={{ flexDirection: "row", height: cardHeight }}>
          <View style={[styles.maskSide, { backgroundColor: mask }]} />
          <View style={{ width: cardWidth }} />
          <View style={[styles.maskSide, { backgroundColor: mask }]} />
        </View>
        <View style={[styles.maskBand, { backgroundColor: mask }]} />
      </View>

      {/* Marco minimalista */}
      <View style={styles.frameLayer} pointerEvents="none">
        <View style={[styles.frameBox, { width: cardWidth, height: cardHeight }]}>
          <View style={styles.frameBorder} />
        </View>
      </View>

      {/* Texto superior */}
      <View style={styles.headerOverlay} pointerEvents="none">
        <LinearGradient
          colors={['rgba(2,6,23,0.88)', 'rgba(2,6,23,0)']}
          style={styles.headerGradient}
        />
        <Text style={[styles.headerSubtitle, { fontSize: Math.round(F.status * 0.65 * textScale) }]} numberOfLines={2}>
          {t(locale, 'receive.cardScannerSubtitle')}
        </Text>
      </View>

      {/* Fake card preview - solo aparece después de escanear */}
      {scannedCardData && (
        <View style={styles.fakeCardContainer} pointerEvents="none">
          <View style={styles.fakeCard}>
            <View style={styles.fakeCardChip} />
            <Text style={[styles.fakeCardNumber, styles.fakeCardNumberScanned, { fontSize: Math.round(F.secondary * 0.9 * textScale) }]}>
              {formatCardNumber(scannedCardData.number)}
            </Text>
            <View style={styles.fakeCardRow}>
              <View>
                <Text style={[styles.fakeCardLabel, { fontSize: Math.round(F.status * 0.65 * textScale) }]}>{t(locale, 'receive.cardHolderLabel')}</Text>
                <Text style={[styles.fakeCardValue, styles.fakeCardValueScanned, { fontSize: Math.round(F.secondary * 0.8 * textScale) }]}>
                  {t(locale, 'receive.cardHolderPlaceholder')}
                </Text>
              </View>
              <View>
                <Text style={[styles.fakeCardLabel, { fontSize: Math.round(F.status * 0.65 * textScale) }]}>{t(locale, 'receive.cardExpiresLabel')}</Text>
                <Text style={[styles.fakeCardValue, styles.fakeCardValueScanned, { fontSize: Math.round(F.secondary * 0.8 * textScale) }]}>
                  {scannedCardData.expiryMonth}/{scannedCardData.expiryYear.slice(-2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {scanning && (
        <View style={styles.scanningIndicator}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      )}

      <View style={[styles.guideTextContainer, embedded && { top: '65%' }]} pointerEvents="none">
        <Text style={[styles.guideText, { fontSize: Math.round(F.status * 0.65 * textScale) }]}>
          {guideText}
        </Text>
      </View>

      {!embedded && (
        <View style={styles.scanButtonContainer}>
          <Pressable
            style={({ pressed }) => [styles.scanButton, pressed && { opacity: 0.9 }, scanning && styles.scanButtonDisabled]}
            onPress={handleScan}
            disabled={scanning || !!scannedCardData}
          >
            {scanning ? (
              <ActivityIndicator color="#fff" size={20} />
            ) : (
              <Text style={[styles.scanButtonText, { fontSize: Math.round(F.status * 0.65 * textScale) }]}>{t(locale, 'receive.scanCardButton')}</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  ) : null;

  if (!visible) return null;

  return permissionContent || scannerContent;
}
