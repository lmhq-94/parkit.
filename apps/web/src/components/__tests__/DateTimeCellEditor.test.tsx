import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateTimeCellEditor } from "../DateTimeCellEditor";

jest.mock("@/components/DateTimePickerField", () => ({
  DateTimePickerField: ({
    value,
    onChange,
    min,
  }: {
    value: string;
    onChange: (v: string) => void;
    min?: string;
  }) => (
    <div data-testid="datetime-picker">
      <input
        data-testid="datetime-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-min={min ?? "none"}
      />
    </div>
  ),
}));

describe("DateTimeCellEditor", () => {
  it("renderiza DateTimePickerField con valor actual", () => {
    render(
      <DateTimeCellEditor
        value="2025-03-15T10:00:00.000Z"
        onValueChange={jest.fn()}
        stopEditing={jest.fn()}
      />
    );
    expect(screen.getByTestId("datetime-picker")).toBeInTheDocument();
    expect(screen.getByTestId("datetime-input")).toHaveValue("2025-03-15T10:00:00.000Z");
  });

  it("usa initialValue cuando value no está definido", () => {
    render(
      <DateTimeCellEditor
        initialValue="2025-01-01T08:00:00.000Z"
        onValueChange={jest.fn()}
        stopEditing={jest.fn()}
      />
    );
    expect(screen.getByTestId("datetime-input")).toHaveValue("2025-01-01T08:00:00.000Z");
  });

  it("llama onValueChange al cambiar el valor", async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <DateTimeCellEditor
        value=""
        onValueChange={onValueChange}
        stopEditing={jest.fn()}
      />
    );
    const input = screen.getByTestId("datetime-input");
    await user.type(input, "2025-06-20T14:30");
    expect(onValueChange).toHaveBeenCalled();
  });

  it("pasa min al picker cuando minNow es true", () => {
    render(
      <DateTimeCellEditor
        value=""
        onValueChange={jest.fn()}
        stopEditing={jest.fn()}
        minNow
      />
    );
    const input = screen.getByTestId("datetime-input");
    expect(input).toHaveAttribute("data-min");
    expect(input.getAttribute("data-min")).not.toBe("none");
  });
});
