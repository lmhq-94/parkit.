"use client";

import type React from "react";
import { DateTimePickerField } from "@/components/DateTimePickerField";

interface DateTimeCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  stopEditing?: (preventFocus?: boolean) => void;
  /** If true, cannot select dates/times earlier than now (e.g. scheduled entry). */
  minNow?: boolean;
}

/**
 * Cell editor that reuses the form's DateTimePickerField,
 * to have the same date/time picker UX inside the table.
 */
export function DateTimeCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  stopEditing: _stopEditing,
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
