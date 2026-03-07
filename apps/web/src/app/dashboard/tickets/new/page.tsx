"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Ticket, Users, Car, MapPin } from "lucide-react";
import { FormWizard } from "@/components/FormWizard";
import { SelectField } from "@/components/SelectField";
import { useTranslation } from "@/hooks/useTranslation";
import { apiClient } from "@/lib/api";

const LABEL = "block text-sm font-medium text-text-secondary mb-1.5";

type ClientOption = { id: string; user?: { firstName?: string; lastName?: string; email?: string } };
type VehicleOption = { id: string; plate?: string; brand?: string; model?: string };
type ParkingOption = { id: string; name?: string };

const defaultForm = { clientId: "", vehicleId: "", parkingId: "" };

export default function NewTicketPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState(defaultForm);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [parkings, setParkings] = useState<ParkingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, v, p] = await Promise.all([
          apiClient.get<ClientOption[]>("/clients"),
          apiClient.get<VehicleOption[]>("/vehicles"),
          apiClient.get<ParkingOption[]>("/parkings"),
        ]);
        setClients(Array.isArray(c) ? c : []);
        setVehicles(Array.isArray(v) ? v : []);
        setParkings(Array.isArray(p) ? p : []);
      } catch { setClients([]); setVehicles([]); setParkings([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = (k: keyof typeof defaultForm) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.clientId || !form.vehicleId || !form.parkingId) return;
    setSubmitting(true); setError(null);
    try {
      await apiClient.post("/tickets", { clientId: form.clientId, vehicleId: form.vehicleId, parkingId: form.parkingId });
      router.push("/dashboard/tickets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el tiquete");
      setSubmitting(false);
    }
  };

  const skel = <div className="h-[46px] rounded-lg bg-input-bg border border-input-border animate-pulse" />;

  const steps = [
    {
      title: t("tickets.sectionMain"),
      description: t("tickets.sectionMainDesc"),
      badge: "required" as const,
      accentColor: "rose",
      isValid: () => !!(form.clientId && form.vehicleId && form.parkingId) && !loading,
      content: (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={LABEL}>{t("tickets.client")} <span className="text-sky-500">*</span></label>
              {loading ? skel : (
                <SelectField value={form.clientId} onChange={set("clientId")} icon={Users}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {`${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.trim() || c.user?.email || c.id}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("tickets.vehicle")} <span className="text-sky-500">*</span></label>
              {loading ? skel : (
                <SelectField value={form.vehicleId} onChange={set("vehicleId")} icon={Car}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.plate ? `${v.plate} — ${[v.brand, v.model].filter(Boolean).join(" ")}` : v.id}
                    </option>
                  ))}
                </SelectField>
              )}
            </div>
            <div>
              <label className={LABEL}>{t("tickets.parking")} <span className="text-sky-500">*</span></label>
              {loading ? skel : (
                <SelectField value={form.parkingId} onChange={set("parkingId")} icon={MapPin}>
                  <option value="">{t("common.selectPlaceholder")}</option>
                  {parkings.map(p => <option key={p.id} value={p.id}>{p.name ?? p.id}</option>)}
                </SelectField>
              )}
            </div>
          </div>

          {/* Info box — entrada automática */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Ticket className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{t("tickets.entryTicket")}</p>
              <p className="text-xs text-text-muted mt-0.5">{t("tickets.entryTicketNote")}</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <FormWizard
      steps={steps}
      onSubmit={handleSubmit}
      submitting={submitting}
      submitLabel={t("tickets.createTicket")}
      cancelHref="/dashboard/tickets"
      error={error}
    />
  );
}
