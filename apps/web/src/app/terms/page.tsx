"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "@/lib/premiumIcons";
import { ThemeToggleSimple } from "@/components/ThemeToggleSimple";
import { LocaleToggle } from "@/components/LocaleToggle";
import { useTranslation } from "@/hooks/useTranslation";

export default function TermsPage() {
  const { resolvedTheme } = useTheme();
  const { t, locale } = useTranslation();
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - usando clases dark: para evitar parpadeo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0f9ff] dark:from-[#0a0a1a] dark:via-[#1a1a2e] dark:to-[#0a0a1a]" />
        {/* Blob 1 */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] opacity-70 dark:opacity-60 blur-[60px]" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', animation: 'lava-morph-1 20s ease-in-out infinite' }} />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] opacity-0 dark:opacity-60 blur-[60px]" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', animation: 'lava-morph-1 20s ease-in-out infinite' }} />
        {/* Blob 2 */}
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] opacity-65 dark:opacity-0 blur-[50px]" style={{ background: 'linear-gradient(225deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', animation: 'lava-morph-2 25s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] opacity-0 dark:opacity-50 blur-[50px]" style={{ background: 'linear-gradient(225deg, #3730a3 0%, #4338ca 50%, #1e3a5f 100%)', borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', animation: 'lava-morph-2 25s ease-in-out infinite' }} />
        {/* Blob 3 */}
        <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px] opacity-75 dark:opacity-0 blur-[70px]" style={{ background: 'linear-gradient(45deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', animation: 'lava-morph-3 22s ease-in-out infinite' }} />
        <div className="absolute bottom-20 left-1/4 w-[450px] h-[450px] opacity-0 dark:opacity-55 blur-[70px]" style={{ background: 'linear-gradient(45deg, #1e1b4b 0%, #312e81 50%, #1e3a8a 100%)', borderRadius: '70% 30% 50% 50% / 30% 50% 50% 70%', animation: 'lava-morph-3 22s ease-in-out infinite' }} />
        {/* Blob 4 */}
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] opacity-60 dark:opacity-0 blur-[55px]" style={{ background: 'linear-gradient(315deg, #4338ca 0%, #4f46e5 50%, #6366f1 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', animation: 'lava-morph-4 18s ease-in-out infinite' }} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] opacity-0 dark:opacity-45 blur-[55px]" style={{ background: 'linear-gradient(315deg, #4338ca 0%, #3730a3 50%, #312e81 100%)', borderRadius: '40% 60% 60% 40% / 60% 40% 60% 40%', animation: 'lava-morph-4 18s ease-in-out infinite' }} />
        {/* Overlay */}
        <div className="absolute inset-0 transition-all duration-700 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.3)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,10,26,0.4)_100%)]" />
      </div>

      {/* Top Toggles - Sticky */}
      <div className="fixed top-4 right-4 z-30 hidden md:flex items-center gap-3">
        <ThemeToggleSimple />
        <LocaleToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 pt-8 pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Glass Card Container */}
          <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 md:p-12">
            {/* Header */}
            <div className="mb-10 border-b border-slate-200 dark:border-slate-700 pb-8">
              <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" />
                {t("terms.backToHome")}
              </button>
              <Logo variant={resolvedTheme === 'dark' ? 'onDark' : 'default'} className="text-3xl mb-4" />
              <h1 className="text-[2rem] md:text-[2.25rem] leading-tight premium-title premium-title-glow mb-2">{t("terms.title")}</h1>
              <p className="premium-subtitle text-sm">{t("terms.updatedAt")}: {new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Content */}
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section1Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("terms.section1Content")}
                </p>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section2Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("terms.section2Intro")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li>{t("terms.section2Item1")}</li>
                  <li>{t("terms.section2Item2")}</li>
                  <li>{t("terms.section2Item3")}</li>
                  <li>{t("terms.section2Item4")}</li>
                  <li>{t("terms.section2Item5")}</li>
                  <li>{t("terms.section2Item6")}</li>
                  <li>{t("terms.section2Item7")}</li>
                  <li>{t("terms.section2Item8")}</li>
                  <li>{t("terms.section2Item9")}</li>
                  <li>{t("terms.section2Item10")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section3Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("terms.section3Content")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm mt-3">
                  <li>{t("terms.section3Item1")}</li>
                  <li>{t("terms.section3Item2")}</li>
                  <li>{t("terms.section3Item3")}</li>
                  <li>{t("terms.section3Item4")}</li>
                  <li>{t("terms.section3Item5")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section4Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("terms.section4Content")}
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li>{t("terms.section4Item1")}</li>
                  <li>{t("terms.section4Item2")}</li>
                  <li>{t("terms.section4Item3")}</li>
                  <li>{t("terms.section4Item4")}</li>
                  <li>{t("terms.section4Item5")}</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section5Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-3">
                  {t("terms.section5Content")}
                </p>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section6Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("terms.section6Content")}
                </p>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section7Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("terms.section7Content")}
                </p>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section8Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("terms.section8Content")}
                </p>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section9Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("terms.section9Content")}
                </p>
              </section>

              <section>
                <h2 className="text-lg premium-section-title mb-3">{t("terms.section10Title")}</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                  {t("terms.section10Content")}
                </p>
              </section>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
              <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4" />
                {t("terms.backToHome")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
