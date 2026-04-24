"use client";

import { useEffect, useState } from "react";
import { MapPin } from "@/lib/premiumIcons";
import { AddressPickerModal } from "@/components/AddressPickerModal";

interface AddressCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  stopEditing?: (preventFocus?: boolean) => void;
  /** Optional country code to filter searches (e.g. "CR"). */
  countryCode?: string;
}

/**
 * Cell editor that when opened shows the address selection modal (AddressPickerModal).
 * Used in inline editing of the parkings table for the address field.
 */
export function AddressCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  stopEditing,
  countryCode,
}: AddressCellEditorProps) {
  const initial = valueProp ?? initialValue ?? "";
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        stopEditing?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, stopEditing]);

  const handleSelect = (address: string) => {
    onValueChange(address || null);
    setOpen(false);
    stopEditing?.();
  };

  const handleClose = () => {
    setOpen(false);
    stopEditing?.();
  };

  return (
    <div className="w-full h-full flex items-center px-2">
      <AddressPickerModal
        open={open}
        onClose={handleClose}
        onSelect={handleSelect}
        initialValue={typeof initial === "string" ? initial : ""}
        countryCode={countryCode}
      />
      <span className="inline-flex items-center gap-2 text-sm text-text-muted truncate">
        <MapPin className="w-4 h-4 shrink-0" />
        {typeof initial === "string" && initial ? initial : "—"}
      </span>
    </div>
  );
}
