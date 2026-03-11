/**
 * Test de integración: formulario tipo wizard con validación, API y toast.
 * Verifica que FormWizard + validación + apiClient + useToast trabajen juntos.
 */
import React, { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormWizard } from "@/components/FormWizard";
import { useTranslation } from "@/hooks/useTranslation";
import { required } from "@/lib/validation";
import { useToast, useToastStore } from "@/lib/toastStore";
import { useLocaleStore } from "@/lib/store";

const mockPost = jest.fn();
const mockPush = jest.fn();
jest.mock("@/lib/api", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));
jest.mock("next/link", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
      return React.createElement("a", { href }, children);
    },
  };
});

function TestWizardForm() {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [data, setData] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    {
      title: "Paso 1",
      description: "Nombre",
      badge: "required" as const,
      isValid: () => !!data.name.trim(),
      content: (
        <div>
          <label htmlFor="name">Nombre *</label>
          <input
            id="name"
            value={data.name}
            onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>
      ),
    },
    {
      title: "Paso 2",
      description: "Email",
      badge: "optional" as const,
      isValid: () => true,
      content: (
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
          />
        </div>
      ),
    },
  ];

  const handleSubmit = async () => {
    const nameError = required(t, data.name);
    if (nameError) {
      showError(nameError);
      return;
    }
    setSubmitting(true);
    try {
      await mockPost("/api/test", { name: data.name, email: data.email || undefined });
      showSuccess("Guardado");
      mockPush("/list");
    } catch {
      showError("Error al guardar");
    }
    setSubmitting(false);
  };

  return (
    <FormWizard
      steps={steps}
      onSubmit={handleSubmit}
      submitting={submitting}
      cancelHref="/back"
    />
  );
}

describe("Integración: FormWizard + validación + API + toast", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "es" });
    mockPost.mockClear();
    mockPost.mockResolvedValue({});
    mockPush.mockClear();
    useToastStore.setState({ toasts: [] });
  });

  it("completa los dos pasos, envía al API y muestra toast de éxito", async () => {
    render(<TestWizardForm />);

    await userEvent.type(screen.getByLabelText(/nombre \*/i), "Acme Corp");
    await userEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    const emailInput = await screen.findByLabelText(/email/i, {}, { timeout: 3000 });
    await userEvent.type(emailInput, "contact@acme.com");
    await userEvent.click(screen.getByRole("button", { name: /guardar/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/api/test", {
        name: "Acme Corp",
        email: "contact@acme.com",
      });
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/list");
    });
    await waitFor(() => {
      expect(useToastStore.getState().toasts.some((toast) => toast.message === "Guardado" && toast.type === "success")).toBe(true);
    });
  });

  it("no envía si el paso requerido está vacío", async () => {
    render(<TestWizardForm />);
    await userEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    await waitFor(() => {
      expect(screen.getByLabelText(/nombre \*/i)).toBeInTheDocument();
    });
    expect(mockPost).not.toHaveBeenCalled();
  });
});
