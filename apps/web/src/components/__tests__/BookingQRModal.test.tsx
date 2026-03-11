import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookingQRModal } from "../BookingQRModal";

jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (fn: () => Promise<{ default: React.ComponentType<{ value: string; size?: number }> }>) => {
    const Component = function MockQR({ value }: { value: string; size?: number }) {
      return <div data-testid="qr-code">{value}</div>;
    };
    return Component;
  },
}));

jest.mock("@/hooks/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        "common.close": "Cerrar",
        "bookings.qrModalTitle": "Código de reserva",
        "bookings.qrModalSubtitle": "Presenta este código al llegar…",
        "bookings.qrModalDownload": "Descargar imagen",
        "bookings.qrNotAvailable": "No hay código QR para esta reserva.",
      })[key] ?? key,
  }),
}));

describe("BookingQRModal", () => {
  it("no renderiza cuando open es false", () => {
    render(
      <BookingQRModal booking={{ id: "1", qrCodeReference: "REF-1" }} open={false} onClose={jest.fn()} />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza diálogo con título y subtítulo cuando open es true", () => {
    render(
      <BookingQRModal booking={{ id: "1", qrCodeReference: "REF-1" }} open={true} onClose={jest.fn()} />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Código de reserva")).toBeInTheDocument();
    expect(screen.getByText(/presenta este código/i)).toBeInTheDocument();
  });

  it("muestra mensaje sin QR cuando booking no tiene qrCodeReference ni id", () => {
    render(<BookingQRModal booking={{}} open={true} onClose={jest.fn()} />);
    expect(screen.getByText("No hay código QR para esta reserva.")).toBeInTheDocument();
  });

  it("muestra placa y datos del vehículo cuando tiene booking con vehicle", () => {
    render(
      <BookingQRModal
        booking={{
          id: "1",
          qrCodeReference: "REF-1",
          vehicle: { plate: "ABC-123", brand: "Toyota", model: "Corolla" },
          parking: { name: "Parqueo Central" },
        }}
        open={true}
        onClose={jest.fn()}
      />
    );
    expect(screen.getByText(/ABC-123/)).toBeInTheDocument();
    expect(screen.getByText(/Toyota.*Corolla/)).toBeInTheDocument();
    expect(screen.getByText("Parqueo Central")).toBeInTheDocument();
  });

  it("llama onClose al hacer clic en Cerrar", () => {
    const onClose = jest.fn();
    render(
      <BookingQRModal booking={{ id: "1", qrCodeReference: "REF-1" }} open={true} onClose={onClose} />
    );
    const closeButtons = screen.getAllByRole("button", { name: /cerrar/i });
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
