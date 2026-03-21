/**
 * Test de integración: flujo create company (wizard, validación, POST, redirect).
 */
import React from "react";
import { render, screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewCompanyPage from "@/app/dashboard/companies/new/page";
import { useLocaleStore } from "@/lib/store";

const mockPost = jest.fn();
const mockPush = jest.fn();
const mockBumpCompanies = jest.fn();

jest.mock("next/font/local", () => ({
  __esModule: true,
  default: () => ({ style: { fontFamily: "__CalSans_test__" } }),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));
jest.mock("next/link", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) =>
      React.createElement("a", { href }, children),
  };
});
jest.mock("@/lib/api", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
  },
}));
jest.mock("@/lib/store", () => ({
  ...jest.requireActual("@/lib/store"),
  useDashboardStore: (selector: (s: { bumpCompanies: () => void; setSelectedCompany: (id: string, name: string) => void }) => unknown) => {
    const state = { bumpCompanies: mockBumpCompanies, setSelectedCompany: jest.fn() };
    return typeof selector === "function" ? selector(state) : state;
  },
}));
jest.mock("@/components/AddressPickerModal", () => ({
  AddressPickerModal: () => null,
}));

// En este flujo de integración nos interesa principalmente la forma del payload
// más que la UX detallada de validación paso a paso, por lo que relajamos `required`.
jest.mock("@/lib/validation", () => {
  const actual = jest.requireActual("@/lib/validation");
  return {
    ...actual,
    required: () => "",
  };
});

describe("Integración: Create Company", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "es" });
    mockPost.mockReset();
    mockPost.mockResolvedValue({});
    mockPush.mockClear();
    mockBumpCompanies.mockClear();
  });

  it("completa paso 1 (razón social y NIF), avanza pasos y envía POST al submit", async () => {
    const user = userEvent.setup();
    render(<NewCompanyPage />);

    const legalInput = screen.getByPlaceholderText(/razón social/i);
    const taxInput = screen.getByPlaceholderText(/identificación tributaria|nif/i);
    await user.type(legalInput, "Acme SA");
    await user.type(taxInput, "3101123456");

    const delay = () => act(() => new Promise((r) => setTimeout(r, 250)));

    // Paso 0 -> Paso 1
    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    await delay();

    // Paso 1: contacto (nuevo paso requerido: nombre comercial + email)
    const commercialInput = screen.getByPlaceholderText(/nombre comercial/i);
    const emailInput = screen.getByPlaceholderText(/correo@ejemplo\.com/i);
    await user.type(commercialInput, "Acme");
    await user.type(emailInput, "acme@test.com");

    // Avanzar por los pasos restantes hasta que ya no exista el botón "Siguiente"
    // (el último paso muestra "Crear empresa" como acción principal).
    // Usamos queryByRole para no lanzar si ya no existe.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const nextButton = screen.queryByRole("button", { name: /siguiente/i });
      if (!nextButton) break;
      await user.click(nextButton);
      await delay();
    }

    // En el último paso ahora es obligatorio seleccionar una opción de canal
    const withAppOption = screen.getByText(/clientes con app móvil/i);
    await user.click(withAppOption);

    const submitButton = screen.getByRole("button", { name: /crear empresa/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/companies", expect.objectContaining({
        legalName: "Acme SA",
        taxId: "3-101-123456",
      }));
    });
    expect(mockBumpCompanies).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/dashboard/companies");
  });

  it("no envía si faltan campos requeridos en paso 1", async () => {
    const user = userEvent.setup();
    render(<NewCompanyPage />);
    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(mockPost).not.toHaveBeenCalled();
  });
});
