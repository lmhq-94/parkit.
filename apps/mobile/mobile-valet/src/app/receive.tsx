import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
  useWindowDimensions,
  RefreshControl,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useRouter, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPlate, getVehicleColorOptions, formatVehicleColorLabel, normalizeVehicleColorValue } from "@parkit/shared";
import { useAuthStore, useLocaleStore, useCompanyStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { Locale as _Locale } from "@parkit/shared";
import type { ReactNode } from "react";
import { useValetTheme, ticketsA11y, useResponsiveLayout } from "@/theme/valetTheme";
import { useValetProfileSync } from "@/lib/useValetProfileSync";
import api from "@/lib/api";
import { messageFromAxios } from "@parkit/shared";
import { useOnAppForeground } from "@/lib/useOnAppForeground";
import { RECEIVE_META_POLL_MS } from "@/lib/syncConstants";
import { useNearestParking, haversineKm } from "@/lib/useNearestParking";
import { formatPhoneInternational, formatPhoneWithCountryCode, getDeviceCountryCode, phoneDigitsForApi } from "@/lib/phoneInternational";
import { createFeedback } from "@/lib/feedback";
import { ValetBackButton } from "@/components/ValetBackButton";
import { StickyFormFooter } from "@/components/StickyFormFooter";
import { ReservationQrPanel, createQrStyles } from "@/components/ReservationQrPanel";
import { CardVerification } from "@/components/CardVerification";
import { VehiclePlateInput } from "@/components/VehiclePlateInput";
import { DriverInfoForm } from "@/components/DriverInfoForm";
import { TicketQRPanel } from "@/components/TicketQRPanel";
import { ValetDispatchRow, createValetRowStyles } from "@/components/ValetDispatchRow";
import {
  COUNTRY_CR,
  MANUAL_TICKET_CODE_RE,
  MAX_DAMAGE_PHOTOS,
  randomWalkInPassword,
  isValidCrPlate,
  formatBenefitTime,
  extractBookingIdFromScan,
} from "@/lib/receiveUtils";
import type {
  VehicleLookup,
  CatalogMake,
  CatalogModel,
  VehicleDimensions,
  ParkingOpt,
  ValetOpt,
  BookingLookup,
  ClientByIdLookup,
} from "@/types/receive";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";

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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const safeInsets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding]
  );
  const qrStyles = useMemo(
    () => createQrStyles(theme, windowHeight),
    [theme, windowHeight]
  );

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
  const [vehColor, setVehColor] = useState("");
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
    color: string;
    year: string;
  } | null>(null);

  const [receptionType, setReceptionType] = useState<"CARD" | "DIRECT" | "RESERVATION" | null>(null);

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
  const [valetsLoading, setValetsLoading] = useState(false);
  const [valetsRefreshing, setValetsRefreshing] = useState(false);

  const [wizardStep, setWizardStep] = useState(1);
  const [_cardVerificationOpening, _setCardVerificationOpening] = useState(false);
  const [cardVerificationStarted, setCardVerificationStarted] = useState(false);
  const [ticketCodesAcknowledged, setTicketCodesAcknowledged] = useState(false);
  const [manualTicketCode, setManualTicketCode] = useState("");
  const [manualKeyCode, setManualKeyCode] = useState("");

  const [keyCodesUnlinked, setKeyCodesUnlinked] = useState(false);
  const [damagePhotoDataUrls, setDamagePhotoDataUrls] = useState<string[]>([]);
  const [damageNote, setDamageNote] = useState("");
  const [damagePhotoBusy, setDamagePhotoBusy] = useState(false);
  const damagePhotosRef = useRef<string[]>([]);
  const [receiveParkingModalOpen, setReceiveParkingModalOpen] = useState(false);
  const [vehicleBrandModalOpen, setVehicleBrandModalOpen] = useState(false);
  const [vehicleModelModalOpen, setVehicleModelModalOpen] = useState(false);
  const [vehicleColorModalOpen, setVehicleColorModalOpen] = useState(false);
  const [manualBrandMode, setManualBrandMode] = useState(false);
  const [manualModelMode, setManualModelMode] = useState(false);

  const [receiveManualParkingId, setReceiveManualParkingId] = useState<string | null>(null);
  const [valetSelectModalOpen, setValetSelectModalOpen] = useState(false);
  const reservationParkingPreselectedRef = useRef<string | null>(null);
  const qrNoCompanyAlertShownRef = useRef(false);

  const isReception = user?.valetStaffRole !== "DRIVER";
  const C = theme.colors;
  const M = ticketsA11y.minTouch;
  const feedback = useMemo(() => createFeedback(locale), [locale]);

  const _startCardVerification = useCallback(async () => {
    try {
      _setCardVerificationOpening(true);
      const res = await api.post<{ data?: { url?: string } }>("/payments/card-verification/session", {
        locale,
      });
      const url = res.data?.data?.url;
      if (!url) throw new Error("No checkout URL");
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) throw new Error("Cannot open checkout URL");
      await Linking.openURL(url);
      setCardVerificationStarted(true);
      feedback.success(t(locale, "receive.cardVerifyStarted"));
    } catch (e) {
      const msg = messageFromAxios(e);
      feedback.error(
        msg === "NETWORK_ERROR"
          ? t(locale, "common.networkError")
          : msg || t(locale, "receive.cardVerifyError")
      );
    } finally {
      _setCardVerificationOpening(false);
    }
  }, [feedback, locale]);


  const typeStepNum = 1;
  const cardStepNum = 2;
  const plateStepNum = 3;
  const driverStepNum = 4;
  const vehicleStepNum = 5;
  const parkingStepNum = reservationFlow ? 2 : 6;
  const damageStepNum = reservationFlow ? 3 : 7;
  const ticketStepNum = reservationFlow ? 4 : 8;
  const valetStepNum = reservationFlow ? 5 : 9;

  const plateBackStep = receptionType === "CARD" ? cardStepNum : typeStepNum;
  const availableValets = useMemo(
    () => valets.filter((v) => v.currentStatus === "AVAILABLE"),
    [valets]
  );
  const busyValets = useMemo(
    () => valets.filter((v) => v.currentStatus === "BUSY"),
    [valets]
  );
  const selectedDispatchDriver = useMemo(
    () => valets.find((x) => x.id === driverValetId) ?? null,
    [valets, driverValetId]
  );
  const selectedBusyDriver =
    selectedDispatchDriver?.currentStatus === "BUSY" ? selectedDispatchDriver : null;

  useEffect(() => {
    damagePhotosRef.current = damagePhotoDataUrls;
  }, [damagePhotoDataUrls]);

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

  const companyIdForBooking = useMemo(() => {
    return (
      effectiveCompanyId ??
      parkings[0]?.companyId ??
      allParkings[0]?.companyId ??
      storedCompanyId ??
      null
    );
  }, [effectiveCompanyId, parkings, allParkings, storedCompanyId]);

  const syncValetWorkingContext = useCallback(
    async (nextCompanyId?: string | null, nextParkingId?: string | null) => {
      if (!user || user.systemRole !== "STAFF") return;
      const companyIdToSave = nextCompanyId ?? effectiveCompanyId;
      const parkingIdToSave = nextParkingId ?? parkingId;
      if (!companyIdToSave || !parkingIdToSave) return;
      try {
        await api.patch("/valets/me", {   
          companyId: companyIdToSave,
          currentParkingId: parkingIdToSave,
        });
      } catch {
        console.error("Failed to sync valet working context");
      }
    },
    [user, effectiveCompanyId, parkingId]
  );

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
    if (!effectiveCompanyId) return;
    setCompanyId(effectiveCompanyId);
  }, [effectiveCompanyId, setCompanyId]);

  const loadDispatchDrivers = useCallback(async (opts?: { silent?: boolean }) => {
    if (!user || !effectiveCompanyId || !parkingId) {
      setValets([]);
      setValetsLoading(false);
      return;
    }
    const silent = opts?.silent === true;
    setCompanyId(effectiveCompanyId);
    if (!silent) setValetsLoading(true);
    try {
      const vRes = await api.get<{ data?: { available?: ValetOpt[]; busy?: ValetOpt[] } }>(
        `/valets/dispatch-drivers/${encodeURIComponent(parkingId)}`
      );
      const payload = vRes.data?.data;
      const availableCandidate = payload?.available;
      const busyCandidate = payload?.busy;
      const available = Array.isArray(availableCandidate) ? availableCandidate : [];
      const busy = Array.isArray(busyCandidate) ? busyCandidate : [];
      setValets([...available, ...busy]);
    } catch {
      setValets([]);
    } finally {
      if (!silent) setValetsLoading(false);
    }
  }, [user, effectiveCompanyId, parkingId, setCompanyId]);

  useEffect(() => {
    void loadDispatchDrivers();
  }, [loadDispatchDrivers]);

  const onValetPullRefresh = useCallback(() => {
    if (wizardStep !== valetStepNum) return;
    setValetsRefreshing(true);
    void loadDispatchDrivers({ silent: true }).finally(() => setValetsRefreshing(false));
  }, [wizardStep, valetStepNum, loadDispatchDrivers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void syncValetWorkingContext();
    }, 450);
    return () => clearTimeout(timer);
  }, [syncValetWorkingContext]);

  useEffect(() => {
    if (driverValetId == null) return;
    if (!valets.some((v) => v.id === driverValetId)) {
      setDriverValetId(null);
    }
  }, [valets, driverValetId]);

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
        feedback.error(t(locale, "receive.errorPlate"));
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
            setDriverPhone(formatPhoneWithCountryCode(ownerPhone, getDeviceCountryCode()));
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
              phone: formatPhoneWithCountryCode(fallbackContact.phone ?? "", getDeviceCountryCode()),
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
        setVehColor(normalizeVehicleColorValue(v.color?.trim() ?? ""));
        setVehYear(v.year != null ? String(v.year) : "");
        setLoadedVehicleSnapshot({
          brand: v.brand?.trim() ?? "",
          model: v.model?.trim() ?? "",
          color: v.color?.trim() ?? "",
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
        setVehColor("");
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
      setVehColor("");
      setVehYear("");
    } finally {
      setLookupLoading(false);
      setVehicleResolved(true);
      setLookupReadyForPlate(formatted);
      if (advanceStep) setWizardStep(driverStepNum);
    }
  };

  useEffect(() => {
    if (wizardStep !== plateStepNum || reservationFlow) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardStep, plate, lookupLoading, lookupReadyForPlate]);

  const validateBooking = async (overrideCode?: string) => {
    const id = (overrideCode ?? bookingCode).trim();
    if (!id) {
      setBookingCheck(null);
      return;
    }
    const cid = companyIdForBooking;
    if (!cid) {
      feedback.error(t(locale, "receive.errorBookingCompany"));
      return;
    }
    setCompanyId(cid);
    setBookingLoading(true);
    try {
      const res = await api.get<{ data: BookingLookup }>(`/bookings/${id}`);
      const b = res.data?.data;
      if (!b) {
        setBookingCheck("invalid");
        feedback.alert(
          t(locale, "receive.benefitInvalidTitle"),
          `${t(locale, "receive.benefitInvalid")}\n\n${t(locale, "receive.benefitInvalidHint")}`
        );
        return;
      }
      if (b.status === "CANCELLED" || b.status === "NO_SHOW") {
        setBookingCheck("invalid");
        feedback.alert(
          t(locale, "receive.benefitInvalidTitle"),
          `${t(locale, "receive.benefitInvalid")}\n\n${t(locale, "receive.benefitInvalidHint")}`
        );
        return;
      }
      setBookingCheck(b);
      feedback.success(
        t(locale, "receive.benefitOk", {
          time: formatBenefitTime(b.parking?.freeBenefitMinutes, locale),
        })
      );
    } catch {
      setBookingCheck("invalid");
      feedback.alert(
        t(locale, "receive.benefitInvalidTitle"),
        `${t(locale, "receive.benefitInvalid")}\n\n${t(locale, "receive.benefitInvalidHint")}`
      );
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    if (!(wizardStep === 1 && reservationFlow)) {
      qrNoCompanyAlertShownRef.current = false;
      return;
    }
    if (metaLoading) return;
    if (companyIdForBooking) {
      qrNoCompanyAlertShownRef.current = false;
      return;
    }
    if (qrNoCompanyAlertShownRef.current) return;
    qrNoCompanyAlertShownRef.current = true;
    feedback.error(t(locale, "receive.wizardQrNoCompany"));
  }, [wizardStep, reservationFlow, metaLoading, companyIdForBooking, feedback, locale]);

  const resolveClientAndVehicleIds = async (): Promise<{
    clientId: string;
    vehicleId: string;
  } | null> => {
    const cid = useCompanyStore.getState().companyId;
    if (!cid || !receptorValetId) return null;

    if (reservationFlow && bookingCheck && bookingCheck !== "invalid") {
      return {
        clientId: bookingCheck.clientId,
        vehicleId: bookingCheck.vehicleId,
      };
    }

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
          color: vehColor.trim(),
          year: vehYear.trim(),
        };
        const changedVehicle =
          nextVehicle.brand !== loadedVehicleSnapshot.brand ||
          nextVehicle.model !== loadedVehicleSnapshot.model ||
          nextVehicle.color !== loadedVehicleSnapshot.color ||
          nextVehicle.year !== loadedVehicleSnapshot.year;
        if (changedVehicle) {
          await api.patch(`/vehicles/${vehicle.id}`, {
            brand: nextVehicle.brand,
            model: nextVehicle.model,
            color: nextVehicle.color || undefined,
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
        feedback.error(t(locale, "receive.errorDriver"));
        return null;
      }
      const uRes = await api.post<{ data: { id: string } }>("/users", {
        firstName: fn,
        lastName: ln,
        email: em,
        phone: phoneDigitsForApi(driverPhone),
        systemRole: "CUSTOMER",
        walkInCustomer: true,
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
    const color = vehColor.trim();
    if (!fn || !ln || !em) {
      feedback.error(t(locale, "receive.errorDriver"));
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
      walkInCustomer: true,
    });
    const userId = uRes.data?.data?.id;
    if (!userId) throw new Error("User create failed");

    const vehRes = await api.post<{ data: { id: string } }>("/vehicles", {
      plate: formatPlate(plate),
      countryCode: COUNTRY_CR,
      brand: br,
      model: md,
      color: color || undefined,
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

  useEffect(() => {
    if (!reservationFlow) return;
    if (!bookingCheck || bookingCheck === "invalid") return;
    let cancelled = false;
    const b = bookingCheck;
    void (async () => {
      const plateStr = b.vehicle?.plate ? formatPlate(b.vehicle.plate) : "";
      const u = b.client?.user;
      let phone = u?.phone?.trim() ?? "";
      if (!phone) {
        const c = await findClientContact(b.clientId);
        if (cancelled) return;
        phone = c.phone?.trim() ?? "";
      }
      if (cancelled) return;
      setPlate(plateStr);
      setDriverFirst(u?.firstName?.trim() ?? "");
      setDriverLast(u?.lastName?.trim() ?? "");
      setDriverEmail(u?.email?.trim() ?? "");
      setDriverPhone(formatPhoneWithCountryCode(phone, getDeviceCountryCode()));
      setVehBrand(b.vehicle?.brand?.trim() ?? "");
      setVehModel(b.vehicle?.model?.trim() ?? "");
        setVehColor(normalizeVehicleColorValue(b.vehicle?.color?.trim() ?? ""));
      setVehYear(b.vehicle?.year != null ? String(b.vehicle.year) : "");
      setVehicle({
        id: b.vehicleId,
        plate: plateStr,
        brand: b.vehicle?.brand ?? "",
        model: b.vehicle?.model ?? "",
        color: b.vehicle?.color ?? "",
        year: b.vehicle?.year ?? null,
        countryCode: COUNTRY_CR,
        companyId: "",
        owners: [
          {
            client: {
              id: b.clientId,
              user: {
                firstName: u?.firstName ?? "",
                lastName: u?.lastName ?? "",
                email: u?.email ?? null,
                phone: phone || null,
              },
            },
          },
        ],
      });
      setVehicleResolved(true);
      setLoadedOwnerUserId(null);
      setLoadedDriverSnapshot(null);
      setLoadedVehicleSnapshot(null);
      setCatalogDimensions(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [reservationFlow, bookingCheck]);

  useEffect(() => {
    if (!reservationFlow) {
      reservationParkingPreselectedRef.current = null;
      return;
    }
    if (!bookingCheck || bookingCheck === "invalid") {
      reservationParkingPreselectedRef.current = null;
      return;
    }
    if (reservationParkingPreselectedRef.current === bookingCheck.id) return;
    const bid = bookingCheck.parkingId;
    if (!bid || !allParkings.length) return;
    if (!allParkings.some((p) => p.id === bid)) return;
    reservationParkingPreselectedRef.current = bookingCheck.id;
    setReceiveManualParkingId(bid);
  }, [reservationFlow, bookingCheck, allParkings]);

  const processAndAddDamagePhoto = useCallback(
    async (uri: string) => {
      if (damagePhotosRef.current.length >= MAX_DAMAGE_PHOTOS) {
        feedback.error(t(locale, "receive.damagePhotoLimit", { max: String(MAX_DAMAGE_PHOTOS) }));
        return;
      }
      setDamagePhotoBusy(true);
      try {
        const manipulated = await manipulateAsync(
          uri,
          [{ resize: { width: 1280 } }],
          { compress: 0.7, format: SaveFormat.JPEG, base64: true }
        );
        if (!manipulated.base64) {
          feedback.error(t(locale, "profile.photoProcessError"));
          return;
        }
        const dataUrl = `data:image/jpeg;base64,${manipulated.base64}`;
        setDamagePhotoDataUrls((p) =>
          p.length >= MAX_DAMAGE_PHOTOS ? p : [...p, dataUrl]
        );
      } catch {
        feedback.error(t(locale, "profile.photoProcessError"));
      } finally {
        setDamagePhotoBusy(false);
      }
    },
    [feedback, locale]
  );

  const pickDamageFromLibrary = useCallback(async () => {
    if (damagePhotosRef.current.length >= MAX_DAMAGE_PHOTOS) {
      feedback.error(t(locale, "receive.damagePhotoLimit", { max: String(MAX_DAMAGE_PHOTOS) }));
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      feedback.error(t(locale, "profile.photoPermissionDenied"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.88,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    await processAndAddDamagePhoto(result.assets[0].uri);
  }, [feedback, locale, processAndAddDamagePhoto]);

  const takeDamagePhoto = useCallback(async () => {
    if (damagePhotosRef.current.length >= MAX_DAMAGE_PHOTOS) {
      feedback.error(t(locale, "receive.damagePhotoLimit", { max: String(MAX_DAMAGE_PHOTOS) }));
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      feedback.error(t(locale, "profile.photoCameraDenied"));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.88,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    await processAndAddDamagePhoto(result.assets[0].uri);
  }, [feedback, locale, processAndAddDamagePhoto]);

  const removeDamagePhotoAt = useCallback((index: number) => {
    setDamagePhotoDataUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async () => {
    const cid = effectiveCompanyId;
    if (!cid || !receptorValetId || !parkingId) {
      feedback.error(t(locale, "receive.errorContext"));
      return;
    }
    if (!driverValetId) {
      feedback.error(t(locale, "receive.errorDriverValetRequired"));
      return;
    }
    setCompanyId(cid);
    if (bookingCheck && bookingCheck !== "invalid" && !reservationFlow) {
      const pl = formatPlate(plate);
      if (
        bookingCheck.vehicle?.plate &&
        formatPlate(bookingCheck.vehicle.plate) !== pl
      ) {
        feedback.error(t(locale, "receive.errorBookingPlate"));
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
      const tc = manualTicketCode.trim();
      const kc = keyCodesUnlinked ? manualKeyCode.trim() : tc;
      if (tc.length < 2 || kc.length < 2) {
        feedback.error(t(locale, "receive.errorTicketCodesRequired"));
        setSubmitting(false);
        return;
      }
      if (!MANUAL_TICKET_CODE_RE.test(tc) || !MANUAL_TICKET_CODE_RE.test(kc)) {
        feedback.error(t(locale, "receive.errorTicketCodesFormat"));
        setSubmitting(false);
        return;
      }

      const payload: Record<string, unknown> = {
        clientId: ids.clientId,
        vehicleId: ids.vehicleId,
        parkingId,
        receptorValetId,
        driverValetId,
        ticketCode: tc,
        keyCode: kc,
      };
      if (bookingCheck && bookingCheck !== "invalid")
        payload.bookingId = bookingCheck.id;

      const noteTrim = damageNote.trim();
      if (damagePhotoDataUrls.length > 0 || noteTrim.length > 0) {
        payload.intakeDamageReport = {
          description: noteTrim,
          photos: damagePhotoDataUrls.map((url) => ({ url })),
        };
      }

      await api.post("/tickets", payload);
      feedback.success(t(locale, "receive.success"), {
        title: t(locale, "receive.successTitle"),
        okText: t(locale, "common.close"),
        onPress: () => router.replace("/home"),
      });
    } catch (e) {
      const msg = messageFromAxios(e);
      feedback.error(
        msg === "NETWORK_ERROR"
          ? t(locale, "common.networkError")
          : msg || t(locale, "receive.errorSubmit")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const plateFormatted = formatPlate(plate).trim();
  const plateLooksValid = isValidCrPlate(plateFormatted);
  const driverValid =
    driverFirst.trim().length > 0 &&
    driverLast.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverEmail.trim());
  const vehicleDataValid =
    vehBrand.trim().length > 0 && vehModel.trim().length > 0;
  const bookingValidated = bookingCheck !== null && bookingCheck !== "invalid";

  const ticketCodesFilled = useMemo(() => {
    const tc = manualTicketCode.trim();
    const kc = keyCodesUnlinked ? manualKeyCode.trim() : tc;
    if (tc.length < 2 || kc.length < 2) return false;
    return MANUAL_TICKET_CODE_RE.test(tc) && MANUAL_TICKET_CODE_RE.test(kc);
  }, [manualTicketCode, manualKeyCode, keyCodesUnlinked]);

  const canContinueFromParking = !!parkingId;

  const canSubmitReceive =
    wizardStep === valetStepNum &&
    !!parkingId &&
    !!receptorValetId &&
    !!effectiveCompanyId &&
    !!driverValetId;

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

  if (!user) return <Redirect href="/login" />;
  if (!isReception) {
    return (
      <SafeAreaView style={styles.safe} edges={["left", "right"]}>
        <StatusBar
          barStyle={theme.isDark ? "light-content" : "dark-content"}
          backgroundColor={C.card}
          translucent={Platform.OS === "android"}
        />
        <View style={styles.frame}>
        <View style={[styles.screenHeader, { paddingTop: safeInsets.top + theme.space.md }]}>
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


  let footer: ReactNode = null;
  if (wizardStep === typeStepNum && !reservationFlow) {
    footer = (
      <StickyFormFooter keyboardPinned>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            styles.primaryBtnSticky,
            { minHeight: M },
            !receptionType && styles.btnDisabled,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            if (receptionType === "CARD") {
              setWizardStep(cardStepNum);
            } else if (receptionType === "RESERVATION") {
              router.replace("/receive?flow=reservation");
            } else {
              setWizardStep(plateStepNum);
            }
          }}
          disabled={!receptionType}
          accessibilityLabel={t(locale, "receive.next")}
        >
          <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
        </Pressable>
      </StickyFormFooter>
    );
  } else if (wizardStep === typeStepNum && reservationFlow) {
    footer = (
      <StickyFormFooter keyboardPinned>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            styles.primaryBtnSticky,
            { minHeight: M },
            !bookingValidated && styles.btnDisabled,
            pressed && styles.pressed,
          ]}
          onPress={() => setWizardStep(parkingStepNum)}
          disabled={!bookingValidated}
          accessibilityLabel={t(locale, "receive.next")}
        >
          <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
        </Pressable>
      </StickyFormFooter>
    );
  } else if (wizardStep === cardStepNum && !reservationFlow) {
    footer = (
      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(typeStepNum)}
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
              !cardVerificationStarted && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(plateStepNum)}
            disabled={!cardVerificationStarted}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === plateStepNum && !reservationFlow) {
    footer = (
      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(plateBackStep)}
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
            onPress={() => setWizardStep(driverStepNum)}
            disabled={!plateLooksValid || lookupLoading || !vehicleResolved}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === driverStepNum && !reservationFlow) {
    footer = (
      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(plateStepNum)}
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
  } else if (wizardStep === vehicleStepNum && !reservationFlow) {
    footer = (
      <StickyFormFooter keyboardPinned>
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
            onPress={() => setWizardStep(parkingStepNum)}
            disabled={!vehicleDataValid}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === parkingStepNum) {
    footer = (
      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(reservationFlow ? typeStepNum : vehicleStepNum)}
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
              !canContinueFromParking && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={async () => {
              await syncValetWorkingContext();
              setWizardStep(damageStepNum);
            }}
            disabled={!canContinueFromParking}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === ticketStepNum) {
    footer = (
      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(damageStepNum)}
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
              (!ticketCodesAcknowledged || !ticketCodesFilled) && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(valetStepNum)}
            disabled={!ticketCodesAcknowledged || !ticketCodesFilled}
            accessibilityLabel={t(locale, "receive.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === damageStepNum) {
    footer = (
      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(parkingStepNum)}
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
              damagePhotoBusy && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => setWizardStep(ticketStepNum)}
            disabled={damagePhotoBusy}
            accessibilityLabel={t(locale, "receive.damageContinueA11y")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "receive.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );
  } else if (wizardStep === valetStepNum) {
    footer = (
      <StickyFormFooter keyboardPinned>
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
              (submitting || !canSubmitReceive) && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleSubmit}
            disabled={submitting || !canSubmitReceive}
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

  const damageTileGap = theme.space.sm;
  const damageGridInnerWidth = Math.max(
    0,
    Math.min(windowWidth, responsive.contentMaxWidth) - responsive.sectionPadding * 2
  );
  const damageThumbSize = Math.max(
    118,
    damageGridInnerWidth > 0 ? (damageGridInnerWidth - damageTileGap) / 2 - 2 : 118
  );

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={C.card}
        translucent={Platform.OS === "android"}
      />
      <View style={styles.frame}>
      <View style={[styles.screenHeader, { paddingTop: safeInsets.top + theme.space.md }]}>
        <ValetBackButton
          onPress={() => router.back()}
          accessibilityLabel={t(locale, "common.back")}
        />
        <Text style={styles.screenTitle}>{receiveTitle}</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={{ flex: 1, minHeight: 0, alignSelf: "stretch", width: "100%" }}>
        {wizardStep === 1 && reservationFlow ? (
          <View
            style={{
              flex: 1,
              minHeight: 0,
              alignSelf: "stretch",
              width: "100%",
              position: "relative",
            }}
          >
            <View style={{ flex: 1, minHeight: 0, alignSelf: "stretch", width: "100%" }}>
              <ReservationQrPanel
                locale={locale}
                theme={theme}
                styles={qrStyles}
                variant="premium"
                validating={bookingLoading}
                pauseAfterScan={bookingCheck !== null && bookingCheck !== "invalid"}
                onBarcodeScanned={(raw) => {
                  const id = extractBookingIdFromScan(raw);
                  setBookingCode(id);
                  void validateBooking(id);
                }}
              />
            </View>
            {Platform.OS === "web" && (
              <View style={styles.reservationQrOverlay} pointerEvents="box-none">
                <LinearGradient
                  colors={["rgba(2,6,23,0)", "rgba(2,6,23,0.72)", "rgba(2,6,23,0.96)"]}
                  locations={[0, 0.28, 1]}
                  style={[
                    styles.reservationQrOverlayGradient,
                    {
                      paddingHorizontal: responsive.sectionPadding,
                      paddingBottom: theme.space.lg + safeInsets.bottom,
                    },
                    Platform.OS !== "web" && {
                      maxHeight: Math.min(Math.round(windowHeight * 0.44), 400),
                      paddingTop: theme.space.md,
                    },
                  ]}
                  pointerEvents="box-none"
                >
                  {Platform.OS === "web" && (
                    <View pointerEvents="auto">
                      <Text style={[styles.sectionLabel, { marginBottom: theme.space.sm }]}>
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
                    </View>
                  )}
                  {Platform.OS === "web" ? (
                    <>
                      {!companyIdForBooking && (
                        <View
                          style={styles.reservationQrCompanyCard}
                          pointerEvents="none"
                          accessibilityRole="text"
                        >
                          <Ionicons name="business-outline" size={22} color="#FBBF24" />
                          <Text style={styles.reservationQrCompanyCardText}>
                            {t(locale, "receive.wizardQrNoCompany")}
                          </Text>
                        </View>
                      )}
                      {bookingCheck && bookingCheck !== "invalid" && (
                        <View style={styles.reservationQrSuccessCard} pointerEvents="none">
                          <Ionicons name="checkmark-circle" size={24} color={C.success} />
                          <Text style={styles.reservationQrSuccessText}>
                            {t(locale, "receive.benefitOk", {
                              time: formatBenefitTime(bookingCheck.parking?.freeBenefitMinutes, locale),
                            })}
                          </Text>
                        </View>
                      )}
                      {bookingCheck === "invalid" && (
                        <View
                          style={styles.reservationBookingErrorShell}
                          pointerEvents="none"
                          accessibilityRole="alert"
                        >
                          <LinearGradient
                            colors={[
                              "rgba(251, 207, 232, 0.55)",
                              "rgba(196, 181, 253, 0.4)",
                              "rgba(125, 211, 252, 0.45)",
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.reservationBookingErrorBorder}
                          >
                            <View style={styles.reservationBookingErrorInner}>
                              <LinearGradient
                                colors={["rgba(15, 23, 42, 0.97)", "rgba(15, 23, 42, 0.92)"]}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                              />
                              <View style={styles.reservationBookingErrorContent}>
                                <View style={styles.reservationBookingErrorHeaderRow}>
                                  <LinearGradient
                                    colors={["rgba(251, 207, 232, 0.35)", "rgba(147, 197, 253, 0.4)"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.reservationBookingErrorIconRing}
                                  >
                                    <View style={styles.reservationBookingErrorIconCore}>
                                      <Ionicons
                                        name="qr-code-outline"
                                        size={22}
                                        color="rgba(248,250,252,0.92)"
                                      />
                                    </View>
                                  </LinearGradient>
                                  <View style={styles.reservationBookingErrorTitleBlock}>
                                    <Text style={styles.reservationBookingErrorEyebrow}>
                                      {t(locale, "receive.benefitInvalidEyebrow")}
                                    </Text>
                                    <Text style={styles.reservationBookingErrorTitle}>
                                      {t(locale, "receive.benefitInvalidTitle")}
                                    </Text>
                                  </View>
                                </View>
                                <Text style={styles.reservationBookingErrorBody} maxFontSizeMultiplier={2}>
                                  {t(locale, "receive.benefitInvalid")}
                                </Text>
                                <Text style={styles.reservationBookingErrorHint} maxFontSizeMultiplier={2}>
                                  {t(locale, "receive.benefitInvalidHint")}
                                </Text>
                              </View>
                            </View>
                          </LinearGradient>
                        </View>
                      )}
                    </>
                  ) : null}
                </LinearGradient>
              </View>
            )}
          </View>
        ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={wizardStep === valetStepNum && valetsRefreshing}
              onRefresh={onValetPullRefresh}
              enabled={wizardStep === valetStepNum}
              tintColor={C.primary}
              colors={[C.primary]}
              progressViewOffset={20}
            />
          }
        >
          {wizardStep === typeStepNum && !reservationFlow && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardTypeTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardTypeHelp")}</Text>
              <View style={styles.typeCardsGrid}>
                <Pressable
                  style={({ pressed }) => [
                    styles.typeCard,
                    receptionType === "CARD" && styles.typeCardSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setReceptionType("CARD")}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: receptionType === "CARD" }}
                >
                  <View style={[styles.typeCardIcon, receptionType === "CARD" && styles.typeCardIconActive]}>
                    <Ionicons
                      name="card-outline"
                      size={28}
                      color={receptionType === "CARD" ? "#fff" : theme.isDark ? "#38BDF8" : "#1D4ED8"}
                    />
                  </View>
                  <Text style={styles.typeCardTitle}>{t(locale, "receive.typeCardTitle")}</Text>
                  <Text style={styles.typeCardBody}>{t(locale, "receive.typeCardBody")}</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.typeCard,
                    receptionType === "RESERVATION" && styles.typeCardSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setReceptionType("RESERVATION")}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: receptionType === "RESERVATION" }}
                >
                  <View style={[styles.typeCardIcon, receptionType === "RESERVATION" && styles.typeCardIconActive]}>
                    <Ionicons
                      name="calendar-outline"
                      size={28}
                      color={receptionType === "RESERVATION" ? "#fff" : theme.isDark ? "#A78BFA" : "#7C3AED"}
                    />
                  </View>
                  <Text style={styles.typeCardTitle}>{t(locale, "receive.typeReservationTitle")}</Text>
                  <Text style={styles.typeCardBody}>{t(locale, "receive.typeReservationBody")}</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.typeCard,
                    receptionType === "DIRECT" && styles.typeCardSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setReceptionType("DIRECT")}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: receptionType === "DIRECT" }}
                >
                  <View style={[styles.typeCardIcon, receptionType === "DIRECT" && styles.typeCardIconActive]}>
                    <Ionicons
                      name="cash-outline"
                      size={28}
                      color={receptionType === "DIRECT" ? "#fff" : theme.isDark ? "#FBBF24" : "#D97706"}
                    />
                  </View>
                  <Text style={styles.typeCardTitle}>{t(locale, "receive.typeDirectTitle")}</Text>
                  <Text style={styles.typeCardBody}>{t(locale, "receive.typeDirectBody")}</Text>
                </Pressable>
              </View>
            </>
          )}

          {wizardStep === cardStepNum && !reservationFlow && (
            <CardVerification
              locale={locale}
              isDark={theme.isDark}
              cardVerificationStarted={cardVerificationStarted}
              onVerified={() => {
                setCardVerificationStarted(true);
                setWizardStep(plateStepNum);
              }}
              onCancel={() => setWizardStep(typeStepNum)}
              colors={{
                primary: C.primary,
                success: C.success,
                warning: C.warning,
                textSubtle: C.textSubtle,
                textMuted: C.textMuted,
                card: C.card,
                border: C.border,
                text: C.text,
              }}
              fonts={{
                secondary: ticketsA11y.font.secondary,
                body: ticketsA11y.font.body,
                button: ticketsA11y.font.button,
                title: ticketsA11y.font.title,
              }}
              space={{
                sm: theme.space.sm,
                md: theme.space.md,
                xs: theme.space.xs,
                lg: theme.space.lg,
              }}
            />
          )}

          {wizardStep === plateStepNum && !reservationFlow && (
            <VehiclePlateInput
              locale={locale}
              plate={plate}
              onPlateChange={(value) => {
                setPlate(value);
                setVehicleResolved(false);
                setLookupReadyForPlate('');
                setVehicle(null);
                setLoadedOwnerUserId(null);
                setLoadedDriverSnapshot(null);
                setLoadedVehicleSnapshot(null);
              }}
              lookupLoading={lookupLoading}
              vehicleResolved={vehicleResolved}
              vehicle={vehicle}
              plateLooksValid={plateLooksValid}
              colors={{
                primary: C.primary,
                success: C.success,
                warning: C.warning,
                textSubtle: C.textSubtle,
                textMuted: C.textMuted,
                card: C.card,
                border: C.border,
                text: C.text,
              }}
              fonts={{
                secondary: ticketsA11y.font.secondary,
                body: ticketsA11y.font.body,
              }}
              space={{
                sm: theme.space.sm,
                md: theme.space.md,
                xs: theme.space.xs,
              }}
            />
          )}

          {wizardStep === driverStepNum && !reservationFlow && (
            <DriverInfoForm
              locale={locale}
              firstName={driverFirst}
              lastName={driverLast}
              email={driverEmail}
              phone={driverPhone}
              countryCode={getDeviceCountryCode()}
              onFirstNameChange={setDriverFirst}
              onLastNameChange={setDriverLast}
              onEmailChange={setDriverEmail}
              onPhoneChange={setDriverPhone}
              colors={{
                textSubtle: C.textSubtle,
                textMuted: C.textMuted,
                card: C.card,
                border: C.border,
                text: C.text,
              }}
              fonts={{
                secondary: ticketsA11y.font.secondary,
                body: ticketsA11y.font.body,
              }}
              space={{
                sm: theme.space.sm,
                md: theme.space.md,
              }}
            />
          )}

          {wizardStep === vehicleStepNum && !reservationFlow && (
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
              <Pressable
                style={({ pressed }) => [styles.input, styles.selectorInput, pressed && styles.pressed]}
                onPress={() => setVehicleColorModalOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={t(locale, "receive.placeholderColor")}
              >
                <Text
                  style={[styles.selectorInputText, !vehColor && styles.selectorInputPlaceholder]}
                  numberOfLines={1}
                  maxFontSizeMultiplier={2}
                >
                  {formatVehicleColorLabel(vehColor, locale) || t(locale, "receive.placeholderColor")}
                </Text>
                <Ionicons name="list-outline" size={18} color={C.textMuted} />
              </Pressable>
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

              <Text style={styles.inputFieldLabel}>
                {keyCodesUnlinked
                  ? t(locale, "receive.ticketCodeOnlyLabel")
                  : t(locale, "receive.ticketCodeFieldLabel")}
              </Text>
              <TextInput
                style={styles.input}
                value={manualTicketCode}
                onChangeText={(v) => {
                  setManualTicketCode(v);
                  if (!keyCodesUnlinked) setManualKeyCode(v);
                }}
                placeholder={t(locale, "receive.placeholderTicketKeyCode")}
                placeholderTextColor={C.textSubtle}
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={64}
                maxFontSizeMultiplier={2}
              />

              <Pressable
                onPress={() => {
                  setKeyCodesUnlinked((u) => {
                    if (u) {
                      setManualKeyCode(manualTicketCode);
                      return false;
                    }
                    setManualKeyCode(manualTicketCode);
                    return true;
                  });
                }}
                style={({ pressed }) => [styles.ticketCodeToggle, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={
                  keyCodesUnlinked
                    ? t(locale, "receive.ticketKeySameToggle")
                    : t(locale, "receive.ticketKeySeparateToggle")
                }
              >
                <Text style={styles.ticketCodeToggleText}>
                  {keyCodesUnlinked
                    ? t(locale, "receive.ticketKeySameToggle")
                    : t(locale, "receive.ticketKeySeparateToggle")}
                </Text>
              </Pressable>

              {keyCodesUnlinked ? (
                <>
                  <Text style={[styles.inputFieldLabel, { marginTop: theme.space.md }]}>
                    {t(locale, "receive.keyCodeFieldLabel")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={manualKeyCode}
                    onChangeText={setManualKeyCode}
                    placeholder={t(locale, "receive.placeholderKeyCode")}
                    placeholderTextColor={C.textSubtle}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    maxLength={64}
                    maxFontSizeMultiplier={2}
                  />
                </>
              ) : null}

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

              {ticketCodesAcknowledged && manualTicketCode.length >= 2 && (
                <View style={{ marginTop: theme.space.lg, height: 400 }}>
                  <TicketQRPanel
                    locale={locale}
                    isDark={theme.isDark}
                    ticketCode={manualTicketCode}
                    keyCode={keyCodesUnlinked ? manualKeyCode : manualTicketCode}
                    vehiclePlate={plate}
                    vehicleBrand={vehBrand}
                    vehicleModel={vehModel}
                    driverName={`${driverFirst} ${driverLast}`}
                    parkingName={displayedReceiveParking?.parking.name}
                    timestamp={new Date().toISOString()}
                    colors={{
                      primary: C.primary,
                      success: C.success,
                      text: C.text,
                      textMuted: C.textMuted,
                      textSubtle: C.textSubtle,
                      card: C.card,
                      border: C.border,
                    }}
                    fonts={{
                      secondary: ticketsA11y.font.secondary,
                      body: ticketsA11y.font.body,
                      button: ticketsA11y.font.button,
                      title: ticketsA11y.font.title,
                    }}
                    space={{
                      sm: theme.space.sm,
                      md: theme.space.md,
                      lg: theme.space.lg,
                      xs: theme.space.xs,
                    }}
                  />
                </View>
              )}
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
            </>
          )}

          {wizardStep === damageStepNum && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardDamageTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.damageHeroSub")}</Text>

              <Text style={styles.inputFieldLabel}>{t(locale, "receive.damageSectionPhotos")}</Text>
              <Text style={styles.help}>{t(locale, "receive.damagePhotosHelp")}</Text>

              <View style={styles.damageActionsRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    styles.damageActionBtnFlex,
                    damagePhotoBusy && styles.btnDisabled,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => void takeDamagePhoto()}
                  disabled={damagePhotoBusy}
                  accessibilityLabel={t(locale, "receive.damageCameraA11y")}
                >
                  <Ionicons name="camera" size={22} color="#fff" />
                  <Text style={styles.primaryBtnText}>{t(locale, "receive.damageTakePhoto")}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.footerSecondaryBtn,
                    styles.damageActionBtnFlex,
                    styles.damageGalleryBtn,
                    damagePhotoBusy && styles.btnDisabled,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => void pickDamageFromLibrary()}
                  disabled={damagePhotoBusy}
                  accessibilityLabel={t(locale, "receive.damageGalleryA11y")}
                >
                  <Ionicons name="images-outline" size={22} color={C.textMuted} />
                  <Text style={styles.footerSecondaryBtnText}>{t(locale, "receive.damageFromGallery")}</Text>
                </Pressable>
              </View>

              <Text style={styles.damageCountMeta}>
                {t(locale, "receive.damagePhotoCount", {
                  current: String(damagePhotoDataUrls.length),
                  max: String(MAX_DAMAGE_PHOTOS),
                })}
              </Text>

              <View
                style={[
                  styles.damageGrid,
                  { gap: damageTileGap, marginBottom: theme.space.md },
                ]}
              >
                {damagePhotoDataUrls.map((url, index) => (
                  <View
                    key={`dmg-${index}`}
                    style={[
                      styles.damageThumbWrap,
                      {
                        width: damageThumbSize,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: url }}
                      style={[
                        styles.damageThumb,
                        {
                          height: Math.round(damageThumbSize * 0.68),
                        },
                      ]}
                      resizeMode="cover"
                    />
                    <Pressable
                      style={({ pressed }) => [styles.damageRemoveBtn, pressed && styles.pressed]}
                      onPress={() => removeDamagePhotoAt(index)}
                      accessibilityLabel={t(locale, "receive.damageRemovePhotoA11y")}
                    >
                      <Ionicons name="close-circle" size={28} color="rgba(255,255,255,0.95)" />
                    </Pressable>
                  </View>
                ))}
              </View>

              {damagePhotoBusy ? (
                <ActivityIndicator color={C.primary} style={{ marginBottom: theme.space.md }} />
              ) : null}

              <Text style={styles.inputFieldLabel}>{t(locale, "receive.damageNoteLabel")}</Text>
              <Text style={[styles.damageNoteOptional, { color: C.textMuted }]}>
                {t(locale, "receive.damageNoteOptional")}
              </Text>
              <TextInput
                style={[styles.input, styles.damageNoteInput]}
                value={damageNote}
                onChangeText={setDamageNote}
                placeholder={t(locale, "receive.damageNotePlaceholder")}
                placeholderTextColor={C.textSubtle}
                multiline
                maxFontSizeMultiplier={2}
              />
            </>
          )}

          {wizardStep === valetStepNum && (
            <>
              <Text style={styles.sectionLabel}>{t(locale, "receive.wizardValetStepTitle")}</Text>
              <Text style={styles.stepExplain}>{t(locale, "receive.wizardValetStepHelp")}</Text>

              <View style={styles.receiveParkingCard}>
                <View style={[styles.bottomCardInner, !driverValetId && { borderColor: C.border }]}>
                  <View style={styles.bottomIconWrap}>
                    <Ionicons
                      name="person-circle-outline"
                      size={26}
                      color={driverValetId ? C.primary : C.textMuted}
                    />
                  </View>
                  <View style={styles.bottomTextCol}>
                    <View style={styles.bottomTitleRow}>
                      <Text style={styles.bottomTitle} numberOfLines={1}>
                        {t(locale, "receive.driverValetSection")}
                      </Text>
                      <Pressable
                        style={({ pressed }) => [styles.bottomChooseBtn, pressed && styles.pressed]}
                        onPress={() => setValetSelectModalOpen(true)}
                        accessibilityRole="button"
                        accessibilityLabel={t(locale, "receive.valetSelectChoose")}
                      >
                        <Ionicons name="list-outline" size={16} color={C.primary} />
                        <Text style={[styles.bottomChooseBtnText, { color: C.primary }]}>
                          {t(locale, "receive.valetSelectChoose")}
                        </Text>
                      </Pressable>
                    </View>

                    {metaLoading || valetsLoading ? (
                      <View style={styles.bottomLoadingRow}>
                        <ActivityIndicator size="small" color={C.primary} />
                        <Text style={styles.bottomMeta}>{t(locale, "common.loading")}</Text>
                      </View>
                    ) : !parkingId || !effectiveCompanyId ? (
                      <Text style={styles.bottomMeta}>{t(locale, "receive.valetDriversNeedParking")}</Text>
                    ) : selectedDispatchDriver ? (
                      <View style={{ gap: 2 }}>
                        <Text style={styles.bottomName} numberOfLines={1}>
                          {selectedDispatchDriver.user.firstName} {selectedDispatchDriver.user.lastName}
                        </Text>
                        <Text style={styles.bottomCompany} numberOfLines={1}>
                          {selectedDispatchDriver.user.email || t(locale, "receive.valetNoEmail")}
                        </Text>
                        {selectedBusyDriver ? (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <Ionicons name="time-outline" size={14} color={C.warning} />
                            <Text style={[styles.bottomMeta, { color: C.warning, marginTop: 0 }]}>
                              {t(locale, "receive.valetStatusBusy")} (5-15 min)
                            </Text>
                          </View>
                        ) : (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                            <Ionicons name="checkmark-circle-outline" size={14} color={C.success} />
                            <Text style={[styles.bottomMeta, { color: C.success, marginTop: 0 }]}>
                              {t(locale, "receive.valetStatusAvailable")}
                            </Text>
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text style={[styles.bottomMeta, { color: C.textSubtle }]}>
                        {t(locale, "receive.valetSelectNoSelection")}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {selectedBusyDriver ? (
                <View style={[styles.valetEtaCard, { marginTop: 0 }]}>
                  <LinearGradient
                    colors={
                      theme.isDark
                        ? ["rgba(245, 158, 11, 0.22)", "rgba(245, 158, 11, 0.06)"]
                        : ["rgba(251, 191, 36, 0.35)", "rgba(254, 243, 199, 0.5)"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.valetEtaAccent} />
                  <View style={styles.valetEtaContent}>
                    <View style={styles.valetEtaIconWrap}>
                      <Ionicons name="hourglass-outline" size={22} color={C.warning} />
                    </View>
                    <View style={styles.valetEtaTextCol}>
                      <Text style={styles.valetEtaKicker}>{t(locale, "receive.valetEtaKicker")}</Text>
                      <Text style={styles.valetEtaTitle}>{t(locale, "receive.valetEtaTitle")}</Text>
                      <Text style={styles.valetEtaBody} maxFontSizeMultiplier={2}>
                        {t(locale, "receive.valetEtaBody", { min: "5", max: "15" })}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
        )}

        {footer ? <View>{footer}</View> : null}


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
                    {t(locale, "receive.brandPickerEmpty")}
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
                    {t(locale, "receive.modelPickerEmpty")}
                  </Text>
                }
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={vehicleColorModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setVehicleColorModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdropPress}
              onPress={() => setVehicleColorModalOpen(false)}
              accessibilityLabel={t(locale, "common.cancel")}
            />
            <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.modalTitle, { color: C.text }]}>{t(locale, "receive.placeholderColor")}</Text>
              <FlatList
                data={getVehicleColorOptions(locale)}
                keyExtractor={(item) => item.value}
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
                      setVehColor("");
                      setVehicleColorModalOpen(false);
                    }}
                  >
                    <Text style={[styles.parkingRowName, { color: C.primary }]}>
                      {t(locale, "receive.noColorOption")}
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
                      setVehColor(item.value);
                      setVehicleColorModalOpen(false);
                    }}
                  >
                    <Text style={[styles.parkingRowName, { color: C.text }]} numberOfLines={2}>
                      {item.label}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  <Text style={{ color: C.textMuted, padding: theme.space.md }}>
                    {t(locale, "receive.colorPickerEmpty")}
                  </Text>
                }
              />
            </View>
          </View>
        </Modal>

        <Modal
          visible={valetSelectModalOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setValetSelectModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.modalBackdropPress}
              onPress={() => setValetSelectModalOpen(false)}
              accessibilityLabel={t(locale, "common.cancel")}
            />
            <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={[styles.bottomTitleRow, { paddingBottom: theme.space.sm, marginBottom: theme.space.sm }]}>
                <Text style={[styles.modalTitle, { color: C.text, marginBottom: 0 }]}>
                    {t(locale, "receive.valetSelectPlaceholder")}
                </Text>
              </View>
              <FlatList
                data={[...availableValets.map(v => ({ ...v, variant: 'available' as const })), ...busyValets.map(v => ({ ...v, variant: 'busy' as const }))] }
                keyExtractor={(item) => item.id}
                style={styles.modalList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <ValetDispatchRow
                    v={item}
                    selected={driverValetId === item.id}
                    isBusy={item.variant === 'busy'}
                    onPress={() => {
                        setDriverValetId(item.id);
                        setValetSelectModalOpen(false);
                    }}
                    locale={locale}
                    theme={theme}
                    styles={createValetRowStyles(theme)}
                    statusMeta={item.variant === 'available' ? t(locale, "receive.valetStatusAvailable") : t(locale, "receive.valetStatusBusy")}
                    statusBadgeShort={item.variant === 'available' ? t(locale, "receive.valetStatusAvailableShort") : t(locale, "receive.valetStatusBusyShort")}
                    badgeVariant={item.variant}
                  />
                )}
                ListHeaderComponent={() => {
                   if (availableValets.length > 0) {
                       return <Text style={[styles.valetSectionTitle, { marginTop: 0 }]}>{t(locale, "receive.valetDriversAvailableTitle")}</Text>
                   }
                   return null;
                }}
                ListEmptyComponent={
                  <Text style={{ color: C.textMuted, padding: theme.space.md }}>
                    {t(locale, "receive.valetDriversEmpty")}
                  </Text>
                }
                ItemSeparatorComponent={() => <View style={{ height: theme.space.sm }} />}
                contentContainerStyle={{ paddingBottom: theme.space.xl }}
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
    inlineLoadingText: {
      fontSize: F.secondary,
      color: C.textSubtle,
      lineHeight: 20,
      marginBottom: 0,
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
    typeCardsGrid: {
      gap: S.md,
      paddingTop: S.xs,
      marginBottom: S.lg,
    },
    typeCard: {
      backgroundColor: C.card,
      borderRadius: R.card,
      borderWidth: 2,
      borderColor: C.border,
      padding: S.lg,
      justifyContent: "center",
      alignItems: "center",
      gap: S.sm,
    },
    typeCardSelected: {
      borderColor: C.primary,
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.08)" : "rgba(59, 130, 246, 0.04)",
    },
    typeCardIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(241, 245, 249, 1)",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: S.xs,
    },
    typeCardIconActive: {
      backgroundColor: C.primary,
    },
    typeCardTitle: {
      fontSize: F.body,
      fontWeight: "800",
      color: C.text,
      textAlign: "center",
    },
    typeCardBody: {
      fontSize: F.secondary,
      color: C.textMuted,
      textAlign: "center",
      lineHeight: 20,
    },
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
    reservationQrOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "flex-end",
    },
    reservationQrOverlayGradient: {
      paddingTop: S.xl * 2.25,
      paddingBottom: S.lg,
      gap: S.md,
    },
    reservationQrOverlayScroll: {
      flexShrink: 1,
    },
    reservationQrOverlayScrollContent: {
      gap: S.md,
      paddingBottom: S.xs,
    },
    reservationQrCompanyCard: {
      flexDirection: "row",
      gap: S.md,
      alignItems: "flex-start",
      backgroundColor: "rgba(30, 41, 59, 0.88)",
      borderWidth: 1,
      borderColor: "rgba(251, 191, 36, 0.35)",
      borderLeftWidth: 4,
      borderLeftColor: "rgba(251, 191, 36, 0.9)",
      paddingVertical: S.md,
      paddingHorizontal: S.md,
      borderRadius: R.card,
    },
    reservationQrCompanyCardText: {
      flex: 1,
      color: "#FDE68A",
      fontWeight: "600",
      fontSize: F.secondary,
      lineHeight: 22,
    },
    reservationQrSuccessCard: {
      flexDirection: "row",
      gap: S.md,
      alignItems: "center",
      backgroundColor: "rgba(30, 41, 59, 0.88)",
      borderWidth: 1,
      borderColor: "rgba(52, 211, 153, 0.35)",
      paddingVertical: S.md,
      paddingHorizontal: S.md,
      borderRadius: R.card,
    },
    reservationQrSuccessText: {
      flex: 1,
      color: "#6EE7B7",
      fontWeight: "700",
      fontSize: F.secondary,
      lineHeight: 22,
    },
    reservationBookingErrorShell: {
      borderRadius: 22,
      overflow: "hidden",
      shadowColor: "#020617",
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.45,
      shadowRadius: 28,
      elevation: 16,
    },
    reservationBookingErrorBorder: {
      borderRadius: 22,
      padding: StyleSheet.hairlineWidth * 2 + 1,
    },
    reservationBookingErrorInner: {
      borderRadius: 20,
      overflow: "hidden",
    },
    reservationBookingErrorContent: {
      paddingVertical: S.lg,
      paddingHorizontal: S.lg,
      gap: S.md,
    },
    reservationBookingErrorHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.md,
    },
    reservationBookingErrorIconRing: {
      width: 52,
      height: 52,
      borderRadius: 16,
      padding: 2,
      justifyContent: "center",
      alignItems: "center",
    },
    reservationBookingErrorIconCore: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: "rgba(2, 6, 23, 0.55)",
      alignItems: "center",
      justifyContent: "center",
    },
    reservationBookingErrorTitleBlock: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    reservationBookingErrorEyebrow: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 3.2,
      color: "rgba(203, 213, 225, 0.65)",
      textTransform: "uppercase",
    },
    reservationBookingErrorTitle: {
      fontSize: F.title - 4,
      fontWeight: "700",
      color: "#F8FAFC",
      letterSpacing: -0.6,
    },
    reservationBookingErrorBody: {
      fontSize: F.secondary,
      fontWeight: "500",
      color: "rgba(226, 232, 240, 0.9)",
      lineHeight: 24,
      letterSpacing: 0.1,
    },
    reservationBookingErrorHint: {
      fontSize: F.secondary - 1,
      fontWeight: "600",
      color: "rgba(148, 163, 184, 0.88)",
      lineHeight: 21,
      letterSpacing: 0.2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(148, 163, 184, 0.15)",
      marginTop: 2,
      paddingTop: S.sm,
    },
    inputFieldLabel: {
      fontSize: F.secondary,
      fontWeight: "700",
      color: C.textMuted,
      marginBottom: S.xs,
    },
    ticketCodeToggle: {
      alignSelf: "flex-start",
      paddingVertical: S.xs,
      marginBottom: S.md,
    },
    ticketCodeToggleText: {
      fontSize: F.secondary,
      fontWeight: "700",
      color: C.primary,
    },
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
      fontWeight: Platform.OS === "android" ? "normal" : "800",
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
      backgroundColor: theme.isDark ? "rgba(2, 6, 23, 0.82)" : "rgba(255, 255, 255, 0.96)",
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(56, 189, 248, 0.28)" : "rgba(37, 99, 235, 0.2)",
      padding: S.lg,
      gap: S.md,
    },
    cardVerifyPremiumShell: {
      borderRadius: R.card + 2,
      padding: 1.5,
      marginBottom: S.md,
    },
    cardVerifyOnHoldRow: { flexDirection: "row", alignItems: "flex-start", gap: S.md },
    cardVerifyIconBubble: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(239, 246, 255, 0.95)",
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(56, 189, 248, 0.32)" : "rgba(37, 99, 235, 0.22)",
    },
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
    cardVerifyBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.sm,
      flexWrap: "wrap",
    },
    cardVerifyBadgeText: {
      fontSize: F.secondary - 1,
      fontWeight: "800",
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    cardVerifyStartedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: S.md,
      borderRadius: 999,
      backgroundColor: theme.isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.13)",
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(52, 211, 153, 0.35)" : "rgba(16, 185, 129, 0.25)",
    },
    cardVerifyStartedBadgeText: {
      fontSize: F.secondary - 1,
      fontWeight: "800",
      color: C.success,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    stepCardStripeBtn: {
      marginBottom: S.sm,
      overflow: "hidden",
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    stepCardStripeBtnBg: {
      width: "100%",
      minHeight: ticketsA11y.minTouch,
      borderRadius: R.button + 2,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: S.md,
      paddingVertical: S.md,
    },
    stepCardStripeBtnRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
    },
    cardVerifyHintText: {
      fontSize: F.secondary,
      color: C.textSubtle,
      lineHeight: 22,
      marginBottom: S.md,
    },
    modalBody: {
      fontSize: F.secondary,
      color: C.textMuted,
      lineHeight: 20,
      marginTop: S.xs,
      marginBottom: S.md,
    },
    modalActions: { flexDirection: "row", gap: S.sm, marginTop: S.sm },
    modalActionBtn: { flex: 1, marginBottom: 0 },
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
    valetDriverList: {
      marginBottom: S.lg,
      gap: S.sm,
    },
    valetSectionTitle: {
      fontSize: F.secondary,
      fontWeight: "800",
      color: C.textSubtle,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: S.xs,
      marginBottom: S.xs,
    },
    valetQueueCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: S.sm,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(217, 119, 6, 0.35)",
      backgroundColor: theme.isDark ? "rgba(245, 158, 11, 0.13)" : "rgba(245, 158, 11, 0.1)",
      paddingHorizontal: S.md,
      paddingVertical: S.sm,
      marginTop: S.xs,
      marginBottom: S.sm,
    },
    valetQueueCardText: {
      flex: 1,
      color: C.text,
      fontSize: F.secondary,
      lineHeight: 20,
      fontWeight: "600",
    },
    valetDriverRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.md,
      backgroundColor: C.card,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.border,
      paddingVertical: S.md,
      paddingHorizontal: S.md,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: { elevation: 1 },
      }),
    },
    valetDriverRowBusy: {
      borderStyle: "dashed",
    },
    valetDriverRowSelected: {
      borderColor: C.primary,
      borderWidth: 2,
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)",
    },
    valetDriverRowTextCol: {
      flex: 1,
      minWidth: 0,
    },
    valetDriverRowText: {
      fontSize: F.body,
      fontWeight: "700",
      color: C.text,
    },
    valetDriverRowMeta: {
      fontSize: F.secondary - 1,
      color: C.textSubtle,
      marginTop: 2,
    },
    valetStatusBadgeAvailable: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(34,197,94,0.45)" : "rgba(22,163,74,0.35)",
      backgroundColor: theme.isDark ? "rgba(34,197,94,0.18)" : "rgba(34,197,94,0.12)",
      paddingVertical: 5,
      paddingHorizontal: S.sm,
    },
    valetStatusBadgeAvailableText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.isDark ? "#86EFAC" : "#166534",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    valetStatusBadgeBusy: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(245,158,11,0.5)" : "rgba(217,119,6,0.35)",
      backgroundColor: theme.isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.12)",
      paddingVertical: 5,
      paddingHorizontal: S.sm,
    },
    valetStatusBadgeBusyText: {
      fontSize: 11,
      fontWeight: "800",
      color: theme.isDark ? "#FCD34D" : "#92400E",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    valetAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      overflow: "hidden",
    },
    valetAvatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 24,
    },
    valetAvatarText: {
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    valetDriverRowSelectedBusy: {
      borderColor: theme.isDark ? "rgba(245, 158, 11, 0.65)" : "rgba(217, 119, 6, 0.55)",
      borderWidth: 2,
      backgroundColor: theme.isDark ? "rgba(245, 158, 11, 0.12)" : "rgba(251, 191, 36, 0.14)",
    },
    valetEtaCard: {
      marginTop: S.md,
      borderRadius: R.card + 4,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(217, 119, 6, 0.3)",
      position: "relative",
    },
    valetEtaAccent: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: C.warning,
      zIndex: 1,
    },
    valetEtaContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: S.md,
      paddingVertical: S.md,
      paddingHorizontal: S.md,
      paddingLeft: S.md + 4,
      zIndex: 2,
    },
    valetEtaIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark ? "rgba(15, 23, 42, 0.65)" : "rgba(255, 255, 255, 0.85)",
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(217, 119, 6, 0.22)",
    },
    valetEtaTextCol: {
      flex: 1,
      minWidth: 0,
      gap: 4,
    },
    valetEtaKicker: {
      fontSize: 11,
      fontWeight: "800",
      color: C.warning,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    valetEtaTitle: {
      fontSize: F.body,
      fontWeight: "800",
      color: C.text,
    },
    valetEtaBody: {
      fontSize: F.secondary,
      color: C.textMuted,
      lineHeight: 22,
      fontWeight: "600",
    },
    valetEtaFootnote: {
      fontSize: F.secondary - 1,
      color: C.textSubtle,
      lineHeight: 20,
      marginTop: 4,
      fontStyle: "italic",
    },
    damageActionsRow: {
      flexDirection: "row",
      gap: S.sm,
      marginBottom: S.sm,
    },
    damageActionBtnFlex: {
      flex: 1,
      marginBottom: 0,
    },
    damageGalleryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
    },
    damageCountMeta: {
      fontSize: 13,
      fontWeight: "700",
      color: C.textMuted,
      marginBottom: S.md,
    },
    damageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    damageThumbWrap: {
      position: "relative",
      borderRadius: R.button,
      overflow: "hidden",
      backgroundColor: theme.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    },
    damageThumb: {
      width: "100%",
      borderRadius: R.button,
      backgroundColor: C.border,
    },
    damageRemoveBtn: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: "rgba(0,0,0,0.45)",
      borderRadius: 999,
    },
    damageNoteOptional: {
      fontSize: F.secondary - 1,
      marginTop: -6,
      marginBottom: S.sm,
      lineHeight: 20,
    },
    damageNoteInput: {
      minHeight: 96,
      textAlignVertical: "top",
      paddingTop: 12,
    },
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
