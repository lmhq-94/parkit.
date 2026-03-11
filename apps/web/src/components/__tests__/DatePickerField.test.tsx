import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePickerField } from "../DatePickerField";

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const dowLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      if (key === "datepicker.clear") return "Limpiar";
      const monthMatch = key.match(/datepicker\.month(\d+)/);
      if (monthMatch) return monthNames[parseInt(monthMatch[1], 10)] ?? key;
      const dowMatch = key.match(/datepicker\.dow(\d+)/);
      if (dowMatch) return dowLabels[parseInt(dowMatch[1], 10)] ?? key;
      return key;
    },
  }),
}));

describe("DatePickerField", () => {
  it("renderiza botón con placeholder cuando value está vacío", () => {
    render(
      <DatePickerField value="" onChange={jest.fn()} placeholder="Seleccionar fecha" />
    );
    expect(screen.getByRole("button", { name: /seleccionar fecha/i })).toBeInTheDocument();
  });

  it("renderiza fecha formateada cuando value tiene YYYY-MM-DD", () => {
    render(
      <DatePickerField value="2025-03-15" onChange={jest.fn()} placeholder="Fecha" />
    );
    expect(screen.getByRole("button")).toHaveTextContent(/15/);
    expect(screen.getByRole("button")).toHaveTextContent(/Marzo/);
    expect(screen.getByRole("button")).toHaveTextContent(/2025/);
  });

  it("llama onChange al elegir un día en el calendario", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(
      <DatePickerField value="" onChange={onChange} placeholder="Fecha" />
    );
    await user.click(screen.getByRole("button"));
    const day15 = screen.getByRole("button", { name: "15" });
    await user.click(day15);
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
  });
});
