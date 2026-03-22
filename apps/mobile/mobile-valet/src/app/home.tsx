import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { Logo } from "@parkit/shared";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import { useNearestParking } from "@/lib/useNearestParking";

/**
 * Inicio: cuadrícula sin scroll, cabecera al color del tema y parqueo más cercano (todos los parqueos del sistema).
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
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
  const M = ticketsA11y.minTouch;
  const first = user.firstName?.trim() || user.email?.split("@")[0] || "—";
  const last = user.lastName?.trim() || "";
  const initials = `${(user.firstName?.[0] || user.email?.[0] || "?").toUpperCase()}${(last[0] || "").toUpperCase()}`;

  const headerMaxH = Math.min(200, height * 0.26);

  const gridShared = {
    minHeight: Math.max(M, 56),
    styles,
    C,
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.root}>
        {/* —— Header (mismo fondo que el tema) —— */}
        <View style={[styles.heroPlain, { maxHeight: headerMaxH }]}>
          <View style={styles.heroTopRow}>
            <Logo size={40} style={styles.heroLogo} />
          </View>

          <View style={styles.heroMain}>
            <View style={styles.avatarInner}>
              <Text style={[styles.avatarText, { color: C.text }]} maxFontSizeMultiplier={2}>
                {initials}
              </Text>
            </View>

            <View style={styles.heroTextCol}>
              <Text style={[styles.heroKicker, { color: C.textMuted }]} maxFontSizeMultiplier={2}>
                {t(locale, "home.hello")}{" "}
                <Text style={[styles.heroName, { color: C.text }]}>{first}</Text>
              </Text>
              <Text style={[styles.heroRole, { color: C.text, fontFamily: "CalSans" }]} maxFontSizeMultiplier={1.6}>
                {isDriverUi ? t(locale, "home.titleDriver") : t(locale, "home.titleReception")}
              </Text>
            </View>
          </View>
        </View>

        {/* —— Cuadrícula (flex, sin ScrollView) —— */}
        <View style={styles.gridWrap}>
          {isDriverUi ? (
            <View style={styles.gridRow}>
              <GridTile
                {...gridShared}
                variant="neutral"
                icon="list-outline"
                iconColor={C.primary}
                title={t(locale, "home.actionQueue")}
                sub={t(locale, "home.actionQueueSub")}
                onPress={() => router.push("/tickets")}
              />
              <GridTile
                {...gridShared}
                variant="neutral"
                icon="settings-outline"
                iconColor={C.text}
                title={t(locale, "home.settings")}
                sub={t(locale, "home.actionSettingsSub")}
                onPress={() => router.push("/settings")}
              />
            </View>
          ) : (
            <>
              <View style={styles.gridRow}>
                <GridTile
                  {...gridShared}
                  variant="accent"
                  icon="add-circle-outline"
                  title={t(locale, "home.actionReceive")}
                  sub={t(locale, "home.actionReceiveSub")}
                  onPress={() => router.push("/receive")}
                />
                <GridTile
                  {...gridShared}
                  variant="warm"
                  icon="arrow-undo-outline"
                  title={t(locale, "home.actionReturn")}
                  sub={t(locale, "home.actionReturnSub")}
                  onPress={() => router.push("/return-pickup")}
                />
              </View>
              <View style={styles.gridRow}>
                <GridTile
                  {...gridShared}
                  variant="neutral"
                  icon="list-outline"
                  iconColor={C.primary}
                  title={t(locale, "home.actionQueue")}
                  sub={t(locale, "home.actionQueueSub")}
                  onPress={() => router.push("/tickets")}
                />
                <GridTile
                  {...gridShared}
                  variant="neutral"
                  icon="settings-outline"
                  iconColor={C.text}
                  title={t(locale, "home.settings")}
                  sub={t(locale, "home.actionSettingsSub")}
                  onPress={() => router.push("/settings")}
                />
              </View>
            </>
          )}
        </View>

        {/* —— Parqueo más cercano —— */}
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
                      km: nearest.distanceKm < 10 ? nearest.distanceKm.toFixed(1) : String(Math.round(nearest.distanceKm)),
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

type GridVariant = "accent" | "warm" | "neutral";

function GridTile(props: {
  variant: GridVariant;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  sub: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  C: { primary: string; text: string };
  minHeight: number;
}) {
  const { variant, icon, iconColor, title, sub, onPress, styles, C, minHeight } = props;
  const isLight = variant !== "neutral";
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        variant === "accent" && styles.tileAccent,
        variant === "warm" && styles.tileWarm,
        variant === "neutral" && styles.tileNeutral,
        { minHeight },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.tileIconWrap,
          variant === "neutral" && styles.tileIconNeutral,
        ]}
      >
        <Ionicons name={icon} size={26} color={isLight ? "#fff" : iconColor ?? C.text} />
      </View>
      <Text
        style={[
          styles.tileTitle,
          isLight && styles.tileTitleLight,
          variant !== "neutral" && { fontFamily: "CalSans" },
        ]}
        numberOfLines={2}
        maxFontSizeMultiplier={1.75}
      >
        {title}
      </Text>
      <Text
        style={[styles.tileSub, isLight && styles.tileSubLight]}
        numberOfLines={2}
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
  const tilePad = compact ? S.sm : S.md;
  const fsTitle = compact ? F.secondary + 1 : F.body - 1;
  const fsSub = compact ? 11 : 12;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    root: {
      flex: 1,
      minHeight: 0,
    },
    heroPlain: {
      backgroundColor: C.bg,
      paddingHorizontal: S.lg,
      paddingTop: S.md,
      paddingBottom: S.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: S.sm,
    },
    heroLogo: { opacity: 1 },
    heroMain: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.md,
    },
    avatarInner: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: C.card,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: C.border,
    },
    avatarText: {
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    heroTextCol: {
      flex: 1,
      minWidth: 0,
    },
    heroKicker: {
      fontSize: compact ? 12 : 13,
      fontWeight: "600",
      marginBottom: 2,
    },
    heroName: {
      fontWeight: "800",
    },
    heroRole: {
      fontSize: compact ? 20 : 22,
      fontWeight: "700",
      letterSpacing: Platform.OS === "ios" ? -0.3 : 0,
      marginTop: 2,
    },
    gridWrap: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: S.lg,
      paddingTop: S.md,
      paddingBottom: S.sm,
      gap: S.sm,
      justifyContent: "center",
    },
    gridRow: {
      flex: 1,
      minHeight: 0,
      flexDirection: "row",
      gap: S.sm,
    },
    tile: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      borderRadius: R.card + 2,
      padding: tilePad,
      justifyContent: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0.35 : 0.1,
          shadowRadius: 8,
        },
        android: { elevation: theme.isDark ? 4 : 3 },
      }),
    },
    tileAccent: {
      backgroundColor: "#2563EB",
    },
    tileWarm: {
      backgroundColor: "#EA580C",
    },
    tileNeutral: {
      backgroundColor: C.card,
      borderWidth: 2,
      borderColor: C.border,
    },
    tileIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: S.xs,
    },
    tileIconNeutral: {
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",
    },
    tileTitle: {
      fontSize: fsTitle,
      fontWeight: "800",
      color: C.text,
      marginBottom: 2,
    },
    tileTitleLight: {
      color: "#fff",
    },
    tileSub: {
      fontSize: fsSub,
      fontWeight: "600",
      color: C.textMuted,
      lineHeight: compact ? 14 : 16,
    },
    tileSubLight: {
      color: "rgba(255,255,255,0.88)",
    },
    pressed: {
      opacity: 0.93,
      transform: [{ scale: 0.985 }],
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
