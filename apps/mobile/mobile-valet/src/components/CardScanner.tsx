import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { t } from '@/lib/i18n';
import type { Locale } from '@parkit/shared';
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

const CORNER_LEN = 28;
const CORNER_THICK = 3;
const ACCENT_GLOW = 'rgba(56, 189, 248, 0.95)';
const ACCENT_SOFT = 'rgba(56, 189, 248, 0.35)';

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
  const [guideText, setGuideText] = useState(t(locale, 'receive.scanCardGuide'));
  const cameraRef = useRef<CameraView>(null);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const lineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    lineLoop.start();
    return () => lineLoop.stop();
  }, [scanLineAnim]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const cardWidth = Math.min(winW * 0.85, 320);
  const cardHeight = cardWidth * 0.63;
  const mask = 'rgba(2, 6, 23, 0.72)';
  const lineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, cardHeight - 16],
  });
  const cornerOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.75, 1],
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#020617',
    },
    camera: {
      ...StyleSheet.absoluteFillObject,
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
      width: cardWidth,
      height: cardHeight,
      borderRadius: 16,
    },
    frameHairline: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: ACCENT_GLOW,
      opacity: 0.45,
    },
    scanLine: {
      position: 'absolute',
      left: 12,
      right: 12,
      height: 2,
      top: 0,
      overflow: 'hidden',
    },
    cornerTL: {
      position: 'absolute',
      top: -2,
      left: -2,
      width: CORNER_LEN,
      height: CORNER_LEN,
      borderTopWidth: CORNER_THICK,
      borderLeftWidth: CORNER_THICK,
      borderColor: ACCENT_GLOW,
    },
    cornerTR: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: CORNER_LEN,
      height: CORNER_LEN,
      borderTopWidth: CORNER_THICK,
      borderRightWidth: CORNER_THICK,
      borderColor: ACCENT_GLOW,
    },
    cornerBL: {
      position: 'absolute',
      bottom: -2,
      left: -2,
      width: CORNER_LEN,
      height: CORNER_LEN,
      borderBottomWidth: CORNER_THICK,
      borderLeftWidth: CORNER_THICK,
      borderColor: ACCENT_GLOW,
    },
    cornerBR: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: CORNER_LEN,
      height: CORNER_LEN,
      borderBottomWidth: CORNER_THICK,
      borderRightWidth: CORNER_THICK,
      borderColor: ACCENT_GLOW,
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
    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(248, 250, 252, 0.12)' : 'rgba(15, 23, 42, 0.07)',
      borderWidth: 2,
      borderColor: C.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraArea: {
      flex: 1,
      backgroundColor: '#020617',
    },
    guideTextTop: {
      position: 'absolute',
      top: S.lg,
      left: S.lg,
      right: S.lg,
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
    footerContainer: {
      paddingHorizontal: S.lg,
      paddingTop: S.md,
      paddingBottom: Math.max(safeInsets.bottom, 20),
      backgroundColor: C.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: C.border,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.primary,
      borderRadius: 14,
      paddingVertical: S.md,
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
      fontSize: 20,
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

  const extractCardData = useCallback((text: string) => {
    // Extract card number (16 digits with or without spaces)
    const cardNumberMatch = text.match(/(\d{4}\s?){4}/);
    const number = cardNumberMatch ? cardNumberMatch[0].replace(/\s/g, '') : '';

    // Extract expiry date (MM/YY or MM/YYYY)
    const expiryMatch = text.match(/(\d{2})\s*[/-]\s*(\d{2,4})/);
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

        if (cardData.number.length === 16) {
          onCardScanned(cardData);
        } else {
          setGuideText(t(locale, 'receive.scanCardRetry'));
        }
      }
    } catch (error) {
      setGuideText(t(locale, 'receive.scanCardError'));
    } finally {
      setScanning(false);
    }
  }, [cameraRef, scanning, extractCardData, onCardScanned, locale]);

  if (!permission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionIconWrap}>
          <LinearGradient
            colors={[ACCENT_SOFT, 'rgba(59, 130, 246, 0.15)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Ionicons name="camera-outline" size={36} color={ACCENT_GLOW} />
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
            colors={['#38BDF8', '#3B82F6']}
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

        <Text style={styles.guideTextTop} pointerEvents="none">
          {guideText}
        </Text>

        <View style={styles.maskColumn} pointerEvents="none">
          <View style={[styles.maskBand, { backgroundColor: mask }]} />
          <View style={{ flexDirection: 'row', height: cardHeight }}>
            <View style={[styles.maskSide, { backgroundColor: mask }]} />
            <View style={{ width: cardWidth }} />
            <View style={[styles.maskSide, { backgroundColor: mask }]} />
          </View>
          <View style={[styles.maskBand, { backgroundColor: mask }]} />
        </View>

        <View style={styles.frameLayer} pointerEvents="none">
          <View style={styles.frameBox}>
            <Animated.View style={[styles.cornerTL, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerTR, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerBL, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerBR, { opacity: cornerOpacity }]} />

            <View style={styles.frameHairline} />

            {!scanning && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: lineTranslate }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(56, 189, 248, 0.9)', 'transparent']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            )}
          </View>
        </View>

        {scanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="large" color={ACCENT_GLOW} />
          </View>
        )}
      </View>

      <View style={styles.footerContainer}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, scanning && { opacity: 0.55 }, pressed && styles.pressed]}
          onPress={handleScan}
          disabled={scanning}
        >
          <Text style={styles.primaryBtnText}>
            {t(locale, 'receive.verifyCardButton')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
