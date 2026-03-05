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
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link
              href="/dashboard/companies"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a empresas
            </Link>

            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              Nueva empresa
            </h1>
            <p className="text-slate-400 text-sm mt-1 mb-8">
              Completa los datos para registrar una nueva empresa.
            </p>

            {error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6 space-y-6"
            >
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="countryCode" className="block text-sm font-medium text-slate-300 mb-1.5">
                    País
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

              <div>
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

              <div className="flex gap-3 pt-2">
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
