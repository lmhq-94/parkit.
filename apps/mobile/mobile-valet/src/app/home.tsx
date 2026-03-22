import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Logo } from "@parkit/shared";
import type { ValetOperationalStatus } from "@parkit/shared";
import { clearAuthToken } from "@/lib/api";
import { useAuthStore, useLocaleStore, useCompanyStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import { useNearestParking } from "@/lib/useNearestParking";
import { LinearGradient } from "expo-linear-gradient";

/** Tonos por tile: modo claro (más profundos) vs oscuro (más vivos sobre fondo oscuro). */
function parkitTilePalette(isDark: boolean) {
  if (isDark) {
    return {
      receive: "#2563EB",
      return: "#F97316",
      reservation: "#2DD4BF",
      queue: "#818CF8",
      profile: "#C084FC",
      settings: "#64748B",
      workflow: "#06B6D4",
    };
  }
  return {
    receive: "#1D4ED8",
    return: "#C2410C",
    reservation: "#0D9488",
    queue: "#4338CA",
    profile: "#7C3AED",
    settings: "#334155",
    workflow: "#0E7490",
  };
}

const HEADER_RADIUS_BOTTOM = 22;
/** Tamaño del avatar en header (círculo perfecto: radio = mitad) */
const HEADER_AVATAR_SIZE = 48;
/** Grosor del anillo de estado alrededor del avatar (borde de color) */
const AVATAR_PRESENCE_RING = 3;

export default function HomeScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const setCompanyId = useCompanyStore((s) => s.setCompanyId);
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const { width, height } = useWindowDimensions();
  useValetProfileSync(user);
  const { nearest, status: locStatus } = useNearestParking(!!user);

  const isDriverUi = user?.valetStaffRole === "DRIVER";

  const styles = useMemo(
    () => createStyles(theme, Math.min(width, height)),
    [theme, width, height]
  );

  if (!user) {
    return <Redirect href="/login" />;
  }

  const C = theme.colors;
  const first = user.firstName?.trim() || user.email?.split("@")[0] || "—";
  const last = user.lastName?.trim() || "";
  const initials = `${(user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()}${(last[0] || "").toUpperCase()}`;
  const avatarUri = user.avatarUrl?.trim() || null;

  const statusKey = user.valetCurrentStatus;
  const statusLabel =
    statusKey === "AVAILABLE"
      ? t(locale, "home.statusAvailable")
      : statusKey === "BUSY"
        ? t(locale, "home.statusBusy")
        : statusKey === "AWAY"
          ? t(locale, "home.statusAway")
          : t(locale, "home.statusSyncing");

  const avatarPresenceColor = avatarPresenceRingColor(theme, statusKey);

  const handleLogout = () => {
    Alert.alert(
      t(locale, "tickets.logoutConfirmTitle"),
      t(locale, "tickets.logoutConfirmMessage"),
      [
        { text: t(locale, "common.cancel"), style: "cancel" },
        {
          text: t(locale, "tickets.logout"),
          style: "destructive",
          onPress: async () => {
            await clearAuthToken();
            setCompanyId(null);
            setUser(null);
            router.replace("/login");
          },
        },
      ]
    );
  };

  const headerMaxH = Math.min(240, height * 0.32);

  const headerGradientSpec = theme.isDark
    ? ({
        colors: ["#1E293B", "#0F172A", "#020617"] as const,
        locations: [0, 0.55, 1] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      } as const)
    : ({
        /** Claro: gris azulado premium (neutro frío, casi sin saturación — estilo producto 2024+) */
        colors: ["#D5DDE8", "#E6EBF2", "#F4F6F9"] as const,
        locations: [0, 0.42, 1] as const,
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0.88 },
      } as const);

  const headerTextPrimary = theme.isDark ? C.text : "#0F172A";
  const headerTextMuted = theme.isDark ? C.textMuted : "#475569";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.mainColumn}>
        <LinearGradient
          colors={[...headerGradientSpec.colors]}
          locations={[...headerGradientSpec.locations]}
          start={headerGradientSpec.start}
          end={headerGradientSpec.end}
          style={[styles.heroPlain, { maxHeight: headerMaxH }]}
        >
          <View style={styles.heroToolbarWrap}>
            <View style={styles.heroToolbar}>
              <Logo
                size={46}
                variant={theme.isDark ? "onDark" : "onLight"}
                style={styles.heroLogo}
              />
              <View style={styles.headerUserBlock}>
                <View style={styles.headerGreetingRow}>
                  <View style={styles.headerGreetingCol}>
                    <Text
                      style={[styles.heroGreeting, { color: headerTextMuted }]}
                      maxFontSizeMultiplier={2}
                    >
                      {t(locale, "home.hello")}{" "}
                      <Text style={[styles.heroGreetingName, { color: headerTextPrimary }]}>{first}</Text>
                    </Text>
                    <Text
                      style={[styles.headerRoleBelow, { color: headerTextPrimary }]}
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.5}
                    >
                      {isDriverUi ? t(locale, "home.titleDriver") : t(locale, "home.titleReception")}
                    </Text>
                  </View>
                  <View
                    style={[styles.avatarPresenceOuter, { borderColor: avatarPresenceColor }]}
                    accessibilityLabel={`${t(locale, "home.profile")} — ${statusLabel}`}
                  >
                    <View
                      style={[
                        styles.headerAvatarInner,
                        { backgroundColor: theme.isDark ? C.card : "#FFFFFF" },
                      ]}
                    >
                      {avatarUri ? (
                        <Image
                          source={{ uri: avatarUri }}
                          style={styles.headerAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text
                          style={[styles.headerAvatarInitials, { color: headerTextPrimary }]}
                          maxFontSizeMultiplier={2}
                        >
                          {initials}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.gridFlex}>
          {isDriverUi ? (
            <>
              <View style={styles.gridRowFill}>
                <GridTile
                  variant="queue"
                  icon="list-outline"
                  title={t(locale, "home.actionQueue")}
                  sub={t(locale, "home.actionQueueSub")}
                  onPress={() => router.push("/tickets")}
                  styles={styles}
                  C={C}
                />
                <GridTile
                  variant="profile"
                  icon="person-circle-outline"
                  title={t(locale, "home.profile")}
                  sub={t(locale, "home.actionProfileSub")}
                  onPress={() => router.push("/profile")}
                  styles={styles}
                  C={C}
                />
              </View>
              <View style={styles.gridRowFill}>
                <GridTile
                  variant="settings"
                  icon="settings-outline"
                  title={t(locale, "home.settings")}
                  sub={t(locale, "home.actionSettingsSub")}
                  onPress={() => router.push("/settings")}
                  styles={styles}
                  C={C}
                />
                <GridTile
                  variant="workflow"
                  icon="git-branch-outline"
                  title={t(locale, "home.actionWorkflow")}
                  sub={t(locale, "home.actionWorkflowSub")}
                  onPress={() => router.push("/workflow")}
                  styles={styles}
                  C={C}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.gridRowFill}>
                <GridTile
                  variant="accent"
                  icon="add-circle-outline"
                  title={t(locale, "home.actionReceive")}
                  sub={t(locale, "home.actionReceiveSub")}
                  onPress={() => router.push("/receive")}
                  styles={styles}
                  C={C}
                />
                <GridTile
                  variant="warm"
                  icon="arrow-undo-outline"
                  title={t(locale, "home.actionReturn")}
                  sub={t(locale, "home.actionReturnSub")}
                  onPress={() => router.push("/return-pickup")}
                  styles={styles}
                  C={C}
                />
              </View>
              <View style={styles.gridRowFill}>
                <GridTile
                  variant="booking"
                  icon="calendar-outline"
                  title={t(locale, "home.actionReservation")}
                  sub={t(locale, "home.actionReservationSub")}
                  onPress={() => router.push("/receive?flow=reservation")}
                  styles={styles}
                  C={C}
                />
                <GridTile
                  variant="workflow"
                  icon="git-branch-outline"
                  title={t(locale, "home.actionWorkflow")}
                  sub={t(locale, "home.actionWorkflowSub")}
                  onPress={() => router.push("/workflow")}
                  styles={styles}
                  C={C}
                />
              </View>
              <View style={styles.gridRowFill}>
                <GridTile
                  variant="profile"
                  icon="person-circle-outline"
                  title={t(locale, "home.profile")}
                  sub={t(locale, "home.actionProfileSub")}
                  onPress={() => router.push("/profile")}
                  styles={styles}
                  C={C}
                />
                <GridTile
                  variant="settings"
                  icon="settings-outline"
                  title={t(locale, "home.settings")}
                  sub={t(locale, "home.actionSettingsSub")}
                  onPress={() => router.push("/settings")}
                  styles={styles}
                  C={C}
                />
              </View>
            </>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutRow, pressed && styles.pressed]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel={t(locale, "tickets.logout")}
        >
          <Ionicons name="log-out-outline" size={22} color={C.logout} />
          <Text style={[styles.logoutText, { color: C.logout }]} maxFontSizeMultiplier={2}>
            {t(locale, "tickets.logout")}
          </Text>
        </Pressable>

        <View style={styles.bottomCard}>
          <View style={styles.bottomCardInner}>
            <View style={styles.bottomIconWrap}>
              <Ionicons name="navigate-circle" size={26} color={C.primary} />
            </View>
            <View style={styles.bottomTextCol}>
              <Text style={styles.bottomTitle}>{t(locale, "home.nearestTitle")}</Text>
              {locStatus === "loading" && (
                <View style={styles.bottomLoadingRow}>
                  <ActivityIndicator size="small" color={C.primary} />
                  <Text style={styles.bottomMeta}>{t(locale, "home.nearestLoading")}</Text>
                </View>
              )}
              {locStatus === "denied" && (
                <Text style={styles.bottomMeta}>{t(locale, "home.nearestDenied")}</Text>
              )}
              {locStatus === "unavailable" && (
                <Text style={styles.bottomMeta}>{t(locale, "home.nearestNoCoords")}</Text>
              )}
              {locStatus === "ready" && nearest && (
                <>
                  <Text style={styles.bottomName} numberOfLines={2}>
                    {nearest.parking.name}
                  </Text>
                  {nearest.parking.company && (
                    <Text style={styles.bottomCompany} numberOfLines={1}>
                      {t(locale, "home.nearestCompany", {
                        name:
                          nearest.parking.company.commercialName?.trim() ||
                          nearest.parking.company.legalName?.trim() ||
                          "—",
                      })}
                    </Text>
                  )}
                  <Text style={styles.bottomMeta}>
                    {t(locale, "home.nearestKm", {
                      km:
                        nearest.distanceKm < 10
                          ? nearest.distanceKm.toFixed(1)
                          : String(Math.round(nearest.distanceKm)),
                    })}
                  </Text>
                  <Text style={styles.bottomAddr} numberOfLines={2}>
                    {nearest.parking.address}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/** Anillo de presencia en el avatar (estilo apps modernas): verde disponible, rojo ocupado, etc. */
function avatarPresenceRingColor(
  theme: ReturnType<typeof useValetTheme>,
  status: ValetOperationalStatus | null | undefined
): string {
  if (status === "AVAILABLE") {
    return "#34D399"; // verde claro brillante (emerald-400)
  }
  if (status === "BUSY") {
    return "#EF4444"; // rojo (red-500)
  }
  if (status === "AWAY") {
    return theme.isDark ? "#94A3B8" : "#64748B";
  }
  return "#60A5FA"; // sincronizando / desconocido — azul (sky-400)
}

type GridVariant = "accent" | "warm" | "queue" | "booking" | "profile" | "settings" | "workflow";

const TILE_ICON_SIZE = 30;

function GridTile(props: {
  variant: GridVariant;
  icon: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  iconColor?: string;
  title: string;
  sub: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  C: { primary: string; text: string };
}) {
  const { variant, icon, iconSize = TILE_ICON_SIZE, title, sub, onPress, styles } = props;
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        variant === "accent" && styles.tileAccent,
        variant === "warm" && styles.tileWarm,
        variant === "queue" && styles.tileQueue,
        variant === "booking" && styles.tileBooking,
        variant === "profile" && styles.tileProfile,
        variant === "settings" && styles.tileSettings,
        variant === "workflow" && styles.tileWorkflow,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.tileIconWrap,
          variant === "queue" && styles.tileIconQueue,
          variant === "booking" && styles.tileIconBooking,
          variant === "profile" && styles.tileIconProfile,
          variant === "settings" && styles.tileIconSettings,
          variant === "workflow" && styles.tileIconWorkflow,
        ]}
      >
        <Ionicons name={icon} size={iconSize} color="#fff" />
      </View>
      <Text
        style={[
          styles.tileTitle,
          styles.tileTitleLight,
          {
            fontFamily: "CalSans",
          },
        ]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.75}
      >
        {title}
      </Text>
      <Text style={[styles.tileSub, styles.tileSubLight]} numberOfLines={2} maxFontSizeMultiplier={1.65}>
        {sub}
      </Text>
    </Pressable>
  );
}

type Theme = ReturnType<typeof useValetTheme>;

function createStyles(theme: Theme, shortestSide: number) {
  const C = theme.colors;
  const S = theme.space;
  const F = ticketsA11y.font;
  const R = theme.radius;
  const compact = shortestSide < 380;
  const P = parkitTilePalette(theme.isDark);

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    mainColumn: {
      flex: 1,
      minHeight: 0,
    },
    heroPlain: {
      paddingHorizontal: S.lg,
      paddingTop: S.md,
      paddingBottom: S.md + 2,
      overflow: "hidden",
      borderBottomLeftRadius: HEADER_RADIUS_BOTTOM,
      borderBottomRightRadius: HEADER_RADIUS_BOTTOM,
      ...Platform.select({
        ios: {
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: theme.isDark ? 0.35 : 0.08,
          shadowRadius: 16,
        },
        android: { elevation: theme.isDark ? 6 : 3 },
      }),
    },
    heroToolbarWrap: {
      marginBottom: S.sm,
      width: "100%",
    },
    heroToolbar: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.md,
      minWidth: 0,
      width: "100%",
    },
    heroLogo: {
      opacity: 1,
      flexShrink: 0,
    },
    /** Bloque derecho: fila alineada a la derecha [avatar | saludo + puesto]. */
    headerUserBlock: {
      flex: 1,
      minWidth: 0,
      alignItems: "flex-end",
    },
    headerGreetingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      width: "100%",
      gap: S.md,
      flexWrap: "nowrap",
    },
    headerGreetingCol: {
      justifyContent: "center",
      gap: 3,
      alignItems: "flex-end",
      flexShrink: 1,
      maxWidth: "58%",
    },
    headerRoleBelow: {
      fontSize: compact ? 13 : 14,
      fontWeight: "800",
      fontFamily: "CalSans",
      textAlign: "right",
    },
    /** Contenedor exterior: el borde de color es el indicador de disponibilidad. */
    avatarPresenceOuter: {
      width: HEADER_AVATAR_SIZE + AVATAR_PRESENCE_RING * 2,
      height: HEADER_AVATAR_SIZE + AVATAR_PRESENCE_RING * 2,
      borderRadius: (HEADER_AVATAR_SIZE + AVATAR_PRESENCE_RING * 2) / 2,
      borderWidth: AVATAR_PRESENCE_RING,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 3,
        },
        android: { elevation: 2 },
      }),
    },
    headerAvatarInner: {
      width: HEADER_AVATAR_SIZE,
      height: HEADER_AVATAR_SIZE,
      borderRadius: HEADER_AVATAR_SIZE / 2,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    /** Medidas explícitas: en algunos dispositivos % dentro del círculo no pinta la imagen. */
    headerAvatarImage: {
      width: HEADER_AVATAR_SIZE,
      height: HEADER_AVATAR_SIZE,
    },
    headerAvatarInitials: {
      fontSize: 15,
      fontWeight: "800",
    },
    heroGreeting: {
      fontSize: compact ? 12 : 13,
      fontWeight: "600",
      textAlign: "right",
    },
    heroGreetingName: {
      fontWeight: "800",
    },
    gridFlex: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: S.lg,
      paddingTop: S.sm,
      paddingBottom: S.sm,
      gap: S.sm,
    },
    gridRowFill: {
      flex: 1,
      minHeight: 0,
      flexDirection: "row",
      alignItems: "stretch",
      gap: S.sm,
    },
    logoutRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
      paddingVertical: S.md,
      paddingHorizontal: S.lg,
      marginBottom: S.xs,
    },
    logoutText: {
      fontSize: F.secondary,
      fontWeight: "800",
    },
    tile: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      borderRadius: R.card + 4,
      borderWidth: 2,
      paddingVertical: S.md + 2,
      paddingHorizontal: S.sm + 2,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: theme.isDark ? 0.35 : 0.12,
          shadowRadius: 10,
        },
        android: { elevation: theme.isDark ? 5 : 4 },
      }),
    },
    tileAccent: {
      backgroundColor: P.receive,
      borderColor: P.receive,
    },
    tileWarm: {
      backgroundColor: P.return,
      borderColor: P.return,
    },
    tileQueue: {
      backgroundColor: P.queue,
      borderColor: P.queue,
    },
    tileBooking: {
      backgroundColor: P.reservation,
      borderColor: P.reservation,
    },
    tileProfile: {
      backgroundColor: P.profile,
      borderColor: P.profile,
    },
    tileSettings: {
      backgroundColor: P.settings,
      borderColor: P.settings,
    },
    tileWorkflow: {
      backgroundColor: P.workflow,
      borderColor: P.workflow,
    },
    tileIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: S.sm + 2,
      alignSelf: "center",
    },
    tileIconQueue: {
      backgroundColor: "rgba(255,255,255,0.22)",
    },
    tileIconBooking: {
      backgroundColor: "rgba(255,255,255,0.22)",
    },
    tileIconProfile: {
      backgroundColor: "rgba(255,255,255,0.22)",
    },
    tileIconSettings: {
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    tileIconWorkflow: {
      backgroundColor: "rgba(255,255,255,0.22)",
    },
    tileTitle: {
      fontSize: compact ? F.secondary + 2 : F.body,
      fontWeight: "800",
      color: C.text,
      marginBottom: 4,
      textAlign: "center",
      width: "100%",
    },
    tileTitleLight: {
      color: "#fff",
    },
    tileSub: {
      fontSize: compact ? 12 : 13,
      fontWeight: "600",
      color: C.textMuted,
      lineHeight: compact ? 16 : 18,
      textAlign: "center",
      width: "100%",
    },
    tileSubLight: {
      color: "rgba(255,255,255,0.9)",
    },
    pressed: {
      opacity: 0.93,
      transform: [{ scale: 0.988 }],
    },
    bottomCard: {
      paddingHorizontal: S.lg,
      paddingBottom: S.sm,
      paddingTop: S.xs,
    },
    bottomCardInner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: S.md,
      backgroundColor: C.card,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.border,
      padding: S.md,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
      }),
    },
    bottomIconWrap: {
      marginTop: 2,
    },
    bottomTextCol: {
      flex: 1,
      minWidth: 0,
    },
    bottomTitle: {
      fontSize: 11,
      fontWeight: "800",
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    bottomName: {
      fontSize: F.secondary - 1,
      fontWeight: "800",
      color: C.text,
    },
    bottomCompany: {
      fontSize: 11,
      fontWeight: "600",
      color: C.textMuted,
      marginTop: 2,
    },
    bottomMeta: {
      fontSize: 12,
      fontWeight: "700",
      color: C.primary,
      marginTop: 2,
    },
    bottomAddr: {
      fontSize: 11,
      color: C.textSubtle,
      marginTop: 4,
      lineHeight: 16,
    },
    bottomLoadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
  });
}
