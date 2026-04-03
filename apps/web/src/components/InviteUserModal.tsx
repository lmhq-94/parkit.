"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/lib/toastStore";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRole?: "ADMIN" | "STAFF" | "CUSTOMER";
}

export function InviteUserModal({
  open,
  onClose,
  onSuccess,
  defaultRole = "CUSTOMER",
}: InviteUserModalProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await apiClient.post("/users/invite", {
        email: email.toLowerCase().trim(),
        role,
      });
      showSuccess(t("users.invitationSent"));
      setEmail("");
      onSuccess?.();
      onClose();
    } catch (err) {
      showError(getTranslatedApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("users.inviteUser")}
      description={t("users.inviteDescription")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {t("common.email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-card-border bg-background text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            {t("users.role")}
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="w-full h-11 px-4 rounded-xl border border-card-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
          >
            <option value="CUSTOMER">{t("roles.CUSTOMER")}</option>
            <option value="STAFF">{t("roles.STAFF")}</option>
            <option value="ADMIN">{t("roles.ADMIN")}</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-6 rounded-xl text-sm font-medium text-text-secondary hover:bg-card-hover transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-11 px-6 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? t("common.sending") : t("users.sendInvitation")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
