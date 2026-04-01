"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Tag, Navigation, Radius, ArrowRight, Plus, Trash2, Clock, Coins } from "lucide-react";
import { SelectField } from "@/components/SelectField";
import { AddressPickerModal } from "@/components/AddressPickerModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useDashboardStore } from "@/lib/store";
import { PageLoader } from "@/components/PageLoader";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const INPUT = "w-full px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-colors focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const PARKING_TYPES = ["OPEN", "COVERED", "TOWER", "UNDERGROUND", "ELEVATOR"] as const;
const SLOT_TYPES = ["REGULAR", "PREMIUM", "ELECTRIC", "HANDICAPPED"] as const;

type SlotRow = { id: string; label: string; slotType: (typeof SLOT_TYPES)[number] };

const defaultForm = {
  name: "", address: "", type: "OPEN",
  latitude: "", longitude: "", geofenceRadius: "",
  freeBenefitHours: "0",
  freeBenefitMinutes: "0",
  pricePerExtraHour: "",
};

export default function EditParkingPage() {
  const { t, tEnum } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const bumpParkings = useDashboardStore((s) => s.bumpParkings);
  const id = params.id as string;
  const [form, setForm] = useState(defaultForm);
  const [initialForm, setInitialForm] = useState(defaultForm);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [initialSlots, setInitialSlots] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState<string | null>(null);
  const [chargesParking, setChargesParking] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    address?: string;
    freeBenefitTime?: string;
    pricePerExtraHour?: string;
  }>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await apiClient.get<Record<string, unknown> & { company?: { currency?: string | null } }>(`/parkings/${id}`);
        if (data) {
          const company = data.company as { currency?: string | null } | undefined;
          if (company?.currency != null) setCompanyCurrency(company.currency);
          const benefitRaw = data.freeBenefitMinutes != null ? Number(data.freeBenefitMinutes) : 0;
          const benefitMinutes = Number.isFinite(benefitRaw) ? Math.max(0, Math.floor(benefitRaw)) : 0;
          const benefitHours = Math.floor(benefitMinutes / 60);
          const benefitRemainder = benefitMinutes % 60;
          const loadedForm = {
            name: String(data.name ?? ""),
            address: String(data.address ?? ""),
            type: String(data.type ?? "OPEN"),
            latitude: data.latitude != null ? String(data.latitude) : "",
            longitude: data.longitude != null ? String(data.longitude) : "",
            geofenceRadius: data.geofenceRadius != null ? String(data.geofenceRadius) : "",
            freeBenefitHours: String(benefitHours),
            freeBenefitMinutes: String(benefitRemainder),
            pricePerExtraHour: data.pricePerExtraHour != null && data.pricePerExtraHour !== "" ? String(data.pricePerExtraHour) : "",
          };
          setForm(loadedForm);
          setInitialForm(loadedForm);
          const hasBilling =
            (data.pricePerExtraHour != null && data.pricePerExtraHour !== "") ||
            (data.freeBenefitMinutes != null && Number(data.freeBenefitMinutes) > 0);
          setChargesParking(Boolean(hasBilling));
        }
        const slotData = await apiClient.get<Array<{ id: string; label: string; slotType?: string }>>(`/parkings/${id}/slots`);
        if (Array.isArray(slotData)) {
          const loadedSlots = slotData.map((s) => ({
            id: s.id,
            label: s.label,
            slotType: (s.slotType as SlotRow["slotType"]) || "REGULAR",
          }));
          setSlots(loadedSlots);
          setInitialSlots(loadedSlots);
        }
      } catch {
        setError(t("common.loadingData"));
        showError(t("common.loadError"));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, showError, t]);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const setNumberField = (k: keyof typeof defaultForm, max?: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, "");
      if (raw === "") {
        setForm((p) => ({ ...p, [k]: "" }));
        return;
      }
      const parsed = Math.max(0, parseInt(raw, 10) || 0);
      const capped = max != null ? Math.min(max, parsed) : parsed;
      setForm((p) => ({ ...p, [k]: String(capped) }));
    };

  const setIntegerValue = (setter: (value: number) => void, min = 0, max?: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, "");
      if (!raw) {
        setter(min);
        return;
      }
      const parsed = Math.max(min, parseInt(raw, 10) || min);
      const capped = max != null ? Math.min(max, parsed) : parsed;
      setter(capped);
    };

  const setDecimalField = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const normalized = e.target.value.replace(",", ".");
      let cleaned = normalized.replace(/[^\d.]/g, "");
      const firstDot = cleaned.indexOf(".");
      if (firstDot !== -1) {
        cleaned =
          cleaned.slice(0, firstDot + 1) +
          cleaned.slice(firstDot + 1).replace(/\./g, "");
      }
      setForm((p) => ({ ...p, [k]: cleaned }));
    };

  const setSlot = (slotId: string, updates: Partial<SlotRow>) => {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, ...updates } : s)));
  };

  const defaultSlot = (): SlotRow => {
    let id: string;
    try {
      if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
        id = (crypto as any).randomUUID();
      } else {
        id = `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }
    } catch {
      id = `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    return {
      id,
      label: "",
      slotType: "REGULAR",
    };
  };

  const addSlot = () => setSlots((prev) => [...prev, defaultSlot()]);

  const removeSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const [batchPrefix, setBatchPrefix] = useState("");
  const [batchCount, setBatchCount] = useState(5);
  const [batchType, setBatchType] = useState<SlotRow["slotType"]>("REGULAR");

  const addSlotsBatch = () => {
    const prefix = batchPrefix.trim();
    if (!prefix) return;
    const count = Math.min(100, Math.max(1, batchCount || 1));
    const match = prefix.match(/^(.+?)(\d+)$/);
    let labels: string[];
    if (match) {
      const prefixPart = match[1];
      const base = parseInt(match[2], 10);
      const numDigits = match[2].length;
      labels = Array.from({ length: count }, (_, i) =>
        `${prefixPart}${String(base + i).padStart(numDigits, "0")}`
      );
    } else {
      const pad = count >= 10 ? 2 : 1;
      labels = Array.from({ length: count }, (_, i) =>
        `${prefix}${String(i + 1).padStart(pad, "0")}`
      );
    }
    const newSlots: SlotRow[] = labels.map((label) => ({
      ...defaultSlot(),
      label,
      slotType: batchType,
    }));
    setSlots((prev) => [...prev, ...newSlots]);
    setBatchPrefix("");
    setBatchCount(5);
  };

  const handleSubmit = async () => {
    const requiresBilling = chargesParking;

    const nextErrors: typeof fieldErrors = {};
    if (!form.name.trim()) nextErrors.name = t("validation.required");
    if (!form.address.trim()) nextErrors.address = t("validation.required");
    if (requiresBilling) {
      if (!form.freeBenefitHours.trim() || !form.freeBenefitMinutes.trim()) {
        nextErrors.freeBenefitTime = t("validation.required");
      }
      if (!form.pricePerExtraHour.trim()) nextErrors.pricePerExtraHour = t("validation.required");
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setSubmitting(true); setError(null);
    try {
      const hours = Math.max(0, parseInt(form.freeBenefitHours, 10) || 0);
      const minutes = Math.min(59, Math.max(0, parseInt(form.freeBenefitMinutes, 10) || 0));
      const freeBenefitMinutes =
        requiresBilling ? (hours * 60 + minutes) : undefined;
      const priceExtra =
        requiresBilling && form.pricePerExtraHour !== ""
          ? Number(form.pricePerExtraHour)
          : undefined;

      await apiClient.patch(`/parkings/${id}`, {
        name: form.name.trim(),
        address: form.address.trim(),
        type: form.type,
        latitude: form.latitude !== "" ? Number(form.latitude) : undefined,
        longitude: form.longitude !== "" ? Number(form.longitude) : undefined,
        geofenceRadius: form.geofenceRadius !== "" ? Number(form.geofenceRadius) : undefined,
        freeBenefitMinutes,
        pricePerExtraHour: priceExtra,
      });
      if (slots.length > 0) {
        const slotList = slots.map((s) => ({
          label: s.label.trim(),
          slotType: s.slotType,
        })).filter((s) => s.label.length > 0);
        if (slotList.length > 0) {
          await apiClient.post(`/parkings/${id}/slots`, { slots: slotList });
        }
      }
      showSuccess(t("common.saveSuccessShort"));
      bumpParkings();
      router.push("/dashboard/parkings");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar el estacionamiento";
      setError(msg);
      showError(msg);
    } finally { setSubmitting(false); }
  };

  const slotsSnapshot = (list: SlotRow[]) =>
    list.map((s) => ({ label: s.label, slotType: s.slotType })).sort((a, b) => a.label.localeCompare(b.label));
  const isDirty = useMemo(
    () =>
      JSON.stringify(form) !== JSON.stringify(initialForm) ||
      JSON.stringify(slotsSnapshot(slots)) !== JSON.stringify(slotsSnapshot(initialSlots)),
    [form, initialForm, slots, initialSlots]
  );
  const isValid = (() => {
    if (!form.name.trim() || !form.address.trim() || !form.type) return false;
    if (!chargesParking) return true;
    return (
      form.freeBenefitHours.trim() !== "" &&
      form.freeBenefitMinutes.trim() !== "" &&
      form.pricePerExtraHour.trim() !== ""
    );
  })();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[200px]">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-6 pb-8 px-4 md:px-10 lg:px-12 w-full gap-5">
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("parkings.sectionMain")}</p>
            <span className="text-[11px] font-medium text-red-500">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("parkings.sectionMainDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={LABEL}>{t("parkings.name")} <span className="text-company-primary">*</span></label>
              <div className="relative group">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input value={form.name} onChange={set("name")} placeholder={t("common.placeholderName")} className={IL} aria-invalid={!!fieldErrors.name} />
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={LABEL}>{t("parkings.address")} <span className="text-company-primary">*</span></label>
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                  <input value={form.address} readOnly placeholder={t("common.placeholderAddress")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} aria-invalid={!!fieldErrors.address} />
                </div>
                <button
                  type="button"
                  onClick={() => setAddressPickerOpen(true)}
                  className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {t("companies.pickAddressOnMap")}
                </button>
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <div className="min-h-[1.25rem] mt-1">
                    {fieldErrors.name && <p className="text-sm text-red-500" role="alert">{fieldErrors.name}</p>}
                  </div>
                </div>
                <div className="sm:col-span-2 lg:col-span-2">
                  <div className="min-h-[1.25rem] mt-1">
                    {fieldErrors.address && <p className="text-sm text-red-500" role="alert">{fieldErrors.address}</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <div className="flex-1">
                  <label className={LABEL}>
                    {t("parkings.type")} <span className="text-company-primary">*</span>
                  </label>
                  <SelectField value={form.type} onChange={set("type")} icon={Tag}>
                    {PARKING_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {tEnum("parkingType", pt)}
                      </option>
                    ))}
                  </SelectField>
                </div>
                <div className="flex items-center gap-3 mt-3 sm:mt-6 pr-1">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-secondary">
                      {t("parkings.chargesSwitchLabel")}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {t("parkings.chargesSwitchHint")}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={chargesParking}
                    onClick={() => setChargesParking((v) => !v)}
                    className={`relative w-10 h-6 rounded-full shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page ${
                      chargesParking ? "bg-company-primary" : "bg-input-border"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        chargesParking ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {chargesParking && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={LABEL}>{t("parkings.freeBenefitTime")}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="relative group">
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={form.freeBenefitHours}
                            onChange={setNumberField("freeBenefitHours")}
                            placeholder="0"
                            className={IL}
                            aria-invalid={!!fieldErrors.freeBenefitTime}
                          />
                        </div>
                        <p className="mt-1 text-xs text-text-muted">{t("parkings.freeBenefitHoursLabel")}</p>
                      </div>
                      <div>
                        <div className="relative group">
                          <input
                            type="number"
                            min={0}
                            max={59}
                            inputMode="numeric"
                            value={form.freeBenefitMinutes}
                            onChange={setNumberField("freeBenefitMinutes", 59)}
                            placeholder="0"
                            className={INPUT}
                            aria-invalid={!!fieldErrors.freeBenefitTime}
                          />
                        </div>
                        <p className="mt-1 text-xs text-text-muted">{t("parkings.freeBenefitMinutesLabel")}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-text-muted">{t("parkings.freeBenefitTimeHint")}</p>
                    <div className="min-h-[1.25rem] mt-1">
                      {fieldErrors.freeBenefitTime && (
                        <p className="text-sm text-red-500" role="alert">
                          {fieldErrors.freeBenefitTime}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={LABEL}>{t("parkings.pricePerExtraHour")}</label>
                    <div className="relative group flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={form.pricePerExtraHour}
                          onChange={setDecimalField("pricePerExtraHour")}
                          placeholder="0"
                          className={IL}
                          aria-invalid={!!fieldErrors.pricePerExtraHour}
                        />
                      </div>
                      {companyCurrency != null && companyCurrency !== "" && (
                        <span className="shrink-0 text-sm font-medium text-text-secondary tabular-nums">
                          {companyCurrency}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{t("parkings.pricePerExtraHourHint")}</p>
                    <div className="min-h-[1.25rem] mt-1">
                      {fieldErrors.pricePerExtraHour && (
                        <p className="text-sm text-red-500" role="alert">
                          {fieldErrors.pricePerExtraHour}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("parkings.sectionSlots")}</p>
            <span className="text-[11px] font-medium text-red-500">{t("common.requiredBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("parkings.sectionSlotsDesc")}</p>
        </div>
        <div className="p-6 pt-4 space-y-5">
          <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-input-bg/60 border border-input-border">
            <div className="flex-1 min-w-[120px]">
              <label className={LABEL}>{t("parkings.slotPrefixPlaceholder")}</label>
              <input
                type="text"
                value={batchPrefix}
                onChange={(e) => setBatchPrefix(e.target.value)}
                placeholder="ATP-01"
                className={INPUT}
              />
            </div>
            <div className="w-28">
              <label className={LABEL}>{t("parkings.slotCount")}</label>
              <input
                type="number"
                min={1}
                max={100}
                value={batchCount}
                onChange={setIntegerValue(setBatchCount, 1, 100)}
                className={INPUT}
              />
            </div>
            <div className="w-[160px] min-w-[140px]">
              <label className={LABEL}>{t("parkings.slotType")}</label>
              <SelectField
                value={batchType}
                onChange={(e) => setBatchType(e.target.value as SlotRow["slotType"])}
                icon={Tag}
              >
                {SLOT_TYPES.map((st) => (
                  <option key={st} value={st}>{tEnum("slotType", st)}</option>
                ))}
              </SelectField>
            </div>
            <button
              type="button"
              onClick={addSlotsBatch}
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              {t("parkings.addSlotsBatch")}
            </button>
          </div>

          <div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center mb-2 px-1 text-xs font-medium text-text-muted uppercase tracking-wide">
              <span>{t("parkings.slotLabel")}</span>
              <span className="w-[160px]">{t("parkings.slotType")}</span>
              <span className="w-9" aria-hidden />
            </div>
            <ul className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {slots.map((slot) => (
                <li
                  key={slot.id}
                  className="grid grid-cols-[1fr_auto_auto] gap-2 items-center"
                >
                  <input
                    type="text"
                    value={slot.label}
                    onChange={(e) => setSlot(slot.id, { label: e.target.value })}
                    placeholder="ATP-02"
                    className={INPUT}
                  />
                  <div className="w-[160px] min-w-[140px]">
                    <SelectField
                      value={slot.slotType}
                      onChange={(e) => setSlot(slot.id, { slotType: e.target.value as SlotRow["slotType"] })}
                      icon={Tag}
                    >
                      {SLOT_TYPES.map((st) => (
                        <option key={st} value={st}>{tEnum("slotType", st)}</option>
                      ))}
                    </SelectField>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    title={t("parkings.removeSlot")}
                    className="p-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-500/10 transition-colors"
                    aria-label={t("parkings.removeSlot")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={addSlot}
              className="mt-3 w-full py-2.5 rounded-lg border border-dashed border-input-border text-text-muted text-sm font-medium hover:border-company-primary hover:text-company-primary hover:bg-company-primary-subtle/50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("parkings.addSlot")}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-primary">{t("parkings.sectionGeo")}</p>
            <span className="text-[11px] font-medium text-text-muted">{t("common.optionalBadge")}</span>
          </div>
          <p className="text-xs text-text-muted mt-1">{t("parkings.sectionGeoDesc")}</p>
        </div>
        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("parkings.latitude")}</label>
              <div className="relative group">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input type="number" step="any" value={form.latitude} readOnly placeholder={t("common.placeholderLatitude")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("parkings.longitude")}</label>
              <div className="relative group">
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input type="number" step="any" value={form.longitude} readOnly placeholder={t("common.placeholderLongitude")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
              </div>
            </div>
            <div>
              <label className={LABEL}>{t("parkings.geofenceRadius")}</label>
              <div className="relative group">
                <Radius className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input type="number" min={1} value={form.geofenceRadius} readOnly placeholder={t("common.placeholderRadius")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-text-muted hidden sm:block">{t("common.requiredNote")}</p>
        <div className="flex items-center gap-3 ml-auto">
          <Link href="/dashboard/parkings"
            className="px-5 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors">
            {t("common.cancel")}
          </Link>
          <button type="button" onClick={handleSubmit} disabled={submitting || !isDirty || !isValid}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page disabled:opacity-50 disabled:pointer-events-none transition-colors">
            {submitting ? <><LoadingSpinner size="sm" />{t("common.saving")}</> : <>{t("common.save")}<ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      <AddressPickerModal
        open={addressPickerOpen}
        onClose={() => setAddressPickerOpen(false)}
        onSelect={(address, coords, geofenceRadius) => {
          setForm((p) => ({
            ...p,
            address,
            ...(coords && {
              latitude: String(coords.lat),
              longitude: String(coords.lon),
              geofenceRadius: String(geofenceRadius ?? 50),
            }),
          }));
          setAddressPickerOpen(false);
        }}
        initialValue={form.address}
        initialGeofenceRadius={form.geofenceRadius !== "" ? Number(form.geofenceRadius) : 50}
      />
    </div>
  );
}
