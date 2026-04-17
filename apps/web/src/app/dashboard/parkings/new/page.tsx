"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Tag, Navigation, Radius, Trash, Clock, Building, World } from "@/lib/premiumIcons";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { AddressPickerModal } from "@/components/AddressPickerModal";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";
import { useToast } from "@/lib/toastStore";
import { useDashboardStore } from "@/lib/store";

const IL = "w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-all duration-200 ease-out focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary/20 focus:ring-inset placeholder:text-text-muted";
/** Input sin icono (mismo estilo que IL en otros formularios). */
const INPUT = "w-full px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-all duration-200 ease-out focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary/20 focus:ring-inset placeholder:text-text-muted";
const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

const PARKING_TYPES = ["OPEN", "COVERED", "TOWER", "UNDERGROUND", "ELEVATOR"] as const;
const SLOT_TYPES = ["REGULAR", "PREMIUM", "ELECTRIC", "HANDICAPPED"] as const;

type SlotRow = { id: string; label: string; slotType: (typeof SLOT_TYPES)[number] };

const defaultForm = {
  name: "",
  address: "",
  type: "OPEN",
  latitude: "",
  longitude: "",
  geofenceRadius: "50",
};

const defaultSlot = (): SlotRow => ({
  id: crypto.randomUUID?.() ?? `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  label: "",
  slotType: "REGULAR",
});

export default function NewParkingPage() {
  const { t, tEnum } = useTranslation();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const selectedCompanyId = useDashboardStore((s: { selectedCompanyId: string | null }) => s.selectedCompanyId);
  const bumpParkings = useDashboardStore((s: { bumpParkings: () => void }) => s.bumpParkings);
  const [form, setForm] = useState(defaultForm);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [chargesParking, setChargesParking] = useState(true);
  const [quickApplyMinutes, setQuickApplyMinutes] = useState(180);
  const [quickApplyPrice, setQuickApplyPrice] = useState(1000);
  const [dailyPricingConfig, setDailyPricingConfig] = useState<{
    monday: { freeBenefitMinutes: number; pricePerHour: number };
    tuesday: { freeBenefitMinutes: number; pricePerHour: number };
    wednesday: { freeBenefitMinutes: number; pricePerHour: number };
    thursday: { freeBenefitMinutes: number; pricePerHour: number };
    friday: { freeBenefitMinutes: number; pricePerHour: number };
    saturday: { freeBenefitMinutes: number; pricePerHour: number };
    sunday: { freeBenefitMinutes: number; pricePerHour: number };
  }>({
    monday: { freeBenefitMinutes: 0, pricePerHour: 0 },
    tuesday: { freeBenefitMinutes: 0, pricePerHour: 0 },
    wednesday: { freeBenefitMinutes: 0, pricePerHour: 0 },
    thursday: { freeBenefitMinutes: 0, pricePerHour: 0 },
    friday: { freeBenefitMinutes: 0, pricePerHour: 0 },
    saturday: { freeBenefitMinutes: 0, pricePerHour: 0 },
    sunday: { freeBenefitMinutes: 0, pricePerHour: 0 },
  });
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    address?: string;
  }>({});


  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

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

  const formatMoney = (value: number): string => {
    return value.toLocaleString("en-US");
  };

  const parseMoney = (formatted: string): number => {
    const cleaned = formatted.replace(/[^\d]/g, "");
    return cleaned ? parseInt(cleaned, 10) || 0 : 0;
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}`;
  };

  const parseTime = (hhmm: string): number => {
    const parts = hhmm.split(":");
    if (parts.length !== 2) return 0;
    const hours = parseInt(parts[0] || "0", 10) || 0;
    const mins = parseInt(parts[1] || "0", 10) || 0;
    return hours * 60 + mins;
  };

  const setTimeValue = (setter: (value: number) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Allow typing numbers and colons only
      const cleaned = value.replace(/[^\d:]/g, "");
      // Ensure only one colon
      const parts = cleaned.split(":");
      if (parts.length > 2) {
        setter(parseTime(parts[0] + ":" + (parts[1] || "0")));
        return;
      }
      if (parts.length === 2 && parts[1] && parts[1].length > 2) {
        setter(parseTime(parts[0] + ":" + parts[1].slice(0, 2)));
        return;
      }
      // Auto-convert to minutes when valid format
      if (parts.length === 2 && parts[0] && parts[1]) {
        const minutes = parseTime(cleaned);
        if (minutes <= 1440) {
          setter(minutes);
        }
      }
    };

  const setSlot = (id: string, updates: Partial<SlotRow>) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const addSlot = () => setSlots((prev) => [...prev, defaultSlot()]);

  const [batchPrefix, setBatchPrefix] = useState("");
  const [batchCount, setBatchCount] = useState(5);
  const [batchType, setBatchType] = useState<SlotRow["slotType"]>("REGULAR");

  const addSlotsBatch = () => {
    const prefix = batchPrefix.trim();
    const count = Math.min(100, Math.max(1, batchCount || 1));
    const match = prefix.match(/^(.+?)(\d+)$/);
    let labels: string[];
    if (match) {
      const prefixPart = match[1];
      const base = parseInt(match[2] || "0", 10);
      const numDigits = (match[2] || "0").length;
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

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async () => {
    const nextErrors: typeof fieldErrors = {};
    if (!form.name.trim()) nextErrors.name = t("validation.required");
    if (!form.address.trim()) nextErrors.address = t("validation.required");
    if (!step3Valid) {
      // Keep slot errors at global level (wizard already shows error), no per-field detail here.
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !step2Valid) return;

    if (!form.name.trim() || !form.address.trim() || !form.type) return;

    try {
      const slotList = slots.map((s) => ({ label: s.label, slotType: s.slotType }));
      await apiClient.post("/parkings", {
        companyId: selectedCompanyId,
        name: form.name,
        address: form.address,
        type: form.type,
        latitude: form.latitude !== "" ? Number(form.latitude) : undefined,
        longitude: form.longitude !== "" ? Number(form.longitude) : undefined,
        geofenceRadius: form.geofenceRadius !== "" ? Number(form.geofenceRadius) : undefined,
        dailyPricingConfig: chargesParking ? dailyPricingConfig : null,
        slots: slotList,
      });
      showSuccess(t("common.createSuccessShort"));
      bumpParkings();
      router.push("/dashboard/parkings");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear el estacionamiento";
      setError(msg);
      showError(msg);
      setSubmitting(false);
    }
  };

  const step1Valid = form.name.trim() !== "" && form.address.trim() !== "" && form.type !== "";
  const step2Valid = form.address.trim() !== "";
  const step3Valid = slots.length > 0 && slots.every((s) => s.label.trim().length > 0);

  const validateStep = (stepIndex: number): boolean => {
    if (stepIndex === 0) {
      const nextErrors: typeof fieldErrors = {};
      if (!form.name.trim()) nextErrors.name = t("validation.required");
      if (!form.address.trim()) nextErrors.address = t("validation.required");
      setFieldErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    }
    if (stepIndex === 1) {
      return true;
    }
    if (stepIndex === 2) return step3Valid;
    return true;
  };

  const steps = [
    {
      title: t("parkings.sectionMain"),
      description: t("parkings.sectionMainDesc"),
      badge: "required" as const,
      accentColor: "orange",
      isValid: () => step1Valid,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("parkings.name")} <span className="text-company-primary">*</span></label>
            <div className="relative group">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input value={form.name} onChange={set("name")} placeholder={t("common.placeholderName")} className={IL} aria-invalid={!!fieldErrors.name} />
            </div>
            <div className="min-h-[1.25rem] mt-1">
              {fieldErrors.name && <p className="text-sm text-red-500" role="alert">{fieldErrors.name}</p>}
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
                <World className="w-4 h-4" />
                {t("companies.pickAddressOnMap")}
              </button>
            </div>
            <div className="min-h-[1.25rem] mt-1">
              {fieldErrors.address && <p className="text-sm text-red-500" role="alert">{fieldErrors.address}</p>}
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL}>{t("parkings.type")} <span className="text-company-primary">*</span></label>
            <SelectField value={form.type} onChange={set("type")} icon={Tag}>
              {PARKING_TYPES.map((pt) => (
                <option key={pt} value={pt}>{tEnum("parkingType", pt)}</option>
              ))}
            </SelectField>
          </div>
        </div>
      ),
    },
    {
      title: t("parkings.sectionBilling"),
      description: t("parkings.sectionBillingDesc"),
      badge: "optional" as const,
      accentColor: "blue",
      isValid: () => step2Valid,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="flex items-center gap-4 p-5 rounded-xl bg-company-primary/5 border border-company-primary/20">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text-primary mb-0.5">
                  {t("parkings.chargesSwitchLabel")}
                </h3>
                <p className="text-sm text-text-muted">
                  {t("parkings.chargesSwitchHint")}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={chargesParking}
                onClick={() => setChargesParking((v) => !v)}
                className={`relative w-10 h-6 rounded-full shrink-0 transition-colors focus:outline-none focus:ring-1 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page ${
                  chargesParking ? "bg-company-primary" : "bg-input-border"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    chargesParking ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {chargesParking && (
            <div className="sm:col-span-2 lg:col-span-3">
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium text-text-muted/80 mb-1 block">{t("parkings.quickApplyMinutes")}</label>
                  <div className="relative group">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatTime(quickApplyMinutes)}
                      onChange={(e) => setTimeValue(setQuickApplyMinutes)(e)}
                      placeholder="4:00"
                      className={IL}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted/60 pointer-events-none group-focus-within:text-company-primary/40 transition-colors">min</span>
                  </div>
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="text-xs font-medium text-text-muted/80 mb-1 block">{t("parkings.quickApplyPrice")}</label>
                  <div className="relative group">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted/60 pointer-events-none group-focus-within:text-company-primary/40 transition-colors">₡</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatMoney(quickApplyPrice)}
                      onChange={(e) => setQuickApplyPrice(parseMoney(e.target.value))}
                      placeholder="1,000"
                      className={IL}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const config = {
                      freeBenefitMinutes: quickApplyMinutes,
                      pricePerHour: quickApplyPrice
                    };
                    setDailyPricingConfig({
                      monday: config,
                      tuesday: config,
                      wednesday: config,
                      thursday: config,
                      friday: config,
                      saturday: config,
                      sunday: config,
                    });
                  }}
                  className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors"
                >
                  {t("parkings.applyToAll")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const config = {
                      freeBenefitMinutes: quickApplyMinutes,
                      pricePerHour: quickApplyPrice
                    };
                    setDailyPricingConfig({
                      monday: config,
                      tuesday: config,
                      wednesday: config,
                      thursday: config,
                      friday: config,
                      saturday: dailyPricingConfig.saturday,
                      sunday: dailyPricingConfig.sunday,
                    });
                  }}
                  className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors"
                >
                  {t("parkings.applyToWeekdays")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const config = {
                      freeBenefitMinutes: quickApplyMinutes,
                      pricePerHour: quickApplyPrice
                    };
                    setDailyPricingConfig({
                      monday: dailyPricingConfig.monday,
                      tuesday: dailyPricingConfig.tuesday,
                      wednesday: dailyPricingConfig.wednesday,
                      thursday: dailyPricingConfig.thursday,
                      friday: dailyPricingConfig.friday,
                      saturday: config,
                      sunday: config,
                    });
                  }}
                  className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors"
                >
                  {t("parkings.applyToWeekend")}
                </button>
              </div>

              <div className="rounded-lg border border-input-border bg-input-bg/50 p-4">
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { key: 'monday', label: t("parkings.monday") },
                    { key: 'tuesday', label: t("parkings.tuesday") },
                    { key: 'wednesday', label: t("parkings.wednesday") },
                    { key: 'thursday', label: t("parkings.thursday") },
                    { key: 'friday', label: t("parkings.friday") },
                    { key: 'saturday', label: t("parkings.saturday") },
                    { key: 'sunday', label: t("parkings.sunday") },
                  ].map((day) => (
                    <div key={day.key} className="flex flex-col gap-2">
                      <div className="text-xs font-medium text-text-primary text-center">{day.label}</div>
                      <div className="relative group">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatTime(dailyPricingConfig[day.key as keyof typeof dailyPricingConfig].freeBenefitMinutes)}
                          onChange={(e) => setDailyPricingConfig({
                            ...dailyPricingConfig,
                            [day.key]: {
                              ...dailyPricingConfig[day.key as keyof typeof dailyPricingConfig],
                              freeBenefitMinutes: parseTime(e.target.value),
                            },
                          })}
                          onFocus={(e) => e.target.select()}
                          placeholder="0:00"
                          className={IL}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted/60 pointer-events-none group-focus-within:text-company-primary/40 transition-colors">min</span>
                      </div>
                      <div className="relative group">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted/60 pointer-events-none group-focus-within:text-company-primary/40 transition-colors">₡</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatMoney(dailyPricingConfig[day.key as keyof typeof dailyPricingConfig].pricePerHour)}
                          onChange={(e) => setDailyPricingConfig({
                            ...dailyPricingConfig,
                            [day.key]: {
                              ...dailyPricingConfig[day.key as keyof typeof dailyPricingConfig],
                              pricePerHour: parseMoney(e.target.value),
                            },
                          })}
                          onFocus={(e) => e.target.select()}
                          placeholder="1,000"
                          className={IL}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const config = { freeBenefitMinutes: 0, pricePerHour: 0 };
                      setDailyPricingConfig({
                        monday: config,
                        tuesday: config,
                        wednesday: config,
                        thursday: config,
                        friday: config,
                        saturday: config,
                        sunday: config,
                      });
                    }}
                    className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors"
                  >
                    {t("parkings.clearAll")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: t("parkings.sectionSlots"),
      description: t("parkings.sectionSlotsDesc"),
      badge: "required" as const,
      accentColor: "blue",
      isValid: () => step3Valid,
      content: (
        <div className="space-y-5">
          {/* Agregar varios a la vez */}
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
                inputMode="numeric"
                step={1}
                value={batchCount}
                onChange={setIntegerValue(setBatchCount, 1, 100)}
                onFocus={(e) => e.target.select()}
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
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:opacity-95 focus:outline-none focus:ring-1 focus:ring-company-primary focus:ring-offset-2"
            >
              <Plus className="w-4 h-4" />
              {t("parkings.addSlotsBatch")}
            </button>
          </div>

          {/* Lista de slots */}
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
                    <Trash className="w-4 h-4" />
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
      ),
    },
    {
      title: t("parkings.sectionGeo"),
      description: t("parkings.sectionGeoDesc"),
      accentColor: "emerald",
      isValid: () => true,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className={LABEL}>{t("parkings.latitude")}</label>
            <div className="relative group">
              <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" step="any" inputMode="decimal" min={-90} max={90} value={form.latitude} readOnly placeholder={t("common.placeholderLatitude")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("parkings.longitude")}</label>
            <div className="relative group">
              <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" step="any" inputMode="decimal" min={-180} max={180} value={form.longitude} readOnly placeholder={t("common.placeholderLongitude")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
            </div>
          </div>
          <div>
            <label className={LABEL}>{t("parkings.geofenceRadius")}</label>
            <div className="relative group">
              <Radius className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
              <input type="number" min={1} max={10000} inputMode="numeric" step={1} value={form.geofenceRadius} readOnly onFocus={(e) => e.target.select()} placeholder={t("common.placeholderRadius")} className={IL + " cursor-pointer"} onClick={() => setAddressPickerOpen(true)} />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <FormWizard
        steps={steps}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitLabel={t("parkings.createParking")}
        cancelHref="/dashboard/parkings"
        error={error}
        onValidateBeforeAction={validateStep}
      />
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
    </>
  );
}
