import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { formatVehicleColorLabel } from "@parkit/shared/src/vehicleColors";
import api from "@/lib/api";
import { ValetBackButton } from "@/components/ValetBackButton";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import { useOnAppForeground } from "@/lib/useOnAppForeground";
import { TICKETS_POLL_MS } from "@/lib/syncConstants";
import { createFeedback } from "@/lib/feedback";
import {
  useValetTheme,
  statusVisuals as statusVisualsForTheme,
  ticketsA11y,
  useResponsiveLayout,
} from "@/theme/valetTheme";
import { mapApiAssignmentToDisplay } from "@/lib/ticketUtils";
import type { ApiAssignment, TicketAssignment } from "@/types/tickets";

type Theme = ReturnType<typeof useValetTheme>;

function createTicketStyles(theme: Theme, contentMaxWidth: number, sectionPadding: number) {
  const C = theme.colors;
  const S = theme.space;
  const F = ticketsA11y.font;
  const R = theme.radius;
  const M = ticketsA11y.minTouch;
  const Fonts = theme.fontFamily;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    container: {
      flex: 1,
      backgroundColor: C.bg,
      alignItems: "center",
    },
    contentFrame: {
      flex: 1,
      width: "100%",
      maxWidth: contentMaxWidth,
    },
    header: {
      backgroundColor: C.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    screenHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: sectionPadding,
      paddingTop: S.sm,
      paddingBottom: S.md,
    },
    screenTitle: {
      fontSize: Math.round(F.secondary * 0.85),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.text,
      flex: 1,
      textAlign: "center",
    },
    intro: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textMuted,
      lineHeight: 20,
      fontWeight: "600",
      textAlign: "left",
    },
    queueBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.md,
      padding: S.md,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(59, 130, 246, 0.35)" : "#BFDBFE",
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.14)" : "#EFF6FF",
      marginBottom: S.md,
    },
    queueBannerIcon: {
      width: 40,
      height: 40,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.25)" : "#DBEAFE",
    },
    queueBannerText: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    queueBannerTitle: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.text,
    },
    queueBannerBody: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textMuted,
      lineHeight: 18,
      fontWeight: "600",
    },
    queueBannerBadge: {
      minWidth: 28,
      height: 28,
      borderRadius: 14,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark ? "#3B82F6" : "#2563EB",
    },
    queueBannerBadgeText: {
      color: "#fff",
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      fontFamily: Fonts.primary,
    },
    introSecondary: {
      marginTop: S.xs,
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textSubtle,
      lineHeight: 18,
      fontWeight: "600",
      textAlign: "left",
    },
    introBlock: {
      marginTop: 0,
      marginBottom: S.md,
      gap: 2,
    },
    list: {
      paddingHorizontal: sectionPadding,
      paddingTop: S.sm,
      paddingBottom: S.xxl,
    },
    listEmptyGrow: {
      flexGrow: 1,
      paddingHorizontal: sectionPadding,
      paddingTop: S.sm,
      paddingBottom: S.xxl,
    },
    ticketCard: {
      position: "relative",
      overflow: "hidden",
      backgroundColor: C.card,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.border,
      padding: S.lg,
      marginBottom: S.md,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: theme.isDark ? 0.28 : 0.07,
          shadowRadius: 18,
        },
        android: { elevation: theme.isDark ? 5 : 2 },
      }),
    },
    ticketCardAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
    },
    plateLabel: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.textMuted,
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    vehiclePlate: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.text,
      letterSpacing: 0.8,
      fontVariant: ["tabular-nums"],
    },
    ticketTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: S.md,
      marginBottom: S.sm,
    },
    plateBlock: {
      flex: 1,
      minWidth: 0,
    },
    statusPill: {
      alignSelf: "flex-start",
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    statusPillText: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      fontFamily: Fonts.primary,
    },
    locationLabel: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.textMuted,
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.sm,
      marginBottom: S.md,
      paddingVertical: 2,
    },
    locationIcon: {
      marginTop: 0,
    },
    location: {
      flex: 1,
      fontSize: Math.round(F.status * 0.65),
      lineHeight: 18,
      fontFamily: Fonts.primary,
      color: C.text,
      fontWeight: "600",
    },
    actions: {
      marginTop: S.xs,
    },
    metaGrid: {
      gap: 8,
      marginBottom: S.sm,
      borderRadius: R.button,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: theme.isDark ? "rgba(15, 23, 42, 0.45)" : "rgba(248, 250, 252, 0.9)",
      paddingVertical: S.sm,
      paddingHorizontal: S.sm,
    },
    metaLine: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: S.sm,
    },
    metaKey: {
      minWidth: 84,
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textMuted,
      fontWeight: "600",
    },
    metaValue: {
      flex: 1,
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.text,
      fontWeight: "700",
      textAlign: "right",
    },
    btn: {
      minHeight: M + 8,
      borderRadius: R.button,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: S.md,
      paddingHorizontal: S.lg,
      gap: S.sm,
    },
    btnPrimary: {
      backgroundColor: C.primary,
    },
    btnSuccess: {
      backgroundColor: C.success,
    },
    btnWarning: {
      backgroundColor: C.warning,
    },
    btnIcon: {
      marginRight: 4,
    },
    btnText: {
      color: C.white,
      fontWeight: "800",
      fontFamily: Fonts.primary,
      fontSize: Math.round(F.status * 0.65),
      textAlign: "center",
      flexShrink: 1,
    },
    completedBox: {
      minHeight: M,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
      paddingVertical: S.md,
      backgroundColor: theme.isDark ? "rgba(16, 185, 129, 0.14)" : "#ECFDF5",
      borderRadius: R.button,
      borderWidth: 2,
      borderColor: theme.isDark ? "rgba(52, 211, 153, 0.35)" : "#A7F3D0",
    },
    completedText: {
      flex: 1,
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "700",
      fontFamily: Fonts.primary,
      color: C.success,
      textAlign: "center",
    },
    centerBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: S.xxl,
      paddingHorizontal: S.lg,
      gap: S.md,
    },
    centerBoxEmpty: {
      flex: 1,
    },
    loadingText: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textMuted,
      fontWeight: "600",
      textAlign: "center",
    },
    emptyTitle: {
      fontSize: Math.round(F.secondary * 0.85),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.text,
      textAlign: "center",
    },
    emptyHint: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      lineHeight: 18,
      color: C.textMuted,
      textAlign: "center",
      fontWeight: "500",
    },
  });
}

export default function TicketsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  useValetProfileSync(user);
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createTicketStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding]
  );

  const [tickets, setTickets] = useState<TicketAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [valetId, setValetId] = useState<string | null>(null);
  const [queueAlertCount, setQueueAlertCount] = useState(0);

  /** Conductor: puede alternar entre ingresos y devoluciones. */
  const isDriverUi = user?.valetStaffRole === "DRIVER";
  const { queue } = useLocalSearchParams<{ queue?: string }>();
  const queueMode =
    queue === "parking"
      ? "parking"
      : queue === "delivery"
        ? "delivery"
        : isDriverUi
          ? "delivery"
          : "parking";
  const showReceptionUi = queueMode === "parking";

  const filteredTickets = useMemo(() => {
    const list =
      queueMode === "parking"
        ? tickets.filter((x) => x.ticketStatus === "REQUEST_PARKING")
        : tickets.filter((x) => x.ticketStatus === "REQUEST_DELIVERY");

    // Sort ascending by createdAt (oldest first = FIFO queue)
    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [tickets, queueMode]);
  const feedback = useMemo(() => createFeedback(locale), [locale]);

  const loadTickets = useCallback(async (opts?: { silent?: boolean }) => {
    if (!user) return;
    const silent = opts?.silent === true;
    if (!silent) setLoading(true);
    try {
      const res = await api.get<{ data: ApiAssignment[] }>("/valets/me/assignments");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const filtered = valetId ? list.filter((x) => x.valetId === valetId) : list;
      setTickets(filtered.map(mapApiAssignmentToDisplay));
    } catch {
      if (!silent) setTickets([]);
    } finally {
      if (!silent) setLoading(false);
      setInitialLoad(false);
    }
  }, [user, valetId]);

  const loadQueueAlerts = useCallback(async () => {
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
      setQueueAlertCount(0);
    }
  }, [user?.id, isDriverUi]);

  useEffect(() => {
    if (user) void loadTickets();
  }, [user, loadTickets]);

  useEffect(() => {
    void loadQueueAlerts();
  }, [loadQueueAlerts]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<{ data: { id: string } }>("/valets/me");
        const id = res.data?.data?.id ?? null;
        if (!cancelled) setValetId(id);
      } catch {
        if (!cancelled) setValetId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user?.id || !isDriverUi) return;
    void api.patch(`/notifications/user/${encodeURIComponent(user.id)}/read-all`).catch(() => {});
  }, [user?.id, isDriverUi]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      void loadTickets({ silent: true });
    }, TICKETS_POLL_MS);
    return () => clearInterval(id);
  }, [user, loadTickets]);

  useOnAppForeground(() => {
    if (user) void loadTickets({ silent: true });
    void loadQueueAlerts();
  });

  if (!user) {
    return <Redirect href="/login" />;
  }

  const C = theme.colors;

  const statusLabel = (s: TicketAssignment["status"]) => {
    if (s === "assigned") return t(locale, "tickets.statusAssigned");
    if (s === "in-transit") return t(locale, "tickets.statusInTransit");
    return t(locale, "tickets.statusCompleted");
  };

  const receptionTicketStatusLabel = (ticketStatus: string) => {
    if (ticketStatus === "REQUEST_PARKING") return t(locale, "tickets.ticketStatusRequestedToPark");
    if (ticketStatus === "PARKED") return t(locale, "tickets.ticketStatusParked");
    if (ticketStatus === "REQUEST_DELIVERY") return t(locale, "tickets.ticketStatusRequestedToDeliver");
    return t(locale, "tickets.ticketStatusOther");
  };

  const mapReceptionVisualStatus = (ticketStatus: string): "assigned" | "in-transit" | "completed" => {
    if (ticketStatus === "DELIVERED") return "completed";
    if (ticketStatus === "REQUEST_DELIVERY") return "in-transit";
    return "assigned";
  };

  const handleGoPark = (item: TicketAssignment) => {
    feedback.confirm({
      title: t(locale, "tickets.confirmGoParkTitle"),
      message: t(locale, "tickets.confirmGoParkMessage"),
      confirmText: t(locale, "tickets.yesContinue"),
      onConfirm: async () => {
        router.push(
          `/park?ticketId=${encodeURIComponent(item.ticketId)}&companyId=${encodeURIComponent(
            item.companyId
          )}`
        );
      },
    });
  };

  const handleRequestReturn = (item: TicketAssignment) => {
    feedback.confirm({
      title: t(locale, "tickets.confirmRequestReturnTitle"),
      message: t(locale, "tickets.confirmRequestReturnMessage"),
      confirmText: t(locale, "tickets.yesContinue"),
      onConfirm: async () => {
        try {
          await api.patch(
            `/tickets/${item.ticketId}`,
            { status: "REQUEST_DELIVERY" },
            { headers: { "x-company-id": item.companyId } }
          );
          feedback.success(t(locale, "tickets.successRequested"));
          await loadTickets();
        } catch (e: unknown) {
          const msg =
            e && typeof e === "object" && "response" in e
              ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
              : null;
          feedback.error(msg || t(locale, "tickets.errorUpdate"));
        }
      },
    });
  };

  const handleMarkDelivered = (item: TicketAssignment) => {
    feedback.confirm({
      title: t(locale, "tickets.confirmMarkDeliveredTitle"),
      message: t(locale, "tickets.confirmMarkDeliveredMessage"),
      confirmText: t(locale, "tickets.yesContinue"),
      onConfirm: async () => {
        try {
          await api.patch(
            `/tickets/${item.ticketId}`,
            { status: "DELIVERED" },
            { headers: { "x-company-id": item.companyId } }
          );
          feedback.success(t(locale, "tickets.successMarkedDelivered"));
          await loadTickets();
        } catch (e: unknown) {
          const msg =
            e && typeof e === "object" && "response" in e
              ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
              : null;
          feedback.error(msg || t(locale, "tickets.errorUpdate"));
        }
      },
    });
  };

  const handleStatusUpdate = (item: TicketAssignment, newStatus: "in-transit" | "completed") => {
    const isComplete = newStatus === "completed";
    feedback.confirm({
      title: isComplete ? t(locale, "tickets.confirmCompleteTitle") : t(locale, "tickets.confirmStartTitle"),
      message: isComplete
        ? t(locale, "tickets.confirmCompleteMessage")
        : t(locale, "tickets.confirmStartMessage"),
      confirmText: t(locale, "tickets.yesContinue"),
      onConfirm: async () => {
        if (isComplete) {
          try {
            await api.patch(
              `/tickets/${item.ticketId}`,
              { status: "DELIVERED" },
              { headers: { "x-company-id": item.companyId } }
            );
            setTickets((prev) =>
              prev.map((tkt) =>
                tkt.ticketId === item.ticketId ? { ...tkt, status: "completed" as const } : tkt
              )
            );
            feedback.success(t(locale, "tickets.successDelivered"));
          } catch (e: unknown) {
            const msg =
              e && typeof e === "object" && "response" in e
                ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
                : null;
            feedback.error(msg || t(locale, "tickets.errorUpdate"));
          }
        } else {
          setTickets((prev) =>
            prev.map((tkt) =>
              tkt.ticketId === item.ticketId ? { ...tkt, status: "in-transit" as const } : tkt
            )
          );
          feedback.success(t(locale, "tickets.successInTransit"));
        }
      },
    });
  };

  const renderTicket = ({ item }: { item: TicketAssignment }) => {
    const ticketCode = item.ticketCode?.trim() || "—";
    const keyCode = item.keyCode?.trim() || null;
    const showDifferentKeyCode = !!keyCode && keyCode !== ticketCode;
    if (showReceptionUi) {
      const rVis = statusVisualsForTheme(mapReceptionVisualStatus(item.ticketStatus), theme.isDark);
      return (
        <View
          style={styles.ticketCard}
          accessibilityLabel={`${t(locale, "tickets.plateLabel")}: ${item.vehiclePlate}. ${receptionTicketStatusLabel(item.ticketStatus)}. ${t(locale, "tickets.locationLabel")}: ${item.location}`}
        >
          <View style={[styles.ticketCardAccent, { backgroundColor: rVis.bar }]} />
          <View style={styles.ticketTopRow}>
            <View style={styles.plateBlock}>
              <Text style={styles.plateLabel}>{t(locale, "tickets.ticketCodeLabel")}</Text>
              <Text style={styles.vehiclePlate} accessibilityRole="header" maxFontSizeMultiplier={2.2}>
                {ticketCode}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: rVis.softBg }]}>
              <Text style={[styles.statusPillText, { color: rVis.softText }]} maxFontSizeMultiplier={2}>
                {receptionTicketStatusLabel(item.ticketStatus)}
              </Text>
            </View>
          </View>

          <Text style={styles.locationLabel}>{t(locale, "tickets.locationLabel")}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={24} color={C.primary} style={styles.locationIcon} />
            <Text style={styles.location} maxFontSizeMultiplier={2}>
              {item.parkingName}
            </Text>
          </View>
          <View style={styles.metaGrid}>
            <View style={styles.metaLine}>
              <Text style={styles.metaKey}>{t(locale, "tickets.plateLabel")}</Text>
              <Text style={styles.metaValue}>{item.vehiclePlate}</Text>
            </View>
            {showDifferentKeyCode ? (
              <View style={styles.metaLine}>
                <Text style={styles.metaKey}>{t(locale, "tickets.keyCodeLabel")}</Text>
                <Text style={styles.metaValue}>{keyCode}</Text>
              </View>
            ) : null}
            <View style={styles.metaLine}>
              <Text style={styles.metaKey}>{t(locale, "tickets.vehicleLabel")}</Text>
              <Text style={styles.metaValue}>{item.vehicleBrandModel}</Text>
            </View>
            {item.vehicleColor ? (
              <View style={styles.metaLine}>
                <Text style={styles.metaKey}>{t(locale, "tickets.colorLabel")}</Text>
                <Text style={styles.metaValue}>{formatVehicleColorLabel(item.vehicleColor, locale)}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.actions}>
            {item.ticketStatus === "REQUEST_PARKING" && (
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                onPress={() => handleGoPark(item)}
                accessibilityRole="button"
                accessibilityHint={t(locale, "tickets.confirmGoParkMessage")}
              >
                <View style={styles.btnIcon}>
                  <Ionicons name="warning-outline" size={26} color={C.white} />
                </View>
                <Text style={styles.btnText} maxFontSizeMultiplier={2}>
                  {t(locale, "tickets.actionGoPark")}
                </Text>
              </TouchableOpacity>
            )}
            {item.ticketStatus === "PARKED" && (
              <TouchableOpacity
                style={[styles.btn, styles.btnWarning]}
                onPress={() => handleRequestReturn(item)}
                accessibilityRole="button"
                accessibilityHint={t(locale, "tickets.confirmRequestReturnMessage")}
              >
                <Ionicons name="arrow-undo-outline" size={28} color={C.white} style={styles.btnIcon} />
                <Text style={styles.btnText} maxFontSizeMultiplier={2}>
                  {t(locale, "tickets.actionRequestReturn")}
                </Text>
              </TouchableOpacity>
            )}
            {item.ticketStatus === "REQUEST_DELIVERY" && (
              <TouchableOpacity
                style={[styles.btn, styles.btnSuccess]}
                onPress={() => handleMarkDelivered(item)}
                accessibilityRole="button"
                accessibilityHint={t(locale, "tickets.confirmMarkDeliveredMessage")}
              >
                <Ionicons name="checkmark-circle-outline" size={30} color={C.white} style={styles.btnIcon} />
                <Text style={styles.btnText} maxFontSizeMultiplier={2}>
                  {t(locale, "tickets.actionMarkDelivered")}
                </Text>
              </TouchableOpacity>
            )}
            {item.ticketStatus === "DELIVERED" && (
              <View style={styles.completedBox}>
                <Ionicons name="checkmark-done-circle" size={34} color={C.success} />
                <Text style={styles.completedText} maxFontSizeMultiplier={2}>
                  {t(locale, "tickets.completedLine")}
                </Text>
              </View>
            )}
          </View>
        </View>
      );
    }

    const vis = statusVisualsForTheme(item.status, theme.isDark);

    return (
      <View
        style={styles.ticketCard}
        accessibilityLabel={`${t(locale, "tickets.plateLabel")}: ${item.vehiclePlate}. ${statusLabel(item.status)}. ${t(locale, "tickets.locationLabel")}: ${item.location}`}
      >
        <View style={[styles.ticketCardAccent, { backgroundColor: vis.bar }]} />
        <View style={styles.ticketTopRow}>
          <View style={styles.plateBlock}>
            <Text style={styles.plateLabel}>{t(locale, "tickets.ticketCodeLabel")}</Text>
            <Text style={styles.vehiclePlate} accessibilityRole="header" maxFontSizeMultiplier={2.2}>
              {ticketCode}
            </Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: vis.softBg }]}>
            <Text style={[styles.statusPillText, { color: vis.softText }]} maxFontSizeMultiplier={2}>
              {statusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.locationLabel}>{t(locale, "tickets.locationLabel")}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={24} color={C.primary} style={styles.locationIcon} />
          <Text style={styles.location} maxFontSizeMultiplier={2}>
            {item.parkingName}
          </Text>
        </View>
        <View style={styles.metaGrid}>
          <View style={styles.metaLine}>
            <Text style={styles.metaKey}>{t(locale, "tickets.plateLabel")}</Text>
            <Text style={styles.metaValue}>{item.vehiclePlate}</Text>
          </View>
          {showDifferentKeyCode ? (
            <View style={styles.metaLine}>
              <Text style={styles.metaKey}>{t(locale, "tickets.keyCodeLabel")}</Text>
              <Text style={styles.metaValue}>{keyCode}</Text>
            </View>
          ) : null}
          <View style={styles.metaLine}>
            <Text style={styles.metaKey}>{t(locale, "tickets.vehicleLabel")}</Text>
            <Text style={styles.metaValue}>{item.vehicleBrandModel}</Text>
          </View>
          {item.vehicleColor ? (
            <View style={styles.metaLine}>
              <Text style={styles.metaKey}>{t(locale, "tickets.colorLabel")}</Text>
              <Text style={styles.metaValue}>{formatVehicleColorLabel(item.vehicleColor, locale)}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          {item.status === "assigned" && (
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => handleStatusUpdate(item, "in-transit")}
              accessibilityRole="button"
              accessibilityHint={t(locale, "tickets.confirmStartMessage")}
            >
              <Ionicons name="car-outline" size={28} color={C.white} style={styles.btnIcon} />
              <Text style={styles.btnText} maxFontSizeMultiplier={2}>
                {t(locale, "tickets.actionStart")}
              </Text>
            </TouchableOpacity>
          )}
          {item.status === "in-transit" && (
            <TouchableOpacity
              style={[styles.btn, styles.btnSuccess]}
              onPress={() => handleStatusUpdate(item, "completed")}
              accessibilityRole="button"
              accessibilityHint={t(locale, "tickets.confirmCompleteMessage")}
            >
              <Ionicons name="checkmark-circle-outline" size={30} color={C.white} style={styles.btnIcon} />
              <Text style={styles.btnText} maxFontSizeMultiplier={2}>
                {t(locale, "tickets.actionComplete")}
              </Text>
            </TouchableOpacity>
          )}
          {item.status === "completed" && (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-done-circle" size={34} color={C.success} />
              <Text style={styles.completedText} maxFontSizeMultiplier={2}>
                {t(locale, "tickets.completedLine")}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const listEmpty = () => {
    if (initialLoad || (loading && tickets.length === 0)) {
      return (
        <View
          style={styles.centerBox}
          accessibilityRole="progressbar"
          accessibilityLabel={t(locale, "tickets.loading")}
        >
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>{t(locale, "tickets.loading")}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.centerBox, styles.centerBoxEmpty]}>
        <Ionicons name="car-outline" size={72} color={C.primary} />
        <Text style={styles.emptyTitle}>
          {isDriverUi ? t(locale, "tickets.emptyDriver") : t(locale, "tickets.emptyReception")}
        </Text>
        <Text style={styles.emptyHint}>
          {isDriverUi ? t(locale, "tickets.emptyHintDriver") : t(locale, "tickets.emptyHintReception")}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.card}
        translucent={Platform.OS === "android"}
      />
      <View style={styles.container}>
        <View style={styles.contentFrame}>
        <View style={styles.header}>
          <View style={[styles.screenHeader, { paddingTop: insets.top + theme.space.md }]}>
            <ValetBackButton
              onPress={() => router.replace("/home")}
              accessibilityLabel={t(locale, "common.back")}
            />
            <Text style={styles.screenTitle}>
              {isDriverUi
                ? queueMode === "parking"
                  ? t(locale, "tickets.titleParkingQueue")
                  : t(locale, "tickets.titleDeliveryQueue")
                : t(locale, "tickets.titleReception")}
            </Text>
            <View style={{ width: 44 }} />
          </View>
        </View>

        <FlatList
          data={filteredTickets}
          keyExtractor={(item) => item.assignmentId}
          renderItem={renderTicket}
          ListHeaderComponent={
            <View style={styles.introBlock}>
              {isDriverUi && queueAlertCount > 0 ? (
                <View style={styles.queueBanner}>
                  <View style={styles.queueBannerIcon}>
                    <Ionicons name="notifications-outline" size={22} color={C.primary} />
                  </View>
                  <View style={styles.queueBannerText}>
                    <Text style={styles.queueBannerTitle} maxFontSizeMultiplier={2}>
                      {t(locale, "home.queueAlertTitle")}
                    </Text>
                    <Text style={styles.queueBannerBody} maxFontSizeMultiplier={2}>
                      {t(locale, "home.queueAlertBody")}
                    </Text>
                  </View>
                  <View style={styles.queueBannerBadge}>
                    <Text style={styles.queueBannerBadgeText}>
                      {queueAlertCount > 99 ? "99+" : String(queueAlertCount)}
                    </Text>
                  </View>
                </View>
              ) : null}
              <Text style={styles.intro} maxFontSizeMultiplier={2}>
                {isDriverUi
                  ? queueMode === "parking"
                    ? t(locale, "tickets.subtitleDriverParking")
                    : t(locale, "tickets.subtitleDriverDelivery")
                  : t(locale, "tickets.subtitleReception")}
              </Text>
            </View>
          }
          refreshing={loading && !initialLoad && tickets.length > 0}
          onRefresh={() => void loadTickets()}
          contentContainerStyle={filteredTickets.length === 0 ? styles.listEmptyGrow : styles.list}
          ListEmptyComponent={listEmpty}
        />
        </View>
      </View>
    </SafeAreaView>
  );
}
