/**
 * Test de integración: flujo de login.
 * Verifica que el formulario, la llamada a la API (mock), el store de auth y la navegación trabajen juntos.
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import { useAuthStore } from "@/lib/store";

jest.mock("next/font/local", () => ({
  __esModule: true,
  default: () => ({ variable: "--font-calsans", className: "font-calsans" }),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: jest.fn() }),
}));

const mockPost = jest.fn();
const mockGet = jest.fn();
const mockPatch = jest.fn();
const mockSetToken = jest.fn();
jest.mock("@/lib/api", () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    setToken: (t: string) => mockSetToken(t),
  },
  getApiErrorMessage: (err: unknown) => (err instanceof Error ? err.message : "Request failed"),
}));

describe("Integración: Login", () => {
  const mockUser = {
    id: "user-1",
    email: "admin@test.com",
    firstName: "Admin",
    lastName: "User",
    systemRole: "ADMIN" as const,
    companyId: "company-1",
    appPreferences: { theme: "light" as const, locale: "es" as const },
  };
  const mockToken = "jwt-token-123";

  beforeEach(() => {
    useAuthStore.setState({ user: null, error: null });
    mockPush.mockClear();
    mockSetToken.mockClear();
    mockPost.mockReset();
    mockGet.mockResolvedValue({ brandingConfig: null });
    mockPatch.mockResolvedValue(undefined);

    mockPost.mockResolvedValue({
      user: mockUser,
      token: mockToken,
    });
  });

  it("al enviar credenciales válidas actualiza el store y navega al dashboard", async () => {
    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "admin@test.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/auth/login", {
        email: "admin@test.com",
        password: "password123",
      });
    });

    await waitFor(() => {
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
    expect(mockSetToken).toHaveBeenCalledWith(mockToken);
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("muestra error cuando la API falla", async () => {
    mockPost.mockRejectedValue(new Error("Invalid credentials"));

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/correo electrónico/i), "wrong@test.com");
    await userEvent.type(screen.getByLabelText(/contraseña/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
