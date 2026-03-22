import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import { useCompanyContext } from "@/lib/useCompanyContext";
import api from "@/lib/api";
import { messageFromAxios } from "@/lib/apiErrors";

interface TicketRow {
  id: string;
  status: string;
  vehicle?: { plate?: string; brand?: string; model?: string };
  parking?: { name?: string };
}

interface ValetOpt {
  id: string;
  user: { firstName: string; lastName: string };
}

export default function ReturnPickupScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  useValetProfileSync(user);
  const { companyId, loading: companyLoading } = useCompanyContext(user);
  const theme = useValetTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [plateFilter, setPlateFilter] = useState("");
  const [valets, setValets] = useState<ValetOpt[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [delivererId, setDelivererId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isReception = user?.valetStaffRole !== "DRIVER";
  const C = theme.colors;
  const M = ticketsA11y.minTouch;

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [tRes, vRes] = await Promise.all([
        api.get<{ data: TicketRow[] }>("/tickets", { params: { status: "PARKED" } }),
        api.get<{ data: ValetOpt[] }>("/valets/for-company"),
      ]);
      setTickets(Array.isArray(tRes.data?.data) ? tRes.data.data : []);
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
    const q = plateFilter.trim().toUpperCase();
    if (!q) return tickets;
    return tickets.filter((x) => (x.vehicle?.plate || "").toUpperCase().includes(q));
  }, [tickets, plateFilter]);

  const handleRequest = async () => {
    if (!selectedTicketId || !companyId) {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "returnPickup.selectTicket"));
      return;
    }
    setSubmitting(true);
    try {
      const body: { status: string; delivererValetId?: string | null } = {
        status: "REQUESTED",
      };
      if (delivererId) body.delivererValetId = delivererId;
      await api.patch(`/tickets/${selectedTicketId}`, body);
      Alert.alert(t(locale, "common.successTitle"), t(locale, "returnPickup.success"), [
        { text: t(locale, "common.ok"), onPress: () => router.replace("/tickets") },
      ]);
    } catch (e) {
      Alert.alert(
        t(locale, "common.errorTitle"),
        messageFromAxios(e) || t(locale, "tickets.errorUpdate")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <Redirect href="/login" />;

  if (!isReception) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.blocked}>
          <Ionicons name="hand-left-outline" size={56} color={C.textMuted} />
          <Text style={styles.blockedTitle}>{t(locale, "receive.driverBlockedTitle")}</Text>
          <Text style={styles.blockedBody}>{t(locale, "receive.driverBlockedBody")}</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>{t(locale, "common.back")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={28} color={C.text} />
          </Pressable>
          <Text style={styles.screenTitle}>{t(locale, "returnPickup.title")}</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.sub}>{t(locale, "returnPickup.subtitle")}</Text>

        <TextInput
          style={styles.input}
          value={plateFilter}
          onChangeText={(x) => setPlateFilter(x.toUpperCase())}
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
                <Text style={styles.plate}>{tk.vehicle?.plate || "—"}</Text>
                <Text style={styles.meta}>
                  {tk.vehicle?.brand} {tk.vehicle?.model}
                </Text>
                <Text style={styles.meta}>{tk.parking?.name}</Text>
              </Pressable>
            );
          })
        )}

        {selectedTicketId && (
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
                  <Text style={[styles.chipText, delivererId === v.id && styles.chipTextOn]}>
                    {v.user.firstName} {v.user.lastName}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { minHeight: M },
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
                  <Text style={styles.primaryBtnText}>{t(locale, "returnPickup.cta")}</Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type Theme = ReturnType<typeof useValetTheme>;

function createStyles(theme: Theme) {
  const C = theme.colors;
  const S = theme.space;
  const F = ticketsA11y.font;
  const R = theme.radius;

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: S.lg, paddingBottom: S.xxl * 2 },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: S.md,
    },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: R.button,
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
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
      marginBottom: S.lg,
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
