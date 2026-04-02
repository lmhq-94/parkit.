/**
 * Integration test: edit company flow (GET, form, PATCH, redirect).
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditCompanyPage from "@/app/dashboard/companies/[id]/edit/page";
import { useLocaleStore } from "@/lib/store";

const mockGet = jest.fn();
const mockPatch = jest.fn();
const mockPush = jest.fn();
const mockBumpCompanies = jest.fn();

jest.mock("next/font/local", () => ({
  __esModule: true,
  default: () => ({ style: { fontFamily: "__CalSans_test__" } }),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  useParams: () => ({ id: "company-1" }),
}));
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) =>
      React.createElement("a", { href }, children),
  };
});
jest.mock("@/lib/api", () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
  },
}));
jest.mock("@/lib/store", () => ({
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ...jest.requireActual("@/lib/store"),
  useDashboardStore: (selector: (s: { bumpCompanies: () => void }) => unknown) => {
    const state = { bumpCompanies: mockBumpCompanies };
    return typeof selector === "function" ? selector(state) : state;
  },
}));
jest.mock("@/components/AddressPickerModal", () => ({
  AddressPickerModal: () => null,
}));

const companyData = {
  id: "company-1",
  legalName: "Empresa Original SA",
  taxId: "3101123456",
  commercialName: "Original",
  countryCode: "CR",
  currency: "CRC",
  timezone: "America/Costa_Rica",
  email: "contact@original.com",
  contactPhone: "50662164040",
  legalAddress: "",
  status: "ACTIVE",
};

describe("Integration: Edit Company", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "es" });
    mockGet.mockReset();
    mockGet.mockResolvedValue(companyData);
    mockPatch.mockReset();
    mockPatch.mockResolvedValue({});
    mockPush.mockClear();
    mockBumpCompanies.mockClear();
  });

  it("carga datos con GET, muestra formulario y al guardar envía PATCH y redirige", async () => {
    const user = userEvent.setup();
    render(<EditCompanyPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("Empresa Original SA")).toBeInTheDocument();
    });

    const legalInput = screen.getByDisplayValue("Empresa Original SA");
    await user.clear(legalInput);
    await user.type(legalInput, "Empresa Modificada SA");

    // In the edit form it is now mandatory to choose a customer channel
    const channelWithAppOption = screen.getByText(/clientes con app móvil/i);
    await user.click(channelWithAppOption);

    const saveButton = screen.getByRole("button", { name: /guardar|save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith(
        "/companies/company-1",
        expect.objectContaining({
          legalName: "Empresa Modificada SA",
          taxId: "3-101-123456",
        })
      );
    });
    expect(mockBumpCompanies).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/dashboard/companies");
  });

  it("muestra formulario con datos cargados tras GET", async () => {
    render(<EditCompanyPage />);
    await waitFor(() => {
      expect(screen.getByDisplayValue("Empresa Original SA")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("3-101-123456")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Original")).toBeInTheDocument();
  });
});
