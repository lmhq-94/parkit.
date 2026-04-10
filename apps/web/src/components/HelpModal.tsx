"use client";

import { createPortal } from "react-dom";
import { useState } from "react";
import { HelpCircle, XCircle, MailOpen, MessageSquare, ExternalLink, Shield, Gavel, ChevronDown } from "@/lib/premiumIcons";
import { useTranslation } from "@/hooks/useTranslation";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const { t } = useTranslation();
  const [tipsExpanded, setTipsExpanded] = useState(false);

  if (!open || typeof document === "undefined") return null;

  const content = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-label={t("common.close")}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg border border-card-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-card-border shrink-0">
          <h2 id="help-modal-title" className="text-sm premium-section-title flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-company-primary" />
            {t("help.title")}
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

        <div className="p-6 space-y-6 overflow-auto">
          {/* Contact Support Section */}
          <div className="space-y-3">
            <h3 className="premium-label text-text-secondary">
              {t("help.contactSupport")}
            </h3>
            <a
              href="mailto:soporte@parkit.com"
              className="flex items-center gap-3 p-4 rounded-lg border border-input-border bg-input-bg hover:bg-company-primary-subtle transition-colors group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-company-primary/10 text-company-primary group-hover:bg-company-primary group-hover:text-white transition-colors">
                <MailOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{t("help.emailSupport")}</p>
                <p className="text-xs text-text-muted">soporte@parkit.com</p>
              </div>
              <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-company-primary transition-colors" />
            </a>
          </div>

          {/* Resources Section */}
          <div className="space-y-3">
            <h3 className="premium-label text-text-secondary">
              {t("help.resources")}
            </h3>
            <div className="space-y-2">
              <a
                href="/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-input-border bg-input-bg hover:bg-company-primary-subtle transition-colors group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-company-secondary/10 text-company-secondary group-hover:bg-company-primary group-hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{t("help.faq")}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-company-primary transition-colors" />
              </a>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-input-border bg-input-bg hover:bg-company-primary-subtle transition-colors group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-company-secondary/10 text-company-secondary group-hover:bg-company-primary group-hover:text-white transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{t("help.privacyPolicy")}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-company-primary transition-colors" />
              </a>
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-input-border bg-input-bg hover:bg-company-primary-subtle transition-colors group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-company-secondary/10 text-company-secondary group-hover:bg-company-primary group-hover:text-white transition-colors">
                  <Gavel className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{t("help.terms")}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-company-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Tips - Collapsible */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setTipsExpanded(!tipsExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("help.quickTips")}
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${tipsExpanded ? "rotate-180" : ""}`} />
            </button>
            {tipsExpanded && (
              <div className="relative overflow-hidden rounded-xl border border-company-primary-muted bg-gradient-to-br from-company-primary-subtle via-company-primary-subtle/80 to-company-secondary-subtle/50 p-5">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-company-primary/10 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-company-secondary/10 blur-2xl" />
                <ul className="relative space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-company-primary text-xs font-semibold text-white shadow-sm">
                      1
                    </div>
                    <span className="text-sm leading-relaxed text-text-secondary">{t("help.tip1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-company-primary text-xs font-semibold text-white shadow-sm">
                      2
                    </div>
                    <span className="text-sm leading-relaxed text-text-secondary">{t("help.tip2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-company-primary text-xs font-semibold text-white shadow-sm">
                      3
                    </div>
                    <span className="text-sm leading-relaxed text-text-secondary">{t("help.tip3")}</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-card-border shrink-0">
          <p className="text-xs text-text-muted">
            {t("help.version")}: {process.env.NEXT_PUBLIC_APP_VERSION ? `v${process.env.NEXT_PUBLIC_APP_VERSION}` : "v1.0.0"}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
