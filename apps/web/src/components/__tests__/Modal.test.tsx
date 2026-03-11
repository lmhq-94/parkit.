import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("no renderiza nada cuando open es false", () => {
    render(
      <Modal open={false} title="Título" onClose={jest.fn()}>
        Contenido
      </Modal>
    );
    expect(screen.queryByRole("heading", { name: /título/i })).not.toBeInTheDocument();
  });

  it("renderiza título, descripción y children cuando open es true", () => {
    render(
      <Modal open={true} title="Título" description="Descripción" onClose={jest.fn()}>
        <p>Contenido del modal</p>
      </Modal>
    );
    expect(screen.getByRole("heading", { name: /título/i })).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Contenido del modal")).toBeInTheDocument();
  });

  it("llama onClose al hacer clic en el overlay", () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} title="Título" onClose={onClose}>
        Contenido
      </Modal>
    );
    const overlay = screen.getByRole("button", { name: /close/i });
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("llama onClose al pulsar Escape", () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} title="Título" onClose={onClose}>
        Contenido
      </Modal>
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
