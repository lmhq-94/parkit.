/**
 * Test de integración: flujo forgot-password.
 * Verifica formulario, submit y estado de éxito con enlace a login.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordPage from "@/app/forgot-password/page";

jest.mock("next/font/local", () => ({
  __esModule: true,
  default: () => ({ variable: "--font-calsans", className: "font-calsans" }),
}));

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: jest.fn() }),
}));

const mockT: Record<string, string> = {
  "auth.resetPasswordDescription": "Ingresa tu correo para recibir el enlace.",
  "auth.email": "Correo electrónico",
  "auth.sendResetLink": "Enviar enlace",
  "auth.backToSignIn": "Volver a iniciar sesión",
  "auth.resetSubmittedMessage": "Revisa {{email}} para restablecer tu contraseña.",
  "auth.supportHint": "¿Problemas?",
  "auth.supportLinkLabel": "Soporte",
};

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => mockT[key] ?? key,
  }),
}));

describe("Integración: Forgot Password", () => {
  it("renderiza descripción, campo email y botón enviar", () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText("Ingresa tu correo para recibir el enlace.")).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it("al enviar con email muestra mensaje de éxito y enlace a login", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);
    const input = screen.getByLabelText(/correo electrónico/i);
    await user.type(input, "user@test.com");
    await user.click(screen.getByRole("button", { name: /enviar enlace/i }));

    expect(
      screen.getByText(/revisa.*user@test\.com.*para restablecer tu contraseña/i)
    ).toBeInTheDocument();
    const backLink = screen.getByRole("link", { name: /volver a iniciar sesión/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/login");
  });

  it("muestra enlace a login también antes de enviar", () => {
    render(<ForgotPasswordPage />);
    const links = screen.getAllByRole("link", { name: /volver a iniciar sesión/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links.some((l) => l.getAttribute("href") === "/login")).toBe(true);
  });
});
