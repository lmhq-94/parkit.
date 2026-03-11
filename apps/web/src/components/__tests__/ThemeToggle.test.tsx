import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "../ThemeToggle";

const mockSetTheme = jest.fn();
jest.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: mockSetTheme }),
}));

jest.mock("@/lib/api", () => ({
  apiClient: {
    patch: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("renderiza botón con aria-label para tema", async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: /dark theme/i }));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("tema light: el botón tiene label para cambiar a dark", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /dark theme/i })).toBeInTheDocument();
  });
});
