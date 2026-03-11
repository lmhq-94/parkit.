import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "@testing-library/react";
import { Toaster } from "../Toaster";
import { useToastStore } from "@/lib/toastStore";

describe("Toaster", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("no renderiza nada cuando no hay toasts", () => {
    render(<Toaster />);
    expect(screen.queryByRole("region", { name: /notificaciones/i })).not.toBeInTheDocument();
  });

  it("muestra toast de success con mensaje y botón cerrar", async () => {
    act(() => {
      useToastStore.getState().add("success", "Guardado correctamente");
    });
    render(<Toaster />);
    await waitFor(() => {
      expect(screen.getByText("Guardado correctamente")).toBeInTheDocument();
    });
    expect(screen.getByRole("region", { name: /notificaciones/i })).toBeInTheDocument();
    const closeBtn = screen.getByRole("button", { name: /cerrar/i });
    act(() => {
      fireEvent.click(closeBtn);
    });
    await waitFor(() => {
      expect(screen.queryByText("Guardado correctamente")).not.toBeInTheDocument();
    });
  });

  it("muestra toast de error", async () => {
    act(() => {
      useToastStore.getState().add("error", "Error al guardar");
    });
    render(<Toaster />);
    await waitFor(() => {
      expect(screen.getByText("Error al guardar")).toBeInTheDocument();
    });
  });

  it("muestra toast de info", async () => {
    act(() => {
      useToastStore.getState().add("info", "Información");
    });
    render(<Toaster />);
    await waitFor(() => {
      expect(screen.getByText("Información")).toBeInTheDocument();
    });
  });
});
