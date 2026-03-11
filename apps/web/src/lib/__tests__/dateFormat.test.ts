import { formatDateTimeDisplay } from "../dateFormat";

describe("formatDateTimeDisplay", () => {
  const t = (key: string) => {
    const months: Record<string, string> = {
      "datepicker.month0": "Enero",
      "datepicker.month1": "Febrero",
      "datepicker.month2": "Marzo",
      "datepicker.month3": "Abril",
      "datepicker.month4": "Mayo",
      "datepicker.month5": "Junio",
      "datepicker.month6": "Julio",
      "datepicker.month7": "Agosto",
      "datepicker.month8": "Septiembre",
      "datepicker.month9": "Octubre",
      "datepicker.month10": "Noviembre",
      "datepicker.month11": "Diciembre",
      "datepicker.am": "AM",
      "datepicker.pm": "PM",
    };
    return months[key] ?? key;
  };

  it("formatea fecha y hora en español (12h)", () => {
    // 30 Diciembre 2028, 2:30 PM
    const date = new Date(2028, 11, 30, 14, 30, 0);
    expect(formatDateTimeDisplay(date, t)).toBe("30 Diciembre 2028, 2:30 PM");
  });

  it("medianoche se muestra como 12 AM", () => {
    const date = new Date(2025, 0, 1, 0, 0, 0);
    expect(formatDateTimeDisplay(date, t)).toBe("01 Enero 2025, 12:00 AM");
  });

  it("mediodía se muestra como 12 PM", () => {
    const date = new Date(2025, 0, 1, 12, 0, 0);
    expect(formatDateTimeDisplay(date, t)).toContain("12:00 PM");
  });
});
