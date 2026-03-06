"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { isSuperAdmin } from "@/lib/auth";
import { useAuthStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCompanyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const superAdmin = isSuperAdmin(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    legalName: "",
    commercialName: "",
    taxId: "",
    countryCode: "CR",
    currency: "CRC",
    timezone: "America/Costa_Rica",
    billingEmail: "",
    contactPhone: "",
    legalAddress: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!superAdmin) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        legalName: formData.legalName.trim(),
        taxId: formData.taxId.trim(),
        ...(formData.commercialName.trim() && { commercialName: formData.commercialName.trim() }),
        ...(formData.countryCode && { countryCode: formData.countryCode }),
        ...(formData.currency && { currency: formData.currency }),
        ...(formData.timezone && { timezone: formData.timezone }),
        ...(formData.billingEmail.trim() && { billingEmail: formData.billingEmail.trim() }),
        ...(formData.contactPhone.trim() && { contactPhone: formData.contactPhone.trim() }),
        ...(formData.legalAddress.trim() && { legalAddress: formData.legalAddress.trim() }),
      };
      await apiClient.post("/companies", payload);
      router.push("/dashboard/companies");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(message || "No se pudo crear la empresa. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!superAdmin) {
    router.replace("/dashboard/companies");
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-page">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto">
            <Link
              href="/dashboard/companies"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a empresas
            </Link>

            <div className="mb-10">
              <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight mb-2">
                Nueva empresa
              </h1>
              <p className="text-slate-400 text-sm">
                Completa los datos para registrar una nueva empresa.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden backdrop-blur-sm p-8"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <label htmlFor="legalName" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Razón social *
                  </label>
                  <input
                    id="legalName"
                    name="legalName"
                    type="text"
                    required
                    value={formData.legalName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
                    placeholder="Ej. Empresa S.A."
                  />
                </div>
                <div>
                  <label htmlFor="commercialName" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nombre comercial
                  </label>
                  <input
                    id="commercialName"
                    name="commercialName"
                    type="text"
                    value={formData.commercialName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
                    placeholder="Ej. Parkit Costa Rica"
                  />
                </div>
                <div>
                  <label htmlFor="taxId" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Cédula jurídica / NIF *
                  </label>
                  <input
                    id="taxId"
                    name="taxId"
                    type="text"
                    required
                    value={formData.taxId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
                    placeholder="Ej. 3-101-123456"
                  />
                </div>
                <div>
                  <label htmlFor="countryCode" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Código de país
                  </label>
                  <input
                    id="countryCode"
                    name="countryCode"
                    type="text"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
                    placeholder="CR"
                  />
                </div>
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Moneda
                  </label>
                  <input
                    id="currency"
                    name="currency"
                    type="text"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
                    placeholder="CRC"
                  />
                </div>
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Zona horaria
                  </label>
                  <input
                    id="timezone"
                    name="timezone"
                    type="text"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
                    placeholder="America/Costa_Rica"
                  />
                </div>
                <div>
                  <label htmlFor="billingEmail" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email de facturación
                  </label>
                  <input
                    id="billingEmail"
                    name="billingEmail"
                    type="email"
                    value={formData.billingEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
                    placeholder="facturacion@empresa.com"
                  />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Teléfono de contacto
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50"
                    placeholder="+506 2222-2222"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="legalAddress" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Dirección legal
                  </label>
                  <textarea
                    id="legalAddress"
                    name="legalAddress"
                    rows={2}
                    value={formData.legalAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 resize-none"
                    placeholder="Dirección fiscal"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-6 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? "Creando…" : "Crear empresa"}
                </button>
                <Link
                  href="/dashboard/companies"
                  className="px-5 py-2.5 rounded-xl border border-white/[0.12] text-slate-300 text-sm font-medium hover:bg-white/[0.06] transition-colors"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
