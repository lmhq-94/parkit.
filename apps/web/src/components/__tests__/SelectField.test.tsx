import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectField } from "../SelectField";

describe("SelectField", () => {
  it("renderiza el valor seleccionado o placeholder", () => {
    const { rerender } = render(
      <SelectField value="" onChange={jest.fn()}>
        <option value="a">Opción A</option>
        <option value="b">Opción B</option>
      </SelectField>
    );
    expect(screen.getByRole("button", { name: /seleccionar…/i })).toBeInTheDocument();

    rerender(
      <SelectField value="a" onChange={jest.fn()}>
        <option value="a">Opción A</option>
        <option value="b">Opción B</option>
      </SelectField>
    );
    expect(screen.getByRole("button", { name: /opción a/i })).toBeInTheDocument();
  });

  it("abre dropdown al hacer clic y llama onChange al elegir opción", async () => {
    const onChange = jest.fn();
    render(
      <SelectField value="" onChange={onChange}>
        <option value="a">Opción A</option>
        <option value="b">Opción B</option>
      </SelectField>
    );
    const trigger = screen.getByRole("button");
    await userEvent.click(trigger);
    const optionB = screen.getByRole("button", { name: /opción b/i });
    expect(optionB).toBeInTheDocument();
    await userEvent.click(optionB);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.objectContaining({ value: "b" }) })
    );
  });
});
