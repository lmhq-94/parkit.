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
  const displayName = [first, last].filter(Boolean).join(" ") || first;
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

  const statusVisual = statusPillStyle(theme, statusKey);

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

  const goProfile = () => router.push("/profile");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.mainColumn}>
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <Logo size={34} style={styles.heroLogo} />
            <View style={styles.heroMid}>
              <Text style={[styles.heroBrand, { color: C.textSubtle }]} numberOfLines={1}>
                Parkit Valet
              </Text>
              <Text style={[styles.heroNameLine, { color: C.text }]} numberOfLines={2}>
                {displayName}
              </Text>
              <View style={styles.heroBadges}>
                <View style={[styles.badge, styles.badgeRole, { borderColor: C.border, backgroundColor: C.card }]}>
                  <Text style={[styles.badgeText, { color: C.text }]}>
                    {isDriverUi ? t(locale, "home.titleDriver") : t(locale, "home.titleReception")}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    styles.badgeStatus,
                    { borderColor: statusVisual.border, backgroundColor: statusVisual.bg },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: statusVisual.fg }]}>{statusLabel}</Text>
                </View>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.heroProfileTap, pressed && styles.pressed]}
              onPress={goProfile}
              accessibilityRole="button"
              accessibilityLabel={t(locale, "home.profile")}
            >
              <View style={[styles.heroAvatar, { borderColor: C.border, backgroundColor: C.card }]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.heroAvatarImg} />
                ) : (
                  <Text style={[styles.heroAvatarInitials, { color: C.text }]}>{initials}</Text>
                )}
              </View>
              <Text style={[styles.heroProfileCta, { color: C.primary }]} numberOfLines={1}>
                {t(locale, "home.profile")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.gridFlex}>
          {isDriverUi ? (
            <View style={styles.gridRowFill}>
              <GridTile
                variant="queue"
                icon="list-outline"
                iconSize={36}
                title={t(locale, "home.actionQueue")}
                sub={t(locale, "home.actionQueueSub")}
                onPress={() => router.push("/tickets")}
                styles={styles}
                C={C}
              />
              <GridTile
                variant="neutral"
                icon="settings-outline"
                iconSize={34}
                iconColor={C.text}
                title={t(locale, "home.settings")}
                sub={t(locale, "home.actionSettingsSub")}
                onPress={() => router.push("/settings")}
                styles={styles}
                C={C}
              />
            </View>
          ) : (
            <>
              <View style={styles.gridRowFill}>
                <GridTile
                  variant="accent"
                  icon="add-circle-outline"
                  iconSize={36}
                  title={t(locale, "home.actionReceive")}
                  sub={t(locale, "home.actionReceiveSub")}
                  onPress={() => router.push("/receive")}
                  styles={styles}
                  C={C}
                />
                <GridTile
                  variant="warm"
                  icon="arrow-undo-outline"
                  iconSize={36}
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
                  iconSize={36}
                  title={t(locale, "home.actionReservation")}
                  sub={t(locale, "home.actionReservationSub")}
                  onPress={() => router.push("/receive?flow=reservation")}
                  styles={styles}
                  C={C}
                />
                <GridTile
                  variant="neutral"
                  icon="settings-outline"
                  iconSize={34}
                  iconColor={C.text}
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

function statusPillStyle(theme: ReturnType<typeof useValetTheme>, status: ValetOperationalStatus | null | undefined) {
  const dark = theme.isDark;
  if (status === "AVAILABLE") {
    return {
      bg: dark ? "rgba(16, 185, 129, 0.2)" : "#D1FAE5",
      fg: dark ? "#6EE7B7" : "#047857",
      border: dark ? "rgba(52, 211, 153, 0.45)" : "#A7F3D0",
    };
  }
  if (status === "BUSY") {
    return {
      bg: dark ? "rgba(251, 191, 36, 0.2)" : "#FEF3C7",
      fg: dark ? "#FCD34D" : "#B45309",
      border: dark ? "rgba(251, 191, 36, 0.5)" : "#FDE68A",
    };
  }
  if (status === "AWAY") {
    return {
      bg: dark ? "rgba(148, 163, 184, 0.18)" : "#E2E8F0",
      fg: dark ? "#CBD5E1" : "#475569",
      border: dark ? "rgba(148, 163, 184, 0.4)" : "#CBD5E1",
    };
  }
  return {
    bg: dark ? "rgba(59, 130, 246, 0.12)" : "#EFF6FF",
    fg: dark ? "#93C5FD" : "#1D4ED8",
    border: dark ? "rgba(59, 130, 246, 0.35)" : "#BFDBFE",
  };
}

type GridVariant = "accent" | "warm" | "queue" | "booking" | "neutral";

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
  const { variant, icon, iconSize = 32, iconColor, title, sub, onPress, styles, C } = props;
  const isLight = variant !== "neutral";
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        variant === "accent" && styles.tileAccent,
        variant === "warm" && styles.tileWarm,
        variant === "queue" && styles.tileQueue,
        variant === "booking" && styles.tileBooking,
        variant === "neutral" && styles.tileNeutral,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.tileIconWrap,
          variant === "neutral" && styles.tileIconNeutral,
          variant === "queue" && styles.tileIconQueue,
          variant === "booking" && styles.tileIconBooking,
        ]}
      >
        <Ionicons name={icon} size={iconSize} color={isLight ? "#fff" : iconColor ?? C.text} />
      </View>
      <Text
        style={[
          styles.tileTitle,
          isLight && styles.tileTitleLight,
          (variant === "accent" || variant === "warm" || variant === "booking") && {
            fontFamily: "CalSans",
          },
        ]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.75}
      >
        {title}
      </Text>
      <Text
        style={[styles.tileSub, isLight && styles.tileSubLight]}
        numberOfLines={3}
        maxFontSizeMultiplier={1.65}
      >
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

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    mainColumn: {
      flex: 1,
      minHeight: 0,
    },
    heroCard: {
      marginHorizontal: S.lg,
      marginTop: S.md,
      marginBottom: S.sm,
      padding: S.md,
      borderRadius: R.card + 4,
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0.25 : 0.08,
          shadowRadius: 10,
        },
        android: { elevation: theme.isDark ? 3 : 2 },
      }),
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: S.md,
    },
    heroLogo: { marginTop: 4 },
    heroMid: {
      flex: 1,
      minWidth: 0,
    },
    heroBrand: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 2,
    },
    heroNameLine: {
      fontSize: compact ? 17 : 19,
      fontWeight: "800",
      letterSpacing: Platform.OS === "ios" ? -0.2 : 0,
      marginBottom: S.sm,
    },
    heroBadges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: S.xs,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },
    badgeRole: {},
    badgeStatus: {},
    badgeText: {
      fontSize: 12,
      fontWeight: "800",
    },
    heroProfileTap: {
      alignItems: "center",
      width: 76,
    },
    heroAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
    },
    heroAvatarImg: {
      width: "100%",
      height: "100%",
    },
    heroAvatarInitials: {
      fontSize: 18,
      fontWeight: "800",
    },
    heroProfileCta: {
      marginTop: 6,
      fontSize: 11,
      fontWeight: "800",
      textAlign: "center",
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
      paddingVertical: S.lg,
      paddingHorizontal: S.md,
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
      backgroundColor: "#2563EB",
    },
    tileWarm: {
      backgroundColor: "#EA580C",
    },
    tileQueue: {
      backgroundColor: "#4338CA",
    },
    tileBooking: {
      backgroundColor: "#0D9488",
    },
    tileNeutral: {
      backgroundColor: C.card,
      borderWidth: 2,
      borderColor: C.border,
    },
    tileIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: S.md,
      alignSelf: "center",
    },
    tileIconNeutral: {
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",
    },
    tileIconQueue: {
      backgroundColor: "rgba(255,255,255,0.22)",
    },
    tileIconBooking: {
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
