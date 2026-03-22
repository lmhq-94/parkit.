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
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import { useCompanyContext } from "@/lib/useCompanyContext";
import api from "@/lib/api";
import { messageFromAxios } from "@/lib/apiErrors";

interface VehicleOwnerRow {
  client: {
    id: string;
    user: { firstName: string; lastName: string };
  };
}

interface VehicleLookup {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  countryCode: string;
  owners: VehicleOwnerRow[];
}

interface ParkingOpt {
  id: string;
  name: string;
  address: string;
}

interface ValetOpt {
  id: string;
  staffRole?: string | null;
  user: { firstName: string; lastName: string };
}

interface BookingLookup {
  id: string;
  status: string;
  clientId: string;
  vehicleId: string;
  parkingId: string;
  parking?: { name?: string; freeBenefitHours?: number };
  vehicle?: { plate?: string };
}

function randomWalkInPassword(): string {
  const r = Math.random().toString(36).slice(2, 10);
  return `Tmp${r}Aa1`;
}

export default function ReceiveScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  useValetProfileSync(user);
  const { companyId, loading: companyLoading, error: companyErr } = useCompanyContext(user);
  const theme = useValetTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [plate, setPlate] = useState("");
  const [countryCode, setCountryCode] = useState("CR");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [vehicle, setVehicle] = useState<VehicleLookup | null>(null);
  const [vehicleResolved, setVehicleResolved] = useState(false);

  const [driverFirst, setDriverFirst] = useState("");
  const [driverLast, setDriverLast] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehBrand, setVehBrand] = useState("");
  const [vehModel, setVehModel] = useState("");
  const [vehYear, setVehYear] = useState("");

  const [bookingCode, setBookingCode] = useState("");
  const [bookingCheck, setBookingCheck] = useState<BookingLookup | null | "invalid">(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [parkings, setParkings] = useState<ParkingOpt[]>([]);
  const [parkingId, setParkingId] = useState<string | null>(null);
  const [valets, setValets] = useState<ValetOpt[]>([]);
  const [driverValetId, setDriverValetId] = useState<string | null>(null);
  const [receptorValetId, setReceptorValetId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);

  const isReception = user?.valetStaffRole !== "DRIVER";
  const C = theme.colors;
  const M = ticketsA11y.minTouch;

  const loadMeta = useCallback(async () => {
    if (!companyId) return;
    setMetaLoading(true);
    try {
      const [pRes, vRes, meRes] = await Promise.all([
        api.get<{ data: ParkingOpt[] }>("/parkings"),
        api.get<{ data: ValetOpt[] }>("/valets/for-company"),
        api.get<{ data: { id: string } }>("/valets/me"),
      ]);
      setParkings(Array.isArray(pRes.data?.data) ? pRes.data.data : []);
      setValets(Array.isArray(vRes.data?.data) ? vRes.data.data : []);
      const rid = meRes.data?.data?.id;
      if (rid) setReceptorValetId(rid);
    } catch {
      setParkings([]);
      setValets([]);
    } finally {
      setMetaLoading(false);
    }
  }, [companyId]);

  const handleLookup = async () => {
    const p = plate.trim().toUpperCase();
    if (!p || !companyId) {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "receive.errorPlate"));
      return;
    }
    setLookupLoading(true);
    setVehicleResolved(false);
    setVehicle(null);
    setBookingCheck(null);
    try {
      const res = await api.get<{ data: VehicleLookup }>("/vehicles/by-plate", {
        params: { plate: p, countryCode: countryCode.trim() || "CR" },
      });
      const v = res.data?.data;
      if (v) {
        setVehicle(v);
        if (v.owners?.length) {
          const o = v.owners[0];
          setDriverFirst(o.client.user.firstName);
          setDriverLast(o.client.user.lastName);
        } else {
          setDriverFirst("");
          setDriverLast("");
          setDriverEmail("");
        }
        setVehBrand(v.brand);
        setVehModel(v.model);
        setVehYear(v.year != null ? String(v.year) : "");
      }
    } catch {
      setVehicle(null);
      setDriverFirst("");
      setDriverLast("");
      setDriverEmail("");
      setVehBrand("");
      setVehModel("");
      setVehYear("");
    } finally {
      setLookupLoading(false);
      setVehicleResolved(true);
      await loadMeta();
    }
  };

  const validateBooking = async () => {
    const id = bookingCode.trim();
    if (!id || !companyId) {
      setBookingCheck(null);
      return;
    }
    setBookingLoading(true);
    try {
      const res = await api.get<{ data: BookingLookup }>(`/bookings/${id}`);
      const b = res.data?.data;
      if (!b) {
        setBookingCheck("invalid");
        return;
      }
      if (b.status === "CANCELLED" || b.status === "NO_SHOW") {
        setBookingCheck("invalid");
        return;
      }
      setBookingCheck(b);
      if (!parkingId) setParkingId(b.parkingId);
    } catch {
      setBookingCheck("invalid");
    } finally {
      setBookingLoading(false);
    }
  };

  const resolveClientAndVehicleIds = async (): Promise<{
    clientId: string;
    vehicleId: string;
  } | null> => {
    if (!companyId || !receptorValetId) return null;

    if (vehicle && vehicle.owners?.length) {
      return {
        clientId: vehicle.owners[0].client.id,
        vehicleId: vehicle.id,
      };
    }

    const dims = {
      lengthCm: 450,
      widthCm: 180,
      heightCm: 150,
      weightKg: 1500,
    };

    if (vehicle && !vehicle.owners?.length) {
      const fn = driverFirst.trim();
      const ln = driverLast.trim();
      const em = driverEmail.trim();
      if (!fn || !ln || !em) {
        Alert.alert(t(locale, "common.errorTitle"), t(locale, "receive.errorDriver"));
        return null;
      }
      const pwd = randomWalkInPassword();
      const uRes = await api.post<{ data: { id: string } }>("/users", {
        firstName: fn,
        lastName: ln,
        email: em,
        phone: driverPhone.trim() || undefined,
        password: pwd,
        systemRole: "CUSTOMER",
      });
      const userId = uRes.data?.data?.id;
      if (!userId) throw new Error("User create failed");
      const linkRes = await api.post<{ data: { clientId?: string } }>(
        `/users/${userId}/vehicles`,
        { vehicleId: vehicle.id, isPrimary: true }
      );
      const clientId =
        linkRes.data?.data?.clientId ?? (await findClientIdForUser(userId));
      if (!clientId) throw new Error("Client link failed");
      return { clientId, vehicleId: vehicle.id };
    }

    const fn = driverFirst.trim();
    const ln = driverLast.trim();
    const em = driverEmail.trim();
    const br = vehBrand.trim() || "—";
    const md = vehModel.trim() || "—";
    if (!fn || !ln || !em) {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "receive.errorDriver"));
      return null;
    }
    const pwd = randomWalkInPassword();
    const uRes = await api.post<{ data: { id: string } }>("/users", {
      firstName: fn,
      lastName: ln,
      email: em,
      phone: driverPhone.trim() || undefined,
      password: pwd,
      systemRole: "CUSTOMER",
    });
    const userId = uRes.data?.data?.id;
    if (!userId) throw new Error("User create failed");

    const vehRes = await api.post<{ data: { id: string } }>("/vehicles", {
      plate: plate.trim().toUpperCase(),
      countryCode: countryCode.trim() || "CR",
      brand: br,
      model: md,
      year: vehYear.trim() ? parseInt(vehYear, 10) : undefined,
      dimensions: dims,
    });
    const vid = vehRes.data?.data?.id;
    if (!vid) throw new Error("Vehicle create failed");

    const linkRes = await api.post<{ data: { clientId?: string } }>(
      `/users/${userId}/vehicles`,
      {
        vehicleId: vid,
        isPrimary: true,
      }
    );
    const clientId =
      linkRes.data?.data?.clientId ?? (await findClientIdForUser(userId));
    if (!clientId) throw new Error("Client link failed");
    return { clientId, vehicleId: vid };
  };

  async function findClientIdForUser(uid: string): Promise<string | null> {
    try {
      const res = await api.get<{
        data: Array<{ id: string; user?: { id: string } }>;
      }>("/clients");
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      const row = list.find((c) => c.user?.id === uid);
      return row?.id ?? null;
    } catch {
      return null;
    }
  }

  const handleSubmit = async () => {
    if (!companyId || !receptorValetId || !parkingId) {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "receive.errorContext"));
      return;
    }
    if (bookingCheck && bookingCheck !== "invalid") {
      const pl = plate.trim().toUpperCase();
      if (
        bookingCheck.vehicle?.plate &&
        bookingCheck.vehicle.plate.toUpperCase() !== pl
      ) {
        Alert.alert(t(locale, "common.errorTitle"), t(locale, "receive.errorBookingPlate"));
        return;
      }
    }
    setSubmitting(true);
    try {
      const ids = await resolveClientAndVehicleIds();
      if (!ids) {
        setSubmitting(false);
        return;
      }
      const payload: Record<string, string> = {
        clientId: ids.clientId,
        vehicleId: ids.vehicleId,
        parkingId,
        receptorValetId,
      };
      if (driverValetId) payload.driverValetId = driverValetId;
      if (bookingCheck && bookingCheck !== "invalid")
        payload.bookingId = bookingCheck.id;

      await api.post("/tickets", payload);
      Alert.alert(t(locale, "common.successTitle"), t(locale, "receive.success"), [
        { text: t(locale, "common.ok"), onPress: () => router.replace("/tickets") },
      ]);
    } catch (e) {
      Alert.alert(
        t(locale, "common.errorTitle"),
        messageFromAxios(e) || t(locale, "receive.errorSubmit")
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

  const showNewDriverFields =
    vehicleResolved && (vehicle === null || !vehicle?.owners?.length);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={28} color={C.text} />
            </Pressable>
            <Text style={styles.screenTitle}>{t(locale, "receive.title")}</Text>
            <View style={{ width: 40 }} />
          </View>

          {companyErr === "no_company" && (
            <View style={styles.warnBanner}>
              <Ionicons name="business-outline" size={22} color="#B45309" />
              <Text style={styles.warnText}>{t(locale, "receive.warnNoCompany")}</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>{t(locale, "receive.stepPlate")}</Text>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={plate}
              onChangeText={(x) => setPlate(x.toUpperCase())}
              placeholder={t(locale, "receive.placeholderPlate")}
              placeholderTextColor={C.textSubtle}
              autoCapitalize="characters"
              maxFontSizeMultiplier={2}
            />
            <TextInput
              style={[styles.input, { width: 72 }]}
              value={countryCode}
              onChangeText={setCountryCode}
              placeholder="CR"
              placeholderTextColor={C.textSubtle}
              maxFontSizeMultiplier={2}
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { minHeight: M },
              (lookupLoading || companyLoading || !companyId) && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleLookup}
            disabled={lookupLoading || companyLoading || !companyId}
          >
            {lookupLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={22} color="#fff" />
                <Text style={styles.primaryBtnText}>{t(locale, "receive.lookup")}</Text>
              </>
            )}
          </Pressable>

          {vehicleResolved && vehicle && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t(locale, "receive.foundVehicle")}</Text>
              <Text style={styles.cardLine}>
                {vehicle.plate} · {vehicle.brand} {vehicle.model}
              </Text>
              {vehicle.owners?.length ? (
                <Text style={styles.cardHint}>
                  {t(locale, "receive.foundOwner")}: {vehicle.owners[0].client.user.firstName}{" "}
                  {vehicle.owners[0].client.user.lastName}
                </Text>
              ) : (
                <Text style={styles.cardHint}>{t(locale, "receive.noOwnerHint")}</Text>
              )}
            </View>
          )}

          {vehicleResolved && vehicle === null && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t(locale, "receive.newVehicleTitle")}</Text>
              <Text style={styles.cardHint}>{t(locale, "receive.newVehicleHint")}</Text>
            </View>
          )}

          {showNewDriverFields && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.driverSection")}</Text>
              <TextInput
                style={styles.input}
                value={driverFirst}
                onChangeText={setDriverFirst}
                placeholder={t(locale, "receive.placeholderFirst")}
                placeholderTextColor={C.textSubtle}
                maxFontSizeMultiplier={2}
              />
              <TextInput
                style={styles.input}
                value={driverLast}
                onChangeText={setDriverLast}
                placeholder={t(locale, "receive.placeholderLast")}
                placeholderTextColor={C.textSubtle}
                maxFontSizeMultiplier={2}
              />
              <TextInput
                style={styles.input}
                value={driverEmail}
                onChangeText={setDriverEmail}
                placeholder={t(locale, "receive.placeholderEmail")}
                placeholderTextColor={C.textSubtle}
                keyboardType="email-address"
                autoCapitalize="none"
                maxFontSizeMultiplier={2}
              />
              <TextInput
                style={styles.input}
                value={driverPhone}
                onChangeText={setDriverPhone}
                placeholder={t(locale, "receive.placeholderPhone")}
                placeholderTextColor={C.textSubtle}
                keyboardType="phone-pad"
                maxFontSizeMultiplier={2}
              />
            </>
          )}

          {vehicleResolved && vehicle === null && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.vehicleSection")}</Text>
              <TextInput
                style={styles.input}
                value={vehBrand}
                onChangeText={setVehBrand}
                placeholder={t(locale, "receive.placeholderBrand")}
                placeholderTextColor={C.textSubtle}
                maxFontSizeMultiplier={2}
              />
              <TextInput
                style={styles.input}
                value={vehModel}
                onChangeText={setVehModel}
                placeholder={t(locale, "receive.placeholderModel")}
                placeholderTextColor={C.textSubtle}
                maxFontSizeMultiplier={2}
              />
              <TextInput
                style={styles.input}
                value={vehYear}
                onChangeText={setVehYear}
                placeholder={t(locale, "receive.placeholderYear")}
                placeholderTextColor={C.textSubtle}
                keyboardType="number-pad"
                maxFontSizeMultiplier={2}
              />
            </>
          )}

          {vehicleResolved && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.benefitSection")}</Text>
              <Text style={styles.help}>{t(locale, "receive.benefitHelp")}</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={bookingCode}
                  onChangeText={setBookingCode}
                  placeholder={t(locale, "receive.placeholderBooking")}
                  placeholderTextColor={C.textSubtle}
                  maxFontSizeMultiplier={2}
                />
                <Pressable
                  style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                  onPress={validateBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color={C.primary} />
                  ) : (
                    <Text style={styles.secondaryBtnText}>{t(locale, "receive.validate")}</Text>
                  )}
                </Pressable>
              </View>
              {bookingCheck && bookingCheck !== "invalid" && (
                <View style={styles.okBanner}>
                  <Ionicons name="checkmark-circle" size={22} color={C.success} />
                  <Text style={styles.okText}>
                    {t(locale, "receive.benefitOk", {
                      hours: String(bookingCheck.parking?.freeBenefitHours ?? 0),
                    })}
                  </Text>
                </View>
              )}
              {bookingCheck === "invalid" && (
                <Text style={styles.errInline}>{t(locale, "receive.benefitInvalid")}</Text>
              )}

              <Text style={styles.sectionLabel}>{t(locale, "receive.parkingSection")}</Text>
              {metaLoading ? (
                <ActivityIndicator color={C.primary} />
              ) : (
                <View style={styles.chips}>
                  {parkings.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => setParkingId(p.id)}
                      style={[
                        styles.chip,
                        parkingId === p.id && styles.chipOn,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          parkingId === p.id && styles.chipTextOn,
                        ]}
                        maxFontSizeMultiplier={2}
                      >
                        {p.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <Text style={styles.sectionLabel}>{t(locale, "receive.driverValetSection")}</Text>
              <Text style={styles.help}>{t(locale, "receive.driverValetHelp")}</Text>
              <View style={styles.chips}>
                <Pressable
                  onPress={() => setDriverValetId(null)}
                  style={[styles.chip, driverValetId === null && styles.chipOn]}
                >
                  <Text
                    style={[styles.chipText, driverValetId === null && styles.chipTextOn]}
                    maxFontSizeMultiplier={2}
                  >
                    {t(locale, "receive.noDriver")}
                  </Text>
                </Pressable>
                {valets.map((v) => (
                  <Pressable
                    key={v.id}
                    onPress={() => setDriverValetId(v.id)}
                    style={[styles.chip, driverValetId === v.id && styles.chipOn]}
                  >
                    <Text
                      style={[styles.chipText, driverValetId === v.id && styles.chipTextOn]}
                      maxFontSizeMultiplier={2}
                    >
                      {v.user.firstName} {v.user.lastName}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { marginTop: 24, minHeight: M },
                  submitting && styles.btnDisabled,
                  pressed && styles.pressed,
                ]}
                onPress={handleSubmit}
                disabled={submitting || !parkingId}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="ticket-outline" size={22} color="#fff" />
                    <Text style={styles.primaryBtnText}>{t(locale, "receive.submit")}</Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
      marginBottom: S.lg,
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
    sectionLabel: {
      fontSize: F.secondary,
      fontWeight: "800",
      color: C.textMuted,
      marginBottom: S.sm,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    help: {
      fontSize: F.secondary,
      color: C.textSubtle,
      marginBottom: S.md,
      lineHeight: 22,
    },
    row: { flexDirection: "row", gap: S.sm, alignItems: "center", marginBottom: S.md },
    input: {
      backgroundColor: C.card,
      borderWidth: 2,
      borderColor: C.border,
      borderRadius: R.button,
      paddingHorizontal: S.md,
      paddingVertical: 14,
      fontSize: F.body,
      color: C.text,
      marginBottom: S.sm,
    },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
      backgroundColor: C.primary,
      borderRadius: R.button + 2,
      paddingVertical: S.md,
      marginBottom: S.lg,
      ...Platform.select({
        ios: {
          shadowColor: C.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: { elevation: 3 },
      }),
    },
    primaryBtnText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: F.button,
    },
    secondaryBtn: {
      paddingHorizontal: S.md,
      paddingVertical: 14,
      borderRadius: R.button,
      borderWidth: 2,
      borderColor: C.primary,
      backgroundColor: C.card,
      minWidth: 100,
      alignItems: "center",
    },
    secondaryBtnText: { color: C.primary, fontWeight: "800" },
    btnDisabled: { opacity: 0.55 },
    pressed: { opacity: 0.9 },
    card: {
      backgroundColor: C.card,
      borderRadius: R.card,
      padding: S.lg,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: S.lg,
    },
    cardTitle: { fontSize: F.body, fontWeight: "800", color: C.text, marginBottom: S.xs },
    cardLine: { fontSize: F.title - 4, fontWeight: "700", color: C.text },
    cardHint: { fontSize: F.secondary, color: C.textMuted, marginTop: S.sm, lineHeight: 22 },
    warnBanner: {
      flexDirection: "row",
      gap: S.sm,
      alignItems: "center",
      backgroundColor: "rgba(245, 158, 11, 0.12)",
      borderRadius: R.button,
      padding: S.md,
      marginBottom: S.lg,
      borderWidth: 1,
      borderColor: "rgba(245, 158, 11, 0.35)",
    },
    warnText: { flex: 1, color: "#B45309", fontWeight: "600", fontSize: F.secondary },
    okBanner: {
      flexDirection: "row",
      gap: S.sm,
      alignItems: "center",
      marginBottom: S.md,
    },
    okText: { flex: 1, color: C.success, fontWeight: "700", fontSize: F.secondary },
    errInline: { color: "#DC2626", marginBottom: S.md, fontWeight: "600" },
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
