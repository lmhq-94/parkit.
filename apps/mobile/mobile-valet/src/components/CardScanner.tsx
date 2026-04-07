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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';
import { StickyFormFooter } from '@/components/StickyFormFooter';
import { ValetBackButton } from '@/components/ValetBackButton';

interface CardScannerProps {
  locale: Locale;
  isDark: boolean;
  onCardScanned: (cardData: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
  }) => void;
  onCancel: () => void;
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
  };
  space: {
    sm: number;
    md: number;
    lg: number;
  };
}

export function CardScanner({
  locale,
  isDark,
  onCardScanned,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCancel,
  colors: C,
  fonts: F,
  space: S,
}: CardScannerProps) {
  const { width: winW } = useWindowDimensions();
  const safeInsets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scannedCardData, setScannedCardData] = useState<{ number: string; expiryMonth: string; expiryYear: string } | null>(null);
  const [guideText, setGuideText] = useState(t(locale, 'receive.scanCardGuide'));
  const cameraRef = useRef<CameraView>(null);

  const cardWidth = Math.min(winW * 0.92, 360);
  const cardHeight = cardWidth * 0.63;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
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
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    screenTitle: {
      fontSize: F.title - 2,
      fontWeight: '800',
      color: C.text,
      flex: 1,
      textAlign: 'center',
    },
    cameraArea: {
      flex: 1,
      backgroundColor: '#020617',
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: S.lg,
      paddingBottom: S.md,
      paddingHorizontal: S.lg,
      zIndex: 10,
    },
    headerGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    headerTitle: {
      fontSize: F.title,
      fontWeight: '800',
      color: '#F8FAFC',
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      marginTop: S.sm,
      fontSize: F.secondary,
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
      fontSize: 18,
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
      fontSize: Math.round(F.secondary * 0.65),
      color: isDark ? '#64748B' : '#94A3B8',
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    fakeCardValue: {
      fontSize: Math.round(F.secondary * 0.8),
      fontWeight: '600',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    fakeCardValueScanned: {
      color: '#F8FAFC',
    },
    guideTextContainer: {
      position: 'absolute',
      top: '58%',
      left: S.lg,
      right: S.lg,
      alignItems: 'center',
    },
    guideText: {
      fontSize: F.secondary,
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
      fontSize: F.button,
    },
    pressed: {
      opacity: 0.9,
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: S.lg,
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    },
    permissionIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: S.sm,
    },
    permissionTitle: {
      fontSize: F.body,
      fontWeight: '800',
      color: C.text,
      textAlign: 'center',
      marginBottom: S.sm,
    },
    permissionText: {
      fontSize: F.body,
      color: C.textMuted,
      textAlign: 'center',
      marginBottom: S.md,
      lineHeight: 22,
    },
    permissionBtn: {
      position: 'relative',
      paddingVertical: S.md,
      paddingHorizontal: S.lg * 2,
      borderRadius: 14,
      overflow: 'hidden',
      minWidth: 200,
      alignItems: 'center',
    },
    permissionBtnText: {
      color: '#fff',
      fontWeight: '800',
      fontSize: F.secondary,
    },
  });

  const formatCardNumber = (num: string) => {
    return num.replace(/(\d{4})/g, '$1 ').trim();
  };

  const extractCardData = useCallback((text: string) => {
    // Log para debuggear
    console.log('OCR Text:', text);
    
    // Extract card number - buscar 15-19 dígitos consecutivos
    // Limpiar todo excepto dígitos
    const digitsOnly = text.replace(/\D/g, '');
    console.log('Digits only:', digitsOnly);
    
    let number = '';
    
    // Buscar cualquier secuencia de 15-19 dígitos en los dígitos consecutivos
    const cardPattern = /(\d{15,19})/g;
    const matches = digitsOnly.match(cardPattern);
    
    if (matches) {
      // Preferir el que tenga 16 dígitos, o el más largo
      const sixteen = matches.find(m => m.length === 16);
      number = sixteen || matches.reduce((a, b) => a.length >= b.length ? a : b, '');
    }
    
    // Si no encontramos, buscar en el texto original por grupos de 4
    if (!number) {
      const groupPattern = /(\d{4})\s*(\d{4})\s*(\d{4})\s*(\d{4})/;
      const groupMatch = text.match(groupPattern);
      if (groupMatch) {
        number = groupMatch.slice(1).join('');
      }
    }
    
    console.log('Extracted number:', number, 'length:', number.length);

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

  const handleScan = useCallback(async (quality: number = 0.8) => {
    if (!cameraRef.current || scanning) return null;

    setScanning(true);
    setGuideText(t(locale, 'receive.scanningCard'));

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality,
        base64: true,
      });

      if (photo?.uri) {
        const result = await TextRecognition.recognize(photo.uri);
        const fullText = result.text;

        const cardData = extractCardData(fullText);

        if (cardData.number.length >= 15 && cardData.number.length <= 19) {
          setScannedCardData(cardData);
          setGuideText(t(locale, 'receive.cardScannedSuccess'));
          return cardData;
        } else {
          console.log('Card rejected, length:', cardData.number.length);
          setGuideText(t(locale, 'receive.scanCardRetry'));
          return null;
        }
      }
    } catch (error) {
      setGuideText(t(locale, 'receive.scanCardError'));
      return null;
    } finally {
      setScanning(false);
    }
  }, [cameraRef, scanning, extractCardData, locale]);

  const handleVerify = useCallback(() => {
    if (scannedCardData) {
      onCardScanned(scannedCardData);
    }
  }, [scannedCardData, onCardScanned]);

  // Auto-scan effect: escanea automáticamente cada 2 segundos
  useEffect(() => {
    if (!permission?.granted || scanning || scannedCardData) return;
    
    const interval = setInterval(() => {
      void handleScan();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [permission?.granted, scanning, scannedCardData, handleScan]);

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconWrap}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.35)', 'rgba(59, 130, 246, 0.15)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Ionicons name="camera-outline" size={36} color={C.primary} />
        </View>
        <Text style={styles.permissionTitle}>
          {t(locale, 'receive.cameraPermissionNeeded')}
        </Text>
        <Text style={styles.permissionText}>
          {t(locale, 'receive.qrPermissionExplain')}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.permissionBtn, pressed && { opacity: 0.92 }]}
          onPress={requestPermission}
        >
          <LinearGradient
            colors={[C.primary, C.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.permissionBtnText}>
            {t(locale, 'common.allow')}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.screenHeader, { paddingTop: safeInsets.top + S.md }]}>
        <ValetBackButton
          onPress={onCancel}
          accessibilityLabel={t(locale, 'common.back')}
        />
        <Text style={styles.screenTitle}>
          {t(locale, 'receive.wizardCardTitle')}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.cameraArea}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          mode="picture"
        />

        <LinearGradient
          colors={['rgba(2,6,23,0.55)', 'transparent', 'rgba(2,6,23,0.45)']}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Header con título y subtítulo */}
        <View style={styles.headerOverlay} pointerEvents="none">
          <LinearGradient
            colors={['rgba(2,6,23,0.92)', 'rgba(2,6,23,0)']}
            style={styles.headerGradient}
            pointerEvents="none"
          />
          <Text style={styles.headerTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            {t(locale, 'receive.cardScannerTitle')}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={2}>
            {t(locale, 'receive.cardScannerSubtitle')}
          </Text>
        </View>

        {/* Scanner frame - solo silueta de tarjeta */}
        <View style={styles.scannerContainer} pointerEvents="none">
          <View style={styles.cardFrame} />
        </View>

        {/* Fake card preview - solo aparece después de escanear */}
        {scannedCardData && (
          <View style={styles.fakeCardContainer} pointerEvents="none">
            <View style={styles.fakeCard}>
              <View style={styles.fakeCardChip} />
              <Text style={[styles.fakeCardNumber, styles.fakeCardNumberScanned]}>
                {formatCardNumber(scannedCardData.number)}
              </Text>
              <View style={styles.fakeCardRow}>
                <View>
                  <Text style={styles.fakeCardLabel}>Titular</Text>
                  <Text style={[styles.fakeCardValue, styles.fakeCardValueScanned]}>
                    NOMBRE APELLIDO
                  </Text>
                </View>
                <View>
                  <Text style={styles.fakeCardLabel}>Vence</Text>
                  <Text style={[styles.fakeCardValue, styles.fakeCardValueScanned]}>
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

        <View style={styles.guideTextContainer} pointerEvents="none">
          <Text style={styles.guideText}>
            {guideText}
          </Text>
        </View>
      </View>

      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.footerPrimaryBtn,
              (!scannedCardData || scanning) && styles.primaryBtnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleVerify}
            disabled={!scannedCardData || scanning}
            accessibilityLabel={t(locale, 'receive.verifyCardButton')}
          >
            <LinearGradient
              colors={[C.primary, C.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.primaryBtnText}>
              {t(locale, 'receive.verifyCardButton')}
            </Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    </View>
  );
}
