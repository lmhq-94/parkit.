import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { IconCamera, IconGallery, IconCircleX } from "@/components/Icons";
import api from "@/lib/api";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { createFeedback } from "@/lib/feedback";
import { ValetBackButton } from "@/components/ValetBackButton";
import { StickyFormFooter } from "@/components/StickyFormFooter";
import { ticketsA11y, useResponsiveLayout, useValetTheme } from "@/theme/valetTheme";

import { MAX_DAMAGE_PHOTOS } from "@/lib/receiveUtils";

type TicketDetail = {
  id: string;
  parkingId: string;
  status: string;
  parking: { name: string; address?: string | null };
  slot?: { id: string; label: string } | null;
};

type ParkingSlot = { id: string; label: string };

type FlowStep = "damage" | "slot";

function createParkStyles(theme: ReturnType<typeof useValetTheme>, contentMaxWidth: number, sectionPadding: number) {
  const C = theme.colors;
  const S = theme.space;
  const R = theme.radius;
  const F = ticketsA11y.font;
  const Fonts = theme.fontFamily;
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
    screenTitle: {
      fontSize: Math.round(F.secondary * 0.85),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.text,
      flex: 1,
      textAlign: "center",
    },
    sectionLabel: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      fontFamily: Fonts.primary,
      color: C.textMuted,
      marginBottom: S.sm,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    stepExplain: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textSubtle,
      marginTop: -4,
      marginBottom: S.md,
      lineHeight: 22,
    },
    inputFieldLabel: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "700",
      fontFamily: Fonts.primary,
      color: C.textMuted,
      marginBottom: S.xs,
    },
    help: {
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.textSubtle,
      marginBottom: S.md,
      lineHeight: 22,
    },
    footerRow: { flexDirection: "row", gap: S.sm, alignItems: "center" },
    footerPrimaryBtn: { flex: 1, marginBottom: 0 },
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
      fontFamily: Fonts.primary,
      fontSize: Math.round(F.status * 0.65),
    },
    primaryBtnSticky: { marginTop: 0, marginBottom: 0 },
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
      fontFamily: Fonts.primary,
      fontSize: Math.round(F.status * 0.65),
    },
    input: {
      backgroundColor: C.card,
      borderWidth: 2,
      borderColor: C.border,
      borderRadius: R.button,
      paddingHorizontal: S.md,
      paddingVertical: 14,
      fontSize: Math.round(F.status * 0.65),
      fontFamily: Fonts.primary,
      color: C.text,
      marginBottom: S.sm,
    },
    btnDisabled: { opacity: 0.55 },
    pressed: { opacity: 0.9 },
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
      fontSize: Math.round(F.secondary * 0.8),
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
    sectionTitle: {
      fontSize: F.secondary - 1,
      fontWeight: "800",
      color: C.text,
      marginBottom: S.xs,
    },
    sectionHelp: {
      fontSize: F.secondary,
      color: C.textMuted,
      lineHeight: 22,
      marginBottom: S.md,
    },
    disabled: {
      opacity: 0.6,
    },
    slotFilterInput: {
      marginBottom: S.md,
    },
    slotGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: S.sm,
    },
    slotCard: {
      minWidth: 110,
      borderRadius: R.card,
      borderWidth: 1.5,
      borderColor: theme.isDark ? "rgba(148, 163, 184, 0.35)" : "#CBD5F5",
      backgroundColor: theme.isDark ? "rgba(30, 41, 59, 0.7)" : "#F8FAFF",
      paddingVertical: S.md,
      paddingHorizontal: S.md,
    },
    slotCardSelected: {
      borderColor: C.primary,
      backgroundColor: theme.isDark ? "rgba(37, 99, 235, 0.2)" : "#DBEAFE",
    },
    slotLabel: {
      fontSize: F.secondary - 1,
      fontWeight: "800",
      color: C.text,
    },
    slotHint: {
      fontSize: F.secondary - 1,
      color: C.textMuted,
      marginTop: 4,
    },
    loadingBox: {
      paddingVertical: S.xl,
      alignItems: "center",
      justifyContent: "center",
      gap: S.sm,
    },
  });
}

export default function ParkFlowScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ticketId?: string | string[]; companyId?: string | string[] }>();
  const ticketId = Array.isArray(params.ticketId) ? params.ticketId[0] : params.ticketId;
  const companyId = Array.isArray(params.companyId) ? params.companyId[0] : params.companyId;

  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createParkStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding]
  );
  const feedback = useMemo(() => createFeedback(locale), [locale]);
  const C = theme.colors;
  const M = ticketsA11y.minTouch;

  const [_ticket, setTicket] = useState<TicketDetail | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotUpdating, setSlotUpdating] = useState(false);
  const [slotFilter, setSlotFilter] = useState("");
  const [step, setStep] = useState<FlowStep>("damage");
  const [damagePhotoDataUrls, setDamagePhotoDataUrls] = useState<string[]>([]);
  const [damagePhotoBusy, setDamagePhotoBusy] = useState(false);
  const [damageNote, setDamageNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [valetId, setValetId] = useState<string | null>(null);

  const damageTileGap = theme.space.sm;
  const damageGridInnerWidth = Math.max(
    0,
    Math.min(width, responsive.contentMaxWidth) - responsive.sectionPadding * 2
  );
  const damageThumbSize = Math.max(
    118,
    damageGridInnerWidth > 0 ? (damageGridInnerWidth - damageTileGap) / 2 - 2 : 118
  );
  const slotTileGap = theme.space.sm;
  const slotGridWidth = Math.max(
    0,
    Math.min(width, responsive.contentMaxWidth) - responsive.sectionPadding * 2
  );
  const slotTileWidth = Math.max(
    140,
    slotGridWidth > 0 ? (slotGridWidth - slotTileGap) / 2 - 2 : 140
  );

  const loadSlots = useCallback(
    async (parkingId: string) => {
      if (!companyId) return;
      setSlotLoading(true);
      try {
        const res = await api.get<{ data: ParkingSlot[] }>(`/parkings/${parkingId}/slots/available`, {
          headers: { "x-company-id": companyId },
        });
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setSlots(list);
      } catch {
        setSlots([]);
      } finally {
        setSlotLoading(false);
      }
    },
    [companyId]
  );

  useEffect(() => {
    if (!user || !ticketId || !companyId) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const [ticketRes, valetRes] = await Promise.all([
          api.get<{ data: TicketDetail }>(`/tickets/${ticketId}`, {
            headers: { "x-company-id": companyId },
          }),
          api.get<{ data: { id: string } }>("/valets/me"),
        ]);
        if (cancelled) return;
        const nextTicket = ticketRes.data?.data ?? null;
        setTicket(nextTicket);
        if (nextTicket?.slot?.id) {
          setSelectedSlotId(nextTicket.slot.id);
        }
        setValetId(valetRes.data?.data?.id ?? null);
        if (nextTicket?.parkingId) {
          void loadSlots(nextTicket.parkingId);
        }
      } catch {
        if (!cancelled) feedback.error(t(locale, "park.loadError"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [user, ticketId, companyId, feedback, locale, loadSlots]);

  const processAndAddDamagePhoto = useCallback(
    async (uri: string) => {
      if (damagePhotoDataUrls.length >= MAX_DAMAGE_PHOTOS) {
        feedback.error(t(locale, "park.photoLimit", { max: String(MAX_DAMAGE_PHOTOS) }));
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
    [damagePhotoDataUrls.length, feedback, locale]
  );

  const pickDamageFromLibrary = useCallback(async () => {
    if (damagePhotoDataUrls.length >= MAX_DAMAGE_PHOTOS) {
      feedback.error(t(locale, "park.photoLimit", { max: String(MAX_DAMAGE_PHOTOS) }));
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
  }, [damagePhotoDataUrls.length, feedback, locale, processAndAddDamagePhoto]);

  const takeDamagePhoto = useCallback(async () => {
    if (damagePhotoDataUrls.length >= MAX_DAMAGE_PHOTOS) {
      feedback.error(t(locale, "park.photoLimit", { max: String(MAX_DAMAGE_PHOTOS) }));
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
  }, [damagePhotoDataUrls.length, feedback, locale, processAndAddDamagePhoto]);

  const removeDamagePhotoAt = useCallback((index: number) => {
    setDamagePhotoDataUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleNext = () => {
    if (damagePhotoDataUrls.length === 0) {
      feedback.error(t(locale, "park.photoRequiredError"));
      return;
    }
    feedback.confirm({
      title: t(locale, "park.confirmPromptTitle"),
      message: t(locale, "park.confirmPromptMessage"),
      confirmText: t(locale, "tickets.yesContinue"),
      onConfirm: () => {
        setStep("slot");
      },
    });
  };

  const handleConfirmParked = () => {
    if (!selectedSlotId) {
      feedback.error(t(locale, "park.slotRequiredError"));
      return;
    }
    if (!ticketId || !companyId || !valetId) {
      feedback.error(t(locale, "park.loadError"));
      return;
    }
    setSubmitting(true);
    (async () => {
      try {
        await api.post(
          `/tickets/${ticketId}/damage-report`,
          {
            valetId,
            description: damageNote.trim(),
            photos: damagePhotoDataUrls.map((url) => ({ url })),
          },
          { headers: { "x-company-id": companyId } }
        );
        await api.patch(
          `/tickets/${ticketId}`,
          { status: "PARKED", slotId: selectedSlotId },
          { headers: { "x-company-id": companyId } }
        );
        feedback.success(t(locale, "park.successParked"));
        router.replace("/tickets?queue=parking");
      } catch {
        feedback.error(t(locale, "tickets.errorUpdate"));
      } finally {
        setSubmitting(false);
      }
    })();
  };

  const filteredSlots = useMemo(() => {
    const q = slotFilter.trim().toLowerCase();
    if (!q) return slots;
    return slots.filter((s) => s.label.toLowerCase().includes(q));
  }, [slots, slotFilter]);

  const handleSelectSlot = async (slotId: string) => {
    if (!companyId) return;
    if (slotUpdating || selectedSlotId === slotId) {
      setSelectedSlotId(slotId);
      return;
    }
    const prev = selectedSlotId;
    setSelectedSlotId(slotId);
    setSlotUpdating(true);
    try {
      if (prev && prev !== slotId) {
        await api.patch(
          `/parkings/slots/${prev}`,
          { isAvailable: true },
          { headers: { "x-company-id": companyId } }
        );
      }
      await api.patch(
        `/parkings/slots/${slotId}`,
        { isAvailable: false },
        { headers: { "x-company-id": companyId } }
      );
    } catch {
      feedback.error(t(locale, "tickets.errorUpdate"));
    } finally {
      setSlotUpdating(false);
    }
  };

  if (!user) return <Redirect href="/login" />;
  if (!ticketId || !companyId) return <Redirect href="/tickets" />;

  const footer =
    step === "damage" ? (
      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
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
              (damagePhotoBusy || damagePhotoDataUrls.length === 0) && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleNext}
            disabled={damagePhotoBusy || damagePhotoDataUrls.length === 0}
            accessibilityLabel={t(locale, "park.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "park.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    ) : (
      <StickyFormFooter keyboardPinned>
        <View style={styles.footerRow}>
          <Pressable
            style={({ pressed }) => [
              styles.footerSecondaryBtn,
              { minHeight: M },
              pressed && styles.pressed,
            ]}
            onPress={() => setStep("damage")}
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
              (submitting || slotLoading || !selectedSlotId) && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={handleConfirmParked}
            disabled={submitting || slotLoading || !selectedSlotId}
            accessibilityLabel={t(locale, "park.next")}
          >
            <Text style={styles.primaryBtnText}>{t(locale, "park.next")}</Text>
          </Pressable>
        </View>
      </StickyFormFooter>
    );

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.card}
        translucent={Platform.OS === "android"}
      />
      <View style={styles.frame}>
        <View style={[styles.screenHeader, { paddingTop: insets.top + theme.space.md }]}>
          <ValetBackButton onPress={() => router.back()} accessibilityLabel={t(locale, "common.back")} />
          <Text style={styles.screenTitle}>{t(locale, "park.title")}</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={{ flex: 1, minHeight: 0, alignSelf: "stretch", width: "100%" }}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={styles.help}>{t(locale, "park.loading")}</Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {step === "damage" ? (
                <>
                  <Text style={styles.sectionLabel}>{t(locale, "park.stepDamageTitle")}</Text>
                  <Text style={styles.stepExplain}>{t(locale, "park.stepDamageHelp")}</Text>

                  <Text style={styles.inputFieldLabel}>{t(locale, "park.damageSectionPhotos")}</Text>
                  <Text style={styles.help}>{t(locale, "park.damagePhotosHelp")}</Text>

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
                      <IconCamera size={22} color="#fff" />
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
                      <IconGallery size={22} color={theme.colors.textMuted} />
                      <Text style={styles.footerSecondaryBtnText}>{t(locale, "receive.damageFromGallery")}</Text>
                    </Pressable>
                  </View>

                  <Text style={styles.damageCountMeta}>
                    {t(locale, "receive.damagePhotoCount", {
                      current: String(damagePhotoDataUrls.length),
                      max: String(MAX_DAMAGE_PHOTOS),
                    })}
                  </Text>

                  <View style={[styles.damageGrid, { gap: damageTileGap, marginBottom: theme.space.md }]}>
                    {damagePhotoDataUrls.map((url, index) => (
                      <View
                        key={`dmg-${index}`}
                        style={[styles.damageThumbWrap, { width: damageThumbSize }]}
                      >
                        <Image
                          source={{ uri: url }}
                          style={[styles.damageThumb, { height: Math.round(damageThumbSize * 0.68) }]}
                          resizeMode="cover"
                        />
                        <Pressable
                          style={({ pressed }) => [styles.damageRemoveBtn, pressed && styles.pressed]}
                          onPress={() => removeDamagePhotoAt(index)}
                          accessibilityLabel={t(locale, "receive.damageRemovePhotoA11y")}
                        >
                          <IconCircleX size={28} color="rgba(255,255,255,0.95)" />
                        </Pressable>
                      </View>
                    ))}
                  </View>

                  {damagePhotoBusy ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginBottom: theme.space.md }} />
                  ) : null}

                  <Text style={styles.inputFieldLabel}>{t(locale, "park.damageNoteLabel")}</Text>
                  <Text style={[styles.damageNoteOptional, { color: theme.colors.textMuted }]}>
                    {t(locale, "park.damageNoteOptional")}
                  </Text>
                  <TextInput
                    style={[styles.input, styles.damageNoteInput]}
                    value={damageNote}
                    onChangeText={setDamageNote}
                    placeholder={t(locale, "receive.damageNotePlaceholder")}
                    placeholderTextColor={theme.colors.textSubtle}
                    multiline
                    maxFontSizeMultiplier={2}
                  />

                </>
              ) : (
                <>
                  <Text style={styles.sectionLabel}>{t(locale, "park.parkedTitle")}</Text>
                  <Text style={styles.stepExplain}>{t(locale, "park.parkedMessage")}</Text>

                  <TextInput
                    style={[styles.input, styles.slotFilterInput]}
                    value={slotFilter}
                    onChangeText={setSlotFilter}
                    placeholder={t(locale, "park.slotFilterPlaceholder")}
                    placeholderTextColor={theme.colors.textSubtle}
                    maxFontSizeMultiplier={2}
                  />

                  {slotLoading ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginBottom: theme.space.md }} />
                  ) : filteredSlots.length === 0 ? (
                    <Text style={styles.help}>{t(locale, "park.selectSlotEmpty")}</Text>
                  ) : (
                    <View style={[styles.slotGrid, { gap: slotTileGap }]}>
                      {filteredSlots.map((slot) => (
                        <Pressable
                          key={slot.id}
                          style={[
                            styles.slotCard,
                            selectedSlotId === slot.id && styles.slotCardSelected,
                            { width: slotTileWidth },
                          ]}
                          onPress={() => void handleSelectSlot(slot.id)}
                          accessibilityLabel={`${t(locale, "park.selectSlotTitle")} ${slot.label}`}
                        >
                          <Text style={styles.slotLabel}>{slot.label}</Text>
                          {selectedSlotId === slot.id ? (
                            <Text style={styles.slotHint}>{t(locale, "park.selectedSlotHint")}</Text>
                          ) : (
                            <Text style={styles.slotHint}>{t(locale, "park.tapSlotHint")}</Text>
                          )}
                        </Pressable>
                      ))}
                    </View>
                  )}

                </>
              )}
            </ScrollView>
          )}
        </View>
        <View style={{ paddingBottom: insets.bottom }}>{footer}</View>
      </View>
    </SafeAreaView>
  );
}
