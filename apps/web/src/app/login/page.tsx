"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const { login, setError, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<{
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          systemRole: "ADMIN" | "STAFF" | "CUSTOMER";
          companyId: string;
        };
        token: string;
      }>("/auth/login", formData);

      if (response) {
        login(response.user, response.token);
        apiClient.setToken(response.token);
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed";
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="premium-bg">
      <div className="premium-glass-panel">
        <div className="flex justify-center mb-4">
          <Logo className="text-5xl" />
        </div>
        <p className="text-center text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase text-xs mb-8 transition-colors">
          Parking Management System
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="premium-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="premium-input"
              placeholder="e.g. jdoe@parkit.cr"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1">
              <label htmlFor="password" className="block text-sm font-semibold tracking-wide transition-colors text-slate-700 dark:text-slate-300">
                Password
              </label>
              <a href="#" className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors mr-1">
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="premium-input"
              placeholder="Your secure password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="premium-button"
          >
            <span>{isSubmitting ? "Authenticating..." : "Sign in securely"}</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50 transition-colors">
          <p className="text-xs text-center text-slate-500 font-medium">
            Secure Access Portal • Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
