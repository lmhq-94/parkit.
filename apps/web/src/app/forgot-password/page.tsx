"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(59,130,246,0.14),transparent_50%)]" />

      <div className="relative w-full max-w-[400px]">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.06] p-8 shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-10">
          <div className="mb-8 flex flex-col items-center">
            <Logo variant="onDark" className="text-5xl md:text-6xl" />
          </div>

          {submitted ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-300">
                If an account exists for <span className="text-white">{email}</span>, you’ll receive a link to reset your password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-white mb-1">Reset password</h1>
              <p className="text-sm text-slate-400 mb-6">
                Enter your email and we’ll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300/90">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@company.com"
                      className="w-full rounded-xl border border-white/12 bg-white/[0.07] py-3.5 pl-12 pr-4 text-white placeholder-slate-400 focus:border-sky-400/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/25"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-500 py-3.5 font-semibold text-white hover:bg-sky-400 transition-colors"
                >
                  Send reset link
                </button>
              </form>
              <Link
                href="/login"
                className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
