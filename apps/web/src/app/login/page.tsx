"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

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
          systemRole: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "CUSTOMER";
          companyId?: string;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Parkit Admin</h1>
        <p className="text-center text-gray-600 mb-8">Parking Management System</p>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@parkit.cr"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500 mt-8">
          Demo credentials: admin@parkit.cr / Parkit123!
        </p>
      </div>
    </div>
  );
}
