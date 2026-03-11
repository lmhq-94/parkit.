/**
 * Test de integración: flujo create company (wizard, validación, POST, redirect).
 */
import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewCompanyPage from "@/app/dashboard/companies/new/page";
import { useLocaleStore } from "@/lib/store";

const mockPost = jest.fn();
const mockPush = jest.fn();
const mockBumpCompanies = jest.fn();

jest.mock("next/font/local", () => ({
  __esModule: true,
  default: () => ({ variable: "--font-calsans", className: "font-calsans" }),
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
  useDashboardStore: (selector: (s: { bumpCompanies: () => void }) => unknown) => {
    const state = { bumpCompanies: mockBumpCompanies };
    return typeof selector === "function" ? selector(state) : state;
  },
}));
jest.mock("@/components/AddressPickerModal", () => ({
  AddressPickerModal: () => null,
}));

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

    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    await delay();
    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    await delay();
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
