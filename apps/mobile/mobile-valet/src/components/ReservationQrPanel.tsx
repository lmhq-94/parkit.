import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useCallback, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import type { Locale } from "@/lib/i18n";
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
};

/**
 * Vista previa de cámara + escaneo QR para enlazar una reserva (flujo valet).
 * En web solo se muestra aviso: usar entrada manual.
 */
export function ReservationQrPanel({
  locale,
  theme,
  styles,
  onBarcodeScanned,
  pauseAfterScan,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);

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
      <View style={styles.permissionBox}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionText}>{t(locale, "receive.qrPermissionExplain")}</Text>
        <Pressable
          style={({ pressed }) => [styles.permissionBtn, pressed && { opacity: 0.9 }]}
          onPress={() => void requestPermission()}
        >
          <Text style={styles.permissionBtnText}>{t(locale, "receive.qrAllowCamera")}</Text>
        </Pressable>
        <Pressable onPress={() => void Linking.openSettings()} style={styles.settingsLink}>
          <Text style={styles.settingsLinkText}>{t(locale, "receive.qrOpenSettings")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.cameraWrap}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerEnabled={!pauseAfterScan}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={pauseAfterScan ? undefined : handleBarCodeScanned}
      />
      <View style={styles.cameraOverlay} pointerEvents="none">
        <View style={styles.cameraFrame} />
      </View>
    </View>
  );
}

export function createQrStyles(theme: Theme) {
  const C = theme.colors;
  const S = theme.space;
  const R = theme.radius;
  const F = 14;

  return StyleSheet.create({
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
      backgroundColor: C.primary,
      paddingVertical: S.md,
      paddingHorizontal: S.xl,
      borderRadius: R.button,
    },
    permissionBtnText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: F,
    },
    settingsLink: { paddingVertical: S.sm },
    settingsLinkText: { fontSize: F - 1, fontWeight: "600", color: C.primary },
  });
}
