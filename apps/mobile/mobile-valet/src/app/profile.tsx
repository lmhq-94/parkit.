import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Modal,
  FlatList,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import type { ValetStaffRole } from "@parkit/shared";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y, useResponsiveLayout } from "@/theme/valetTheme";
import { ValetBackButton } from "@/components/ValetBackButton";
import { StickyFormFooter } from "@/components/StickyFormFooter";
import api from "@/lib/api";
import { messageFromAxios } from "@parkit/shared";
import { saveUser } from "@/lib/auth";
import { createFeedback } from "@/lib/feedback";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LICENSE_TYPE_OPTIONS, LICENSE_TYPE_VALUES, labelForLicenseType } from "@/lib/licenseTypes";
import {
  COUNTRY_DIAL_CODES,
  formatPhoneInternational,
  formatPhoneWithCountryCode,
  getDeviceCountryCode,
  isValidPhoneOptional,
  phoneDigitsForApi,
} from "@/lib/phoneInternational";

import { formatYmdLocal, parseYmdLocal } from "@/lib/dateUtils";
import { EMAIL_RE } from "@/lib/validation";
import { STAFF_ROLES } from "@/lib/staffRoles";

type MePayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export default function ProfileScreen() {
  const router = useRouter();
  const locale = useLocaleStore((s) => s.locale);
  const { user, mergeUser } = useAuthStore();
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, responsive.contentMaxWidth, responsive.sectionPadding),
    [theme, responsive.contentMaxWidth, responsive.sectionPadding]
  );
  const C = theme.colors;
  const feedback = useMemo(() => createFeedback(locale), [locale]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  /** Vista previa local (data URL) o null si el usuario quitó la foto antes de guardar */
  const [localAvatar, setLocalAvatar] = useState<string | null | undefined>(undefined);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [staffRole, setStaffRole] = useState<ValetStaffRole>(
    user?.valetStaffRole === "DRIVER" ? "DRIVER" : "RECEPTIONIST"
  );
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseTypes, setLicenseTypes] = useState<string[]>([]);
  /** YYYY-MM-DD local o "" */
  const [licenseExpiryYmd, setLicenseExpiryYmd] = useState("");
  const [expiryPickerOpen, setExpiryPickerOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<"firstName" | "lastName" | "email" | "phone", string>>
  >({});

  useEffect(() => {
    const r = user?.valetStaffRole;
    if (r === "DRIVER" || r === "RECEPTIONIST") {
      setStaffRole(r);
    }
  }, [user?.valetStaffRole]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, vRes] = await Promise.all([
        api.get<{ data: MePayload }>("/users/me"),
        api
          .get<{
            data: {
              staffRole?: string | null;
              licenseNumber?: string | null;
              licenseExpiry?: string | null;
            };
          }>("/valets/me")
          .catch(() => null),
      ]);
      const d = uRes.data?.data;
      if (d) {
        setFirstName(String(d.firstName ?? ""));
        setLastName(String(d.lastName ?? ""));
        setEmail(String(d.email ?? ""));
        setPhone(formatPhoneWithCountryCode(d.phone != null ? String(d.phone) : "", getDeviceCountryCode()));
        setLocalAvatar(undefined);
        setAvatarRemoved(false);
      }
      const vd = vRes?.data?.data;
      if (vd) {
        if (vd.staffRole === "DRIVER" || vd.staffRole === "RECEPTIONIST") {
          setStaffRole(vd.staffRole);
        }
        if (vd.staffRole === "DRIVER") {
          const raw = String(vd.licenseNumber ?? "");
          const parts = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
          const allowed = new Set<string>([...LICENSE_TYPE_VALUES]);
          setLicenseTypes(parts.filter((p) => allowed.has(p)));
          if (vd.licenseExpiry) {
            const dt = new Date(String(vd.licenseExpiry));
            setLicenseExpiryYmd(Number.isNaN(dt.getTime()) ? "" : formatYmdLocal(dt));
          } else {
            setLicenseExpiryYmd("");
          }
        } else {
          setLicenseTypes([]);
          setLicenseExpiryYmd("");
        }
      }
    } catch {
      feedback.error(t(locale, "profile.loadError"));
    } finally {
      setLoading(false);
    }
  }, [feedback, locale]);

  useEffect(() => {
    load();
  }, [load]);

  /** Tras «Quitar foto» no mostrar la URL del servidor hasta guardar. */
  const displayAvatarUri = useMemo(() => {
    if (avatarRemoved) return null;
    if (typeof localAvatar === "string" && localAvatar.length > 0) return localAvatar;
    return user?.avatarUrl?.trim() || null;
  }, [avatarRemoved, localAvatar, user?.avatarUrl]);

  const initials = useMemo(() => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    const a = (fn[0] || em[0] || "?").toUpperCase();
    const b = (ln[0] || em[1] || "").toUpperCase();
    return `${a}${b}`;
  }, [firstName, lastName, email]);

  const processPickedUri = async (uri: string) => {
    try {
      const manipulated = await manipulateAsync(
        uri,
        [{ resize: { width: 480 } }],
        { compress: 0.82, format: SaveFormat.JPEG, base64: true }
      );
      if (manipulated.base64) {
        setLocalAvatar(`data:image/jpeg;base64,${manipulated.base64}`);
        setAvatarRemoved(false);
      }
    } catch {
      feedback.error(t(locale, "profile.photoProcessError"));
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      feedback.error(t(locale, "profile.photoPermissionDenied"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.92,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    await processPickedUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      feedback.error(t(locale, "profile.photoCameraDenied"));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.92,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    await processPickedUri(result.assets[0].uri);
  };

  const clearLocalPhoto = () => {
    setLocalAvatar(undefined);
    setAvatarRemoved(true);
  };

  const validate = useCallback((): boolean => {
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    const ph = phone;

    const nextErr: Partial<Record<"firstName" | "lastName" | "email" | "phone", string>> = {};

    if (!fn) {
      nextErr.firstName = t(locale, "profile.errorFirstNameRequired");
    } else if (fn.length < 2) {
      nextErr.firstName = t(locale, "profile.errorNameLength");
    }

    if (!ln) {
      nextErr.lastName = t(locale, "profile.errorLastNameRequired");
    } else if (ln.length < 2) {
      nextErr.lastName = t(locale, "profile.errorNameLength");
    }

    if (!em) {
      nextErr.email = t(locale, "profile.errorEmailRequired");
    } else if (!EMAIL_RE.test(em)) {
      nextErr.email = t(locale, "profile.errorEmailInvalid");
    }

    if (!isValidPhoneOptional(ph)) {
      nextErr.phone = t(locale, "profile.errorPhoneInvalid");
    }

    if (Object.keys(nextErr).length > 0) {
      setFieldErrors(nextErr);
      const firstMsg =
        nextErr.firstName ||
        nextErr.lastName ||
        nextErr.email ||
        nextErr.phone ||
        t(locale, "profile.errorRequired");
      feedback.error(firstMsg);
      return false;
    }

    setFieldErrors({});
    return true;
  }, [firstName, lastName, email, phone, locale, feedback]);

  const handleSave = async () => {
    if (!validate()) return;

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: fn,
        lastName: ln,
        email: em,
        phone: phoneDigitsForApi(phone),
      };
      if (avatarRemoved || typeof localAvatar === "string") {
        payload.avatarUrl = avatarRemoved ? null : localAvatar;
      }
      const res = await api.patch<{ data: MePayload }>("/users/me", payload);
      const d = res.data?.data;

      const valetPatch: {
        staffRole: ValetStaffRole;
        licenseNumber: string | null;
        licenseExpiry: string | null;
      } = {
        staffRole,
        licenseNumber: null,
        licenseExpiry: null,
      };
      if (staffRole === "DRIVER") {
        valetPatch.licenseNumber =
          licenseTypes.length > 0
            ? [...licenseTypes].sort((a, b) => a.localeCompare(b)).join(", ")
            : null;
        valetPatch.licenseExpiry = licenseExpiryYmd.trim()
          ? new Date(`${licenseExpiryYmd.trim()}T12:00:00`).toISOString()
          : null;
      }
      await api.patch("/valets/me", valetPatch);

      if (d && user) {
        const nextAvatar =
          avatarRemoved || d.avatarUrl === null || d.avatarUrl === ""
            ? null
            : d.avatarUrl != null
              ? String(d.avatarUrl)
              : typeof localAvatar === "string"
                ? localAvatar
                : user.avatarUrl ?? null;
        mergeUser({
          firstName: String(d.firstName ?? fn),
          lastName: String(d.lastName ?? ln),
          email: String(d.email ?? em),
          phone: d.phone != null ? formatPhoneInternational(String(d.phone)) : null,
          avatarUrl: nextAvatar,
          valetStaffRole: staffRole,
        });
        const next = useAuthStore.getState().user;
        if (next) await saveUser(next);
        setLocalAvatar(undefined);
        setAvatarRemoved(false);
        if (d.phone != null) {
          setPhone(formatPhoneWithCountryCode(String(d.phone), getDeviceCountryCode()));
        } else {
          setPhone("");
        }
        feedback.success(t(locale, "profile.saveSuccess"));
      }
    } catch (e) {
      const msg = messageFromAxios(e);
      feedback.error(
        msg === "NETWORK_ERROR"
          ? t(locale, "common.networkError")
          : msg || t(locale, "profile.saveError")
      );
    } finally {
      setSaving(false);
    }
  };

  const canRemovePhoto =
    !avatarRemoved &&
    ((typeof localAvatar === "string" && localAvatar.length > 0) || !!user?.avatarUrl?.trim());

  const staffRoleLabel =
    staffRole === "RECEPTIONIST"
      ? t(locale, "signup.staffRoleReceptionist")
      : t(locale, "signup.staffRoleDriver");

  const staffRoleSub = (r: ValetStaffRole) =>
    r === "RECEPTIONIST"
      ? t(locale, "profile.staffRoleSubReceptionist")
      : t(locale, "profile.staffRoleSubDriver");

  const licenseCodesDisplay = useMemo(
    () => LICENSE_TYPE_VALUES.filter((v) => licenseTypes.includes(v)).join(", "),
    [licenseTypes]
  );

  const toggleLicenseType = (value: string) => {
    setLicenseTypes((prev) => {
      const next = prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value];
      return [...next].sort((a, b) => a.localeCompare(b));
    });
  };

  const openExpiryPicker = () => setExpiryPickerOpen(true);

  const onExpiryChange = (event: { type?: string }, date?: Date) => {
    if (Platform.OS === "android") {
      setExpiryPickerOpen(false);
      if (event.type === "dismissed") return;
    }
    if (date) {
      setLicenseExpiryYmd(formatYmdLocal(date));
    }
  };

  const openPhotoChooser = () => {
    if (Platform.OS === "web") {
      void pickImage();
      return;
    }
    feedback.alert(t(locale, "profile.changePhoto"), "", [
      { text: t(locale, "common.cancel"), style: "cancel" },
      { text: t(locale, "profile.photoFromLibrary"), onPress: () => void pickImage() },
      { text: t(locale, "profile.photoFromCamera"), onPress: () => void takePhoto() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.card}
        translucent={Platform.OS === "android"}
      />
      <View style={styles.frame}>
      <View style={styles.flex}>
        <View style={[styles.header, { paddingTop: insets.top + theme.space.md }]}>
          <ValetBackButton
            onPress={() => router.back()}
            accessibilityLabel={t(locale, "common.back")}
          />
          <Text style={styles.headerTitle}>{t(locale, "profile.title")}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.loadingText}>{t(locale, "common.loading")}</Text>
          </View>
        ) : (
          <View style={styles.bodyColumn}>
            <KeyboardAwareScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bottomOffset={96}
            >
              <Text style={styles.intro}>{t(locale, "profile.intro")}</Text>

              <View style={styles.avatarBlock}>
                <Pressable
                  onPress={openPhotoChooser}
                  style={({ pressed }) => [styles.avatarRing, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={t(locale, "profile.changePhoto")}
                >
                  {displayAvatarUri ? (
                    <Image source={{ uri: displayAvatarUri }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials} maxFontSizeMultiplier={2}>
                        {initials}
                      </Text>
                    </View>
                  )}
                </Pressable>
                <Text style={[styles.avatarHint, { color: C.textMuted }]}>
                  {Platform.OS === "web"
                    ? t(locale, "profile.avatarHintWeb")
                    : t(locale, "profile.avatarHintNative")}
                </Text>
                <View style={styles.avatarActionsRow}>
                  <Pressable
                    onPress={pickImage}
                    style={({ pressed }) => [
                      styles.avatarChip,
                      { borderColor: C.border, backgroundColor: C.card },
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={t(locale, "profile.photoFromLibrary")}
                  >
                    <Ionicons name="images-outline" size={22} color={C.primary} />
                    <Text style={[styles.avatarChipText, { color: C.text }]}>
                      {t(locale, "profile.photoFromLibrary")}
                    </Text>
                  </Pressable>
                  {Platform.OS !== "web" ? (
                    <Pressable
                      onPress={takePhoto}
                      style={({ pressed }) => [
                        styles.avatarChip,
                        { borderColor: C.border, backgroundColor: C.card },
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={t(locale, "profile.photoFromCamera")}
                    >
                      <Ionicons name="camera-outline" size={22} color={C.primary} />
                      <Text style={[styles.avatarChipText, { color: C.text }]}>
                        {t(locale, "profile.photoFromCamera")}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
                {canRemovePhoto ? (
                  <Pressable onPress={clearLocalPhoto} style={styles.secondaryLink}>
                    <Text style={[styles.secondaryLinkText, styles.dangerText]}>
                      {t(locale, "profile.removePhoto")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

            <Text style={styles.label}>{t(locale, "profile.staffRoleLabel")}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.pickerRow,
                { borderColor: C.border, backgroundColor: C.card },
                pressed && styles.pressed,
              ]}
              onPress={() => setRoleModalOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t(locale, "profile.staffRolePickerTitle")}
            >
              <View style={styles.pickerRowText}>
                <Text style={[styles.pickerRowTitle, { color: C.text }]} numberOfLines={1}>
                  {staffRoleLabel}
                </Text>
                <Text style={[styles.pickerRowSub, { color: C.textMuted }]} numberOfLines={2}>
                  {staffRoleSub(staffRole)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={C.textMuted} />
            </Pressable>

            <Modal
              visible={roleModalOpen}
              animationType="slide"
              transparent
              onRequestClose={() => setRoleModalOpen(false)}
            >
              <View style={styles.modalOverlay}>
                <Pressable
                  style={styles.modalBackdropPress}
                  onPress={() => setRoleModalOpen(false)}
                  accessibilityLabel={t(locale, "common.cancel")}
                />
                <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
                  <Text style={[styles.modalTitle, { color: C.text }]}>
                    {t(locale, "profile.staffRolePickerTitle")}
                  </Text>
                  <FlatList
                    data={STAFF_ROLES}
                    keyExtractor={(item) => item}
                    style={styles.modalList}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({ item: r }) => (
                      <Pressable
                        style={({ pressed }) => [
                          styles.roleRow,
                          { borderBottomColor: C.border },
                          pressed && styles.pressed,
                        ]}
                        onPress={() => {
                          setStaffRole(r);
                          setRoleModalOpen(false);
                          if (r === "RECEPTIONIST") {
                            setLicenseTypes([]);
                            setLicenseExpiryYmd("");
                          }
                        }}
                      >
                        <View style={styles.roleRowText}>
                          <Text style={[styles.roleRowName, { color: C.text }]} numberOfLines={1}>
                            {r === "RECEPTIONIST"
                              ? t(locale, "signup.staffRoleReceptionist")
                              : t(locale, "signup.staffRoleDriver")}
                          </Text>
                          <Text style={[styles.roleRowAddr, { color: C.textMuted }]} numberOfLines={2}>
                            {staffRoleSub(r)}
                          </Text>
                        </View>
                        {staffRole === r ? (
                          <Ionicons name="checkmark-circle" size={24} color={C.primary} />
                        ) : null}
                      </Pressable>
                    )}
                  />
                </View>
              </View>
            </Modal>

            <Text style={styles.label}>
              {t(locale, "profile.firstName")}
              <Text style={{ color: C.logout }}> *</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: fieldErrors.firstName ? C.logout : C.border },
              ]}
              value={firstName}
              onChangeText={(v) => {
                setFirstName(v);
                if (fieldErrors.firstName) setFieldErrors((e) => ({ ...e, firstName: undefined }));
              }}
              placeholder={t(locale, "profile.placeholderFirstName")}
              placeholderTextColor={C.textSubtle}
              autoCapitalize="words"
            />
            {fieldErrors.firstName ? (
              <Text style={styles.fieldError}>{fieldErrors.firstName}</Text>
            ) : null}

            <Text style={styles.label}>
              {t(locale, "profile.lastName")}
              <Text style={{ color: C.logout }}> *</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: fieldErrors.lastName ? C.logout : C.border },
              ]}
              value={lastName}
              onChangeText={(v) => {
                setLastName(v);
                if (fieldErrors.lastName) setFieldErrors((e) => ({ ...e, lastName: undefined }));
              }}
              placeholder={t(locale, "profile.placeholderLastName")}
              placeholderTextColor={C.textSubtle}
              autoCapitalize="words"
            />
            {fieldErrors.lastName ? (
              <Text style={styles.fieldError}>{fieldErrors.lastName}</Text>
            ) : null}

            <Text style={styles.label}>
              {t(locale, "profile.email")}
              <Text style={{ color: C.logout }}> *</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: fieldErrors.email ? C.logout : C.border },
              ]}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (fieldErrors.email) setFieldErrors((e) => ({ ...e, email: undefined }));
              }}
              placeholder={t(locale, "profile.placeholderEmail")}
              placeholderTextColor={C.textSubtle}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

            <Text style={styles.label}>{t(locale, "profile.phone")}</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: fieldErrors.phone ? C.logout : C.border },
              ]}
              value={phone}
              onChangeText={(v) => {
                setPhone(formatPhoneWithCountryCode(v, getDeviceCountryCode()));
                if (fieldErrors.phone) setFieldErrors((e) => ({ ...e, phone: undefined }));
              }}
              placeholder={`+${COUNTRY_DIAL_CODES[getDeviceCountryCode()] || "1"}`}
              placeholderTextColor={C.textSubtle}
              keyboardType="default"
              autoComplete="tel"
              textContentType="telephoneNumber"
            />
            {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}

            {staffRole === "DRIVER" && (
              <>
                <View style={styles.licenseDivider} />
                <Text style={styles.sectionDriver}>{t(locale, "profile.licenseSectionDriver")}</Text>

                <Text style={styles.label}>{t(locale, "profile.licenseTypesLabel")}</Text>
                <Text style={[styles.helper, { color: C.textMuted }]}>{t(locale, "profile.licenseTypesHint")}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.pickerRow,
                    { borderColor: C.border, backgroundColor: C.card },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setLicenseModalOpen(true)}
                  accessibilityRole="button"
                  accessibilityLabel={t(locale, "profile.licensePickerTitle")}
                >
                  <View style={styles.pickerRowText}>
                    <Text style={[styles.pickerRowTitle, { color: C.text }]} numberOfLines={2}>
                      {licenseCodesDisplay || t(locale, "profile.licenseTypesPlaceholder")}
                    </Text>
                    <Text style={[styles.pickerRowSub, { color: C.textMuted }]} numberOfLines={1}>
                      {licenseTypes.length > 0
                        ? t(locale, "profile.licenseTypesSummary", {
                            count: String(licenseTypes.length),
                          })
                        : t(locale, "profile.licenseTypesHint")}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={C.textMuted} />
                </Pressable>

                <Modal
                  visible={licenseModalOpen}
                  animationType="slide"
                  transparent
                  onRequestClose={() => setLicenseModalOpen(false)}
                >
                  <View style={styles.modalOverlay}>
                    <Pressable
                      style={styles.modalBackdropPress}
                      onPress={() => setLicenseModalOpen(false)}
                      accessibilityLabel={t(locale, "common.cancel")}
                    />
                    <View
                      style={[styles.modalSheetLicense, { backgroundColor: C.card, borderColor: C.border }]}
                    >
                      <Text style={[styles.modalTitle, { color: C.text }]}>
                        {t(locale, "profile.licensePickerTitle")}
                      </Text>
                      <FlatList
                        data={LICENSE_TYPE_OPTIONS}
                        keyExtractor={(item) => item.value}
                        style={styles.modalListLicense}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => {
                          const selected = licenseTypes.includes(item.value);
                          return (
                            <Pressable
                              style={({ pressed }) => [
                                styles.licenseOptionRow,
                                { borderBottomColor: C.border },
                                pressed && styles.pressed,
                              ]}
                              onPress={() => toggleLicenseType(item.value)}
                            >
                              <View style={styles.licenseOptionText}>
                                <Text style={[styles.roleRowName, { color: C.text }]} numberOfLines={2}>
                                  {labelForLicenseType(item.value, locale)}
                                </Text>
                              </View>
                              <Ionicons
                                name={selected ? "checkmark-circle" : "ellipse-outline"}
                                size={26}
                                color={selected ? C.primary : C.textMuted}
                              />
                            </Pressable>
                          );
                        }}
                      />
                      <Pressable style={styles.modalDoneBtn} onPress={() => setLicenseModalOpen(false)}>
                        <Text style={[styles.modalDoneBtnText, { color: C.primary }]}>
                          {t(locale, "common.ok")}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>

                <Text style={styles.label}>{t(locale, "profile.licenseExpiryLabel")}</Text>
                <Text style={[styles.helper, { color: C.textMuted }]}>{t(locale, "profile.licenseExpiryHint")}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.pickerRow,
                    { borderColor: C.border, backgroundColor: C.card },
                    pressed && styles.pressed,
                  ]}
                  onPress={openExpiryPicker}
                  accessibilityRole="button"
                >
                  <View style={styles.pickerRowText}>
                    <Text style={[styles.pickerRowTitle, { color: C.text }]} numberOfLines={1}>
                      {licenseExpiryYmd.trim()
                        ? licenseExpiryYmd
                        : t(locale, "profile.licenseExpiryPlaceholder")}
                    </Text>
                  </View>
                  <Ionicons name="calendar-outline" size={22} color={C.primary} />
                </Pressable>
                {licenseExpiryYmd.trim() ? (
                  <Pressable onPress={() => setLicenseExpiryYmd("")} style={styles.clearExpiryLink}>
                    <Text style={[styles.secondaryLinkText, styles.dangerText]}>
                      {t(locale, "profile.licenseClearExpiry")}
                    </Text>
                  </Pressable>
                ) : null}

                {expiryPickerOpen && Platform.OS === "android" ? (
                  <DateTimePicker
                    value={parseYmdLocal(licenseExpiryYmd) ?? new Date()}
                    mode="date"
                    display="default"
                    onChange={onExpiryChange}
                  />
                ) : null}

                {expiryPickerOpen && Platform.OS === "ios" ? (
                  <Modal
                    transparent
                    animationType="slide"
                    visible={expiryPickerOpen}
                    onRequestClose={() => setExpiryPickerOpen(false)}
                  >
                    <View style={styles.iosExpiryOverlay}>
                      <Pressable
                        style={styles.modalBackdropPress}
                        onPress={() => setExpiryPickerOpen(false)}
                      />
                      <View style={[styles.iosExpirySheet, { backgroundColor: C.card }]}>
                        <View style={styles.iosExpiryToolbar}>
                          <Pressable onPress={() => setExpiryPickerOpen(false)} hitSlop={12}>
                            <Text style={[styles.iosExpiryToolbarBtn, { color: C.textMuted }]}>
                              {t(locale, "common.cancel")}
                            </Text>
                          </Pressable>
                          <Pressable onPress={() => setExpiryPickerOpen(false)} hitSlop={12}>
                            <Text style={[styles.iosExpiryToolbarBtn, { color: C.primary, fontWeight: "800" }]}>
                              {t(locale, "common.ok")}
                            </Text>
                          </Pressable>
                        </View>
                        <DateTimePicker
                          value={parseYmdLocal(licenseExpiryYmd) ?? new Date()}
                          mode="date"
                          display="spinner"
                          onChange={(_, date) => {
                            if (date) setLicenseExpiryYmd(formatYmdLocal(date));
                          }}
                        />
                      </View>
                    </View>
                  </Modal>
                ) : null}
              </>
            )}
            </KeyboardAwareScrollView>

            <KeyboardStickyView>
              <StickyFormFooter keyboardPinned>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtnFooter,
                    { backgroundColor: C.primary },
                    saving && styles.btnDisabled,
                    pressed && !saving && styles.pressed,
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>{t(locale, "profile.save")}</Text>
                  )}
                </Pressable>
              </StickyFormFooter>
            </KeyboardStickyView>
          </View>
        )}
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
    flex: { flex: 1 },
    bodyColumn: { flex: 1, minHeight: 0 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: sectionPadding,
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    headerSpacer: { width: 44 },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: F.title - 4,
      fontWeight: "800",
      color: C.text,
    },
    centered: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: S.md,
    },
    loadingText: { fontSize: F.secondary, color: C.textMuted },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: sectionPadding,
      paddingTop: S.sm,
      paddingBottom: S.xl,
    },
    intro: {
      fontSize: F.secondary,
      color: C.textMuted,
      lineHeight: 24,
      marginBottom: S.md,
      fontWeight: "600",
    },
    avatarBlock: { alignItems: "center", marginBottom: S.lg },
    avatarHint: {
      fontSize: F.secondary - 1,
      textAlign: "center",
      marginTop: S.sm,
      marginBottom: S.md,
      fontWeight: "600",
      lineHeight: 20,
      paddingHorizontal: S.md,
    },
    avatarActionsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: S.sm,
      marginBottom: S.xs,
    },
    avatarChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.sm,
      paddingVertical: S.sm,
      paddingHorizontal: S.md,
      borderRadius: R.button,
      borderWidth: 2,
    },
    avatarChipText: {
      fontSize: F.secondary,
      fontWeight: "800",
    },
    avatarRing: {
      width: 120,
      height: 120,
      borderRadius: 60,
      overflow: "hidden",
      borderWidth: 3,
      borderColor: C.primary,
      backgroundColor: C.card,
    },
    avatarImage: { width: "100%", height: "100%" },
    avatarPlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.isDark ? "rgba(148,163,184,0.12)" : "rgba(15,23,42,0.06)",
    },
    avatarInitials: {
      fontSize: 44,
      fontWeight: "800",
      color: C.text,
      letterSpacing: 1,
    },
    secondaryLink: { paddingVertical: S.xs },
    secondaryLinkText: {
      fontSize: F.secondary,
      fontWeight: "700",
      color: C.primary,
    },
    dangerText: { color: C.logout },
    label: {
      fontSize: 12,
      fontWeight: "800",
      color: C.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: S.xs,
    },
    pickerRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 2,
      borderRadius: R.button,
      paddingHorizontal: S.md,
      paddingVertical: S.md,
      marginBottom: S.md,
      gap: S.sm,
    },
    pickerRowText: { flex: 1, minWidth: 0 },
    pickerRowTitle: {
      fontSize: F.body,
      fontWeight: "800",
    },
    pickerRowSub: {
      fontSize: F.secondary - 1,
      fontWeight: "600",
      marginTop: 4,
      lineHeight: 20,
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
      maxHeight: 320,
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
    },
    modalList: {
      maxHeight: 260,
    },
    roleRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: S.sm,
    },
    roleRowText: { flex: 1, minWidth: 0 },
    roleRowName: {
      fontSize: F.secondary - 1,
      fontWeight: "800",
    },
    roleRowAddr: {
      fontSize: 12,
      marginTop: 4,
      lineHeight: 16,
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
      marginBottom: S.xs,
    },
    fieldError: {
      fontSize: 12,
      fontWeight: "600",
      color: C.logout,
      marginBottom: S.sm,
    },
    saveFooter: {
      paddingHorizontal: sectionPadding,
      paddingTop: S.md,
      borderTopWidth: StyleSheet.hairlineWidth,
    },
    primaryBtnFooter: {
      borderRadius: R.button + 2,
      paddingVertical: S.md,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 52,
    },
    primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: F.button },
    btnDisabled: { opacity: 0.55 },
    pressed: { opacity: 0.9 },
    licenseDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginVertical: S.lg,
    },
    sectionDriver: {
      fontSize: F.body,
      fontWeight: "800",
      color: C.text,
      marginBottom: S.sm,
    },
    helper: {
      fontSize: F.secondary - 1,
      lineHeight: 20,
      marginBottom: S.sm,
      fontWeight: "500",
    },
    modalSheetLicense: {
      maxHeight: 440,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: S.md,
      paddingTop: S.md,
      paddingBottom: S.md,
    },
    modalListLicense: {
      maxHeight: 320,
    },
    licenseOptionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: S.md,
    },
    licenseOptionText: { flex: 1, minWidth: 0 },
    modalDoneBtn: {
      alignItems: "center",
      paddingVertical: S.md,
      marginTop: S.xs,
    },
    modalDoneBtnText: {
      fontSize: F.body,
      fontWeight: "800",
    },
    clearExpiryLink: {
      alignSelf: "flex-start",
      marginBottom: S.md,
      paddingVertical: S.xs,
    },
    iosExpiryOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(15, 23, 42, 0.45)",
    },
    iosExpirySheet: {
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingBottom: Platform.OS === "ios" ? 28 : S.md,
    },
    iosExpiryToolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: S.lg,
      paddingVertical: S.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    iosExpiryToolbarBtn: {
      fontSize: F.body,
      fontWeight: "600",
    },
  });
}
