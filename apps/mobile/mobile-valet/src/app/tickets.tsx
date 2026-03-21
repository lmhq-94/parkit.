import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import api, { clearAuthToken } from "@/lib/api";
import { useValetTheme, statusVisuals as statusVisualsForTheme } from "@/theme/valetTheme";

/** Assignment from API GET /valets/me/assignments */
interface ApiAssignment {
  id: string;
  ticketId: string;
  valetId: string;
  role: string;
  assignedAt: string;
  ticket: {
    id: string;
    status: string;
    companyId: string;
    vehicle: { plate: string; countryCode?: string };
    parking: { name: string; address?: string };
    slot?: { label: string } | null;
  };
}

interface TicketAssignment {
  id: string;
  assignmentId: string;
  ticketId: string;
  valetId: string;
  status: "assigned" | "in-transit" | "completed";
  vehiclePlate: string;
  location: string;
  timestamp: string;
  companyId: string;
}

function mapApiAssignmentToDisplay(a: ApiAssignment): TicketAssignment {
  const status =
    a.ticket.status === "DELIVERED"
      ? "completed"
      : a.ticket.status === "REQUESTED"
        ? "assigned"
        : "assigned";
  const location =
    [a.ticket.parking?.name, a.ticket.slot?.label].filter(Boolean).join(" · ") ||
    a.ticket.parking?.address ||
    "—";
  const plate = a.ticket.vehicle?.plate ? `${a.ticket.vehicle.plate}` : "—";
  return {
    id: a.ticket.id,
    assignmentId: a.id,
    ticketId: a.ticket.id,
    valetId: a.valetId,
    status,
    vehiclePlate: plate,
    location,
    timestamp: a.assignedAt,
    companyId: a.ticket.companyId,
  };
}

type Theme = ReturnType<typeof useValetTheme>;

function createTicketStyles(theme: Theme) {
  const C = theme.colors;
  const S = theme.space;
  const F = theme.font;
  const R = theme.radius;
  const M = theme.minTouch;

  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.bg,
    },
    container: {
      flex: 1,
      backgroundColor: C.bg,
    },
    header: {
      paddingHorizontal: S.lg,
      paddingTop: S.sm,
      paddingBottom: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    headerTextBlock: {
      gap: S.xs,
    },
    title: {
      fontSize: F.title,
      fontWeight: "800",
      color: C.text,
      letterSpacing: Platform.OS === "ios" ? -0.5 : 0,
    },
    subtitle: {
      fontSize: F.subtitle,
      color: C.textMuted,
      lineHeight: 24,
      fontWeight: "500",
    },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "stretch",
      paddingVertical: S.md,
      paddingHorizontal: S.md,
      gap: S.md,
      backgroundColor: C.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    toolbarBtn: {
      flex: 1,
      minHeight: M,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
      paddingVertical: S.sm,
      paddingHorizontal: S.md,
      backgroundColor: C.bg,
      borderRadius: R.button,
      borderWidth: 2,
      borderColor: C.border,
    },
    toolbarBtnLabel: {
      fontSize: F.body,
      fontWeight: "700",
      color: C.text,
    },
    toolbarLogoutLabel: {
      color: C.logout,
    },
    list: {
      padding: S.md,
      paddingBottom: S.xxl,
    },
    listEmptyGrow: {
      flexGrow: 1,
      padding: S.lg,
      justifyContent: "center",
    },
    ticketCard: {
      backgroundColor: C.card,
      borderRadius: R.card,
      borderLeftWidth: 8,
      padding: S.xl,
      marginBottom: S.lg,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.isDark ? 0.35 : 0.08,
          shadowRadius: 8,
        },
        android: { elevation: theme.isDark ? 5 : 3 },
      }),
    },
    plateLabel: {
      fontSize: F.secondary,
      fontWeight: "600",
      color: C.textSubtle,
      marginBottom: 4,
    },
    vehiclePlate: {
      fontSize: F.hero,
      fontWeight: "800",
      color: C.text,
      letterSpacing: 2,
      marginBottom: S.md,
      fontVariant: ["tabular-nums"],
    },
    statusPill: {
      alignSelf: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: S.md,
      borderRadius: 12,
      marginBottom: S.lg,
    },
    statusPillText: {
      fontSize: F.status,
      fontWeight: "800",
    },
    locationLabel: {
      fontSize: F.secondary,
      fontWeight: "700",
      color: C.textMuted,
      marginBottom: 6,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: S.sm,
      marginBottom: S.lg,
    },
    locationIcon: {
      marginTop: 2,
    },
    location: {
      flex: 1,
      fontSize: F.body,
      lineHeight: 26,
      color: C.text,
      fontWeight: "600",
    },
    actions: {
      marginTop: S.xs,
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
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const styles = useMemo(() => createTicketStyles(theme), [theme]);

  const [tickets, setTickets] = useState<TicketAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const tx = useMemo(
    () => ({
      cancel: t(locale, "common.cancel"),
      ok: t(locale, "common.ok"),
    }),
    [locale]
  );

  const loadTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: ApiAssignment[] }>("/valets/me/assignments");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setTickets(list.map(mapApiAssignmentToDisplay));
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadTickets();
  }, [user, loadTickets]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const C = theme.colors;

  const statusLabel = (s: TicketAssignment["status"]) => {
    if (s === "assigned") return t(locale, "tickets.statusAssigned");
    if (s === "in-transit") return t(locale, "tickets.statusInTransit");
    return t(locale, "tickets.statusCompleted");
  };

  const handleStatusUpdate = (item: TicketAssignment, newStatus: "in-transit" | "completed") => {
    const isComplete = newStatus === "completed";
    Alert.alert(
      isComplete ? t(locale, "tickets.confirmCompleteTitle") : t(locale, "tickets.confirmStartTitle"),
      isComplete ? t(locale, "tickets.confirmCompleteMessage") : t(locale, "tickets.confirmStartMessage"),
      [
        { text: tx.cancel, style: "cancel" },
        {
          text: t(locale, "tickets.yesContinue"),
          onPress: async () => {
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
                Alert.alert(t(locale, "common.successTitle"), t(locale, "tickets.successDelivered"));
              } catch (e: unknown) {
                const msg =
                  e && typeof e === "object" && "response" in e
                    ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
                    : null;
                Alert.alert(t(locale, "common.errorTitle"), msg || t(locale, "tickets.errorUpdate"));
              }
            } else {
              setTickets((prev) =>
                prev.map((tkt) =>
                  tkt.ticketId === item.ticketId ? { ...tkt, status: "in-transit" as const } : tkt
                )
              );
              Alert.alert(t(locale, "common.successTitle"), t(locale, "tickets.successInTransit"));
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(t(locale, "tickets.logoutConfirmTitle"), t(locale, "tickets.logoutConfirmMessage"), [
      { text: tx.cancel, style: "cancel" },
      {
        text: t(locale, "tickets.logout"),
        style: "destructive",
        onPress: async () => {
          await clearAuthToken();
          setUser(null);
          router.replace("/login");
        },
      },
    ]);
  };

  const renderTicket = ({ item }: { item: TicketAssignment }) => {
    const vis = statusVisualsForTheme(item.status, theme.isDark);

    return (
      <View
        style={[styles.ticketCard, { borderLeftColor: vis.bar }]}
        accessibilityLabel={`${t(locale, "tickets.plateLabel")}: ${item.vehiclePlate}. ${statusLabel(item.status)}. ${t(locale, "tickets.locationLabel")}: ${item.location}`}
      >
        <Text style={styles.plateLabel}>{t(locale, "tickets.plateLabel")}</Text>
        <Text style={styles.vehiclePlate} accessibilityRole="header" maxFontSizeMultiplier={2.2}>
          {item.vehiclePlate}
        </Text>

        <View style={[styles.statusPill, { backgroundColor: vis.softBg }]}>
          <Text style={[styles.statusPillText, { color: vis.softText }]} maxFontSizeMultiplier={2}>
            {statusLabel(item.status)}
          </Text>
        </View>

        <Text style={styles.locationLabel}>{t(locale, "tickets.locationLabel")}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={26} color={C.primary} style={styles.locationIcon} />
          <Text style={styles.location} maxFontSizeMultiplier={2}>
            {item.location}
          </Text>
        </View>

        <View style={styles.actions}>
          {item.status === "assigned" && (
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => handleStatusUpdate(item, "in-transit")}
              accessibilityRole="button"
              accessibilityHint={t(locale, "tickets.confirmStartMessage")}
            >
              <Ionicons name="car-outline" size={26} color={C.white} style={styles.btnIcon} />
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
              <Ionicons name="checkmark-circle-outline" size={28} color={C.white} style={styles.btnIcon} />
              <Text style={styles.btnText} maxFontSizeMultiplier={2}>
                {t(locale, "tickets.actionComplete")}
              </Text>
            </TouchableOpacity>
          )}
          {item.status === "completed" && (
            <View style={styles.completedBox}>
              <Ionicons name="checkmark-done-circle" size={32} color={C.success} />
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
      <View style={styles.centerBox}>
        <Ionicons name="car-sport-outline" size={64} color={C.textSubtle} />
        <Text style={styles.emptyTitle}>{t(locale, "tickets.emptyTitle")}</Text>
        <Text style={styles.emptyHint}>{t(locale, "tickets.emptyHint")}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title} maxFontSizeMultiplier={1.8}>
              {t(locale, "tickets.title")}
            </Text>
            <Text style={styles.subtitle} maxFontSizeMultiplier={2}>
              {t(locale, "tickets.subtitle")}
            </Text>
          </View>
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => router.push("/settings")}
            accessibilityRole="button"
            accessibilityLabel={t(locale, "tickets.settings")}
          >
            <Ionicons name="settings-outline" size={28} color={C.text} />
            <Text style={styles.toolbarBtnLabel}>{t(locale, "tickets.settings")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel={t(locale, "tickets.logout")}
          >
            <Ionicons name="log-out-outline" size={28} color={C.logout} />
            <Text style={[styles.toolbarBtnLabel, styles.toolbarLogoutLabel]}>{t(locale, "tickets.logout")}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={tickets}
          keyExtractor={(item) => item.assignmentId}
          renderItem={renderTicket}
          refreshing={loading && !initialLoad}
          onRefresh={loadTickets}
          contentContainerStyle={tickets.length === 0 ? styles.listEmptyGrow : styles.list}
          ListEmptyComponent={listEmpty}
        />
      </View>
    </SafeAreaView>
  );
}
