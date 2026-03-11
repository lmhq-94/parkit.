import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleToggle } from "../LocaleToggle";
import { useLocaleStore } from "@/lib/store";

jest.mock("@/lib/api", () => ({
  apiClient: {
    patch: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("LocaleToggle", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "es" });
  });

  it("muestra locale actual en el botón", () => {
    render(<LocaleToggle />);
    expect(screen.getByRole("button", { name: /idioma/i })).toBeInTheDocument();
    expect(screen.getByText("es")).toBeInTheDocument();
  });

  it("abre dropdown y al elegir English actualiza el store", async () => {
    const { getByRole } = render(<LocaleToggle />);
    await userEvent.click(getByRole("button", { name: /idioma/i }));
    const englishBtn = screen.getByRole("button", { name: /english/i });
    await userEvent.click(englishBtn);
    expect(useLocaleStore.getState().locale).toBe("en");
  });

  it("al elegir Español actualiza el store a es", async () => {
    useLocaleStore.setState({ locale: "en" });
    render(<LocaleToggle />);
    await userEvent.click(screen.getByRole("button", { name: /idioma/i }));
    await userEvent.click(screen.getByRole("button", { name: /español/i }));
    expect(useLocaleStore.getState().locale).toBe("es");
  });
});
