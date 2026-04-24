"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/lib/toastStore";

interface FormattedInputCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  /** Function to format the value while typing (e.g. formatPlate). */
  format?: (value: string) => string;
  stopEditing?: (preventFocus?: boolean) => void;
  /** If it returns a string, the editor does not close and the message (toast) is shown. */
  validator?: (value: unknown) => string | null;
}

/**
 * Cell editor with input that applies a formatting function while typing.
 */
export function FormattedInputCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  format,
  stopEditing,
  validator,
}: FormattedInputCellEditorProps) {
  const initial = String(valueProp ?? initialValue ?? "");
  const [localValue, setLocalValue] = useState(format ? format(initial) : initial);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showError } = useToast();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = format ? format(raw) : raw;
    setLocalValue(formatted);
    onValueChange(formatted === "" ? null : formatted);
  };

  const tryStop = () => {
    const valueToValidate = localValue.trim() === "" ? null : localValue.trim();
    const err = validator ? validator(valueToValidate) : null;
    if (err) {
      showError(err);
      return;
    }
    stopEditing?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      tryStop();
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
        onBlur={tryStop}
        className="w-full h-full px-2 text-text-primary text-sm outline-none"
      />
    </div>
  );
}
