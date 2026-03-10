"use client";

import { useEffect, useRef, useState } from "react";

interface FormattedInputCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  /** Función para formatear el valor mientras se escribe (ej. formatPlate). */
  format?: (value: string) => string;
  stopEditing?: (preventFocus?: boolean) => void;
}

/**
 * Editor de celda con input que aplica una función de formato al escribir.
 */
export function FormattedInputCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  format,
  stopEditing,
}: FormattedInputCellEditorProps) {
  const initial = String(valueProp ?? initialValue ?? "");
  const [localValue, setLocalValue] = useState(format ? format(initial) : initial);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = format ? format(raw) : raw;
    setLocalValue(formatted);
    onValueChange(formatted === "" ? null : formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      stopEditing?.();
    }
    if (e.key === "Escape") {
      stopEditing?.();
    }
  };

  return (
    <div className="w-full h-full flex items-center">
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => stopEditing?.()}
        className="w-full h-full px-2 text-text-primary text-sm outline-none"
      />
    </div>
  );
}
