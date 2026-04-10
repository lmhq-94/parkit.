"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, ValueGetterParams, ValueSetterParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/app/ag-grid-parkit-overrides.css";
import { Check, ChevronDown, ChevronRight, Eye, Pencil, Plus, Trash, XCircle, Search, Download, Copy, Share2, Filter } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore, useDashboardStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import type { TranslateFn } from "@/lib/validation";
import { useToast } from "@/lib/toastStore";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { SelectCellEditor } from "@/components/SelectCellEditor";
import { MultiSelectCellEditor } from "@/components/MultiSelectCellEditor";
import { FormattedInputCellEditor } from "@/components/FormattedInputCellEditor";
import { BrandModelCatalogCellEditor } from "@/components/BrandModelCatalogCellEditor";
import { AddressCellEditor } from "@/components/AddressCellEditor";
import { DateTimeCellEditor } from "@/components/DateTimeCellEditor";
import { PageLoader } from "@/components/PageLoader";

ModuleRegistry.registerModules([AllCommunityModule]);

export type StatusBadgeVariant =
  | "company"
  | "user"
  | "valet"
  | "booking"
  | "ticket"
  | "notification";

type TableColumn<T> = {
  header: string;
  render: (item: T) => string | number | boolean | null | undefined;
  /** Campo en el objeto row para edición inline. Si se usa con editable: true, la celda es editable. Para rutas anidadas usar valueGetter/valueSetter. */
  field?: (keyof T & string) | string;
  /** Si true y field está definido, la celda es editable. Puede ser función (row) => boolean para condicional. */
  editable?: boolean | ((row: T) => boolean);
  /** Valores para dropdown (raw, para API). Si se define con editable, la celda usa select en lugar de input. */
  cellEditorValues?: string[];
  /** Etiquetas traducidas para el dropdown (mismo orden que cellEditorValues). Si no se define, se muestran los valores crudos. */
  cellEditorLabels?: string[];
  /** Si true, usa MultiSelectCellEditor con cellEditorOptions. Valor almacenado como string separado por valueSeparator. */
  cellEditorMultiSelect?: boolean;
  /** Opciones para multi-select [{ value, label }]. Requiere cellEditorMultiSelect. */
  cellEditorOptions?: Array<{ value: string; label: string }>;
  /** Separador para valores en multi-select (default: ", "). */
  cellEditorValueSeparator?: string;
  /** Función para formatear el input mientras se escribe (ej. formatPlate). Si se define, usa FormattedInputCellEditor. */
  cellEditorInputFormat?: (value: string) => string;
  /** Si true, usa el mismo selector de fecha/hora que los formularios para edición inline. */
  cellEditorDateTime?: boolean;
  /** Si true y cellEditorDateTime, no se permiten fechas/horas anteriores a ahora (ej. entrada programada). */
  cellEditorDateTimeMinNow?: boolean;
  /** "make" | "model" para dropdown de catálogo de vehículos (marca/modelo). Carga opciones desde API. */
  cellEditorCatalogType?: "make" | "model";
  /** Si true, al editar la celda se abre el modal AddressPickerModal para elegir dirección en mapa. */
  cellEditorAddress?: boolean;
  /** Código de país para el selector de dirección (ej. "CR"). Opcional. */
  cellEditorAddressCountryCode?: string;
  /** Si se define, la columna de estado se muestra con color y punto indicador (minimalista). */
  statusBadge?: StatusBadgeVariant;
  /** Campo para leer el valor crudo del estado (ej. "status", "currentStatus", "isActive"). Por defecto "status". */
  statusField?: keyof T & string;
  /** Para editores select: devuelve estilo (text + dot) por valor, así la celda en edición mantiene el mismo look. Si no se pasa, se usa statusBadge cuando existe. */
  getStatusStyle?: (value: string) => { text: string; dot: string };
  /** Validación para edición inline: recibe valor y t; devuelve mensaje de error o null si es válido. */
  validator?: (value: unknown, t: TranslateFn) => string | null;
  /** Renderer personalizado para la celda (ej. iconos). Si se define, se usa en lugar del texto de render(). */
  cellRenderer?: React.ComponentType<ICellRendererParams<T> & Record<string, unknown>>;
  /** Parámetros adicionales para cellRenderer. */
  cellRendererParams?: Record<string, unknown>;
  /** Ancho fijo o límites de ancho de la columna (opcional). */
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Si es "email" o "phone", la celda se muestra como enlace mailto: o tel: al hacer clic. */
  linkType?: "email" | "phone";
  /** Getter personalizado para el valor (ej. convertir boolean a "true"/"false" para select). */
  valueGetter?: (data: T) => unknown;
  /** Setter personalizado al editar (ej. convertir "true"/"false" a boolean). */
  valueSetter?: (data: T, value: unknown) => void;
};

const STATUS_TEXT_STYLES: Record<string, { text: string; dot: string }> = {
  success: { text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  warning: { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  error: { text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
  muted: { text: "text-company-tertiary", dot: "bg-company-tertiary" },
  info: { text: "text-company-primary", dot: "bg-company-primary" },
};

function getStatusBadgeVariant(
  type: StatusBadgeVariant,
  value: string | boolean | null | undefined
): string {
  const v = value === true ? "true" : value === false ? "false" : String(value ?? "");
  switch (type) {
    case "company":
      if (v === "ACTIVE") return "success";
      if (v === "PENDING" || v === "SUSPENDED") return "warning";
      if (v === "INACTIVE") return "error";
      return "muted";
    case "user":
      return value === true ? "success" : "error";
    case "valet":
      if (v === "AVAILABLE") return "success";
      if (v === "BUSY") return "warning";
      if (v === "AWAY") return "muted";
      return "muted";
    case "booking":
      if (v === "CONFIRMED" || v === "CHECKED_IN") return "success";
      if (v === "PENDING") return "warning";
      if (v === "CANCELLED" || v === "NO_SHOW") return "error";
      return "muted";
    case "ticket":
      if (v === "PARKED" || v === "REQUEST_PARKING" || v === "REQUEST_DELIVERY") return "info";
      if (v === "DELIVERED") return "success";
      if (v === "CANCELLED") return "error";
      return "muted";
    case "notification":
      if (v === "DELIVERED" || v === "READ") return "success";
      if (v === "SENT") return "info";
      if (v === "FAILED") return "error";
      return "muted";
    default:
      return "muted";
  }
}

function StatusCellRenderer<T>(
  params: ICellRendererParams<T> & {
    getLabel: (data: T) => string;
    statusType: StatusBadgeVariant;
    getValue: (data: T) => string | boolean | null | undefined;
  }
) {
  const { data, getLabel, statusType, getValue } = params;
  if (data == null) return null;
  const label = getLabel(data);
  const raw = getValue(data);
  const variant = getStatusBadgeVariant(statusType, raw);
  const style = (STATUS_TEXT_STYLES[variant] ?? STATUS_TEXT_STYLES.muted) as {
    text: string;
    dot: string;
  };
  return (
    <span className={`inline-flex items-center gap-2 text-sm ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      {label || "—"}
    </span>
  );
}

function LinkCellRenderer(
  params: ICellRendererParams & { linkType: "email" | "phone" }
) {
  const value = params.value != null ? String(params.value).trim() : "";
  const isEmpty = !value || value === "N/A" || value === "—";
  if (isEmpty) return <span className="text-company-tertiary">—</span>;
  const href = params.linkType === "email" ? `mailto:${value}` : `tel:${value}`;
  return (
    <a
      href={href}
      className="text-company-primary hover:underline truncate block"
      title={params.linkType === "email" ? value : value}
    >
      {value}
    </a>
  );
}

type DetailRow<T> = { __detail: true; __parent: T };

/**
 * Altura inicial antes de medir: debe ser >0 para que el contenido no quede recortado.
 * Tras el primer layout, ResizeObserver + medición “ajustada” fijan la altura real por fila/grid.
 */
const DETAIL_ROW_FALLBACK_HEIGHT = 220;
const DETAIL_ROW_MEASURE_BUFFER_PX = 10;

/**
 * Altura visual desde la parte superior del root hasta el borde inferior más bajo del contenido
 * (cada grid tiene distinto DOM en renderRowDetail; esto evita scrollHeight inflado por stretch del grid).
 */
function measureTightDetailHeight(root: HTMLElement): number {
  const rootTop = root.getBoundingClientRect().top;
  let maxBottom = rootTop;
  const walk = (node: Element) => {
    const el = node as HTMLElement;
    const r = el.getBoundingClientRect();
    if (r.width > 0 || r.height > 0) {
      maxBottom = Math.max(maxBottom, r.bottom);
    }
    for (const c of el.children) walk(c);
  };
  for (const c of root.children) walk(c);
  const h = maxBottom - rootTop;
  const rootBox = root.getBoundingClientRect().height;
  const merged = Math.max(h, rootBox, root.offsetHeight, root.scrollHeight);
  if (merged <= 0) {
    return Math.max(1, Math.ceil(rootBox));
  }
  return Math.max(1, Math.ceil(merged));
}

function DetailRowMeasureWrapper({
  children,
  onMeasured,
  trimPx = 0,
}: {
  children: React.ReactNode;
  onMeasured: (height: number) => void;
  /** Resta fina (píxeles) tras medir; cada página puede pasar un extra vía DashboardDataTablePage.detailRowHeightTrimPx */
  trimPx?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMeasuredRef = useRef(onMeasured);
  const trimRef = useRef(trimPx);
  onMeasuredRef.current = onMeasured;
  trimRef.current = trimPx;

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      // offsetHeight / border box del contenedor: incluye padding interno del panel (additional info)
      const layoutH = Math.max(
        el.scrollHeight,
        el.offsetHeight,
        Math.ceil(el.getBoundingClientRect().height),
        measureTightDetailHeight(el)
      );
      // Add a small safety buffer to avoid clipping descenders/bottom spacing due to sub-pixel rounding.
      const trimmed = Math.max(
        1,
        Math.ceil(layoutH) + DETAIL_ROW_MEASURE_BUFFER_PX - trimRef.current
      );
      onMeasuredRef.current(trimmed);
    };

    measure();
    const t1 = requestAnimationFrame(() => {
      requestAnimationFrame(measure);
    });

    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(t1);
    }

    let raf: number | null = null;
    const ro = new ResizeObserver(() => {
      if (raf != null) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = null;
        measure();
      });
    });
    ro.observe(el, { box: "border-box" });
    return () => {
      cancelAnimationFrame(t1);
      ro.disconnect();
      if (raf != null) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- medición vía ResizeObserver al mutar el DOM del detalle
  }, []);

  return (
    <div ref={ref} className="w-full min-h-0 h-fit overflow-visible parkit-grid-detail-measure parkit-grid-detail-root">
      {children}
    </div>
  );
}

function ExpandCellRenderer<T extends { id?: string | number }>(
  params: ICellRendererParams<T> & {
    expandedRowId: string | number | null;
    onToggle: (id: string | number | null) => void;
    expandLabel: string;
    collapseLabel: string;
    hasRowDetail?: (row: T) => boolean;
  }
) {
  const { data, expandedRowId, onToggle, expandLabel, collapseLabel, hasRowDetail } = params;
  if (!data) return null;
  if ((data as unknown as { __detail?: boolean }).__detail) return null;
  if ((data as unknown as { __isNew?: boolean }).__isNew) return null;
  if (hasRowDetail != null && !hasRowDetail(data)) return null;
  const id = data.id;
  if (id == null) return null;
  const isExpanded = expandedRowId === id;
  return (
    <button
      type="button"
      onClick={() => onToggle(isExpanded ? null : id)}
      className="p-2 rounded-lg text-text-muted hover:text-company-primary hover:bg-company-primary-subtle transition-colors"
      title={isExpanded ? collapseLabel : expandLabel}
      aria-label={isExpanded ? collapseLabel : expandLabel}
      aria-expanded={isExpanded}
    >
      {isExpanded ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
    </button>
  );
}

interface DashboardDataTablePageProps<T> {
  title: string;
  description: string;
  endpoint: string | ((userId: string) => string);
  fetchData?: (userId: string) => Promise<T[] | T | null | undefined>;
  columns: Array<TableColumn<T>>;
  emptyMessage: string;
  /** Contenido opcional entre el header y la tabla (ej. filtros, tabs) */
  toolbar?: React.ReactNode;
  /** Contenido opcional alineado a la derecha de la barra (ej. include inactives) */
  toolbarRight?: React.ReactNode;
  /** Acción opcional en el header (ej. botón "Nueva empresa") */
  headerAction?: React.ReactNode;
  /** Fuerza recargar los datos cuando cambia */
  refreshToken?: number;
  /** Callback al hacer clic en Editar (opcional). Si se pasa, se muestra el botón Editar. */
  onEdit?: (row: T) => void;
  /** Callback al hacer clic en Ver (opcional). Si se pasa junto con renderRowDetail, se ignora; usar renderRowDetail para expandir fila. */
  onView?: (row: T) => void;
  /** Contenido a mostrar al expandir la fila. Si se pasa, se muestra botón expandir en lugar del botón Ver. */
  renderRowDetail?: (row: T) => React.ReactNode;
  /** Si se pasa, solo las filas con información adicional muestran el botón expandir. Por defecto todas son expandibles. */
  hasRowDetail?: (row: T) => boolean;
  /**
   * Píxeles a restar de la altura medida del panel “Additional info” (por grid).
   * Cada tabla tiene distinto contenido; si tras el layout automático queda un pelo de más, sube el valor (p. ej. 2–4).
   * Valores negativos añaden altura si el detalle se recorta.
   */
  detailRowHeightTrimPx?: number;
  /** Callback al hacer clic en Eliminar (opcional). Si se pasa, se muestra el botón Eliminar. Tras eliminar se recarga la tabla. */
  onDelete?: (row: T) => void | Promise<void>;
  /** Mensaje de confirmación antes de eliminar (opcional). */
  getConfirmDeleteMessage?: (row: T) => string;
  /** Callback al editar una celda inline. Se llama con la fila actualizada tras cambiar el valor. Requerido para columnas editable. */
  onUpdate?: (row: T) => void | Promise<void>;
  /** Callback para crear un registro nuevo (opcional). Si se pasa, se muestra el botón Agregar y una fila editable temporal. */
  onCreate?: (draft: Partial<T>) => void | Promise<void>;
  /** Botones de acción extra en la columna Actions (icono, etiqueta, onClick por fila). */
  customActions?: Array<{ icon: React.ReactNode; label: string; onClick: (row: T) => void }>;
}

function ActionsCellRenderer<T extends { id?: string | number }>(
  params: ICellRendererParams<T> & {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  /** Al hacer clic en Eliminar se llama esto (abre modal en el padre). */
  onRequestDelete?: (row: T) => void;
  viewLabel: string;
  editLabel: string;
  deleteLabel: string;
  saveLabel: string;
  cancelLabel: string;
  /** Si está definido, se usa expand en lugar del botón Ver. */
  renderRowDetail?: (row: T) => React.ReactNode;
  /** Si está definido, al hacer clic en Editar se abre la primera celda editable de la fila. */
  firstEditableColId?: string;
  /** Crear/Cancelar creación para filas temporales */
  onCreate?: (draft: Partial<T>) => void | Promise<void>;
  onCancelCreate?: () => void;
  /** Acciones extra (ej. Ver QR) */
  customActions?: Array<{ icon: React.ReactNode; label: string; onClick: (row: T) => void }>;
  }
) {
  const { data, onView, onEdit, onRequestDelete, viewLabel, editLabel, deleteLabel, saveLabel, cancelLabel, firstEditableColId, onCreate, onCancelCreate, renderRowDetail, customActions } = params;
  const [saving, setSaving] = useState(false);

  if (!data) return null;
  const isNew = Boolean((data as unknown as { __isNew?: boolean }).__isNew);
  const hasView = !isNew && typeof onView === "function" && renderRowDetail == null;
  const hasEdit = !isNew && (typeof onEdit === "function" || firstEditableColId != null);
  const hasDelete = typeof onRequestDelete === "function";
  const hasCreate = isNew && typeof onCreate === "function";
  const hasCustomActions = !isNew && Array.isArray(customActions) && customActions.length > 0;

  const handleEdit = () => {
    if (typeof onEdit === "function") {
      onEdit(data);
    } else if (firstEditableColId != null && params.api != null && params.node?.rowIndex != null) {
      params.api.startEditingCell({ rowIndex: params.node.rowIndex, colKey: firstEditableColId });
    }
  };

  const handleSave = async () => {
    if (!hasCreate) return;
    setSaving(true);
    try {
      const draft = { ...(data as unknown as Record<string, unknown>) };
      delete (draft as { __isNew?: boolean }).__isNew;
      await onCreate?.(draft as Partial<T>);
    } finally {
      setSaving(false);
    }
  };

  if (!hasView && !hasEdit && !hasDelete && !hasCreate && !hasCustomActions) return null;

  return (
    <div className="flex items-center justify-center gap-1 h-full">
      {hasCreate && (
        <>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="p-2 rounded-lg text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
            title={saveLabel}
            aria-label={saveLabel}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onCancelCreate?.()}
            className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title={cancelLabel}
            aria-label={cancelLabel}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </>
      )}
      {hasView && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(data);
          }}
          className="p-2 rounded-lg text-text-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
          title={viewLabel}
          aria-label={viewLabel}
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {hasCustomActions && customActions!.map((action, idx) => (
        <button
          key={idx}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(data);
          }}
          className="p-2 rounded-lg text-text-muted hover:text-company-primary hover:bg-company-primary/10 transition-colors"
          title={action.label}
          aria-label={action.label}
        >
          {action.icon}
        </button>
      ))}
      {hasEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit();
          }}
          className="p-2 rounded-lg text-text-muted hover:text-company-primary hover:bg-company-primary-subtle transition-colors"
          title={editLabel}
          aria-label={editLabel}
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {hasDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRequestDelete?.(data);
          }}
          className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title={deleteLabel}
          aria-label={deleteLabel}
        >
          <Trash className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function DashboardDataTablePage<T extends { id?: string | number }>({
  title: _title,
  description: _description,
  endpoint,
  fetchData,
  columns,
  emptyMessage,
  toolbar,
  toolbarRight,
  headerAction,
  refreshToken,
  onView,
  onEdit,
  onDelete,
  getConfirmDeleteMessage,
  onUpdate,
  onCreate,
  renderRowDetail,
  hasRowDetail,
  detailRowHeightTrimPx = 0,
  customActions,
}: DashboardDataTablePageProps<T>) {
  const { resolvedTheme } = useTheme();
  const { user } = useAuthStore();
  const selectedCompanyId = useDashboardStore((s: { selectedCompanyId: string | null }) => s.selectedCompanyId);
  const locale = useLocaleStore((s) => s.locale);
  const { showError: showToastError } = useToast();
  const [rows, setRows] = useState<T[]>([]);
  const [draftRow, setDraftRow] = useState<(T & { __isNew?: true }) | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<T | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const gridRef = useRef<AgGridReact<T>>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  // Measured detail-row heights by row id (so each grid/row adapts to its content).
  const [detailRowHeights, setDetailRowHeights] = useState<Record<string | number, number>>({});


  const getLocaleText = useCallback(
    (params: { key: string; defaultValue?: string }) => {
      const def = params.defaultValue ?? "";
      if (locale === "es" && def === "Page Size") return t(locale, "grid.pageSize");
      const key = "grid." + params.key;
      const translated = t(locale, key);
      return translated !== key ? translated : (params.defaultValue ?? params.key);
    },
    [locale]
  );

  const localeText = useMemo(() => {
    const keys = [
      "page", "to", "of", "first", "previous", "next", "last",
      "pageSize", "pageSizeLabel", "pageSizeSelectorLabel", "rowsPerPage", "pageSizeSelectLabel",
      "filterOoo", "contains", "equals", "notEqual", "startsWith", "endsWith",
      "lessThan", "greaterThan", "lessThanOrEqual", "greaterThanOrEqual",
      "inRange", "andCondition", "orCondition", "and", "or",
      "applyFilter", "resetFilter", "clearFilter", "notContains", "noRowsToShow",
      "firstPage", "lastPage", "nextPage", "previousPage",
    ] as const;
    const out: Record<string, string> = {};
    for (const k of keys) {
      const val = t(locale, "grid." + k);
      out[k] = val !== "grid." + k ? val : k;
    }
    return out;
  }, [locale]);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = fetchData
        ? await fetchData(user.id)
        : await apiClient.get<T[] | T>(typeof endpoint === "function" ? endpoint(user.id) : endpoint);
      setRows(Array.isArray(data) ? data : data ? [data] : []);
      setDraftRow(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t(locale, "common.loadError");
      setError(msg);
      showToastError(t(locale, "common.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, fetchData, user?.id, locale, showToastError]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshToken, selectedCompanyId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  /** Evita alturas cacheadas de otra fila detalle; fuerza nueva medición al expandir. */
  useEffect(() => {
    setDetailRowHeights({});
  }, [expandedRowId]);

  const handleDeleteConfirm = useCallback(
    async (row: T) => {
      setDeletingInProgress(true);
      try {
        await onDelete?.(row);
        await loadData();
      } finally {
        setDeletingInProgress(false);
        setPendingDeleteRow(null);
      }
    },
    [onDelete, loadData]
  );

  const onRequestDelete = useCallback((row: T) => {
    setPendingDeleteRow(row);
  }, []);

  const handleCreate = useCallback(
    async (draft: Partial<T>) => {
      await onCreate?.(draft);
      await loadData();
    },
    [onCreate, loadData]
  );

  const handleEditRow = useCallback(
    (row: T) => {
      if (!onEdit) return;
      setNavigating(true);
      onEdit(row);
    },
    [onEdit]
  );

  const handleCellValueChanged = useCallback(
    async (e: { data?: T | DetailRow<T> }) => {
      if (!onUpdate || !e.data) return;
      const row = e.data as T & { __isNew?: boolean };
      if (row.__isNew) return;
      try {
        await onUpdate(row);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update");
      }
    },
    [onUpdate]
  );

  const columnDefs = useMemo<ColDef<T | DetailRow<T>>[]>(() => {
    const dataCols: ColDef<T | DetailRow<T>>[] = [];
    if (renderRowDetail != null) {
      dataCols.push({
        headerName: "",
        colId: "expand",
        sortable: false,
        filter: false,
        resizable: false,
        flex: 0,
        minWidth: 44,
        maxWidth: 44,
        cellRenderer: ExpandCellRenderer,
        cellRendererParams: {
          expandedRowId,
          onToggle: setExpandedRowId,
          expandLabel: t(locale, "common.expandRow"),
          collapseLabel: t(locale, "common.collapseRow"),
          hasRowDetail: hasRowDetail ?? undefined,
        },
      } as ColDef<T>);
    }
    columns.forEach((column) => {
      const isEditable = typeof column.editable === "function" ? column.editable : column.editable;
      const hasField = Boolean(isEditable && column.field);
      const statusFieldKey = (column.statusField ?? column.field ?? "status") as keyof T & string;
      const widthProps =
        column.width != null || column.minWidth != null || column.maxWidth != null
          ? {
              ...(column.width != null && { width: column.width }),
              ...(column.minWidth != null && { minWidth: column.minWidth }),
              ...(column.maxWidth != null && { maxWidth: column.maxWidth }),
            }
          : {};
      const base: ColDef<T> = {
        headerName: column.header,
        colId: column.header,
        ...widthProps,
      };

      const badgeParams = column.statusBadge
        ? {
            cellRenderer: StatusCellRenderer,
            cellRendererParams: {
              getLabel: column.render,
              statusType: column.statusBadge,
              getValue: (data: T) =>
                (data as Record<string, unknown>)[statusFieldKey] as string | boolean | null | undefined,
            },
          }
        : {};

      if (hasField && column.field) {
        const field = column.field;
        const linkProps =
          column.linkType != null
            ? {
                cellRenderer: LinkCellRenderer,
                cellRendererParams: { linkType: column.linkType },
              }
            : {};
        const customCellForEditable =
          column.cellRenderer != null && !column.statusBadge
            ? {
                cellRenderer: column.cellRenderer,
                cellRendererParams: column.cellRendererParams ?? {},
              }
            : {};
        const cellEditorProps =
          column.cellEditorMultiSelect && column.cellEditorOptions != null && column.cellEditorOptions.length > 0
            ? {
                cellEditor: MultiSelectCellEditor,
                cellEditorParams: {
                  options: column.cellEditorOptions,
                  valueSeparator: column.cellEditorValueSeparator ?? ", ",
                },
              }
            : column.cellEditorCatalogType != null
              ? {
                  cellEditor: BrandModelCatalogCellEditor,
                  cellEditorParams: { catalogType: column.cellEditorCatalogType },
                }
              : column.cellEditorAddress === true
                ? {
                    cellEditor: AddressCellEditor,
                    cellEditorParams: {
                      countryCode: column.cellEditorAddressCountryCode,
                    },
                  }
                : column.cellEditorDateTime === true
                  ? {
                      cellEditor: DateTimeCellEditor,
                      cellEditorParams: {
                        minNow: column.cellEditorDateTimeMinNow === true,
                        ...(column.validator != null && {
                          validator: (v: unknown) => column.validator!(v, (key, vars) => t(locale, key, vars)),
                        }),
                      },
                    }
                  : column.cellEditorInputFormat != null
                    ? {
                        cellEditor: FormattedInputCellEditor,
                        cellEditorParams: {
                          format: column.cellEditorInputFormat,
                          ...(column.validator != null && {
                            validator: (v: unknown) => column.validator!(v, (key, vars) => t(locale, key, vars)),
                          }),
                        },
                      }
                    : column.cellEditorValues != null && column.cellEditorValues.length > 0
                      ? {
                          cellEditor: SelectCellEditor,
                          cellEditorParams: {
                            values: column.cellEditorValues,
                            labels: column.cellEditorLabels,
                            ...((column.getStatusStyle != null || column.statusBadge != null) && {
                              getStatusStyle: column.getStatusStyle ?? (column.statusBadge
                                ? (value: string) => {
                                    const variant = getStatusBadgeVariant(column.statusBadge!, value);
                                    return (STATUS_TEXT_STYLES[variant] ?? STATUS_TEXT_STYLES.muted) as { text: string; dot: string };
                                  }
                                : undefined),
                            }),
                            ...(column.validator != null && {
                              validator: (v: unknown) => column.validator!(v, (key, vars) => t(locale, key, vars)),
                            }),
                          },
                        }
                      : {};
        const customValueGetter =
          column.valueGetter != null
            ? (params: ValueGetterParams<T>) =>
                params.data != null ? column.valueGetter!(params.data) : undefined
            : (params: ValueGetterParams<T>) =>
                params.data != null ? (params.data as Record<string, unknown>)[field] : undefined;
        const customValueSetter =
          column.valueSetter != null
            ? (params: ValueSetterParams<T>) => {
                if (params.data != null) {
                  column.valueSetter!(params.data, params.newValue);
                }
              }
            : (params: ValueSetterParams<T>) => {
                if (params.data != null) {
                  (params.data as Record<string, unknown>)[field] = params.newValue;
                }
              };
        dataCols.push({
          ...base,
          ...badgeParams,
          ...linkProps,
          ...customCellForEditable,
          ...cellEditorProps,
          field,
          editable: (params: { data?: unknown }) => {
            const data = params.data as T & { __isNew?: boolean } | undefined;
            if (data?.__isNew) return true;
            if (!onUpdate) return false;
            const colEditable = typeof column.editable === "function" ? (data ? column.editable(data) : false) : column.editable;
            return Boolean(colEditable);
          },
          valueGetter: customValueGetter,
          valueFormatter: (params: ValueGetterParams<T>) =>
            params.data ? String(column.render(params.data) ?? "") : "",
          valueSetter: customValueSetter,
        } as unknown as ColDef<T>);
        return;
      }

      if (column.statusBadge) {
        dataCols.push({
          ...base,
          ...badgeParams,
          valueGetter: (params: ValueGetterParams<T>) =>
            params.data ? column.render(params.data) : "",
        } as unknown as ColDef<T>);
        return;
      }

      const customCell =
        column.linkType != null
          ? {
              cellRenderer: LinkCellRenderer,
              cellRendererParams: { linkType: column.linkType },
            }
          : column.cellRenderer != null
            ? {
                cellRenderer: column.cellRenderer,
                cellRendererParams: column.cellRendererParams ?? {},
              }
            : {};
      dataCols.push({
        ...base,
        ...customCell,
        valueGetter: (params: ValueGetterParams<T>) =>
          params.data ? column.render(params.data) : "",
      });
    });
    const hasEditableCols = columns.some((c) => Boolean(c.editable && c.field));
    const firstEditableColId = hasEditableCols ? columns.find((c) => c.editable && c.field)?.header : undefined;
    const hasActions =
      renderRowDetail != null ||
      onView != null ||
      onEdit != null ||
      onDelete != null ||
      onCreate != null ||
      (hasEditableCols && firstEditableColId != null);
    if (hasActions) {
      dataCols.push({
        headerName: t(locale, "common.actions"),
        colId: "actions",
        sortable: false,
        filter: false,
        resizable: false,
        flex: 0,
        minWidth: (onEdit != null || onView != null || renderRowDetail != null || (customActions?.length ?? 0) > 0) ? 145 : 110,
        maxWidth: (onEdit != null || onView != null || renderRowDetail != null || (customActions?.length ?? 0) > 0) ? 180 : 110,
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onView: onView ?? undefined,
          onEdit: onEdit ? handleEditRow : undefined,
          onRequestDelete: onDelete ? onRequestDelete : undefined,
          viewLabel: t(locale, "common.view"),
          editLabel: t(locale, "common.edit"),
          deleteLabel: t(locale, "common.delete"),
          saveLabel: t(locale, "common.save"),
          cancelLabel: t(locale, "common.cancel"),
          renderRowDetail: renderRowDetail ?? undefined,
          firstEditableColId,
          onCreate: onCreate ? handleCreate : undefined,
          onCancelCreate: () => setDraftRow(null),
          customActions: customActions ?? undefined,
        },
      });
    }
    return dataCols;
  }, [columns, locale, onView, onEdit, onDelete, onCreate, onRequestDelete, handleCreate, onUpdate, renderRowDetail, hasRowDetail, expandedRowId, customActions, handleEditRow]);

  const hasEditableColumns = useMemo(
    () => columns.some((c) => Boolean(c.editable && c.field)),
    [columns]
  );

  const firstEditableColId = useMemo(
    () => columns.find((c) => Boolean(c.editable && c.field))?.header,
    [columns]
  );

  const canCreate = Boolean(onCreate && firstEditableColId);
  const startCreate = () => {
    if (!canCreate || draftRow) return;
    setError(null);
    setDraftRow({ __isNew: true } as unknown as T & { __isNew?: true });
    // Wait for row to render before opening edit
    setTimeout(() => {
      if (firstEditableColId) {
        gridRef.current?.api?.startEditingCell({ rowIndex: 0, colKey: firstEditableColId });
      }
    }, 0);
  };

  const rowData = useMemo(() => {
    const base = draftRow ? ([draftRow as unknown as T, ...rows] as T[]) : rows;
    if (renderRowDetail == null || expandedRowId == null) return base;
    return base.flatMap((row: T) => {
      if ((row as unknown as { __isNew?: boolean }).__isNew) return [row];
      if (hasRowDetail != null && !hasRowDetail(row)) return [row];
      const id = (row as { id?: string | number }).id;
      if (id === expandedRowId)
        return [row, { __detail: true as const, __parent: row } as DetailRow<T>];
      return [row];
    });
  }, [draftRow, rows, renderRowDetail, hasRowDetail, expandedRowId]);

  // Sync rowData with grid API to avoid rows occasionally not rendering (race/hydration).
  useEffect(() => {
    const api = gridRef.current?.api as { setGridOption: (k: string, v: unknown) => void; refreshCells: (o?: { force?: boolean }) => void } | undefined;
    if (!api) return;
    api.setGridOption("rowData", rowData);
    const id = requestAnimationFrame(() => {
      api.refreshCells({ force: true });
    });
    return () => cancelAnimationFrame(id);
  }, [rowData]);

  useEffect(() => {
    if (!isMobile) return;
    const api = gridRef.current?.api as { autoSizeAllColumns?: (skipHeader?: boolean) => void } | undefined;
    if (!api?.autoSizeAllColumns) return;
    const id = requestAnimationFrame(() => {
      api.autoSizeAllColumns(false);
    });
    return () => cancelAnimationFrame(id);
  }, [isMobile, columns, rowData]);

  const fullWidthCellRenderer = useCallback(
    (params: ICellRendererParams<T | DetailRow<T>>) => {
      const data = params.data as DetailRow<T>;
      if (!data?.__detail || !data.__parent || !renderRowDetail) return null;
      const nodeId = params.node?.id as string | number | undefined;
      const content = (
        <div className="flex w-full items-stretch gap-0 mt-2 mb-1.5 min-h-0">
          <div
            className="shrink-0 w-[3px] min-h-0 self-stretch bg-gradient-to-b from-company-primary/80 via-company-primary/45 to-company-primary/15 dark:from-company-primary/60 dark:via-company-primary/35 dark:to-company-primary/10 ml-4 mr-4"
            aria-hidden
          />
          {/* Padding inferior (pb) en este bloque = aire dentro del fondo, no fuera del panel */}
          <div className="box-border min-h-0 min-w-0 flex-1 bg-slate-100/90 dark:bg-zinc-900/80 px-6 pt-4 pb-12 backdrop-blur-sm mr-3">
            <div className="min-w-0 [&_dl]:m-0 [&_dl]:grid [&_dl]:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] [&_dl]:gap-x-8 [&_dl]:gap-y-3.5 [&_dl]:text-sm [&_dl]:w-full [&_dl]:content-start [&_dl]:leading-snug [&_dl]:pb-0">
              {renderRowDetail(data.__parent)}
            </div>
          </div>
        </div>
      );
      // Measure actual height of this detail and update only that row.
      return (
        <DetailRowMeasureWrapper
          key={nodeId != null ? `detail-${String(nodeId)}` : "detail"}
          trimPx={detailRowHeightTrimPx}
          onMeasured={(height) => {
            const rowId =
              nodeId ??
              (data.__parent?.id != null ? `detail-${String(data.__parent.id)}` : undefined);
            if (rowId == null) return;
            const nextHeight = Math.max(1, Math.ceil(height));
            params.node?.setRowHeight(nextHeight);
            params.api?.onRowHeightChanged();
            setDetailRowHeights((prev) => {
              const prevHeight = prev[rowId];
              if (prevHeight === nextHeight) return prev;
              return { ...prev, [rowId]: nextHeight };
            });
          }}
        >
          {content}
        </DetailRowMeasureWrapper>
      );
    },
    [renderRowDetail, detailRowHeightTrimPx]
  );

  const isFullWidthRow = useCallback(
    (params: { rowNode?: { data?: T | DetailRow<T> } }) =>
      (params.rowNode?.data as DetailRow<T>)?.__detail === true,
    []
  );

  const getRowId = useCallback(
    (params: { data?: T | DetailRow<T>; rowIndex?: number }) => {
      const d = params.data;
      if (!d) return String(params.rowIndex ?? 0);
      if ((d as DetailRow<T>).__detail)
        return `detail-${(d as DetailRow<T>).__parent?.id ?? params.rowIndex}`;
      if ((d as unknown as { __isNew?: boolean }).__isNew) return "draft";
      return String((d as T & { id?: string | number }).id ?? params.rowIndex);
    },
    []
  );

  const getRowHeight = useCallback(
    (params: { data?: T | DetailRow<T>; node?: { id?: string | number } }) => {
      const data = params.data as DetailRow<T> | undefined;
      if (!data || data.__detail !== true) return 44;
      const id = params.node?.id;
      if (id == null) return DETAIL_ROW_FALLBACK_HEIGHT;
      return detailRowHeights[id] ?? DETAIL_ROW_FALLBACK_HEIGHT;
    },
    [detailRowHeights]
  );

  const getRowClass = useCallback(
    (params: { data?: T | DetailRow<T> }) => {
      if (!renderRowDetail) return undefined;
      const d = params.data as DetailRow<T> | undefined;
      if (d && d.__detail) return "parkit-grid-detail-fullwidth-row";
      return undefined;
    },
    [renderRowDetail]
  );

  const getRowStyle = useCallback(
    (params: { data?: T | DetailRow<T> }) => {
      if (!renderRowDetail) return undefined;
      const d = params.data as DetailRow<T> | undefined;
      if (!d || !d.__detail) return undefined;
      return {
        marginBottom: 0,
        paddingBottom: 0,
        borderBottom: "none",
      } as const;
    },
    [renderRowDetail]
  );

  const showAddInBar = onCreate != null && canCreate;
  const addButtonNode =
    headerAction ??
    (showAddInBar ? (
      <button
        type="button"
        onClick={startCreate}
        disabled={draftRow != null}
        className="inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg bg-company-primary text-white text-sm font-medium hover:bg-company-primary focus:outline-none focus:ring-2 focus:ring-company-primary focus:ring-offset-2 focus:ring-offset-page transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        <Plus className="w-4 h-4" strokeWidth={2.25} />
        {t(locale, "common.add")}
      </button>
    ) : null);

  return (
    <div className="flex-1 flex flex-col min-h-0 pt-6 md:pt-8 px-4 md:px-10 lg:px-12 pb-4 md:pb-10 lg:pb-12 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:flex-nowrap gap-3 mb-4">
              <div className="flex-1 min-w-0 overflow-x-auto">
                <div className="inline-flex items-center gap-3 min-w-full">
                  {toolbar}
                  <div className="relative hidden md:block min-w-[220px] w-full max-w-[320px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    <input
                      type="text"
                      value={quickFilter}
                      onChange={(e) => setQuickFilter(e.target.value)}
                      placeholder={t(locale, "grid.filterOoo")}
                      className="w-full min-h-[42px] pl-9 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-1 focus:ring-company-primary focus:border-company-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 md:ml-auto w-full md:w-auto">
                <div className="relative flex-1 md:hidden">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <input
                    type="text"
                    value={quickFilter}
                    onChange={(e) => setQuickFilter(e.target.value)}
                    placeholder={t(locale, "grid.filterOoo")}
                    className="w-full min-h-[42px] pl-9 pr-4 py-3 rounded-lg border border-input-border bg-input-bg text-sm text-text-primary placeholder:text-text-muted transition-colors focus:outline-none focus:ring-1 focus:ring-company-primary focus:border-company-primary"
                  />
                </div>
                {(toolbarRight != null || addButtonNode != null) && (
                  <div className="flex items-center gap-3 shrink-0">
                    {toolbarRight}
                    {addButtonNode}
                  </div>
                )}
              </div>
            </div>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl">
                <span className="font-medium">{error}</span>
              </div>
            )}

            {isLoading || navigating ? (
              <div className="flex items-center justify-center flex-1 min-h-[200px]">
                <PageLoader />
              </div>
            ) : (
              <div className="relative flex-1 flex flex-col min-h-[400px] bg-transparent">
                <div className={`ag-theme-quartz ag-theme-parkit flex-1 min-h-0 w-full ${resolvedTheme === "dark" ? "ag-theme-quartz-dark" : ""}`}>
                  <AgGridReact<T | DetailRow<T>>
                    key={locale}
                    theme="legacy"
                    ref={gridRef as React.RefObject<AgGridReact<T | DetailRow<T>>>}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    embedFullWidthRows={Boolean(renderRowDetail)}
                    getRowClass={renderRowDetail ? getRowClass : undefined}
                    getRowStyle={renderRowDetail ? getRowStyle : undefined}
                    quickFilterText={quickFilter || undefined}
                    defaultColDef={{
                      sortable: true,
                      filter: false,
                      resizable: true,
                      flex: isMobile ? undefined : 1,
                      minWidth: isMobile ? 180 : 140,
                    }}
                    alwaysShowHorizontalScroll={isMobile}
                    overlayNoRowsTemplate={`<div class="flex flex-col items-center justify-center text-company-tertiary"><svg class="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><span>${emptyMessage}</span></div>`}
                    pagination
                    paginationPageSize={20}
                    animateRows={false}
                    suppressCellFocus={!hasEditableColumns}
                    singleClickEdit={hasEditableColumns}
                    getRowHeight={renderRowDetail ? getRowHeight : undefined}
                    rowHeight={renderRowDetail ? undefined : 44}
                    headerHeight={48}
                    localeText={localeText}
                    getLocaleText={getLocaleText}
                    onCellValueChanged={handleCellValueChanged}
                    getRowId={renderRowDetail ? getRowId : undefined}
                    isFullWidthRow={renderRowDetail ? isFullWidthRow : undefined}
                    fullWidthCellRenderer={renderRowDetail ? fullWidthCellRenderer : undefined}
                  />
                </div>
              </div>
            )}

      <ConfirmDeleteModal
        open={pendingDeleteRow != null}
        title={t(locale, "common.confirmDeleteTitle")}
        message={pendingDeleteRow != null ? (getConfirmDeleteMessage?.(pendingDeleteRow) ?? t(locale, "common.confirmDelete")) : ""}
        confirmLabel={t(locale, "common.delete")}
        cancelLabel={t(locale, "common.cancel")}
        onConfirm={pendingDeleteRow != null ? () => handleDeleteConfirm(pendingDeleteRow) : () => {}}
        onCancel={() => setPendingDeleteRow(null)}
        loading={deletingInProgress}
      />
    </div>
  );
}
