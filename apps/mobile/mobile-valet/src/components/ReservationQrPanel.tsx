import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  ActivityIndicator,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { Locale } from "@parkit/shared";
import { t } from "@/lib/i18n";
import type { useValetTheme } from "@/theme/valetTheme";

type Theme = ReturnType<typeof useValetTheme>;

type Props = {
  locale: Locale;
  theme: Theme;
  styles: ReturnType<typeof createQrStyles>;
  /** Llamado con el texto crudo del QR (id de reserva, URL, etc.). */
  onBarcodeScanned: (data: string) => void;
  /** Si true, deja de escuchar nuevos códigos (p. ej. reserva ya validada). */
  pauseAfterScan?: boolean;
  /** UI de escáner a pantalla con máscara y animaciones. */
  variant?: "default" | "premium";
  /** Mientras se valida el código en servidor. */
  validating?: boolean;
};

const CORNER_LEN = 28;
const CORNER_THICK = 3;
const ACCENT_GLOW = "rgba(56, 189, 248, 0.95)";
const ACCENT_SOFT = "rgba(56, 189, 248, 0.35)";

/**
 * Vista previa de cámara + escaneo QR para enlazar una reserva (flujo valet).
 * En web solo se muestra aviso: usar otro dispositivo.
 */
export function ReservationQrPanel({
  locale,
  theme,
  styles,
  onBarcodeScanned,
  pauseAfterScan,
  variant = "default",
  validating = false,
}: Props) {
  const { width: winW, height: winH } = useWindowDimensions();
  const safeInsets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);
  /**
   * Android / expo-camera: si `onBarcodeScanned` activa el analizador antes de que
   * `barcodeScannerSettings` quede aplicado en nativo, el BarcodeAnalyzer se crea con
   * formatos vacíos y no se vuelve a construir al actualizar solo los settings.
   * Retrasar el callback un par de frames asegura QR en la primera sesión.
   */
  const [androidBarcodeReady, setAndroidBarcodeReady] = useState(Platform.OS !== "android");

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }
    if (!permission?.granted) {
      setAndroidBarcodeReady(false);
      return;
    }
    setAndroidBarcodeReady(false);
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) {
          setAndroidBarcodeReady(true);
        }
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [permission?.granted]);

  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (variant !== "premium" || pauseAfterScan) return;
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
  }, [variant, pauseAfterScan, scanLineAnim]);

  useEffect(() => {
    if (variant !== "premium") return;
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
  }, [variant, pulseAnim]);

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (pauseAfterScan || handledRef.current) return;
      const trimmed = data?.trim();
      if (!trimmed) return;
      handledRef.current = true;
      onBarcodeScanned(trimmed);
      setTimeout(() => {
        handledRef.current = false;
      }, 2000);
    },
    [onBarcodeScanned, pauseAfterScan]
  );

  const scanningActive =
    !pauseAfterScan &&
    !validating &&
    (Platform.OS !== "android" || androidBarcodeReady);

  if (Platform.OS === "web") {
    return (
      <View style={styles.webFallback}>
        <Ionicons name="qr-code-outline" size={40} color={theme.colors.textMuted} />
        <Text style={styles.webFallbackText}>{t(locale, "receive.qrWebHint")}</Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.permissionBox, variant === "premium" && styles.permissionBoxPremium]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    if (variant === "premium") {
      return (
        <View style={[styles.permissionBox, styles.permissionBoxPremium]}>
          <View style={styles.permissionIconWrap}>
            <LinearGradient
              colors={[ACCENT_SOFT, "rgba(59, 130, 246, 0.15)"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Ionicons name="camera-outline" size={36} color={ACCENT_GLOW} />
          </View>
          <Text style={styles.permissionTitle}>{t(locale, "receive.qrPermissionTitle")}</Text>
          <Text style={styles.permissionText}>{t(locale, "receive.qrPermissionExplain")}</Text>
          <Pressable
            style={({ pressed }) => [styles.permissionBtn, pressed && { opacity: 0.92 }]}
            onPress={() => void requestPermission()}
          >
            <LinearGradient
              colors={["#38BDF8", "#3B82F6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.permissionBtnText}>{t(locale, "receive.qrAllowCamera")}</Text>
          </Pressable>
          <Pressable onPress={() => void Linking.openSettings()} style={styles.settingsLink}>
            <Text style={styles.settingsLinkText}>{t(locale, "receive.qrOpenSettings")}</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionText}>{t(locale, "receive.qrPermissionExplain")}</Text>
        <Pressable
          style={({ pressed }) => [styles.permissionBtnLegacy, pressed && { opacity: 0.9 }]}
          onPress={() => void requestPermission()}
        >
          <Text style={styles.permissionBtnTextLegacy}>{t(locale, "receive.qrAllowCamera")}</Text>
        </Pressable>
        <Pressable onPress={() => void Linking.openSettings()} style={styles.settingsLink}>
          <Text style={styles.settingsLinkText}>{t(locale, "receive.qrOpenSettings")}</Text>
        </Pressable>
      </View>
    );
  }

  if (variant === "premium") {
    const frameW = Math.min(winW * 0.76, Math.min(300, winH * 0.42));
    const mask = "rgba(2, 6, 23, 0.72)";
    const lineTranslate = scanLineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [8, frameW - 16],
    });
    const cornerOpacity = pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.75, 1],
    });

    return (
      <View style={styles.premiumRoot}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={scanningActive ? handleBarCodeScanned : undefined}
        />

        {/* Viñeta suave en bordes */}
        <LinearGradient
          colors={["rgba(2,6,23,0.55)", "transparent", "rgba(2,6,23,0.45)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Máscara con “agujero” central */}
        <View style={styles.premiumMaskColumn} pointerEvents="none">
          <View style={[styles.premiumMaskBand, { backgroundColor: mask }]} />
          <View style={{ flexDirection: "row", height: frameW }}>
            <View style={[styles.premiumMaskSide, { backgroundColor: mask }]} />
            <View style={{ width: frameW }} />
            <View style={[styles.premiumMaskSide, { backgroundColor: mask }]} />
          </View>
          <View style={[styles.premiumMaskBand, { backgroundColor: mask }]} />
        </View>

        {/* Marco, esquinas y línea de escaneo */}
        <View style={styles.premiumFrameLayer} pointerEvents="none">
          <View style={[styles.premiumFrameBox, { width: frameW, height: frameW }]}>
            <Animated.View style={[styles.cornerTL, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerTR, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerBL, { opacity: cornerOpacity }]} />
            <Animated.View style={[styles.cornerBR, { opacity: cornerOpacity }]} />

            <LinearGradient
              colors={["transparent", ACCENT_GLOW, "transparent"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.premiumFrameHairline}
            />

            {!pauseAfterScan && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: lineTranslate }],
                  },
                ]}
              >
                <LinearGradient
                  colors={["transparent", "rgba(56, 189, 248, 0.9)", "transparent"]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            )}
          </View>
        </View>

        {/* Texto superior: compacto para no invadir el marco central del QR */}
        <View style={styles.premiumHeader} pointerEvents="none">
          <LinearGradient
            colors={["rgba(2,6,23,0.92)", "rgba(2,6,23,0)"]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <Text style={styles.premiumTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
            {t(locale, "receive.qrPremiumTitle")}
          </Text>
          <Text style={styles.premiumSubtitle} numberOfLines={2}>
            {t(locale, "receive.qrPremiumSubtitle")}
          </Text>
        </View>

        {validating && (
          <View
            style={[
              styles.validatingBottomStrip,
              { paddingBottom: Math.max(safeInsets.bottom, 12) },
            ]}
            pointerEvents="none"
          >
            <View style={styles.validatingCard}>
              <ActivityIndicator color={ACCENT_GLOW} size="small" />
              <Text style={styles.validatingText}>{t(locale, "receive.qrValidating")}</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.cameraWrap}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanningActive ? handleBarCodeScanned : undefined}
      />
      <View style={styles.cameraOverlay} pointerEvents="none">
        <View style={styles.cameraFrame} />
      </View>
    </View>
  );
}

export function createQrStyles(theme: Theme, layoutHeight?: number) {
  const C = theme.colors;
  const S = theme.space;
  const R = theme.radius;
  const F = 14;
  const headerMaxH = layoutHeight ? Math.round(layoutHeight * 0.24) : 130;

  const cornerBase = {
    position: "absolute" as const,
    width: CORNER_LEN,
    height: CORNER_LEN,
    borderColor: ACCENT_GLOW,
  };

  return StyleSheet.create({
    premiumRoot: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      alignSelf: "stretch",
      borderRadius: 0,
      overflow: "hidden",
      backgroundColor: "#020617",
    },
    premiumMaskColumn: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
    },
    premiumMaskBand: {
      flex: 1,
    },
    premiumMaskSide: {
      flex: 1,
    },
    premiumFrameLayer: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
    premiumFrameBox: {
      position: "relative",
    },
    premiumFrameHairline: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.45,
    },
    scanLine: {
      position: "absolute",
      left: 12,
      right: 12,
      height: 2,
      top: 0,
      overflow: "hidden",
    },
    cornerTL: {
      ...cornerBase,
      top: -2,
      left: -2,
      borderTopWidth: CORNER_THICK,
      borderLeftWidth: CORNER_THICK,
    },
    cornerTR: {
      ...cornerBase,
      top: -2,
      right: -2,
      borderTopWidth: CORNER_THICK,
      borderRightWidth: CORNER_THICK,
    },
    cornerBL: {
      ...cornerBase,
      bottom: -2,
      left: -2,
      borderBottomWidth: CORNER_THICK,
      borderLeftWidth: CORNER_THICK,
    },
    cornerBR: {
      ...cornerBase,
      bottom: -2,
      right: -2,
      borderBottomWidth: CORNER_THICK,
      borderRightWidth: CORNER_THICK,
    },
    premiumHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      paddingTop: S.sm,
      paddingBottom: S.md,
      paddingHorizontal: S.lg,
      maxHeight: headerMaxH,
    },
    premiumKicker: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2,
      color: "rgba(56, 189, 248, 0.85)",
      textTransform: "uppercase",
      marginBottom: S.xs,
    },
    premiumTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: "#F8FAFC",
      letterSpacing: -0.5,
    },
    premiumSubtitle: {
      marginTop: S.sm,
      fontSize: F,
      lineHeight: 22,
      color: "rgba(248, 250, 252, 0.72)",
      maxWidth: 320,
    },
    validatingBottomStrip: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: S.lg,
      paddingTop: S.md,
      alignItems: "center",
      justifyContent: "flex-end",
    },
    validatingCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.md,
      paddingVertical: S.md,
      paddingHorizontal: S.lg,
      borderRadius: 16,
      backgroundColor: "rgba(15, 23, 42, 0.92)",
      borderWidth: 1,
      borderColor: "rgba(56, 189, 248, 0.35)",
      maxWidth: "100%",
    },
    validatingText: {
      flexShrink: 1,
      fontSize: F,
      fontWeight: "600",
      color: "#E2E8F0",
    },
    permissionBoxPremium: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      alignSelf: "stretch",
      borderRadius: 0,
      borderWidth: 0,
      backgroundColor: "rgba(15, 23, 42, 0.6)",
    },
    permissionIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 36,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: S.sm,
    },
    permissionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: C.text,
      textAlign: "center",
      marginBottom: S.sm,
    },
    cameraWrap: {
      borderRadius: R.card,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: C.border,
      backgroundColor: C.bg,
      minHeight: 260,
      maxHeight: 320,
      position: "relative",
    },
    camera: { flex: 1, minHeight: 260 },
    cameraOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
    },
    cameraFrame: {
      width: "72%",
      aspectRatio: 1,
      maxWidth: 240,
      borderRadius: 12,
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.85)",
      backgroundColor: "transparent",
    },
    webFallback: {
      minHeight: 160,
      borderRadius: R.card,
      borderWidth: 2,
      borderColor: C.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      padding: S.lg,
      gap: S.md,
      backgroundColor: theme.isDark ? "rgba(148,163,184,0.08)" : "rgba(148,163,184,0.12)",
    },
    webFallbackText: {
      fontSize: F,
      color: C.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },
    permissionBox: {
      minHeight: 200,
      borderRadius: R.card,
      borderWidth: 2,
      borderColor: C.border,
      padding: S.lg,
      alignItems: "center",
      justifyContent: "center",
      gap: S.md,
    },
    permissionText: {
      fontSize: F,
      color: C.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },
    permissionBtn: {
      position: "relative",
      paddingVertical: S.md,
      paddingHorizontal: S.xl,
      borderRadius: R.button,
      overflow: "hidden",
      minWidth: 200,
      alignItems: "center",
    },
    permissionBtnText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: F,
    },
    settingsLink: { paddingVertical: S.sm },
    settingsLinkText: { fontSize: F - 1, fontWeight: "600", color: C.primary },
    permissionBtnLegacy: {
      backgroundColor: C.primary,
      paddingVertical: S.md,
      paddingHorizontal: S.xl,
      borderRadius: R.button,
    },
    permissionBtnTextLegacy: {
      color: "#fff",
      fontWeight: "800",
      fontSize: F,
    },
  });
}
