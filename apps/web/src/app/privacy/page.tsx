"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Shield, Lock, Eye, Database, Trash2, UserCheck } from "lucide-react";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggleSimple } from "@/components/LocaleToggleSimple";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyPage() {
  const { resolvedTheme } = useTheme();
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const PrivacyIcon = ({ icon: Icon }: { icon: typeof Shield }) => (
    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)' }} />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px]" style={{ background: isDark ? 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)' : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(60px)', opacity: isDark ? 0.6 : 0.7, animation: 'lava-morph-1 20s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px]" style={{ background: isDark ? 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)' : 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', filter: 'blur(50px)', opacity: isDark ? 0.5 : 0.65, animation: 'lava-morph-2 25s ease-in-out infinite' }} />
        <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px]" style={{ background: isDark ? 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)' : 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', filter: 'blur(70px)', opacity: isDark ? 0.55 : 0.75, animation: 'lava-morph-3 22s ease-in-out infinite' }} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px]" style={{ background: isDark ? 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)' : 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', filter: 'blur(55px)', opacity: isDark ? 0.45 : 0.6, animation: 'lava-morph-4 18s ease-in-out infinite' }} />
        <div className="absolute inset-0 transition-all duration-700" style={{ background: isDark ? 'radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)' : 'radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)' }} />
      </div>

      {/* Top Toggles */}
      <div className="absolute top-4 right-4 z-30 hidden md:flex items-center gap-3">
        <ThemeToggleSimple />
        <LocaleToggleSimple />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-8 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Glass Card Container */}
          <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-12">
            {/* Header */}
            <div className="mb-10 border-b border-slate-200 dark:border-slate-700 pb-8">
              <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">{t("privacy.backToHome")}</span>
              </Link>
              <Logo variant={isDark ? 'onDark' : 'default'} className="text-3xl mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2">{t("privacy.title")}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t("privacy.updatedAt")}: {new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Introduction */}
            <div className="mb-8 p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                {t("privacy.intro")}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-8">
              <section>
                <PrivacyIcon icon={Database} />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{t("privacy.section1Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section1Intro")}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium text-slate-800 dark:text-white mb-2 text-sm">{t("privacy.companyDataTitle")}</h3>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                      <li>• {t("privacy.companyDataItem1")}</li>
                      <li>• {t("privacy.companyDataItem2")}</li>
                      <li>• {t("privacy.companyDataItem3")}</li>
                      <li>• {t("privacy.companyDataItem4")}</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium text-slate-800 dark:text-white mb-2 text-sm">{t("privacy.vehicleDataTitle")}</h3>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                      <li>• {t("privacy.vehicleDataItem1")}</li>
                      <li>• {t("privacy.vehicleDataItem2")}</li>
                      <li>• {t("privacy.vehicleDataItem3")}</li>
                      <li>• {t("privacy.vehicleDataItem4")}</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium text-slate-800 dark:text-white mb-2 text-sm">{t("privacy.userDataTitle")}</h3>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                      <li>• {t("privacy.userDataItem1")}</li>
                      <li>• {t("privacy.userDataItem2")}</li>
                      <li>• {t("privacy.userDataItem3")}</li>
                      <li>• {t("privacy.userDataItem4")}</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-medium text-slate-800 dark:text-white mb-2 text-sm">{t("privacy.operationalDataTitle")}</h3>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                      <li>• {t("privacy.operationalDataItem1")}</li>
                      <li>• {t("privacy.operationalDataItem2")}</li>
                      <li>• {t("privacy.operationalDataItem3")}</li>
                      <li>• {t("privacy.operationalDataItem4")}</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <PrivacyIcon icon={Eye} />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{t("privacy.section2Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section2Intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li>{t("privacy.section2Item1")}</li>
                  <li>{t("privacy.section2Item2")}</li>
                  <li>{t("privacy.section2Item3")}</li>
                  <li>{t("privacy.section2Item4")}</li>
                  <li>{t("privacy.section2Item5")}</li>
                  <li>{t("privacy.section2Item6")}</li>
                  <li>{t("privacy.section2Item7")}</li>
                </ul>
              </section>

              <section>
                <PrivacyIcon icon={Lock} />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{t("privacy.section3Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section3Intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li>{t("privacy.section3Item1")}</li>
                  <li>{t("privacy.section3Item2")}</li>
                  <li>{t("privacy.section3Item3")}</li>
                  <li>{t("privacy.section3Item4")}</li>
                  <li>{t("privacy.section3Item5")}</li>
                  <li>{t("privacy.section3Item6")}</li>
                </ul>
              </section>

              <section>
                <PrivacyIcon icon={UserCheck} />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{t("privacy.section4Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section4Intro")}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white text-sm">{t("privacy.rightAccess")}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{t("privacy.rightAccessDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white text-sm">{t("privacy.rightRectify")}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{t("privacy.rightRectifyDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white text-sm">{t("privacy.rightExport")}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{t("privacy.rightExportDesc")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div>
                      <h4 className="font-medium text-slate-800 dark:text-white text-sm">{t("privacy.rightDelete")}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">{t("privacy.rightDeleteDesc")}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <PrivacyIcon icon={Trash2} />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{t("privacy.section5Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("privacy.section5Content")}
                </p>
              </section>

              <section>
                <PrivacyIcon icon={Shield} />
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{t("privacy.section6Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section6Intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li>{t("privacy.section6Item1")}</li>
                  <li>{t("privacy.section6Item2")}</li>
                  <li>{t("privacy.section6Item3")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{t("privacy.section7Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("privacy.section7Content")}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{t("privacy.section8Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("privacy.section8Content")} <strong>privacy@parkit.com</strong> o escribe a Parkit Technologies, Bogotá, Colombia.
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {t("privacy.backToHome")}
              </Link>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="fixed bottom-0 left-0 right-0 py-4 px-4 text-center z-20">
            <div className="max-w-[480px] mx-auto">
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
                <span>© {new Date().getFullYear()} Parkit. {t("privacy.footerRights")}</span>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
                <Link href="/terms" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">{t("privacy.footerTerms")}</Link>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600" />
                <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">{t("privacy.footerPrivacy")}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
