import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiSelectField } from "../MultiSelectField";

const options = [
  { value: "a", label: "Opción A" },
  { value: "b", label: "Opción B" },
  { value: "c", label: "Opción C" },
];

describe("MultiSelectField", () => {
  it("renderiza placeholder cuando value está vacío", () => {
    render(
      <MultiSelectField value={[]} onChange={jest.fn()} options={options} />
    );
    expect(screen.getByRole("button", { name: /seleccionar…/i })).toBeInTheDocument();
  });

  it("muestra labels de opciones seleccionadas cuando hay valores", () => {
    render(
      <MultiSelectField value={["a", "b"]} onChange={jest.fn()} options={options} />
    );
    expect(screen.getByText("Opción A")).toBeInTheDocument();
    expect(screen.getByText("Opción B")).toBeInTheDocument();
  });

  it("abre dropdown y llama onChange al marcar/desmarcar opción", async () => {
    const onChange = jest.fn();
    render(
      <MultiSelectField value={[]} onChange={onChange} options={options} />
    );
    await userEvent.click(screen.getByRole("button"));
    const optA = screen.getByRole("button", { name: /opción a/i });
    await userEvent.click(optA);
    expect(onChange).toHaveBeenCalledWith(["a"]);
  });

  it("placeholder personalizado", () => {
    render(
      <MultiSelectField
        value={[]}
        onChange={jest.fn()}
        options={options}
        placeholder="Elegir opciones"
      />
    );
    expect(screen.getByRole("button", { name: /elegir opciones/i })).toBeInTheDocument();
  });
});
