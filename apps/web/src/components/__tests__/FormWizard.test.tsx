import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormWizard } from "../FormWizard";
import { useLocaleStore } from "@/lib/store";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a href={href}>{children}</a>;
  };
});

const steps = [
  {
    title: "Paso 1",
    description: "Descripción 1",
    badge: "required" as const,
    isValid: () => true,
    content: <div>Contenido paso 1</div>,
  },
  {
    title: "Paso 2",
    description: "Descripción 2",
    badge: "optional" as const,
    isValid: () => true,
    content: <div>Contenido paso 2</div>,
  },
];

describe("FormWizard", () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: "es" });
  });

  it("renderiza el primer paso y su contenido", () => {
    render(
      <FormWizard
        steps={steps}
        onSubmit={jest.fn()}
        submitting={false}
        cancelHref="/back"
      />
    );
    expect(screen.getAllByText("Paso 1").length).toBeGreaterThan(0);
    expect(screen.getByText("Contenido paso 1")).toBeInTheDocument();
  });

  it("muestra enlace de cancelar con href correcto", () => {
    render(
      <FormWizard
        steps={steps}
        onSubmit={jest.fn()}
        submitting={false}
        cancelHref="/dashboard"
      />
    );
    const cancelLink = screen.getByRole("link", { name: /cancelar/i });
    expect(cancelLink).toHaveAttribute("href", "/dashboard");
  });

  it("avanza al siguiente paso al hacer clic en Siguiente", async () => {
    render(
      <FormWizard
        steps={steps}
        onSubmit={jest.fn()}
        submitting={false}
        cancelHref="/back"
      />
    );
    const nextBtn = screen.getByRole("button", { name: /siguiente/i });
    await userEvent.click(nextBtn);
    expect(await screen.findByText("Contenido paso 2")).toBeInTheDocument();
  });

  it("en el último paso muestra botón de enviar y llama onSubmit", async () => {
    const onSubmit = jest.fn();
    render(
      <FormWizard
        steps={steps}
        onSubmit={onSubmit}
        submitting={false}
        cancelHref="/back"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    const submitBtn = await screen.findByRole("button", { name: /guardar/i });
    expect(submitBtn).toBeInTheDocument();
    await userEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
  });
});
