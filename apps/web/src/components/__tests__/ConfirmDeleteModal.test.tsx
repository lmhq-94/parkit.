import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDeleteModal } from "../ConfirmDeleteModal";

describe("ConfirmDeleteModal", () => {
  it("no renderiza cuando open es false", () => {
    render(
      <ConfirmDeleteModal
        open={false}
        title="Eliminar"
        message="¿Seguro?"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza título, mensaje y botones cuando open es true", () => {
    render(
      <ConfirmDeleteModal
        open={true}
        title="Confirmar eliminación"
        message="Se eliminará de forma permanente."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirmar eliminación")).toBeInTheDocument();
    expect(screen.getByText("Se eliminará de forma permanente.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /eliminar/i })).toBeInTheDocument();
    const cancelButtons = screen.getAllByRole("button", { name: /cancelar/i });
    expect(cancelButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("llama onCancel al hacer clic en Cancelar", () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDeleteModal
        open={true}
        title="Título"
        message="Mensaje"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );
    const cancelButtons = screen.getAllByRole("button", { name: /cancelar/i });
    fireEvent.click(cancelButtons[cancelButtons.length - 1]);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("llama onConfirm al hacer clic en confirmar", () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDeleteModal
        open={true}
        title="Título"
        message="Mensaje"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /eliminar/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("no llama onCancel con Escape cuando loading es true", () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDeleteModal
        open={true}
        title="Título"
        message="Mensaje"
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={jest.fn()}
        onCancel={onCancel}
        loading={true}
      />
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onCancel).not.toHaveBeenCalled();
  });
});
