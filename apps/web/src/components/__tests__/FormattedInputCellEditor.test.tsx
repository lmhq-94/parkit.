import React from "react";
// eslint-disable @typescript-eslint/no-var-requires
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormattedInputCellEditor } from "../FormattedInputCellEditor";

const mockUseToast = jest.fn(() => ({ showError: jest.fn() }));

jest.mock("@/lib/toastStore", () => ({
  useToast: mockUseToast,
}));

describe("FormattedInputCellEditor", () => {
  it("renderiza input con valor inicial y aplica formato al escribir", async () => {
    const onValueChange = jest.fn();
    const stopEditing = jest.fn();
    const format = (v: string) => v.replace(/\D/g, "").slice(0, 10);

    render(
      <FormattedInputCellEditor
        value="123"
        onValueChange={onValueChange}
        format={format}
        stopEditing={stopEditing}
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("123");

    await userEvent.clear(input);
    await userEvent.type(input, "456abc789");
    expect(onValueChange).toHaveBeenCalled();
    expect(input).toHaveValue("456789");
  });

  it("llama stopEditing al blur con valor válido", async () => {
    const stopEditing = jest.fn();
    render(
      <FormattedInputCellEditor
        value="test"
        onValueChange={jest.fn()}
        stopEditing={stopEditing}
      />
    );
    screen.getByRole("textbox").blur();
    expect(stopEditing).toHaveBeenCalled();
  });

  it("llama stopEditing al pulsar Enter", async () => {
    const user = userEvent.setup();
    const stopEditing = jest.fn();
    render(
      <FormattedInputCellEditor
        value="x"
        onValueChange={jest.fn()}
        stopEditing={stopEditing}
      />
    );
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{Enter}");
    expect(stopEditing).toHaveBeenCalled();
  });

  it("llama stopEditing al pulsar Escape", async () => {
    const user = userEvent.setup();
    const stopEditing = jest.fn();
    render(
      <FormattedInputCellEditor
        value="x"
        onValueChange={jest.fn()}
        stopEditing={stopEditing}
      />
    );
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.keyboard("{Escape}");
    expect(stopEditing).toHaveBeenCalled();
  });

  it("muestra toast y no cierra cuando el validador devuelve error", async () => {
    const showError = jest.fn();
    mockUseToast.mockReturnValue({ showError });
    const stopEditing = jest.fn();
    render(
      <FormattedInputCellEditor
        value="short"
        onValueChange={jest.fn()}
        stopEditing={stopEditing}
        validator={(v) => (String(v).length < 10 ? "Mínimo 10 caracteres" : null)}
      />
    );
    screen.getByRole("textbox").blur();
    expect(showError).toHaveBeenCalledWith("Mínimo 10 caracteres");
    expect(stopEditing).not.toHaveBeenCalled();
  });
});
