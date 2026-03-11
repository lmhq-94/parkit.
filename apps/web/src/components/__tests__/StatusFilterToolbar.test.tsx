import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusFilterToolbar } from "../StatusFilterToolbar";

const options = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "CANCELLED", label: "Cancelada" },
];

describe("StatusFilterToolbar", () => {
  it("renderiza botón con placeholder y opciones al abrir", async () => {
    const onChange = jest.fn();
    render(
      <StatusFilterToolbar
        allLabel="Todas"
        placeholder="Estados"
        options={options}
        selected={[]}
        onChange={onChange}
        tableKey="bookings"
      />
    );
    const dropdownTrigger = screen.getByRole("button", { name: /estados/i });
    expect(dropdownTrigger).toBeInTheDocument();
    await userEvent.click(dropdownTrigger);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  it("muestra cantidad seleccionada cuando selected tiene valores", () => {
    render(
      <StatusFilterToolbar
        allLabel="Todas"
        placeholder="Estados"
        options={options}
        selected={["PENDING", "CONFIRMED"]}
        onChange={jest.fn()}
        tableKey="bookings"
      />
    );
    expect(screen.getByRole("button", { name: /2 seleccionados/i })).toBeInTheDocument();
  });

  it("llama onChange al marcar una opción", async () => {
    const onChange = jest.fn();
    render(
      <StatusFilterToolbar
        allLabel="Todas"
        placeholder="Estados"
        options={options}
        selected={[]}
        onChange={onChange}
        tableKey="bookings"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /estados/i }));
    await userEvent.click(screen.getByText("Pendiente"));
    expect(onChange).toHaveBeenCalledWith(["PENDING"]);
  });
});
