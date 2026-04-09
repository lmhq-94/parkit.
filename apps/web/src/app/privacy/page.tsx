"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggleSimple } from "@/components/LocaleToggleSimple";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyPage() {
  const { resolvedTheme } = useTheme();
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    setMounted(true);
    setUpdatedAt(
      new Date().toLocaleDateString(
        locale === "es" ? "es-ES" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
    );
  }, [locale]);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 25%, #16213e 50%, #1a1a2e 75%, #0a0a1a 100%)"
              : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #dbeafe 50%, #e0f2fe 75%, #f0f9ff 100%)",
          }}
        />
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px]"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)"
              : "linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            filter: "blur(60px)",
            opacity: isDark ? 0.6 : 0.7,
            animation: "lava-morph-1 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[500px] h-[500px]"
          style={{
            background: isDark
              ? "linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)"
              : "linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            filter: "blur(50px)",
            opacity: isDark ? 0.5 : 0.65,
            animation: "lava-morph-2 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-[450px] h-[450px]"
          style={{
            background: isDark
              ? "linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)"
              : "linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)",
            borderRadius: "70% 30% 50% 50% / 30% 50% 50% 70%",
            filter: "blur(70px)",
            opacity: isDark ? 0.55 : 0.75,
            animation: "lava-morph-3 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[400px] h-[400px]"
          style={{
            background: isDark
              ? "linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)"
              : "linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)",
            borderRadius: "40% 60% 60% 40% / 60% 40% 60% 40%",
            filter: "blur(55px)",
            opacity: isDark ? 0.45 : 0.6,
            animation: "lava-morph-4 18s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            background: isDark
              ? "radial-gradient(ellipse at center, transparent 0%, rgba(10,10,26,0.4) 100%)"
              : "radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)",
          }}
        />
      </div>

      {/* Top Toggles - Sticky */}
      <div className="fixed top-4 right-4 z-30 hidden md:flex items-center gap-3">
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
              {/* Usar Link en lugar de router.back() para consistencia */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("privacy.backToHome")}
              </Link>
              <Logo variant={isDark ? "onDark" : "default"} className="text-3xl mb-4" />
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2">
                {t("privacy.title")}
              </h1>
              {/* updatedAt generado en cliente para evitar hydration mismatch */}
              {updatedAt && (
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {t("privacy.updatedAt")}: {updatedAt}
                </p>
              )}
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
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t("privacy.section1Title")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section1Intro")}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "privacy.companyDataTitle",
                      items: ["privacy.companyDataItem1", "privacy.companyDataItem2", "privacy.companyDataItem3", "privacy.companyDataItem4"],
                    },
                    {
                      title: "privacy.vehicleDataTitle",
                      items: ["privacy.vehicleDataItem1", "privacy.vehicleDataItem2", "privacy.vehicleDataItem3", "privacy.vehicleDataItem4"],
                    },
                    {
                      title: "privacy.userDataTitle",
                      items: ["privacy.userDataItem1", "privacy.userDataItem2", "privacy.userDataItem3", "privacy.userDataItem4"],
                    },
                    {
                      title: "privacy.operationalDataTitle",
                      items: ["privacy.operationalDataItem1", "privacy.operationalDataItem2", "privacy.operationalDataItem3", "privacy.operationalDataItem4"],
                    },
                  ].map(({ title, items }) => (
                    <div
                      key={title}
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                    >
                      <h3 className="font-medium text-slate-800 dark:text-white mb-2 text-sm">
                        {t(title)}
                      </h3>
                      <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                        {items.map((item) => (
                          <li key={item}>• {t(item)}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t("privacy.section2Title")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section2Intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  {["section2Item1","section2Item2","section2Item3","section2Item4","section2Item5","section2Item6","section2Item7","section2Item8"].map((k) => (
                    <li key={k}>{t(`privacy.${k}`)}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t("privacy.section3Title")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section3Intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  {["section3Item1","section3Item2","section3Item3","section3Item4","section3Item5","section3Item6","section3Item7"].map((k) => (
                    <li key={k}>{t(`privacy.${k}`)}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t("privacy.section4Title")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section4Intro")}
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { title: "privacy.rightAccess", desc: "privacy.rightAccessDesc" },
                    { title: "privacy.rightRectify", desc: "privacy.rightRectifyDesc" },
                    { title: "privacy.rightExport", desc: "privacy.rightExportDesc" },
                    { title: "privacy.rightDelete", desc: "privacy.rightDeleteDesc" },
                  ].map(({ title, desc }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      <div>
                        <h4 className="font-medium text-slate-800 dark:text-white text-sm">
                          {t(title)}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">{t(desc)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t("privacy.section5Title")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("privacy.section5Content")}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t("privacy.section6Title")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("privacy.section6Intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  {["section6Item1","section6Item2","section6Item3","section6Item4","section6Item5"].map((k) => (
                    <li key={k}>{t(`privacy.${k}`)}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t("privacy.section7Title")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("privacy.section7Content")}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {t("privacy.section8Title")}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("privacy.section8Content")}
                  {t("privacy.contactEmail") && (
                    <>
                      {" "}
                      <a
                        href={`mailto:${t("privacy.contactEmail")}`}
                        className="text-indigo-500 dark:text-indigo-400 hover:underline"
                      >
                        {t("privacy.contactEmail")}
                      </a>
                    </>
                  )}
                  {t("privacy.section8Address") && (
                    <>{" "}{t("privacy.section8Address")}</>
                  )}
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("privacy.backToHome")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}