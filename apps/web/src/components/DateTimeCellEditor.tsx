"use client";

import type React from "react";
import { DateTimePickerField } from "@/components/DateTimePickerField";

interface DateTimeCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  stopEditing?: (preventFocus?: boolean) => void;
  /** Si true, no se pueden elegir fechas/horas anteriores a ahora (ej. scheduled entry). */
  minNow?: boolean;
}

/**
 * Editor de celda que reutiliza el DateTimePickerField del formulario,
 * para tener la misma UX de selector de fecha y hora dentro de la tabla.
 */
export function DateTimeCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  stopEditing,
  minNow,
}: DateTimeCellEditorProps) {
  const current = (valueProp ?? initialValue ?? "") as string;

  const handleChange = (next: string) => {
    onValueChange(next || null);
  };

  return (
    <div className="w-full h-full flex items-center">
      <DateTimePickerField
        value={current}
        onChange={handleChange}
        autoOpenOnMount
        variant="inline"
        min={minNow ? new Date().toISOString() : undefined}
      />
    </div>
  );
}

