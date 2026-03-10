"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toTitleCase } from "@/lib/inputMasks";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { CatalogComboCellEditor } from "./CatalogComboCellEditor";
import { FormattedInputCellEditor } from "./FormattedInputCellEditor";

type CatalogMake = { id: number; name: string };
type CatalogModel = { id: number; name: string };

interface RowData {
  brand?: string;
  model?: string;
  year?: number;
}

interface BrandModelCatalogCellEditorProps {
  value?: string | null;
  initialValue?: string | null;
  onValueChange: (value: string | null) => void;
  catalogType: "make" | "model";
  data?: RowData | null;
  stopEditing?: (preventFocus?: boolean) => void;
}

/**
 * Editor de celda para marca/modelo: catálogo + opción de escribir manualmente.
 */
export function BrandModelCatalogCellEditor({
  value: valueProp,
  initialValue,
  onValueChange,
  catalogType,
  data,
  stopEditing,
}: BrandModelCatalogCellEditorProps) {
  const value = valueProp ?? initialValue ?? null;
  const locale = useLocaleStore((s) => s.locale);
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        if (catalogType === "make") {
          const url = data?.year != null
            ? `/vehicles/catalog/makes?year=${encodeURIComponent(data.year)}`
            : "/vehicles/catalog/makes";
          const makes = await apiClient.get<CatalogMake[]>(url);
          if (!cancelled && Array.isArray(makes)) {
            setOptions(makes.map((m) => ({ value: m.name, label: toTitleCase(m.name) })));
          }
        } else {
          const brand = data?.brand?.trim();
          if (!brand) {
            setOptions([]);
            setLoading(false);
            return;
          }
          const params = new URLSearchParams({ make: brand });
          if (data?.year != null) params.set("year", String(data.year));
          const models = await apiClient.get<CatalogModel[]>(
            `/vehicles/catalog/models?${params.toString()}`
          );
          if (!cancelled && Array.isArray(models)) {
            setOptions(models.map((m) => ({ value: m.name, label: toTitleCase(m.name) })));
          }
        }
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [catalogType, data?.brand, data?.year]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center px-2 text-sm text-text-muted">
        {t(locale, "common.loading")}
      </div>
    );
  }

  if (catalogType === "model" && !data?.brand?.trim()) {
    return (
      <div className="w-full h-full flex items-center px-2 text-sm text-text-muted">
        {t(locale, "vehicles.selectBrandFirst")}
      </div>
    );
  }

  if (catalogType === "model" && options.length === 0) {
    return (
      <FormattedInputCellEditor
        value={value}
        initialValue={initialValue}
        onValueChange={onValueChange}
        format={toTitleCase}
        stopEditing={stopEditing}
      />
    );
  }

  return (
    <CatalogComboCellEditor
      value={value}
      initialValue={initialValue}
      onValueChange={onValueChange}
      options={options}
      stopEditing={stopEditing}
    />
  );
}
