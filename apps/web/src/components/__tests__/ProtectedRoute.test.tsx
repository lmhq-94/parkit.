import React from "react";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "../ProtectedRoute";
import { useAuthStore } from "@/lib/store";

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockUser = {
  id: "1",
  email: "u@test.com",
  firstName: "Test",
  lastName: "User",
  systemRole: "ADMIN" as const,
  companyId: "c1",
  isActive: true,
};

const originalHydrate = useAuthStore.getState().hydrate;

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.removeItem("user");
    mockReplace.mockClear();
    useAuthStore.setState({ hydrate: originalHydrate });
  });

  it("muestra PageLoader cuando no hay usuario", () => {
    useAuthStore.setState({ user: null, loggingOut: false });
    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("renderiza children cuando hay usuario en el store", () => {
    useAuthStore.setState({
      user: mockUser,
      loggingOut: false,
      hydrate: () => {},
    });
    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("no renderiza nada cuando loggingOut es true", () => {
    useAuthStore.setState({ user: { id: "1", email: "u@t.com", firstName: "A", lastName: "B", systemRole: "ADMIN", companyId: "c1", isActive: true }, loggingOut: true });
    render(
      <ProtectedRoute>
        <div>Contenido</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText("Contenido")).not.toBeInTheDocument();
  });
});
