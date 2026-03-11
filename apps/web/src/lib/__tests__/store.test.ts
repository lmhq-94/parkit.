import { act, renderHook } from "@testing-library/react";
import { useAuthStore, useLocaleStore, useDashboardStore } from "../store";
import type { User } from "../auth";

const mockUser: User = {
  id: "u1",
  email: "u@test.com",
  firstName: "Test",
  lastName: "User",
  systemRole: "ADMIN",
  companyId: "c1",
  isActive: true,
};

describe("useAuthStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, error: null, loggingOut: false });
  });

  it("login guarda user y token en localStorage y state", () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.login(mockUser, "token-123");
    });
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem("user")).toBeTruthy();
    expect(localStorage.getItem("authToken")).toBe("token-123");
  });

  it("logout limpia user y pone loggingOut", () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.login(mockUser, "token");
    });
    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(result.current.loggingOut).toBe(true);
    expect(localStorage.getItem("authToken")).toBeNull();
  });

  it("hydrate restaura user desde localStorage", () => {
    localStorage.setItem("user", JSON.stringify(mockUser));
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.hydrate();
    });
    expect(result.current.user).toEqual(mockUser);
  });

  it("setError actualiza error", () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.setError("Invalid credentials");
    });
    expect(result.current.error).toBe("Invalid credentials");
  });
});

describe("useLocaleStore", () => {
  beforeEach(() => {
    localStorage.removeItem("parkit_locale");
    useLocaleStore.setState({ locale: "es" });
  });

  it("setLocale actualiza locale y localStorage", () => {
    const { result } = renderHook(() => useLocaleStore());
    expect(result.current.locale).toBe("es");
    act(() => {
      result.current.setLocale("en");
    });
    expect(result.current.locale).toBe("en");
    expect(localStorage.getItem("parkit_locale")).toBe("en");
  });
});

describe("useDashboardStore", () => {
  beforeEach(() => {
    localStorage.removeItem("parkit_sidebar_collapsed");
    localStorage.removeItem("parkit_selected_company_id");
    localStorage.removeItem("parkit_selected_company_name");
    useDashboardStore.setState({
      selectedCompanyId: null,
      selectedCompanyName: null,
      sidebarOpen: false,
      companyBranding: null,
    });
  });

  it("toggleSidebar invierte sidebarOpen", () => {
    const { result } = renderHook(() => useDashboardStore());
    const initial = result.current.sidebarOpen;
    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.sidebarOpen).toBe(!initial);
  });

  it("setSelectedCompany guarda en state y localStorage", () => {
    const { result } = renderHook(() => useDashboardStore());
    act(() => {
      result.current.setSelectedCompany("company-1", "Acme");
    });
    expect(result.current.selectedCompanyId).toBe("company-1");
    expect(result.current.selectedCompanyName).toBe("Acme");
    expect(localStorage.getItem("parkit_selected_company_id")).toBe("company-1");
  });

  it("bumpCompanies incrementa companiesVersion", () => {
    const { result } = renderHook(() => useDashboardStore());
    const v = result.current.companiesVersion;
    act(() => {
      result.current.bumpCompanies();
    });
    expect(result.current.companiesVersion).toBe(v + 1);
  });

  it("setCompanyBranding actualiza companyBranding", () => {
    const { result } = renderHook(() => useDashboardStore());
    const branding = { primaryColor: "#2563eb" };
    act(() => {
      result.current.setCompanyBranding(branding);
    });
    expect(result.current.companyBranding).toEqual(branding);
  });
});
