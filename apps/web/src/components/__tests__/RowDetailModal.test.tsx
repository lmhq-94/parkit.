import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  RowDetailModal,
  DetailField,
  DetailSeparator,
  DetailSectionLabel,
} from "../RowDetailModal";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
  }) {
    return (
      <a href={href} onClick={onClick}>
        {children}
      </a>
    );
  };
});

const t = (key: string) => (key === "common.edit" ? "Editar" : key === "common.cancel" ? "Cancelar" : key);

describe("RowDetailModal", () => {
  it("renderiza título, subtítulo y children", () => {
    render(
      <RowDetailModal title="Detalle" subtitle="Subtítulo" onClose={jest.fn()} t={t}>
        <p>Contenido</p>
      </RowDetailModal>
    );
    expect(screen.getByText("Detalle")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });

  it("muestra statusLabel con estado activo/inactivo", () => {
    render(
      <RowDetailModal
        title="Título"
        statusLabel="Activo"
        statusActive={true}
        onClose={jest.fn()}
        t={t}
      >
        <span>Body</span>
      </RowDetailModal>
    );
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  it("llama onClose al hacer clic en cerrar", () => {
    const onClose = jest.fn();
    render(
      <RowDetailModal title="Título" onClose={onClose} t={t}>
        <span>Body</span>
      </RowDetailModal>
    );
    const cancelButtons = screen.getAllByText("Cancelar");
    fireEvent.click(cancelButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });
});

describe("DetailField", () => {
  it("renderiza label y value", () => {
    render(<DetailField label="Nombre" value="Juan" />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
  });

  it("muestra un placeholder cuando value es null o vacío", () => {
    const { getAllByText, rerender } = render(<DetailField label="Opcional" value={null} />);
    // Cuando no hay valor, se muestra el placeholder "—"
    expect(getAllByText("—")[0]).toBeInTheDocument();

    rerender(<DetailField label="Vacio" value="" />);
    expect(getAllByText("—")[0]).toBeInTheDocument();
  });

  it("renderiza enlace mailto cuando linkType es email", () => {
    render(<DetailField label="Email" value="a@b.com" linkType="email" />);
    const link = screen.getByRole("link", { name: "a@b.com" });
    expect(link).toHaveAttribute("href", "mailto:a@b.com");
  });

  it("renderiza enlace tel cuando linkType es phone", () => {
    render(<DetailField label="Tel" value="50612345678" linkType="phone" />);
    const link = screen.getByRole("link", { name: "50612345678" });
    expect(link).toHaveAttribute("href", "tel:50612345678");
  });
});

describe("DetailSeparator", () => {
  it("renderiza un div separador", () => {
    const { container } = render(<DetailSeparator />);
    expect(container.firstChild).toHaveClass("col-span-full");
  });
});

describe("DetailSectionLabel", () => {
  it("renderiza el texto de sección", () => {
    render(<DetailSectionLabel text="Datos personales" />);
    expect(screen.getByText("Datos personales")).toBeInTheDocument();
  });
});
