/**
 * Formato de fecha y hora igual al de DateTimePickerField:
 * "30 Diciembre 2028, 2:30 PM" (día, nombre del mes, año, hora en 12h con AM/PM).
 */
function hour24To12(h24: number): { hour12: number; ampm: "AM" | "PM" } {
  if (h24 === 0) return { hour12: 12, ampm: "AM" };
  if (h24 < 12) return { hour12: h24, ampm: "AM" };
  if (h24 === 12) return { hour12: 12, ampm: "PM" };
  return { hour12: h24 - 12, ampm: "PM" };
}

export function formatDateTimeDisplay(
  date: Date,
  t: (key: string) => string
): string {
  const monthNames = Array.from({ length: 12 }, (_, i) => t(`datepicker.month${i}`));
  const datePart = `${String(date.getDate()).padStart(2, "0")} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  const { hour12, ampm } = hour24To12(date.getHours());
  const timePart = `${hour12}:${String(date.getMinutes()).padStart(2, "0")} ${t(ampm === "AM" ? "datepicker.am" : "datepicker.pm")}`;
  return `${datePart}, ${timePart}`;
}
