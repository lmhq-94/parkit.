import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y, useResponsiveLayout } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import { useCompanyContext } from "@/lib/useCompanyContext";
import api from "@/lib/api";
import { messageFromAxios } from "@/lib/apiErrors";
import { createFeedback } from "@/lib/feedback";
import { ValetBackButton } from "@/components/ValetBackButton";
import { StickyFormFooter } from "@/components/StickyFormFooter";
import { ValetChipAvatar } from "@/components/ValetChipAvatar";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

interface TicketRow {
  id: string;
  status: string;
  ticketCode?: string;
  delivererValetId?: string | null;
  vehicle?: { plate?: string; brand?: string; model?: string };
  parking?: { name?: string };
}

interface ValetOpt {
  id: string;
  user: { firstName: string; lastName: string; avatarUrl?: string | null };
}

export default function ReturnPickupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  useValetProfileSync(user);
  const { companyId, loading: companyLoading } = useCompanyContext(user);
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding]
  );

  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [ticketCodeFilter, setTicketCodeFilter] = useState("");
  const [valets, setValets] = useState<ValetOpt[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [delivererId, setDelivererId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isReception = user?.valetStaffRole !== "DRIVER";
  const C = theme.colors;
  const M = ticketsA11y.minTouch;
  const feedback = useMemo(() => createFeedback(locale), [locale]);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [tRes, vRes] = await Promise.all([
        api.get<{ data: TicketRow[] }>("/tickets", { params: { status: "PARKED,REQUEST_DELIVERY" } }),
        api.get<{ data: ValetOpt[] }>("/valets/for-company"),
      ]);
      const rows = Array.isArray(tRes.data?.data) ? tRes.data.data : [];
      setTickets(rows.filter((row) => !row.delivererValetId));
      setValets(Array.isArray(vRes.data?.data) ? vRes.data.data : []);
    } catch {
      setTickets([]);
      setValets([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (user && companyId) load();
  }, [user, companyId, load]);

  const filtered = useMemo(() => {
    const q = ticketCodeFilter.trim().toUpperCase();
    if (!q) return tickets;
    return tickets.filter((x) => (x.ticketCode || "").toUpperCase().includes(q));
  }, [tickets, ticketCodeFilter]);

  const selectedTicket = useMemo(
    () => filtered.find((tk) => tk.id === selectedTicketId) ?? null,
    [filtered, selectedTicketId]
  );

  const handleRequest = async () => {
    if (!selectedTicket || !companyId) {
      feedback.error(t(locale, "returnPickup.selectTicket"));
      return;
    }
    setSubmitting(true);
    try {
      if (selectedTicket.status === "REQUEST_DELIVERY") {
        await api.patch(`/tickets/${selectedTicket.id}`, { status: "DELIVERED" });
        feedback.success(t(locale, "returnPickup.successDelivered"), {
          onPress: () => router.replace("/tickets"),
        });
      } else {
        const body: { status: string; delivererValetId?: string | null } = {
          status: "REQUEST_DELIVERY",
        };
        if (delivererId) body.delivererValetId = delivererId;
        await api.patch(`/tickets/${selectedTicket.id}`, body);
        feedback.success(t(locale, "returnPickup.successRequested"), {
          onPress: () => router.replace("/tickets"),
        });
      }
    } catch (e) {
      const msg = messageFromAxios(e);
      feedback.error(
        msg === "NETWORK_ERROR"
          ? t(locale, "common.networkError")
          : msg || t(locale, "tickets.errorUpdate")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Redirect href="/login" />;

  if (!isReception) {
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <StatusBar
          barStyle={theme.isDark ? "light-content" : "dark-content"}
          backgroundColor={theme.colors.card}
          translucent={Platform.OS === "android"}
        />
        <View style={styles.frame}>
        <View style={[styles.screenHeader, { paddingTop: insets.top + theme.space.md }]}>
          <ValetBackButton
            onPress={() => router.back()}
            accessibilityLabel={t(locale, "common.back")}
          />
          <Text style={styles.screenTitle}>{t(locale, "returnPickup.title")}</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.blocked}>
          <Ionicons name="hand-left-outline" size={56} color={C.textMuted} />
          <Text style={styles.blockedTitle}>{t(locale, "receive.driverBlockedTitle")}</Text>
          <Text style={styles.blockedBody}>{t(locale, "receive.driverBlockedBody")}</Text>
        </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.card}
        translucent={Platform.OS === "android"}
      />
      <View style={styles.frame}>
      <View style={[styles.screenHeader, { paddingTop: insets.top + theme.space.md }]}>
        <ValetBackButton
          onPress={() => router.back()}
          accessibilityLabel={t(locale, "common.back")}
        />
        <Text style={styles.screenTitle}>{t(locale, "returnPickup.title")}</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={{ flex: 1, minHeight: 0 }}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={96}
        >
          <Text style={styles.sub}>{t(locale, "returnPickup.subtitle")}</Text>

          <TextInput
            style={styles.input}
            value={ticketCodeFilter}
            onChangeText={(x) => setTicketCodeFilter(x.toUpperCase())}
            placeholder={t(locale, "returnPickup.filterPlaceholder")}
            placeholderTextColor={C.textSubtle}
            autoCapitalize="characters"
          />

          {companyLoading || loading ? (
            <ActivityIndicator style={{ marginVertical: 24 }} color={C.primary} size="large" />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={48} color={C.textSubtle} />
              <Text style={styles.emptyText}>{t(locale, "returnPickup.empty")}</Text>
            </View>
          ) : (
            filtered.map((tk) => {
              const active = selectedTicketId === tk.id;
              return (
                <Pressable
                  key={tk.id}
                  onPress={() => {
                    setSelectedTicketId(tk.id);
                    setDelivererId(null);
                  }}
                  style={[styles.ticketCard, active && styles.ticketCardOn]}
                >
                  <Text style={styles.metaStrong}>{tk.ticketCode || "—"}</Text>
                  <Text style={styles.plate}>{tk.vehicle?.plate || "—"}</Text>
                  <Text style={styles.meta}>
                    {tk.vehicle?.brand} {tk.vehicle?.model}
                  </Text>
                  <Text style={styles.meta}>{tk.parking?.name}</Text>
                </Pressable>
              );
            })
          )}

          {selectedTicket?.status === "PARKED" ? (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "returnPickup.assignDriver")}</Text>
              <Text style={styles.help}>{t(locale, "returnPickup.assignHelp")}</Text>
              <View style={styles.chips}>
                <Pressable
                  onPress={() => setDelivererId(null)}
                  style={[styles.chip, delivererId === null && styles.chipOn]}
                >
                  <Text style={[styles.chipText, delivererId === null && styles.chipTextOn]}>
                    {t(locale, "receive.noDriver")}
                  </Text>
                </Pressable>
                {valets.map((v) => (
                  <Pressable
                    key={v.id}
                    onPress={() => setDelivererId(v.id)}
                    style={[styles.chip, delivererId === v.id && styles.chipOn]}
                  >
                    <View style={styles.chipRow}>
                      <ValetChipAvatar
                        id={v.id}
                        firstName={v.user.firstName}
                        lastName={v.user.lastName}
                        avatarUrl={v.user.avatarUrl}
                        isDark={theme.isDark}
                      />
                      <Text style={[styles.chipText, delivererId === v.id && styles.chipTextOn]}>
                        {v.user.firstName} {v.user.lastName}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </KeyboardAwareScrollView>

        {selectedTicketId ? (
          <KeyboardStickyView>
          <StickyFormFooter keyboardPinned>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { marginTop: 0, minHeight: M },
                submitting && styles.btnDisabled,
                pressed && styles.pressed,
              ]}
              onPress={handleRequest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="arrow-undo-circle-outline" size={24} color="#fff" />
                  <Text style={styles.primaryBtnText}>
                    {selectedTicket?.status === "REQUEST_DELIVERY"
                      ? t(locale, "returnPickup.ctaMarkDelivered")
                      : t(locale, "returnPickup.ctaRequestDelivery")}
                  </Text>
                </>
              )}
            </Pressable>
          </StickyFormFooter>
          </KeyboardStickyView>
        ) : null}
      </View>
      </View>
    </SafeAreaView>
  );
}

type Theme = ReturnType<typeof useValetTheme>;

function createStyles(theme: Theme, contentMaxWidth: number, sectionPadding: number) {
  const C = theme.colors;
  const S = theme.space;
  const F = ticketsA11y.font;
  const R = theme.radius;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    frame: {
      flex: 1,
      width: "100%",
      maxWidth: contentMaxWidth,
      alignSelf: "center",
    },
    screenHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: sectionPadding,
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    scroll: {
      paddingHorizontal: sectionPadding,
      paddingTop: S.sm,
      paddingBottom: S.xl,
    },
    screenTitle: {
      fontSize: F.title - 2,
      fontWeight: "800",
      color: C.text,
      flex: 1,
      textAlign: "center",
    },
    sub: {
      fontSize: F.secondary,
      color: C.textMuted,
      marginBottom: S.md,
      lineHeight: 22,
    },
    input: {
      backgroundColor: C.card,
      borderWidth: 2,
      borderColor: C.border,
      borderRadius: R.button,
      paddingHorizontal: S.md,
      paddingVertical: 14,
      fontSize: F.body,
      color: C.text,
      marginBottom: S.lg,
    },
    ticketCard: {
      backgroundColor: C.card,
      borderRadius: R.card,
      padding: S.lg,
      marginBottom: S.md,
      borderWidth: 2,
      borderColor: C.border,
    },
    ticketCardOn: {
      borderColor: C.primary,
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)",
    },
    plate: {
      fontSize: F.title,
      fontWeight: "800",
      color: C.text,
      letterSpacing: 1,
    },
    meta: { fontSize: F.secondary, color: C.textMuted, marginTop: 4 },
    metaStrong: { fontSize: F.secondary, color: C.primary, fontWeight: "800", marginBottom: 4 },
    sectionLabel: {
      fontSize: F.secondary,
      fontWeight: "800",
      color: C.textMuted,
      marginTop: S.lg,
      marginBottom: S.sm,
      textTransform: "uppercase",
    },
    help: { fontSize: F.secondary, color: C.textSubtle, marginBottom: S.md },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: S.sm, marginBottom: S.lg },
    chip: {
      paddingVertical: 10,
      paddingHorizontal: S.md,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: C.border,
      backgroundColor: C.card,
    },
    chipOn: {
      borderColor: C.primary,
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.12)",
    },
    chipText: { fontSize: F.secondary, fontWeight: "700", color: C.text },
    chipTextOn: { color: C.primary },
    chipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.xs,
    },
    chipAvatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      overflow: "hidden",
    },
    chipAvatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 11,
    },
    chipAvatarText: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: -0.2,
    },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
      backgroundColor: C.warning,
      borderRadius: R.button + 2,
      paddingVertical: S.md,
      marginTop: S.md,
      ...Platform.select({
        ios: {
          shadowColor: "#F59E0B",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: F.button },
    btnDisabled: { opacity: 0.55 },
    pressed: { opacity: 0.9 },
    empty: { alignItems: "center", paddingVertical: S.xxl, gap: S.md },
    emptyText: { fontSize: F.body, color: C.textMuted, textAlign: "center" },
    blocked: {
      flex: 1,
      padding: S.xl,
      justifyContent: "center",
      alignItems: "center",
      gap: S.md,
    },
    blockedTitle: { fontSize: F.title, fontWeight: "800", color: C.text, textAlign: "center" },
    blockedBody: { fontSize: F.body, color: C.textMuted, textAlign: "center", lineHeight: 26 },
    backBtn: {
      marginTop: S.lg,
      paddingVertical: S.md,
      paddingHorizontal: S.xl,
      backgroundColor: C.primary,
      borderRadius: R.button,
    },
    backBtnText: { color: "#fff", fontWeight: "800" },
  });
}
