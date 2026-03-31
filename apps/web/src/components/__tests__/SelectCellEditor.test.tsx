import React from "react";
import { render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectCellEditor } from "../SelectCellEditor";

jest.mock("@/lib/toastStore", () => ({
  useToast: () => ({ showError: jest.fn() }),
}));

describe("SelectCellEditor", () => {
  it("renderiza botón con valor seleccionado y etiqueta", () => {
    const { container } = render(
      <SelectCellEditor
        value="ACTIVE"
        onValueChange={jest.fn()}
        values={["PENDING", "ACTIVE", "INACTIVE"]}
        labels={["Pendiente", "Activa", "Inactiva"]}
        stopEditing={jest.fn()}
      />
    );
    const trigger = container.querySelector("button");
    expect(trigger).toHaveTextContent("Activa");
  });

  it("al abrir muestra opciones y al elegir una llama onValueChange y stopEditing", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const stopEditing = jest.fn();
    render(
      <SelectCellEditor
        value="PENDING"
        onValueChange={onValueChange}
        values={["PENDING", "ACTIVE"]}
        labels={["Pendiente", "Activa"]}
        stopEditing={stopEditing}
      />
    );
    const dropdown = document.querySelector("[data-select-cell-editor-dropdown]");
    expect(dropdown).toBeInTheDocument();
    const activaOption = within(dropdown as HTMLElement).getByRole("button", { name: "Activa" });
    await user.click(activaOption);
    expect(onValueChange).toHaveBeenCalledWith("ACTIVE");
    expect(stopEditing).toHaveBeenCalled();
  });

  it("usa values como etiquetas cuando labels no se define", () => {
    const { container } = render(
      <SelectCellEditor
        value="A"
        onValueChange={jest.fn()}
        values={["A", "B"]}
        stopEditing={jest.fn()}
      />
    );
    const trigger = container.querySelector("button");
    expect(trigger).toHaveTextContent("A");
  });
});
