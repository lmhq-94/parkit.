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
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { formatPlate } from "@parkit/shared";
import { useAuthStore, useLocaleStore, useCompanyStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y, useResponsiveLayout } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import api from "@/lib/api";
import { messageFromAxios } from "@/lib/apiErrors";
import { useOnAppForeground } from "@/lib/useOnAppForeground";
import { RECEIVE_META_POLL_MS } from "@/lib/syncConstants";
import { useNearestParking, haversineKm } from "@/lib/useNearestParking";
import { formatPhoneInternational, phoneDigitsForApi } from "@/lib/phoneInternational";
import { ValetBackButton } from "@/components/ValetBackButton";
import { StickyFormFooter } from "@/components/StickyFormFooter";
import { ReservationQrPanel, createQrStyles } from "@/components/ReservationQrPanel";

interface VehicleOwnerRow {
  client: {
    id: string;
    user: {
      id?: string;
      firstName: string;
      lastName: string;
      email?: string | null;
      phone?: string | null;
    };
  };
}

interface VehicleLookup {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  countryCode: string;
  companyId: string;
  owners: VehicleOwnerRow[];
}

interface CatalogMake {
  id: number;
  name: string;
}

interface CatalogModel {
  id: number;
  name: string;
}

interface VehicleDimensions {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  weightKg?: number;
}

interface ParkingOpt {
  id: string;
  name: string;
  address: string;
  companyId: string;
}

const COUNTRY_CR = "CR";

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

interface ClientByIdLookup {
  id: string;
  user?: { email?: string | null; phone?: string | null };
}

function randomWalkInPassword(): string {
  const r = Math.random().toString(36).slice(2, 10);
  return `Tmp${r}Aa1`;
}

function isValidCrPlate(value: string): boolean {
  const p = formatPlate(value).trim();
  return /^\d{6}$/.test(p) || /^[A-Z]{3}-\d{3}$/.test(p);
}

/** Extrae un posible UUID/id de reserva desde texto plano o URL en el QR. */
function extractBookingIdFromScan(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^[a-f0-9-]{8,}$/i.test(t)) return t;
  try {
    const u = new URL(t);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^[a-f0-9-]{8,}$/i.test(last)) return last;
    const q = u.searchParams.get("id") || u.searchParams.get("bookingId");
    if (q && /^[a-f0-9-]{8,}$/i.test(q.trim())) return q.trim();
  } catch {
    /* no es URL */
  }
  return t;
}

export default function ReceiveScreen() {
  const router = useRouter();
  const flowRaw = useLocalSearchParams<{ flow?: string | string[] }>().flow;
  const flowParam = Array.isArray(flowRaw) ? flowRaw[0] : flowRaw;
  const reservationFlow = flowParam === "reservation";

  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  useValetProfileSync(user);
  const setCompanyId = useCompanyStore((s) => s.setCompanyId);
  const storedCompanyId = useCompanyStore((s) => s.companyId);
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding]
  );
  const qrStyles = useMemo(() => createQrStyles(theme), [theme]);

  const [plate, setPlate] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupReadyForPlate, setLookupReadyForPlate] = useState("");
  const [vehicle, setVehicle] = useState<VehicleLookup | null>(null);
  const [vehicleResolved, setVehicleResolved] = useState(false);

  const [driverFirst, setDriverFirst] = useState("");
  const [driverLast, setDriverLast] = useState("");
  const [driverEmail, setDriverEmail] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [vehBrand, setVehBrand] = useState("");
  const [vehModel, setVehModel] = useState("");
  const [vehYear, setVehYear] = useState("");
  const [catalogMakes, setCatalogMakes] = useState<CatalogMake[]>([]);
  const [catalogModels, setCatalogModels] = useState<CatalogModel[]>([]);
  const [loadingCatalogMakes, setLoadingCatalogMakes] = useState(false);
  const [loadingCatalogModels, setLoadingCatalogModels] = useState(false);
  const [catalogDimensions, setCatalogDimensions] = useState<VehicleDimensions | null>(null);
  const [loadedOwnerUserId, setLoadedOwnerUserId] = useState<string | null>(null);
  const [loadedDriverSnapshot, setLoadedDriverSnapshot] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null>(null);
  const [loadedVehicleSnapshot, setLoadedVehicleSnapshot] = useState<{
    brand: string;
    model: string;
    year: string;
  } | null>(null);

  const [bookingCode, setBookingCode] = useState("");
  const [bookingCheck, setBookingCheck] = useState<BookingLookup | null | "invalid">(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [parkings, setParkings] = useState<ParkingOpt[]>([]);
  const [parkingId, setParkingId] = useState<string | null>(null);
  const [valets, setValets] = useState<ValetOpt[]>([]);
  const [driverValetId, setDriverValetId] = useState<string | null>(null);
  const [receptorValetId, setReceptorValetId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  /** 1=tarjeta, 2=matrícula … 6=parqueo (walk-in); reserva: QR en 3 → hasta 7. */
  const [wizardStep, setWizardStep] = useState(1);
  const [cardAcknowledged, setCardAcknowledged] = useState(false);
  const [ticketCodesAcknowledged, setTicketCodesAcknowledged] = useState(false);
  const [receiveParkingModalOpen, setReceiveParkingModalOpen] = useState(false);
  const [vehicleBrandModalOpen, setVehicleBrandModalOpen] = useState(false);
  const [vehicleModelModalOpen, setVehicleModelModalOpen] = useState(false);
  const [manualBrandMode, setManualBrandMode] = useState(false);
  const [manualModelMode, setManualModelMode] = useState(false);
  /** null = usar parqueo más cercano según GPS; si no, id elegido manualmente. */
  const [receiveManualParkingId, setReceiveManualParkingId] = useState<string | null>(null);

  const isReception = user?.valetStaffRole !== "DRIVER";
  const C = theme.colors;
  const M = ticketsA11y.minTouch;

  const parkingStepNum = reservationFlow ? 7 : 6;
  const driverStepNum = reservationFlow ? 4 : 3;
  const vehicleStepNum = reservationFlow ? 5 : 4;
  const ticketStepNum = reservationFlow ? 6 : 5;

  const { nearest, allParkings, status: locStatus, userCoords } = useNearestParking(
    !!user && isReception && wizardStep === parkingStepNum
  );

  const receiveTitle = reservationFlow
    ? t(locale, "receive.titleReservation")
    : t(locale, "receive.title");

  const effectiveCompanyId = useMemo(() => {
    if (vehicle?.companyId) return vehicle.companyId;
    if (parkingId) {
      return parkings.find((x) => x.id === parkingId)?.companyId ?? null;
    }
    return null;
  }, [vehicle, parkingId, parkings]);

  /** Empresa para validar reserva antes de tener plaza/placa (p. ej. cabecera API). */
  const companyIdForBooking = useMemo(() => {
    return (
      effectiveCompanyId ??
      parkings[0]?.companyId ??
      allParkings[0]?.companyId ??
      storedCompanyId ??
      null
    );
  }, [effectiveCompanyId, parkings, allParkings, storedCompanyId]);

  const displayedReceiveParking = useMemo(() => {
    if (!allParkings.length) return null;
    if (receiveManualParkingId) {
      const p = allParkings.find((x) => x.id === receiveManualParkingId);
      if (!p) return null;
      let distanceKm: number | null = null;
      if (
        userCoords &&
        p.latitude != null &&
        p.longitude != null &&
        !Number.isNaN(p.latitude) &&
        !Number.isNaN(p.longitude)
      ) {
        distanceKm = haversineKm(userCoords.lat, userCoords.lon, p.latitude, p.longitude);
      }
      return { parking: p, distanceKm, isManual: true };
    }
    if (nearest) return { ...nearest, isManual: false };
    return { parking: allParkings[0], distanceKm: null, isManual: false };
  }, [allParkings, receiveManualParkingId, nearest, userCoords]);

  useEffect(() => {
    if (wizardStep !== parkingStepNum) return;
    if (receiveManualParkingId) {
      const p = allParkings.find((x) => x.id === receiveManualParkingId);
      if (p) setParkingId(p.id);
      return;
    }
    if (nearest) {
      setParkingId(nearest.parking.id);
      return;
    }
    if (allParkings[0]) setParkingId(allParkings[0].id);
  }, [wizardStep, parkingStepNum, receiveManualParkingId, nearest, allParkings]);

  useEffect(() => {
    if (!effectiveCompanyId) {
      setCompanyId(null);
      setValets([]);
      return;
    }
    setCompanyId(effectiveCompanyId);
    let cancelled = false;
    (async () => {
      try {
        const vRes = await api.get<{ data: ValetOpt[] }>("/valets/for-company");
        if (!cancelled) {
          setValets(Array.isArray(vRes.data?.data) ? vRes.data.data : []);
        }
      } catch {
        if (!cancelled) setValets([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [effectiveCompanyId, setCompanyId]);

  const loadReceiveMeta = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!user) return;
      const silent = opts?.silent === true;
      if (!silent) setMetaLoading(true);
      try {
        const [pRes, meRes] = await Promise.all([
          api.get<
            {
              data: Array<{
                id: string;
                name: string;
                address: string;
                companyId: string;
              }>;
            }
          >("/parkings/valet/all-locations"),
          api.get<{ data: { id: string } }>("/valets/me"),
        ]);
        const plist = Array.isArray(pRes.data?.data) ? pRes.data.data : [];
        setParkings(
          plist.map((p) => ({
            id: p.id,
            name: p.name,
            address: p.address,
            companyId: p.companyId,
          }))
        );
        const rid = meRes.data?.data?.id;
        if (rid) setReceptorValetId(rid);
      } catch {
        if (!silent) setParkings([]);
      } finally {
        if (!silent) setMetaLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    void loadReceiveMeta();
  }, [loadReceiveMeta]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      void loadReceiveMeta({ silent: true });
    }, RECEIVE_META_POLL_MS);
    return () => clearInterval(id);
  }, [user, loadReceiveMeta]);

  useOnAppForeground(() => {
    if (user) void loadReceiveMeta({ silent: true });
  });

  const handleLookup = async (opts?: { advanceStep?: boolean; plateValue?: string }) => {
    const advanceStep = opts?.advanceStep ?? true;
    const formatted = formatPlate(opts?.plateValue ?? plate);
    if (!formatted.trim()) {
      if (advanceStep) {
        Alert.alert(t(locale, "common.errorTitle"), t(locale, "receive.errorPlate"));
      }
      return;
    }
    setPlate(formatted);
    setTicketCodesAcknowledged(false);
    setReceiveManualParkingId(null);
    setLookupLoading(true);
    setVehicleResolved(false);
    setVehicle(null);
    if (!reservationFlow) setBookingCheck(null);
    try {
      const res = await api.get<{ data: VehicleLookup }>("/vehicles/valet/by-plate", {
        params: { plate: formatted, countryCode: COUNTRY_CR },
      });
      const v = res.data?.data;
      if (v) {
        setVehicle(v);
        if (v.owners?.length) {
          const o = v.owners[0];
          setLoadedOwnerUserId(o.client.user.id ?? null);
          setDriverFirst(o.client.user.firstName);
          setDriverLast(o.client.user.lastName);
          const ownerEmail = o.client.user.email?.trim() ?? "";
          const ownerPhone = o.client.user.phone?.trim() ?? "";
          if (ownerEmail || ownerPhone) {
            setDriverEmail(ownerEmail);
            setDriverPhone(formatPhoneInternational(ownerPhone));
            setLoadedDriverSnapshot({
              firstName: o.client.user.firstName,
              lastName: o.client.user.lastName,
              email: ownerEmail,
              phone: formatPhoneInternational(ownerPhone),
            });
          } else {
            const fallbackContact = await findClientContact(o.client.id);
            setDriverEmail(fallbackContact.email ?? "");
            setDriverPhone(formatPhoneInternational(fallbackContact.phone ?? ""));
            setLoadedDriverSnapshot({
              firstName: o.client.user.firstName,
              lastName: o.client.user.lastName,
              email: fallbackContact.email ?? "",
              phone: formatPhoneInternational(fallbackContact.phone ?? ""),
            });
          }
        } else {
          setLoadedOwnerUserId(null);
          setLoadedDriverSnapshot(null);
          setDriverFirst("");
          setDriverLast("");
          setDriverEmail("");
          setDriverPhone("");
        }
        setVehBrand(v.brand);
        setVehModel(v.model);
        setVehYear(v.year != null ? String(v.year) : "");
        setLoadedVehicleSnapshot({
          brand: v.brand?.trim() ?? "",
          model: v.model?.trim() ?? "",
          year: v.year != null ? String(v.year) : "",
        });
      } else {
        setVehicle(null);
        setLoadedOwnerUserId(null);
        setLoadedDriverSnapshot(null);
        setLoadedVehicleSnapshot(null);
        setDriverFirst("");
        setDriverLast("");
        setDriverEmail("");
        setDriverPhone("");
        setVehBrand("");
        setVehModel("");
        setVehYear("");
      }
    } catch {
      setVehicle(null);
      setLoadedOwnerUserId(null);
      setLoadedDriverSnapshot(null);
      setLoadedVehicleSnapshot(null);
      setDriverFirst("");
      setDriverLast("");
      setDriverEmail("");
      setDriverPhone("");
      setVehBrand("");
      setVehModel("");
      setVehYear("");
    } finally {
      setLookupLoading(false);
      setVehicleResolved(true);
      setLookupReadyForPlate(formatted);
      if (advanceStep) setWizardStep(3);
    }
  };

  useEffect(() => {
    if (wizardStep !== 2) return;
    const formatted = formatPlate(plate).trim();
    if (!isValidCrPlate(formatted)) {
      setVehicleResolved(false);
      setLookupReadyForPlate("");
      setVehicle(null);
      return;
    }
    const id = setTimeout(() => {
      if (lookupLoading || formatted === lookupReadyForPlate) return;
      void handleLookup({ advanceStep: false, plateValue: formatted });
    }, 350);
    return () => clearTimeout(id);
  }, [wizardStep, plate, lookupLoading, lookupReadyForPlate]);

  const validateBooking = async (overrideCode?: string) => {
    const id = (overrideCode ?? bookingCode).trim();
    if (!id) {
      setBookingCheck(null);
      return;
    }
    const cid = companyIdForBooking;
    if (!cid) {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "receive.errorBookingCompany"));
      return;
    }
    setCompanyId(cid);
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
    const cid = useCompanyStore.getState().companyId;
    if (!cid || !receptorValetId) return null;

    if (vehicle && vehicle.owners?.length) {
      if (loadedOwnerUserId && loadedDriverSnapshot) {
        const nextDriver = {
          firstName: driverFirst.trim(),
          lastName: driverLast.trim(),
          email: driverEmail.trim(),
          phone: driverPhone.trim(),
        };
        const changedDriver =
          nextDriver.firstName !== loadedDriverSnapshot.firstName ||
          nextDriver.lastName !== loadedDriverSnapshot.lastName ||
          nextDriver.email !== loadedDriverSnapshot.email ||
          nextDriver.phone !== loadedDriverSnapshot.phone;
        if (changedDriver) {
          await api.patch(`/users/${loadedOwnerUserId}`, {
            firstName: nextDriver.firstName,
            lastName: nextDriver.lastName,
            email: nextDriver.email,
            phone: phoneDigitsForApi(nextDriver.phone),
          });
        }
      }
      if (loadedVehicleSnapshot) {
        const nextVehicle = {
          brand: vehBrand.trim(),
          model: vehModel.trim(),
          year: vehYear.trim(),
        };
        const changedVehicle =
          nextVehicle.brand !== loadedVehicleSnapshot.brand ||
          nextVehicle.model !== loadedVehicleSnapshot.model ||
          nextVehicle.year !== loadedVehicleSnapshot.year;
        if (changedVehicle) {
          await api.patch(`/vehicles/${vehicle.id}`, {
            brand: nextVehicle.brand,
            model: nextVehicle.model,
            ...(nextVehicle.year ? { year: parseInt(nextVehicle.year, 10) } : {}),
            ...(catalogDimensions ? { dimensions: catalogDimensions } : {}),
          });
        }
      }
      return {
        clientId: vehicle.owners[0].client.id,
        vehicleId: vehicle.id,
      };
    }

    const dims: VehicleDimensions =
      catalogDimensions ?? {
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
        phone: phoneDigitsForApi(driverPhone),
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
      phone: phoneDigitsForApi(driverPhone),
      password: pwd,
      systemRole: "CUSTOMER",
    });
    const userId = uRes.data?.data?.id;
    if (!userId) throw new Error("User create failed");

    const vehRes = await api.post<{ data: { id: string } }>("/vehicles", {
      plate: formatPlate(plate),
      countryCode: COUNTRY_CR,
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

  async function findClientContact(
    clientId: string
  ): Promise<{ email: string | null; phone: string | null }> {
    try {
      const res = await api.get<{ data: ClientByIdLookup }>(`/clients/${clientId}`);
      const email = res.data?.data?.user?.email;
      const phone = res.data?.data?.user?.phone;
      return {
        email: typeof email === "string" && email.trim() ? email.trim() : null,
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
      };
    } catch {
      return { email: null, phone: null };
    }
  }

  const handleSubmit = async () => {
    const cid = effectiveCompanyId;
    if (!cid || !receptorValetId || !parkingId) {
      Alert.alert(t(locale, "common.errorTitle"), t(locale, "receive.errorContext"));
      return;
    }
    setCompanyId(cid);
    if (bookingCheck && bookingCheck !== "invalid") {
      const pl = formatPlate(plate);
      if (
        bookingCheck.vehicle?.plate &&
        formatPlate(bookingCheck.vehicle.plate) !== pl
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
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.frame}>
        <View style={styles.screenHeader}>
          <ValetBackButton
            onPress={() => router.back()}
            accessibilityLabel={t(locale, "common.back")}
          />
          <Text style={styles.screenTitle}>{receiveTitle}</Text>
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

  const showNewDriverFields =
    vehicleResolved && (vehicle === null || !vehicle?.owners?.length);

  const plateFormatted = formatPlate(plate).trim();
  const plateLooksValid = isValidCrPlate(plateFormatted);
  const driverValid =
    driverFirst.trim().length > 0 &&
    driverLast.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverEmail.trim());
  const vehicleDataValid =
    vehBrand.trim().length > 0 && vehModel.trim().length > 0;
  const bookingValidated = bookingCheck !== null && bookingCheck !== "invalid";

  const canSubmitParking =
    wizardStep === parkingStepNum &&
    !!parkingId &&
    !!receptorValetId &&
    !!effectiveCompanyId;

  useEffect(() => {
    let cancelled = false;
    setLoadingCatalogMakes(true);
    (async () => {
      try {
        const year = vehYear.trim();
        const url = year
          ? `/vehicles/catalog/makes?year=${encodeURIComponent(year)}`
          : "/vehicles/catalog/makes";
        const res = await api.get<{ data: CatalogMake[] }>(url);
        if (!cancelled) setCatalogMakes(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch {
        if (!cancelled) setCatalogMakes([]);
      } finally {
        if (!cancelled) setLoadingCatalogMakes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vehYear]);

  useEffect(() => {
    const make = vehBrand.trim();
    if (!make) {
      setCatalogModels([]);
      return;
    }
    let cancelled = false;
    setLoadingCatalogModels(true);
    (async () => {
      try {
        const params = new URLSearchParams({ make });
        if (vehYear.trim()) params.set("year", vehYear.trim());
        const res = await api.get<{ data: CatalogModel[] }>(
          `/vehicles/catalog/models?${params.toString()}`
        );
        if (!cancelled) setCatalogModels(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch {
        if (!cancelled) setCatalogModels([]);
      } finally {
        if (!cancelled) setLoadingCatalogModels(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vehBrand, vehYear]);

  useEffect(() => {
    const make = vehBrand.trim();
    const model = vehModel.trim();
    if (!make || !model) {
      setCatalogDimensions(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const q = new URLSearchParams({ make, model });
        if (vehYear.trim()) q.set("year", vehYear.trim());
        const res = await api.get<{ data: VehicleDimensions }>(
          `/vehicles/catalog/dimensions?${q.toString()}`
        );
        const d = res.data?.data ?? {};
        const hasDims =
          d.lengthCm != null || d.widthCm != null || d.heightCm != null || d.weightKg != null;
        if (!cancelled) setCatalogDimensions(hasDims ? d : null);
      } catch {
        if (!cancelled) setCatalogDimensions(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [vehBrand, vehModel, vehYear]);

  const backStepForDriver = reservationFlow ? 3 : 2;

  let footer: ReactNode = null;
  if (wizardStep === 1) {
    footer = (
      <StickyFormFooter>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            styles.primaryBtnSticky,
            { minHeight: M },
            !cardAcknowledged && styles.btnDisabled,
            pressed && styles.pressed,
          ]}
          onPress={() => setWizardStep(2)}
          disabled={!cardAcknowledged}
          accessibilityLabel={t(locale, "receive.next")}
        >
          <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
        </Pressable>
      </StickyFormFooter>
    );
  } else if (wizardStep === 2) {
    footer = (
      <StickyFormFooter>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(1)}
            accessibilityLabel={t(locale, "common.back")}
          >
            <Text style={styles.footerSecondaryBtnText}>{t(locale, "common.back")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnSticky,
              styles.footerPrimaryBtn,
              { minHeight: M },
              (!plateLooksValid || lookupLoading || !vehicleResolved) && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(3)}
            disabled={!plateLooksValid || lookupLoading || !vehicleResolved}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === 3 && reservationFlow) {
    footer = (
      <StickyFormFooter>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(2)}
            accessibilityLabel={t(locale, "common.back")}
          >
            <Text style={styles.footerSecondaryBtnText}>{t(locale, "common.back")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnSticky,
              styles.footerPrimaryBtn,
              { minHeight: M },
              !bookingValidated && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(4)}
            disabled={!bookingValidated}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === driverStepNum) {
    footer = (
      <StickyFormFooter>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(backStepForDriver)}
            accessibilityLabel={t(locale, "common.back")}
          >
            <Text style={styles.footerSecondaryBtnText}>{t(locale, "common.back")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnSticky,
              styles.footerPrimaryBtn,
              { minHeight: M },
              !driverValid && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(vehicleStepNum)}
            disabled={!driverValid}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === vehicleStepNum) {
    footer = (
      <StickyFormFooter>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(driverStepNum)}
            accessibilityLabel={t(locale, "common.back")}
          >
            <Text style={styles.footerSecondaryBtnText}>{t(locale, "common.back")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnSticky,
              styles.footerPrimaryBtn,
              { minHeight: M },
              !vehicleDataValid && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(ticketStepNum)}
            disabled={!vehicleDataValid}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === ticketStepNum) {
    footer = (
      <StickyFormFooter>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(vehicleStepNum)}
            accessibilityLabel={t(locale, "common.back")}
          >
            <Text style={styles.footerSecondaryBtnText}>{t(locale, "common.back")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnSticky,
              styles.footerPrimaryBtn,
              { minHeight: M },
              !ticketCodesAcknowledged && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(parkingStepNum)}
            disabled={!ticketCodesAcknowledged}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === parkingStepNum) {
    footer = (
      <StickyFormFooter>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(ticketStepNum)}
            accessibilityLabel={t(locale, "common.back")}
          >
            <Text style={styles.footerSecondaryBtnText}>{t(locale, "common.back")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              styles.primaryBtnSticky,
              styles.footerPrimaryBtn,
              { minHeight: M },
              (submitting || !canSubmitParking) && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !canSubmitParking}
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
        </View>
      </StickyFormFooter>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.frame}>
      <View style={styles.screenHeader}>
        <ValetBackButton
          onPress={() => router.back()}
          accessibilityLabel={t(locale, "common.back")}
        />
        <Text style={styles.screenTitle}>{receiveTitle}</Text>
        <View style={{ width: 44 }} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, minHeight: 0 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {wizardStep === 1 && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardCardTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardCardHelp")}</Text>
              <View
                style={styles.cardVerifyOnHold}
                accessible
                accessibilityLabel={`${t(locale, "receive.wizardCardTitle")}. ${t(locale, "receive.cardVerifyOnHoldTitle")}`}
              >
                <View style={styles.cardVerifyOnHoldRow}>
                  <Ionicons name="card-outline" size={26} color={C.textMuted} />
                  <View style={styles.cardVerifyOnHoldTextCol}>
                    <Text style={styles.cardVerifyOnHoldTitle}>
                      {t(locale, "receive.cardVerifyOnHoldTitle")}
                    </Text>
                    <Text style={styles.cardVerifyOnHoldBody} maxFontSizeMultiplier={2}>
                      {t(locale, "receive.cardVerifyOnHoldBody")}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardVerifyBadge}>
                  <Text style={styles.cardVerifyBadgeText}>{t(locale, "receive.cardVerifyBadge")}</Text>
                </View>
              </View>
              <Pressable
                onPress={() => setCardAcknowledged(!cardAcknowledged)}
                style={({ pressed }) => [styles.ackRow, pressed && styles.pressed]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: cardAcknowledged }}
                accessibilityLabel={t(locale, "receive.wizardCardAck")}
              >
                <Ionicons
                  name={cardAcknowledged ? "checkbox-outline" : "square-outline"}
                  size={24}
                  color={cardAcknowledged ? C.primary : C.textMuted}
                />
                <Text style={styles.ackRowText}>{t(locale, "receive.wizardCardAck")}</Text>
              </Pressable>
            </>
          )}

          {wizardStep === 2 && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardPlateTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardPlateHelp")}</Text>
              <TextInput
                style={styles.input}
                value={plate}
                onChangeText={(x) => {
                  setPlate(formatPlate(x));
                  setVehicleResolved(false);
                  setLookupReadyForPlate("");
                  setVehicle(null);
                  setLoadedOwnerUserId(null);
                  setLoadedDriverSnapshot(null);
                  setLoadedVehicleSnapshot(null);
                }}
                placeholder={t(locale, "receive.placeholderPlate")}
                placeholderTextColor={C.textSubtle}
                autoCapitalize="characters"
                maxFontSizeMultiplier={2}
              />
              {lookupLoading && (
                <View style={styles.row}>
                  <ActivityIndicator color={C.primary} />
                  <Text style={styles.help}>{t(locale, "receive.lookupInlineLoading")}</Text>
                </View>
              )}
              {vehicleResolved && vehicle && (
                <View style={[styles.card, styles.vehicleFoundCard]}>
                  <View style={styles.vehicleFoundHeader}>
                    <View style={styles.vehicleFoundBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={C.success} />
                      <Text style={styles.vehicleFoundBadgeText}>{t(locale, "receive.foundVehicle")}</Text>
                    </View>
                  </View>
                  <View style={styles.vehicleSummaryRow}>
                    <Text style={styles.vehicleSummaryLabel}>{t(locale, "receive.wizardPlateTitle")}</Text>
                    <Text style={styles.vehicleSummaryValue}>{formatPlate(vehicle.plate)}</Text>
                  </View>
                  <View style={styles.vehicleSummaryRow}>
                    <Text style={styles.vehicleSummaryLabel}>{t(locale, "receive.wizardVehicleTitle")}</Text>
                    <Text style={styles.vehicleSummaryValue}>
                      {vehicle.brand} {vehicle.model}
                    </Text>
                  </View>
                  {vehicle.owners?.length ? (
                    <View style={[styles.vehicleSummaryRow, styles.vehicleSummaryRowLast]}>
                      <Text style={styles.vehicleSummaryLabel}>{t(locale, "receive.foundOwner")}</Text>
                      <Text style={styles.vehicleSummaryValue}>
                        {vehicle.owners[0].client.user.firstName} {vehicle.owners[0].client.user.lastName}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.cardHint}>{t(locale, "receive.noOwnerHint")}</Text>
                  )}
                </View>
              )}
              {vehicleResolved && !vehicle && plateLooksValid && (
                <View style={[styles.card, styles.vehicleNotFoundCard]}>
                  <View style={styles.vehicleFoundHeader}>
                    <View style={styles.vehicleNotFoundBadge}>
                      <Ionicons name="alert-circle-outline" size={16} color={C.warning} />
                      <Text style={styles.vehicleNotFoundBadgeText}>{t(locale, "receive.newVehicleTitle")}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardHint}>{t(locale, "receive.newVehicleHint")}</Text>
                </View>
              )}
            </>
          )}

          {wizardStep === 3 && reservationFlow && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardQrTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardQrHelp")}</Text>
              <ReservationQrPanel
                locale={locale}
                theme={theme}
                styles={qrStyles}
                pauseAfterScan={bookingCheck !== null && bookingCheck !== "invalid"}
                onBarcodeScanned={(raw) => {
                  const id = extractBookingIdFromScan(raw);
                  setBookingCode(id);
                  void validateBooking(id);
                }}
              />
              <Text style={[styles.sectionLabel, { marginTop: theme.space.lg }]}>
                {t(locale, "receive.reservationQrManual")}
              </Text>
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
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    (!companyIdForBooking || bookingLoading) && styles.btnDisabled,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => void validateBooking()}
                  disabled={bookingLoading || !companyIdForBooking}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color={C.primary} />
                  ) : (
                    <Text style={styles.secondaryBtnText}>{t(locale, "receive.validate")}</Text>
                  )}
                </Pressable>
              </View>
              {!companyIdForBooking && (
                <Text style={styles.errInline}>{t(locale, "receive.wizardQrNoCompany")}</Text>
              )}
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
            </>
          )}

          {wizardStep === driverStepNum && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardDriverTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardDriverHelp")}</Text>
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
                onChangeText={(v) => setDriverPhone(formatPhoneInternational(v))}
                placeholder={t(locale, "receive.placeholderPhone")}
                placeholderTextColor={C.textSubtle}
                keyboardType="phone-pad"
                maxFontSizeMultiplier={2}
              />
            </>
          )}

          {wizardStep === vehicleStepNum && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardVehicleTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardVehicleHelp")}</Text>
              {manualBrandMode ? (
                <TextInput
                  style={styles.input}
                  value={vehBrand}
                  onChangeText={(v) => {
                    setVehBrand(v);
                    setVehModel("");
                  }}
                  placeholder={t(locale, "receive.placeholderBrand")}
                  placeholderTextColor={C.textSubtle}
                  maxFontSizeMultiplier={2}
                />
              ) : (
                <Pressable
                  style={({ pressed }) => [styles.input, styles.selectorInput, pressed && styles.pressed]}
                  onPress={() => setVehicleBrandModalOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t(locale, "receive.placeholderBrand")}
                >
                  <Text
                    style={[styles.selectorInputText, !vehBrand && styles.selectorInputPlaceholder]}
                    numberOfLines={1}
                    maxFontSizeMultiplier={2}
                  >
                    {vehBrand || t(locale, "receive.placeholderBrand")}
                  </Text>
                  <Ionicons name="list-outline" size={18} color={C.textMuted} />
                </Pressable>
              )}
              {loadingCatalogMakes && <ActivityIndicator color={C.primary} style={{ marginBottom: theme.space.sm }} />}
              {manualModelMode ? (
                <TextInput
                  style={styles.input}
                  value={vehModel}
                  onChangeText={setVehModel}
                  placeholder={t(locale, "receive.placeholderModel")}
                  placeholderTextColor={C.textSubtle}
                  maxFontSizeMultiplier={2}
                />
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.input,
                    styles.selectorInput,
                    !vehBrand && styles.btnDisabled,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => {
                    if (!vehBrand) return;
                    setVehicleModelModalOpen(true);
                  }}
                  disabled={!vehBrand}
                  accessibilityRole="button"
                  accessibilityLabel={t(locale, "receive.placeholderModel")}
                >
                  <Text
                    style={[styles.selectorInputText, !vehModel && styles.selectorInputPlaceholder]}
                    numberOfLines={1}
                    maxFontSizeMultiplier={2}
                  >
                    {vehModel || t(locale, "receive.placeholderModel")}
                  </Text>
                  <Ionicons name="list-outline" size={18} color={C.textMuted} />
                </Pressable>
              )}
              {loadingCatalogModels && (
                <ActivityIndicator color={C.primary} style={{ marginBottom: theme.space.sm }} />
              )}
              <TextInput
                style={styles.input}
                value={vehYear}
                onChangeText={setVehYear}
                placeholder={t(locale, "receive.placeholderYear")}
                placeholderTextColor={C.textSubtle}
                keyboardType="number-pad"
                maxFontSizeMultiplier={2}
              />
              {!!vehModel && catalogDimensions && (
                <View style={styles.okBanner}>
                  <Ionicons name="resize-outline" size={20} color={C.success} />
                  <Text style={styles.okText}>{t(locale, "receive.vehicleDimensionsAuto")}</Text>
                </View>
              )}
            </>
          )}

          {wizardStep === ticketStepNum && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardTicketTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardTicketHelp")}</Text>
              <Pressable
                onPress={() => setTicketCodesAcknowledged(!ticketCodesAcknowledged)}
                style={({ pressed }) => [styles.ackRow, pressed && styles.pressed]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ticketCodesAcknowledged }}
                accessibilityLabel={t(locale, "receive.wizardTicketAck")}
              >
                <Ionicons
                  name={ticketCodesAcknowledged ? "checkbox-outline" : "square-outline"}
                  size={24}
                  color={ticketCodesAcknowledged ? C.primary : C.textMuted}
                />
                <Text style={styles.ackRowText}>{t(locale, "receive.wizardTicketAck")}</Text>
              </Pressable>
            </>
          )}

          {wizardStep === parkingStepNum && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardParkingTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardParkingHelp")}</Text>

              <View style={styles.receiveParkingCard}>
                <View style={styles.bottomCardInner}>
                  <View style={styles.bottomIconWrap}>
                    <Ionicons name="navigate-circle" size={26} color={C.primary} />
                  </View>
                  <View style={styles.bottomTextCol}>
                    <View style={styles.bottomTitleRow}>
                      <Text style={styles.bottomTitle} numberOfLines={1}>
                        {t(locale, "home.nearestTitle")}
                      </Text>
                      {allParkings.length > 0 && locStatus !== "loading" && locStatus !== "unavailable" && (
                        <Pressable
                          style={({ pressed }) => [styles.bottomChooseBtn, pressed && styles.pressed]}
                          onPress={() => setReceiveParkingModalOpen(true)}
                          accessibilityRole="button"
                          accessibilityLabel={t(locale, "home.chooseParking")}
                        >
                          <Ionicons name="list-outline" size={16} color={C.primary} />
                          <Text style={[styles.bottomChooseBtnText, { color: C.primary }]}>
                            {t(locale, "home.chooseParking")}
                          </Text>
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
                    {allParkings.length === 0 && locStatus !== "loading" && (
                      <Text style={styles.bottomMeta}>{t(locale, "receive.wizardParkingEmpty")}</Text>
                    )}
                    {(locStatus === "ready" || locStatus === "denied") && displayedReceiveParking && (
                      <>
                        {displayedReceiveParking.isManual && (
                          <Text style={[styles.bottomManualHint, { color: C.textMuted }]}>
                            {t(locale, "home.manualParkingHint")}
                          </Text>
                        )}
                        <Text style={styles.bottomName} numberOfLines={2}>
                          {displayedReceiveParking.parking.name}
                        </Text>
                        {displayedReceiveParking.parking.company && (
                          <Text style={styles.bottomCompany} numberOfLines={1}>
                            {t(locale, "home.nearestCompany", {
                              name:
                                displayedReceiveParking.parking.company.commercialName?.trim() ||
                                displayedReceiveParking.parking.company.legalName?.trim() ||
                                "—",
                            })}
                          </Text>
                        )}
                        {displayedReceiveParking.distanceKm != null && (
                          <Text style={styles.bottomMeta}>
                            {t(locale, "home.nearestKm", {
                              km:
                                displayedReceiveParking.distanceKm < 10
                                  ? displayedReceiveParking.distanceKm.toFixed(1)
                                  : String(Math.round(displayedReceiveParking.distanceKm)),
                            })}
                          </Text>
                        )}
                        <Text style={styles.bottomAddr} numberOfLines={2}>
                          {displayedReceiveParking.parking.address}
                        </Text>
                        {displayedReceiveParking.isManual && (
                          <Pressable
                            style={({ pressed }) => [styles.bottomUseNearestBtn, pressed && styles.pressed]}
                            onPress={() => setReceiveManualParkingId(null)}
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

              <Text style={[styles.sectionLabel, { marginTop: theme.space.lg }]}>
                {t(locale, "receive.driverValetSection")}
              </Text>
              <Text style={styles.help}>{t(locale, "receive.driverValetHelp")}</Text>
              {metaLoading ? (
                <ActivityIndicator color={C.primary} />
              ) : (
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
              )}
            </>
          )}
        </ScrollView>

        {footer}

        <Modal
          visible={vehicleBrandModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setVehicleBrandModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdropPress}
              onPress={() => setVehicleBrandModalOpen(false)}
              accessibilityLabel={t(locale, "common.cancel")}
            />
            <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>{t(locale, "receive.placeholderBrand")}</Text>
              <FlatList
                data={catalogMakes}
                keyExtractor={(item) => String(item.id)}
                style={styles.modalList}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                  <Pressable
                    style={({ pressed }) => [
                      styles.parkingRow,
                      { borderBottomColor: C.border },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setManualBrandMode(true);
                      setManualModelMode(true);
                      setVehicleBrandModalOpen(false);
                    }}
                  >
                    <Text style={[styles.parkingRowName, { color: C.primary }]}>
                      {t(locale, "receive.manualEntry")}
                    </Text>
                  </Pressable>
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.parkingRow,
                      { borderBottomColor: C.border },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setVehBrand(item.name);
                      setVehModel("");
                      setManualBrandMode(false);
                      setManualModelMode(false);
                      setVehicleBrandModalOpen(false);
                    }}
                  >
                    <Text style={[styles.parkingRowName, { color: C.text }]} numberOfLines={2}>
                      {item.name}
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

        <Modal
          visible={vehicleModelModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setVehicleModelModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdropPress}
              onPress={() => setVehicleModelModalOpen(false)}
              accessibilityLabel={t(locale, "common.cancel")}
            />
            <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>{t(locale, "receive.placeholderModel")}</Text>
              <FlatList
                data={catalogModels}
                keyExtractor={(item) => String(item.id)}
                style={styles.modalList}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                  <Pressable
                    style={({ pressed }) => [
                      styles.parkingRow,
                      { borderBottomColor: C.border },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setManualModelMode(true);
                      setVehicleModelModalOpen(false);
                    }}
                  >
                    <Text style={[styles.parkingRowName, { color: C.primary }]}>
                      {t(locale, "receive.manualEntry")}
                    </Text>
                  </Pressable>
                }
                renderItem={({ item }) => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.parkingRow,
                      { borderBottomColor: C.border },
                      pressed && styles.pressed,
                    ]}
                    onPress={() => {
                      setVehModel(item.name);
                      setManualModelMode(false);
                      setVehicleModelModalOpen(false);
                    }}
                  >
                    <Text style={[styles.parkingRowName, { color: C.text }]} numberOfLines={2}>
                      {item.name}
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

        <Modal
          visible={receiveParkingModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setReceiveParkingModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdropPress}
              onPress={() => setReceiveParkingModalOpen(false)}
              accessibilityLabel={t(locale, "common.cancel")}
            />
            <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>
                {t(locale, "home.parkingPickerTitle")}
              </Text>
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
                      setReceiveManualParkingId(item.id);
                      setReceiveParkingModalOpen(false);
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
      </KeyboardAvoidingView>
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
    safe: { flex: 1, backgroundColor: C.bg, alignItems: "center" },
    frame: {
      flex: 1,
      width: "100%",
      maxWidth: contentMaxWidth,
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
    scroll: { padding: sectionPadding, paddingBottom: S.xl },
    primaryBtnSticky: { marginTop: 0, marginBottom: 0 },
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
    footerRow: { flexDirection: "row", gap: S.sm, alignItems: "center" },
    footerPrimaryBtn: { flex: 1, marginBottom: 0 },
    footerSecondaryBtn: {
      flex: 1,
      borderWidth: 2,
      borderColor: C.border,
      backgroundColor: C.card,
      borderRadius: R.button + 2,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: S.md,
    },
    footerSecondaryBtnText: {
      color: C.text,
      fontWeight: "800",
      fontSize: F.button,
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
      marginBottom: S.sm,
    },
    selectorInput: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    selectorInputText: {
      flex: 1,
      color: C.text,
      fontSize: F.body,
      fontWeight: "600",
      marginRight: S.sm,
    },
    selectorInputPlaceholder: {
      color: C.textSubtle,
      fontWeight: "500",
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
    vehicleFoundCard: {
      borderColor: theme.isDark ? "rgba(16, 185, 129, 0.45)" : "rgba(16, 185, 129, 0.35)",
      backgroundColor: theme.isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.06)",
    },
    vehicleFoundHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: S.xs,
    },
    vehicleFoundBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: S.sm,
      backgroundColor: theme.isDark ? "rgba(16, 185, 129, 0.15)" : "rgba(16, 185, 129, 0.12)",
    },
    vehicleFoundBadgeText: {
      fontSize: 12,
      fontWeight: "800",
      color: C.success,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    vehicleSummaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: S.sm,
      paddingVertical: S.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.35)",
    },
    vehicleSummaryRowLast: {
      borderBottomWidth: 0,
      paddingBottom: 0,
    },
    vehicleSummaryLabel: {
      flexShrink: 1,
      fontSize: 13,
      fontWeight: "700",
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    vehicleSummaryValue: {
      flex: 1,
      textAlign: "right",
      fontSize: F.secondary,
      fontWeight: "800",
      color: C.text,
    },
    vehicleNotFoundCard: {
      borderColor: theme.isDark ? "rgba(249, 115, 22, 0.45)" : "rgba(249, 115, 22, 0.35)",
      backgroundColor: theme.isDark ? "rgba(249, 115, 22, 0.09)" : "rgba(249, 115, 22, 0.06)",
    },
    vehicleNotFoundBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: S.sm,
      backgroundColor: theme.isDark ? "rgba(249, 115, 22, 0.18)" : "rgba(249, 115, 22, 0.12)",
    },
    vehicleNotFoundBadgeText: {
      fontSize: 12,
      fontWeight: "800",
      color: C.warning,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
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
    stepExplain: {
      fontSize: F.secondary,
      color: C.textSubtle,
      marginTop: -4,
      marginBottom: S.md,
      lineHeight: 22,
    },
    ackRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: S.sm,
      paddingVertical: S.sm,
      marginBottom: S.lg,
    },
    ackRowText: {
      flex: 1,
      fontSize: F.body,
      color: C.text,
      fontWeight: "600",
      lineHeight: 22,
    },
    receiveParkingCard: {
      marginBottom: S.lg,
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
    bottomTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: S.sm,
      marginBottom: 4,
    },
    bottomTitle: {
      fontSize: 11,
      fontWeight: "800",
      color: C.textMuted,
      textTransform: "uppercase",
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
      fontSize: 12,
      fontWeight: "800",
    },
    bottomManualHint: {
      fontSize: 11,
      fontWeight: "700",
      marginBottom: 4,
    },
    bottomUseNearestBtn: {
      marginTop: S.sm,
      alignSelf: "flex-start",
      paddingVertical: 4,
    },
    bottomUseNearestText: {
      fontSize: 13,
      fontWeight: "800",
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
      fontSize: F.secondary,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: S.sm,
      fontFamily: "CalSans",
    },
    modalList: {
      maxHeight: 300,
    },
    parkingRow: {
      paddingVertical: S.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    parkingRowName: {
      fontSize: F.secondary - 1,
      fontWeight: "800",
    },
    parkingRowAddr: {
      fontSize: 12,
      marginTop: 4,
      lineHeight: 16,
    },
    cardVerifyOnHold: {
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)",
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(59, 130, 246, 0.35)" : "rgba(59, 130, 246, 0.28)",
      padding: S.lg,
      marginBottom: S.lg,
      gap: S.md,
    },
    cardVerifyOnHoldRow: { flexDirection: "row", alignItems: "flex-start", gap: S.md },
    cardVerifyOnHoldTextCol: { flex: 1, minWidth: 0 },
    cardVerifyOnHoldTitle: {
      fontSize: F.body,
      fontWeight: "800",
      color: C.text,
      marginBottom: S.xs,
    },
    cardVerifyOnHoldBody: {
      fontSize: F.secondary,
      color: C.textMuted,
      lineHeight: 22,
    },
    cardVerifyBadge: {
      alignSelf: "flex-start",
      paddingVertical: 6,
      paddingHorizontal: S.md,
      borderRadius: 999,
      backgroundColor: theme.isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(100, 116, 139, 0.15)",
    },
    cardVerifyBadgeText: {
      fontSize: F.secondary - 1,
      fontWeight: "800",
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
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
