import React from "react";
import { render, screen } from "@testing-library/react";
import { Logo } from "../Logo";

jest.mock("next/font/local", () => ({
  __esModule: true,
  default: () => ({
    variable: "--font-calsans",
    className: "font-calsans",
  }),
}));

describe("Logo", () => {
  it("renderiza logo completo 'parkit.' por defecto", () => {
    render(<Logo />);
    expect(screen.getByText("park")).toBeInTheDocument();
    expect(screen.getByText("it.")).toBeInTheDocument();
  });

  it("renderiza solo mark 'p.' cuando variant es mark", () => {
    render(<Logo variant="mark" />);
    expect(screen.getByText("p")).toBeInTheDocument();
    expect(screen.getByText(".")).toBeInTheDocument();
    expect(screen.queryByText("park")).not.toBeInTheDocument();
  });

  it("aplica className personalizado", () => {
    const { container } = render(<Logo className="mi-clase" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("mi-clase");
  });

  it("variantes onDark y markOnDark renderizan correctamente", () => {
    render(<Logo variant="onDark" />);
    expect(screen.getByText("park")).toBeInTheDocument();
    render(<Logo variant="markOnDark" />);
    expect(screen.getByText("p")).toBeInTheDocument();
  });
});
