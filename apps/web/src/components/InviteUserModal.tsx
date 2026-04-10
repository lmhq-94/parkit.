"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { MailOpen, Plus, Trash, XCircle, Users } from "@/lib/premiumIcons";
import { apiClient, getTranslatedApiErrorMessage } from "@/lib/api";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/lib/toastStore";

interface InviteUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRole?: "ADMIN" | "STAFF" | "CUSTOMER";
  title?: string;
  description?: string;
}

export function InviteUserModal({ 
  open, 
  onClose, 
  onSuccess, 
  defaultRole = "ADMIN",
  title,
  description
}: InviteUserModalProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setEmailInput("");
      setEmails([]);
    }
  }, [open]);

  const addEmail = useCallback(() => {
    const trimmed = emailInput.trim().toLowerCase();
    if (trimmed && trimmed.includes("@") && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
      setEmailInput("");
    }
  }, [emailInput, emails]);

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleSubmit = async () => {
    if (emails.length === 0 && !emailInput.trim()) {
      showError(t("users.noEmails"));
      return;
    }

    // Explicitly do NOT auto-add the input text as per user request in previous turns
    if (emails.length === 0) {
      showError(t("users.noEmails"));
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/users/invite-batch", {
        emails,
        role: defaultRole,
      });
      
      showSuccess(t("users.invitationsSentCount", { count: emails.length }));
      setEmails([]);
      setEmailInput("");
      onSuccess?.();
      onClose();
    } catch (err) {
      showError(getTranslatedApiErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  };

  if (!open || typeof document === "undefined") return null;

  const content = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-label={t("common.close")}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg border border-card-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border shrink-0">
          <h2 id="invite-modal-title" className="text-sm premium-section-title flex items-center gap-2">
            <Users className="w-4 h-4 text-company-primary" />
            {title || t("users.inviteUser")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-input-bg transition-colors"
            aria-label={t("common.close")}
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-auto">
          <p className="text-sm premium-subtitle">
            {description || t("users.inviteDescription")}
          </p>

          {/* Add single email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">
              {t("common.email")}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <MailOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-company-primary transition-colors pointer-events-none" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEmail();
                    }
                  }}
                  placeholder={t("common.placeholderEmail")}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-primary text-sm transition-all duration-200 ease-out focus:border-company-primary focus:outline-none focus:ring-1 focus:ring-company-primary/20 focus:ring-inset"
                />
              </div>
              <button
                type="button"
                onClick={addEmail}
                disabled={!emailInput.trim() || !emailInput.includes("@")}
                className="shrink-0 px-4 py-3 rounded-lg border border-input-border bg-input-bg text-text-secondary text-sm font-medium hover:bg-company-primary-subtle hover:border-company-primary-muted hover:text-company-primary transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t("users.addAnother")}
              </button>
            </div>
          </div>

          {/* List of emails */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="premium-label text-text-muted">
                {t("users.emailsList")}
              </h3>
              <span className="text-[10px] font-medium bg-input-bg text-text-secondary px-2 py-0.5 rounded-full border border-input-border">
                {emails.length}
              </span>
            </div>
            
            {emails.length > 0 ? (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {emails.map((email) => (
                  <li
                    key={email}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-input-border bg-input-bg/40 group hover:border-company-primary-muted transition-colors"
                  >
                    <span className="text-sm text-text-primary break-all">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="p-1.5 rounded-md text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title={t("users.removeEmail")}
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center rounded-xl border border-dashed border-input-border bg-input-bg/20">
                <p className="text-sm text-text-muted italic">{t("users.noEmails")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-card-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-input-border text-sm font-medium text-text-secondary hover:bg-input-bg hover:text-text-primary transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || emails.length === 0}
            className="flex-1 px-4 py-3 rounded-lg bg-company-primary text-white text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-sm shadow-company-primary/20"
          >
            {loading ? t("common.sending") : t("users.sendInvitations")}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
