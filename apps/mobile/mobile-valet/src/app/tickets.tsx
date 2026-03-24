import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { formatVehicleColorLabel } from "@parkit/shared/src/vehicleColors";
import api, { clearAuthToken } from "@/lib/api";
import { ValetBackButton } from "@/components/ValetBackButton";
import { SquareParkingOff } from "lucide-react-native";
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
/** Assignment from API GET /valets/me/assignments */
interface ApiAssignment {
  id: string;
  ticketId: string;
  valetId: string;
  assignedAt: string;
  ticket: {
    id: string;
    status: string;
    companyId: string;
    ticketCode?: string | null;
    keyCode?: string | null;
    entryTime?: string;
    vehicle: {
      plate: string;
      countryCode?: string;
      brand?: string | null;
      model?: string | null;
      color?: string | null;
    };
    parking: { name: string; address?: string };
    slot?: { label: string } | null;
  };
}

interface TicketAssignment {
  id: string;
  assignmentId: string;
  ticketId: string;
  valetId: string;
  /** Estado real del ticket en backend. */
  ticketStatus: string;
  status: "assigned" | "in-transit" | "completed";
  ticketCode?: string | null;
  keyCode?: string | null;
  vehiclePlate: string;
  vehicleBrandModel: string;
  vehicleColor: string | null;
  parkingName: string;
  createdAt: string;
  location: string;
  timestamp: string;
  companyId: string;
}

function mapApiAssignmentToDisplay(a: ApiAssignment): TicketAssignment {
  const status =
    a.ticket.status === "DELIVERED"
      ? "completed"
      : a.ticket.status === "REQUEST_DELIVERY"
        ? "assigned"
        : "assigned";
  const location =
    [a.ticket.parking?.name, a.ticket.slot?.label].filter(Boolean).join(" · ") ||
    a.ticket.parking?.address ||
    "—";
  const plate = a.ticket.vehicle?.plate ? `${a.ticket.vehicle.plate}` : "—";
  const brand = a.ticket.vehicle?.brand?.trim() || "";
  const model = a.ticket.vehicle?.model?.trim() || "";
  const brandModel = [brand, model].filter(Boolean).join(" ").trim() || "—";
  const color = a.ticket.vehicle?.color?.trim() || null;
  const parkingName = a.ticket.parking?.name?.trim() || "—";
  return {
    id: a.ticket.id,
    assignmentId: a.id,
    ticketId: a.ticket.id,
    valetId: a.valetId,
    ticketStatus: a.ticket.status,
    status,
    ticketCode: a.ticket.ticketCode ?? null,
    keyCode: a.ticket.keyCode ?? null,
    vehiclePlate: plate,
    vehicleBrandModel: brandModel,
    vehicleColor: color,
    parkingName,
    createdAt: a.ticket.entryTime || a.assignedAt,
    location,
    timestamp: a.assignedAt,
    companyId: a.ticket.companyId,
  };
}

type Theme = ReturnType<typeof useValetTheme>;

function createTicketStyles(theme: Theme, contentMaxWidth: number, sectionPadding: number) {
  const C = theme.colors;
  const S = theme.space;
  const F = ticketsA11y.font;
  const R = theme.radius;
  const M = ticketsA11y.minTouch;

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
      fontSize: F.title - 2,
      fontWeight: "800",
      color: C.text,
      flex: 1,
      textAlign: "center",
    },
    intro: {
      fontSize: F.secondary,
      color: C.textMuted,
      lineHeight: 24,
      fontWeight: "600",
      textAlign: "left",
    },
    introSecondary: {
      marginTop: S.xs,
      fontSize: F.secondary - 1,
      color: C.textSubtle,
      lineHeight: 20,
      fontWeight: "600",
      textAlign: "left",
    },
    introBlock: {
      marginTop: S.md,
      marginBottom: S.lg,
      gap: 2,
    },
    list: {
      padding: sectionPadding,
      paddingBottom: S.xxl,
    },
    listEmptyGrow: {
      flexGrow: 1,
      paddingHorizontal: sectionPadding,
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
      fontSize: F.secondary - 2,
      fontWeight: "700",
      color: C.textSubtle,
      textTransform: "uppercase",
      letterSpacing: 1.1,
      marginBottom: 4,
    },
    vehiclePlate: {
      fontSize: F.title + 2,
      fontWeight: "800",
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
      fontSize: F.secondary - 1,
      fontWeight: "700",
    },
    locationLabel: {
      fontSize: F.secondary - 1,
      fontWeight: "700",
      color: C.textMuted,
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
      fontSize: F.body - 1,
      lineHeight: 24,
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
      fontSize: F.secondary - 2,
      color: C.textMuted,
      fontWeight: "600",
    },
    metaValue: {
      flex: 1,
      fontSize: F.secondary,
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
      fontSize: F.button,
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
      fontSize: F.body,
      fontWeight: "700",
      color: C.success,
      textAlign: "center",
    },
    centerBox: {
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
      fontSize: F.body,
      color: C.textMuted,
      fontWeight: "600",
      textAlign: "center",
    },
    emptyTitle: {
      fontSize: F.title - 2,
      fontWeight: "800",
      color: C.text,
      textAlign: "center",
    },
    emptyHint: {
      fontSize: F.secondary,
      lineHeight: 24,
      color: C.textMuted,
      textAlign: "center",
      fontWeight: "500",
    },
  });
}

export default function TicketsScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  useValetProfileSync(user);
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const styles = useMemo(
    () => createTicketStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding]
  );

  const [tickets, setTickets] = useState<TicketAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

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
  }, [tickets, isDriverUi]);
  const feedback = useMemo(() => createFeedback(locale), [locale]);

  const loadTickets = useCallback(async (opts?: { silent?: boolean }) => {
    if (!user) return;
    const silent = opts?.silent === true;
    if (!silent) setLoading(true);
    try {
      const res = await api.get<{ data: ApiAssignment[] }>("/valets/me/assignments");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setTickets(list.map(mapApiAssignmentToDisplay));
    } catch {
      if (!silent) setTickets([]);
    } finally {
      if (!silent) setLoading(false);
      setInitialLoad(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) void loadTickets();
  }, [user, loadTickets]);

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

  const handleMarkParked = (item: TicketAssignment) => {
    feedback.confirm({
      title: t(locale, "tickets.confirmMarkParkedTitle"),
      message: t(locale, "tickets.confirmMarkParkedMessage"),
      confirmText: t(locale, "tickets.yesContinue"),
      onConfirm: async () => {
        try {
          await api.patch(
            `/tickets/${item.ticketId}`,
            { status: "PARKED" },
            { headers: { "x-company-id": item.companyId } }
          );
          feedback.success(t(locale, "tickets.successMarkedParked"));
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

  const handleLogout = () => {
    feedback.confirm({
      title: t(locale, "tickets.logoutConfirmTitle"),
      message: t(locale, "tickets.logoutConfirmMessage"),
      confirmText: t(locale, "tickets.logout"),
      destructive: true,
      onConfirm: async () => {
        await api.post("/valets/me/presence", { status: "AWAY" }).catch(() => {});
        await clearAuthToken();
        setUser(null);
        router.replace("/login");
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
                style={[styles.btn, styles.btnWarning]}
                onPress={() => handleMarkParked(item)}
                accessibilityRole="button"
                accessibilityHint={t(locale, "tickets.confirmMarkParkedMessage")}
              >
                <Ionicons name="arrow-undo-outline" size={28} color={C.white} style={styles.btnIcon} />
                <Text style={styles.btnText} maxFontSizeMultiplier={2}>
                  {t(locale, "tickets.actionMarkParked")}
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
        <SquareParkingOff size={72} color={C.textSubtle} strokeWidth={2} />
        <Text style={styles.emptyTitle}>
          {showReceptionUi ? t(locale, "tickets.emptyReception") : t(locale, "tickets.emptyDriver")}
        </Text>
        <Text style={styles.emptyHint}>
          {showReceptionUi ? t(locale, "tickets.emptyHintReception") : t(locale, "tickets.emptyHintDriver")}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.contentFrame}>
        <View style={styles.header}>
          <View style={styles.screenHeader}>
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
              <Text style={styles.intro} maxFontSizeMultiplier={2}>
                {isDriverUi
                  ? queueMode === "parking"
                    ? t(locale, "tickets.subtitleDriverParking")
                    : t(locale, "tickets.subtitleDriverDelivery")
                  : t(locale, "tickets.subtitleReception")}
              </Text>
            </View>
          }
          refreshing={loading && !initialLoad}
          onRefresh={() => void loadTickets()}
          contentContainerStyle={filteredTickets.length === 0 ? styles.listEmptyGrow : styles.list}
          ListEmptyComponent={listEmpty}
        />
        </View>
      </View>
    </SafeAreaView>
  );
}
