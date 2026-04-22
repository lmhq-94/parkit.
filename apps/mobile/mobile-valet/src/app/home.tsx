import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useMemo, useEffect, useState, useCallback, useRef } from "react";
import React from "react";
import { IconUser, IconLocationFilled, IconList, IconSettings, IconLogout, IconCar, IconArrowUndo, IconKey, IconKeyOff } from "@/components/TablerIcons";
import { Logo } from "@parkit/shared";
import api, { clearAuthToken } from "@/lib/api";
import { useAuthStore, useLocaleStore, useCompanyStore, useParkingPreferenceStore, useAccessibilityStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import { useNearestParking, haversineKm } from "@/lib/useNearestParking";
import { createFeedback } from "@/lib/feedback";
import { useOnAppForeground } from "@/lib/useOnAppForeground";
import { TICKETS_POLL_MS } from "@/lib/syncConstants";
import {
  avatarPresenceRingColor,
  HEADER_RADIUS_BOTTOM,
  getHeaderSizes,
  HEADER_LOGO_BASE_SIZE,
} from "@/lib/homeUtils";
import { AnimatedGridTile } from "@/components/AnimatedGridTile";
import { WorkflowTile } from "@/components/WorkflowTile";
import { HeaderAnimatedView, AvatarPulseView } from "@/components/ReanimatedWrappers";
import { LinearGradient } from "expo-linear-gradient";

// Static font sizes for error boundary (fallback UI when theme is not available)
const ERROR_TITLE_SIZE = 18;
const ERROR_BODY_SIZE = 14;

class HomeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fee2e2' }}>
          <Text style={{ fontSize: ERROR_TITLE_SIZE, fontWeight: 'bold', color: '#dc2626', marginBottom: 10 }}>Error en Home</Text>
          <Text style={{ fontSize: ERROR_BODY_SIZE, color: '#7f1d1d', textAlign: 'center' }}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function HomeScreen() {
  return (
    <HomeErrorBoundary>
      <HomeScreenContent />
    </HomeErrorBoundary>
  );
}

function HomeScreenContent() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const setCompanyId = useCompanyStore((s) => s.setCompanyId);
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const insets = useSafeAreaInsets();
  const windowDims = useWindowDimensions();
  const winW = windowDims.width;
  const winH =
    typeof windowDims.height === "number" && windowDims.height > 0 ? windowDims.height : winW;
  const shortestSide = Math.min(winW, winH);
  const isTablet = shortestSide >= 600;
  const isLandscape = winW > winH;
  useValetProfileSync(user);
  const { nearest, status: locStatus, allParkings, userCoords } = useNearestParking(!!user);
  const manualParkingId = useParkingPreferenceStore((s) => s.manualParkingId);
  const setManualParkingId = useParkingPreferenceStore((s) => s.setManualParkingId);
  const hydrateParkingPreference = useParkingPreferenceStore((s) => s.hydrateParkingPreference);
  const feedback = useMemo(() => createFeedback(locale), [locale]);
  const [parkingModalOpen, setParkingModalOpen] = useState(false);
  const [queueAlertCount, setQueueAlertCount] = useState(0);
  const isDriverUi = user?.valetStaffRole === "DRIVER";
  const prevQueueAlertCountRef = useRef(0);
  const { textScale, reduceMotion } = useAccessibilityStore();
  const statusKey = user?.valetCurrentStatus;
  const isAvailable = statusKey === "AVAILABLE";

  // Calculate proportional header sizes based on logo and text scale
  const headerSizes = getHeaderSizes(HEADER_LOGO_BASE_SIZE, textScale);

  useEffect(() => {
    void hydrateParkingPreference();
  }, [hydrateParkingPreference]);

  const loadQueueAlerts = useCallback(async (opts?: { silent?: boolean }) => {
    if (!user?.id || !isDriverUi) {
      setQueueAlertCount(0);
      return;
    }
    try {
      const res = await api.get<{ data?: { count?: number } }>(
        `/notifications/user/${encodeURIComponent(user.id)}/unread-count`
      );
      const count = Number(res.data?.data?.count ?? 0);
      setQueueAlertCount(Number.isFinite(count) && count > 0 ? Math.floor(count) : 0);
    } catch {
      if (!opts?.silent) setQueueAlertCount(0);
    }
  }, [user?.id, isDriverUi]);

  useEffect(() => {
    void loadQueueAlerts();
  }, [loadQueueAlerts]);

  useEffect(() => {
    if (!isDriverUi || !user?.id) return;
    const id = setInterval(() => {
      void loadQueueAlerts({ silent: true });
    }, TICKETS_POLL_MS);
    return () => clearInterval(id);
  }, [isDriverUi, user?.id, loadQueueAlerts]);

  useOnAppForeground(() => {
    void loadQueueAlerts({ silent: true });
  });

  useEffect(() => {
    if (!isDriverUi) return;
    const prev = prevQueueAlertCountRef.current;
    if (queueAlertCount > prev && queueAlertCount > 0) {
      feedback.alert(
        t(locale, "home.queueAlertTitle"),
        t(locale, "home.queueAlertBody")
      );
    }
    prevQueueAlertCountRef.current = queueAlertCount;
  }, [queueAlertCount, isDriverUi, feedback, locale]);

  const displayedParking = useMemo(() => {
    if (!user) return null;
    if (manualParkingId && allParkings.length > 0) {
      const p = allParkings.find((x) => x.id === manualParkingId);
      if (p) {
        let distanceKm: number | null = null;
        if (userCoords && p.latitude != null && p.longitude != null) {
          distanceKm = haversineKm(userCoords.lat, userCoords.lon, p.latitude, p.longitude);
        }
        return { parking: p, distanceKm, isManual: true };
      }
    }
    if (nearest) {
      return { parking: nearest.parking, distanceKm: nearest.distanceKm, isManual: false };
    }
    return null;
  }, [user, manualParkingId, allParkings, nearest, userCoords]);

  useEffect(() => {
    if (!user || user.systemRole !== "STAFF") return;
    const p = displayedParking?.parking;
    if (!p?.id || !p.companyId) return;
    const timer = setTimeout(() => {
      void api
        .patch("/valets/me", {
          companyId: p.companyId,
          currentParkingId: p.id,
        })
        .catch(() => {});
    }, 350);
    return () => clearTimeout(timer);
  }, [user, displayedParking?.parking, displayedParking?.parking?.id, displayedParking?.parking?.companyId]);

  const styles = useMemo(
    () => createStyles(theme, shortestSide, isTablet, isLandscape),
    [theme, shortestSide, isTablet, isLandscape]
  );

  if (!user) {
    return <Redirect href="/login" />;
  }

  const C = theme.colors;
  const firstName = user.firstName?.trim() || "";
  const displayName = firstName || user.email?.split("@")[0]?.trim() || "—";
  const avatarUri = user.avatarUrl?.trim() || null;

  const avatarPresenceColor = avatarPresenceRingColor(theme, statusKey);

  const statusLabel =
    statusKey === "AVAILABLE"
      ? t(locale, "home.statusAvailable")
      : statusKey === "BUSY"
        ? t(locale, "home.statusBusy")
        : statusKey === "AWAY"
          ? t(locale, "home.statusAway")
          : t(locale, "home.statusSyncing");

  const handleLogout = () => {
    feedback.confirm({
      title: t(locale, "tickets.logoutConfirmTitle"),
      message: t(locale, "tickets.logoutConfirmMessage"),
      confirmText: t(locale, "tickets.logout"),
      destructive: true,
      onConfirm: async () => {
        await api.post("/valets/me/presence", { status: "AWAY" }).catch(() => {});
        await clearAuthToken();
        setCompanyId(null);
        setUser(null);
        router.replace("/login");
      },
    });
  };

  const headerMaxH = Math.min(96, winH * 0.12);

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
  /** Mismo tono que el inicio del gradiente del header (barra de estado alineada visualmente). */
  const statusBarBg = headerGradientSpec.colors[0];
  const S = theme.space;

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={statusBarBg}
        translucent={Platform.OS === "android"}
      />
      <View style={styles.mainColumn}>
        <View style={styles.screenContent}>
        <HeaderAnimatedView reduceMotion={reduceMotion}>
        <LinearGradient
          colors={[...headerGradientSpec.colors]}
          locations={[...headerGradientSpec.locations]}
          start={headerGradientSpec.start}
          end={headerGradientSpec.end}
          style={[
            styles.heroPlain,
            {
              paddingTop: insets.top + S.md,
              maxHeight: headerMaxH + insets.top,
            },
          ]}
        >
          <View style={styles.heroToolbarWrap}>
            <View style={[styles.heroToolbar, { gap: headerSizes.gap }]}>
              <Logo
                size={headerSizes.logoSize}
                variant={theme.isDark ? "onDark" : "onLight"}
                style={styles.heroLogo}
              />
              <View style={styles.headerUserBlock}>
                <View style={[styles.headerGreetingRow, { gap: headerSizes.gap }]}>
                  <View style={styles.headerGreetingCol}>
                    <Text
                      style={[styles.headerDisplayName, { color: headerTextPrimary, fontSize: Math.round(ticketsA11y.font.status * 0.65) }]}
                      numberOfLines={2}
                      maxFontSizeMultiplier={2}
                    >
                      {displayName}
                    </Text>
                    <Text
                      style={[styles.headerRoleBelow, { color: headerTextPrimary, fontSize: Math.round(ticketsA11y.font.status * 0.65) }]}
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.5}
                    >
                      {isDriverUi ? t(locale, "home.titleDriver") : t(locale, "home.titleReception")}
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [
                      styles.avatarWrapper,
                      { width: headerSizes.avatarSize + 4, height: headerSizes.avatarSize + 4 },
                      pressed && styles.avatarPressed,
                    ]}
                    accessibilityLabel={`${t(locale, "home.profile")} - ${statusLabel}`}
                    accessibilityRole="button"
                    onPress={() => router.push("/profile")}
                  >
                    <AvatarPulseView
                      isAvailable={isAvailable}
                      color={avatarPresenceColor}
                      size={headerSizes.avatarSize}
                      reduceMotion={reduceMotion}
                    >
                      <View
                        style={[
                          styles.headerAvatarInner,
                          { 
                            backgroundColor: theme.isDark ? C.card : "#FFFFFF",
                            width: headerSizes.avatarSize,
                            height: headerSizes.avatarSize,
                            borderRadius: headerSizes.avatarSize / 2,
                          },
                        ]}
                      >
                        {avatarUri ? (
                          <Image
                            source={{ uri: avatarUri }}
                            style={[styles.headerAvatarImage, { 
                              width: headerSizes.avatarSize,
                              height: headerSizes.avatarSize,
                            }]}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={{ 
                            width: headerSizes.avatarSize, 
                            height: headerSizes.avatarSize, 
                            borderRadius: headerSizes.avatarSize / 2,
                            backgroundColor: theme.isDark ? "rgba(148,163,184,0.15)" : "rgba(100,116,139,0.15)",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <IconUser size={headerSizes.avatarSize * 0.5} color={C.textMuted} />
                          </View>
                        )}
                      </View>
                    </AvatarPulseView>
                    <View style={[
                      styles.statusDotBadge,
                      { 
                        backgroundColor: avatarPresenceColor,
                        width: headerSizes.statusDotSize,
                        height: headerSizes.statusDotSize,
                        borderRadius: headerSizes.statusDotSize / 2,
                        borderWidth: headerSizes.statusDotBorderWidth,
                      },
                      isAvailable && styles.statusDotPulse
                    ]}>
                      {isAvailable && <View style={[styles.statusDotInner, { 
                        width: headerSizes.statusDotSize * 0.43,
                        height: headerSizes.statusDotSize * 0.43,
                        borderRadius: headerSizes.statusDotSize * 0.215,
                      }]} />}
                    </View>
                    {(queueAlertCount ?? 0) > 0 && (
                      <View style={[styles.headerBadge, {
                        minWidth: headerSizes.badgeSize,
                        height: headerSizes.badgeSize,
                        borderRadius: headerSizes.badgeSize / 2,
                        paddingHorizontal: headerSizes.badgeSize * 0.22,
                      }]}>
                        <Text style={[styles.headerBadgeText, { fontSize: headerSizes.badgeFontSize }]}>
                          {queueAlertCount > 99 ? "99+" : queueAlertCount}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
        </HeaderAnimatedView>

        <View style={styles.gridFlex}>
          {isDriverUi ? (
            <>
              <View style={[styles.gridRowFill, { flex: 1 }]}>
                <AnimatedGridTile
                  variant="queue"
                  lucideIcon={IconCar}
                  title={t(locale, "home.actionParkingQueue")}
                  sub={t(locale, "home.actionParkingQueueSub")}
                  onPress={() => router.push({ pathname: "/tickets", params: { queue: "parking" } })}
                  styles={styles}
                  isDark={theme.isDark}
                  index={0}
                  textScale={textScale}
                  reduceMotion={reduceMotion}
                />
                <AnimatedGridTile
                  variant="queue"
                  lucideIcon={IconArrowUndo}
                  title={t(locale, "home.actionDeliveryQueue")}
                  sub={t(locale, "home.actionDeliveryQueueSub")}
                  badgeCount={queueAlertCount}
                  onPress={() => router.push({ pathname: "/tickets", params: { queue: "delivery" } })}
                  styles={styles}
                  isDark={theme.isDark}
                  index={1}
                  textScale={textScale}
                  reduceMotion={reduceMotion}
                />
              </View>
              <View style={[styles.gridRowFill, { flex: 2 }]}>
                <WorkflowTile
                  styles={styles}
                  isDark={theme.isDark}
                  textScale={textScale}
                />
              </View>
            </>
          ) : (
            <>
              <View style={[styles.gridRowFill, { flex: 1 }]}>
                <AnimatedGridTile
                  variant="accent"
                  lucideIcon={IconKey}
                  iconSize={Math.round(headerSizes.avatarSize * 0.5)}
                  title={t(locale, "home.actionReceive")}
                  sub={t(locale, "home.actionReceiveSub")}
                  onPress={() => router.push("/receive")}
                  styles={styles}
                  isDark={theme.isDark}
                  index={0}
                  textScale={textScale}
                  reduceMotion={reduceMotion}
                />
                <AnimatedGridTile
                  variant="warm"
                  lucideIcon={IconKeyOff}
                  iconSize={Math.round(headerSizes.avatarSize * 0.5)}
                  title={t(locale, "home.actionReturn")}
                  sub={t(locale, "home.actionReturnSub")}
                  onPress={() => router.push("/return-pickup")}
                  styles={styles}
                  isDark={theme.isDark}
                  index={1}
                  textScale={textScale}
                  reduceMotion={reduceMotion}
                />
              </View>
              <View style={[styles.gridRowFill, { flex: 2 }]}>
                <WorkflowTile
                  styles={styles}
                  isDark={theme.isDark}
                  textScale={textScale}
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.bottomCardInner}>
            <View style={styles.bottomIconWrap}>
              <IconLocationFilled size={Math.round(14 * textScale)} fill={C.primary}  color={C.primary} />
            </View>
            <View style={styles.bottomTextCol}>
              <View style={styles.bottomTitleRow}>
                <Text style={styles.bottomTitle} numberOfLines={1}>
                  {t(locale, "home.nearestTitle")}
                </Text>
                {allParkings.length > 0 && locStatus !== "loading" && locStatus !== "unavailable" && (
                  <Pressable
                    style={({ pressed }) => [styles.bottomChooseBtn, pressed && styles.pressed]}
                    onPress={() => setParkingModalOpen(true)}
                    accessibilityRole="button"
                    accessibilityLabel={t(locale, "home.chooseParking")}
                  >
                    <IconList size={Math.round(18 * textScale)} color={C.primary} />
                  </Pressable>
                )}
              </View>
              {locStatus === "loading" && (
                <View style={styles.bottomLoadingRow}>
                  <ActivityIndicator size="small" color={C.primary} />
                  <Text style={styles.bottomMeta}>{t(locale, "home.nearestLoading")}</Text>
                </View>
              )}
              {locStatus === "unavailable" && (
                <Text style={styles.bottomMeta}>{t(locale, "home.nearestNoCoords")}</Text>
              )}
              {locStatus === "denied" && (
                <Text style={styles.bottomMeta}>{t(locale, "home.nearestDenied")}</Text>
              )}
              {(locStatus === "ready" || locStatus === "denied") && displayedParking && (
                <>
                  {displayedParking.isManual && (
                    <Text style={[styles.bottomManualHint, { color: C.textMuted }]}>
                      {t(locale, "home.manualParkingHint")}
                    </Text>
                  )}
                  <Text style={styles.bottomName} numberOfLines={2}>
                    {displayedParking.parking.name}
                  </Text>
                  {displayedParking.parking.company && (
                    <Text style={styles.bottomCompany} numberOfLines={1}>
                      {displayedParking.parking.company.commercialName?.trim() ||
                        displayedParking.parking.company.legalName?.trim() ||
                        "—"}
                    </Text>
                  )}
                  {displayedParking.distanceKm != null && (
                    <Text style={styles.bottomMeta}>
                      {t(locale, "home.nearestKm", {
                        km:
                          displayedParking.distanceKm < 10
                            ? displayedParking.distanceKm.toFixed(1)
                            : String(Math.round(displayedParking.distanceKm)),
                      })}
                    </Text>
                  )}
                  <Text style={styles.bottomAddr} numberOfLines={2}>
                    {displayedParking.parking.address}
                  </Text>
                  {displayedParking.isManual && (
                    <Pressable
                      style={({ pressed }) => [styles.bottomUseNearestBtn, pressed && styles.pressed]}
                      onPress={() => void setManualParkingId(null)}
                    >
                      <Text style={[styles.bottomUseNearestText, { color: C.primary }]}>
                        {t(locale, "home.useNearestParking")}
                      </Text>
                    </Pressable>
                  )}
                </>
              )}
            </View>
          </View>
        </View>

        <View style={styles.helpLogoutRow}>
          <Pressable
            style={({ pressed }) => [styles.helpLogoutBtn, pressed && styles.pressed]}
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel={t(locale, "home.settings")}
          >
            <IconSettings size={Math.round(22 * textScale)} color={C.primary} />
            <Text
              style={[styles.helpLogoutBtnText, { color: C.primary }]}
              maxFontSizeMultiplier={2}
              numberOfLines={2}
            >
              {t(locale, "home.settings")}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.helpLogoutBtn, pressed && styles.pressed]}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel={t(locale, "tickets.logout")}
          >
            <IconLogout size={Math.round(22 * textScale)} color={C.logout} />
            <Text
              style={[styles.helpLogoutBtnText, { color: C.logout }]}
              maxFontSizeMultiplier={2}
              numberOfLines={2}
            >
              {t(locale, "tickets.logout")}
            </Text>
          </Pressable>
        </View>

        <Modal
          visible={parkingModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setParkingModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdropPress}
              onPress={() => setParkingModalOpen(false)}
              accessibilityLabel={t(locale, "common.cancel")}
            />
            <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>{t(locale, "home.parkingPickerTitle")}</Text>
              <FlatList
                data={allParkings}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.parkingRow,
                      { borderBottomColor: C.border },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      void setManualParkingId(item.id);
                      setParkingModalOpen(false);
                    }}
                  >
                    <Text style={[styles.parkingRowName, { color: C.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={[styles.parkingRowAddr, { color: C.textMuted }]} numberOfLines={2}>
                      {item.address}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={{ color: C.textMuted, padding: theme.space.md }}>
                    {t(locale, "home.parkingPickerEmpty")}
                  </Text>
                }
              />
            </View>
          </View>
        </Modal>
        </View>
      </View>
    </SafeAreaView>
  );
}

type Theme = ReturnType<typeof useValetTheme>;

function createStyles(theme: Theme, shortestSide: number, isTablet: boolean, isLandscape: boolean) {
  const C = theme.colors;
  const S = theme.space;
  const F = ticketsA11y.font;
  const R = theme.radius;
  const Fonts = theme.fontFamily;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    mainColumn: {
      flex: 1,
      minHeight: 0,
      alignItems: "center",
    },
    screenContent: {
      flex: 1,
      minHeight: 0,
      width: "100%",
      alignSelf: "center",
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
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: theme.isDark ? 0.45 : 0.12,
          shadowRadius: 24,
        },
        android: { elevation: theme.isDark ? 8 : 4 },
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
      gap: 1,
      alignItems: "flex-end",
      flexShrink: 1,
      maxWidth: "58%",
    },
    headerRoleBelow: {
      fontWeight: Platform.OS === "android" ? "normal" : "600",
      fontFamily: Fonts.primary,
      textAlign: "right",
      letterSpacing: 0.2,
    },
    /** Contenedor del avatar con dot de status */
    avatarWrapper: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    avatarPressed: {
      transform: [{ scale: 0.96 }],
    },
    statusDotBadge: {
      position: "absolute",
      bottom: 2,
      right: 2,
      borderColor: C.card,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1,
        },
        android: { elevation: 2 },
      }),
    },
    statusDotPulse: {
      alignItems: "center",
      justifyContent: "center",
    },
    statusDotInner: {
      backgroundColor: "#FFFFFF",
      opacity: 0.4,
    },
    headerAvatarInner: {
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: C.border,
    },
    /** Medidas explícitas: en algunos dispositivos % dentro del círculo no pinta la imagen. */
    headerAvatarImage: {
    },
    headerAvatarInitials: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
    },
    headerDisplayName: {
      fontWeight: Platform.OS === "android" ? "normal" : "700",
      fontFamily: Fonts.primary,
      textAlign: "right",
      letterSpacing: -0.3,
    },
    headerBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      backgroundColor: theme.isDark ? "#EF4444" : "#DC2626",
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(254, 202, 202, 0.45)" : "rgba(255,255,255,0.7)",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 1,
        },
        android: { elevation: 2 },
      }),
    },
    headerBadgeText: {
      color: "#fff",
      fontWeight: "700",
      fontFamily: Fonts.primary,
    },
    gridFlex: {
      flex: 1,
      minHeight: 0,
      paddingHorizontal: isTablet ? S.xl : S.lg,
      paddingTop: isLandscape ? S.xs : S.sm,
      paddingBottom: S.sm,
      gap: isTablet ? S.md : S.sm,
    },
    gridRowFill: {
      flex: 1,
      minHeight: 0,
      flexDirection: "row",
      alignItems: "stretch",
      gap: S.sm,
    },
    tileSpacer: {
      flex: 1,
      minWidth: 0,
    },
    tileGhost: {
      opacity: 0,
    },
    helpLogoutRow: {
      flexDirection: "row",
      alignItems: "stretch",
      paddingHorizontal: S.lg,
      paddingTop: S.xs,
      paddingBottom: S.md,
      gap: S.sm,
    },
    helpLogoutBtn: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
      paddingVertical: S.md,
      paddingHorizontal: S.sm,
      borderRadius: R.card,
      borderWidth: 2,
      borderColor: C.border,
      backgroundColor: C.card,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: theme.isDark ? 0.25 : 0.06,
          shadowRadius: 4,
        },
        android: { elevation: theme.isDark ? 2 : 1 },
      }),
    },
    helpLogoutBtnText: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
      textAlign: "center",
      flexShrink: 1,
    },
    tile: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      position: "relative",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(226, 232, 240, 0.9)",
      paddingVertical: isTablet ? S.lg : S.md + 2,
      paddingHorizontal: isTablet ? S.md : S.sm + 2,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.85)",
      ...Platform.select({
        ios: {
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: theme.isDark ? 0.35 : 0.08,
          shadowRadius: 14,
        },
        android: {
          elevation: theme.isDark ? 5 : 3,
        },
      }),
    },
    tileAccent: {
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.55)" : "rgba(255, 255, 255, 0.9)",
      borderColor: theme.isDark ? "rgba(37, 99, 235, 0.3)" : "rgba(29, 78, 216, 0.15)",
    },
    tileWarm: {
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.55)" : "rgba(255, 255, 255, 0.9)",
      borderColor: theme.isDark ? "rgba(249, 115, 22, 0.3)" : "rgba(194, 65, 12, 0.15)",
    },
    tileQueue: {
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.55)" : "rgba(255, 255, 255, 0.9)",
      borderColor: theme.isDark ? "rgba(129, 140, 248, 0.3)" : "rgba(67, 56, 202, 0.15)",
    },
    tileBooking: {
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.55)" : "rgba(255, 255, 255, 0.9)",
      borderColor: theme.isDark ? "rgba(45, 212, 191, 0.3)" : "rgba(13, 148, 136, 0.15)",
    },
    tileProfile: {
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.55)" : "rgba(255, 255, 255, 0.9)",
      borderColor: theme.isDark ? "rgba(192, 132, 252, 0.3)" : "rgba(124, 58, 237, 0.15)",
    },
    tileSettings: {
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.55)" : "rgba(255, 255, 255, 0.9)",
      borderColor: theme.isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(51, 65, 85, 0.15)",
    },
    tileWorkflow: {
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.45)" : "rgba(255, 255, 255, 0.8)",
      borderColor: theme.isDark ? "rgba(6, 182, 212, 0.25)" : "rgba(14, 116, 144, 0.15)",
    },
    tileIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: S.sm + 2,
      alignSelf: "center",
    },
    tileBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      backgroundColor: theme.isDark ? "#EF4444" : "#DC2626",
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(254, 202, 202, 0.45)" : "rgba(255,255,255,0.7)",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        },
        android: { elevation: 2 },
      }),
    },
    tileBadgeText: {
      color: "#fff",
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    tileTitle: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: Platform.OS === "android" ? "normal" : "600",
      fontFamily: Fonts.primary,
      color: C.text,
      marginBottom: 4,
      textAlign: "center",
      width: "100%",
    },
    tileSub: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
      color: C.textMuted,
      lineHeight: Math.round(F.status * 0.85),
      textAlign: "center",
      width: "100%",
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
      minHeight: 152,
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
      marginTop: 36,
    },
    bottomTextCol: {
      flex: 1,
      minWidth: 0,
    },
    bottomTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: S.sm,
      marginBottom: 4,
    },
    bottomTitle: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
      color: C.textMuted,
      letterSpacing: 0.6,
      flex: 1,
      minWidth: 0,
    },
    bottomChooseBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: S.xs,
      flexShrink: 0,
    },
    bottomChooseBtnText: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
    },
    bottomManualHint: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "700",
      fontFamily: Fonts.primary,
      marginBottom: 4,
    },
    bottomUseNearestBtn: {
      marginTop: S.sm,
      alignSelf: "flex-start",
      paddingVertical: 4,
    },
    bottomUseNearestText: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
    },
    bottomName: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
      color: C.text,
    },
    bottomCompany: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
      color: C.textMuted,
      marginTop: 2,
    },
    bottomMeta: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "700",
      fontFamily: Fonts.primary,
      color: C.primary,
      marginTop: 2,
    },
    bottomAddr: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textSubtle,
      marginTop: 4,
      lineHeight: Math.round(F.status * 0.95),
    },
    bottomLoadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(15, 23, 42, 0.45)",
    },
    modalBackdropPress: {
      flex: 1,
    },
    modalSheet: {
      maxHeight: 360,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: S.md,
      paddingTop: S.md,
      paddingBottom: S.lg,
    },
    modalTitle: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: Platform.OS === "android" ? "normal" : "600",
      fontFamily: Fonts.primary,
      textAlign: "center",
      marginBottom: S.sm,
    },
    modalList: {
      maxHeight: 300,
    },
    parkingRow: {
      paddingVertical: S.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    parkingRowName: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: Fonts.primary,
    },
    parkingRowAddr: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      marginTop: 4,
      lineHeight: Math.round(F.status * 0.95),
    },
  });
}
