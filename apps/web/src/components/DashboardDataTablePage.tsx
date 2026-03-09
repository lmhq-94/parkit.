"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useHeaderAction } from "@/app/dashboard/layout";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, ValueGetterParams, ValueSetterParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/app/ag-grid-parkit-overrides.css";
import { Check, ChevronDown, ChevronRight, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

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
  /** Campo en el objeto row para edición inline. Si se usa con editable: true, la celda es editable. */
  field?: keyof T & string;
  /** Si true y field está definido, la celda es editable directamente en el grid. */
  editable?: boolean;
  /** Si se define, la columna de estado se muestra con color y punto indicador (minimalista). */
  statusBadge?: StatusBadgeVariant;
  /** Campo para leer el valor crudo del estado (ej. "status", "currentStatus", "isActive"). Por defecto "status". */
  statusField?: keyof T & string;
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
};

const STATUS_TEXT_STYLES: Record<string, { text: string; dot: string }> = {
  success: { text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  warning: { text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  error: { text: "text-red-600 dark:text-red-400", dot: "bg-red-500" },
  muted: { text: "text-slate-500 dark:text-slate-400", dot: "bg-slate-400" },
  info: { text: "text-sky-600 dark:text-sky-400", dot: "bg-sky-500" },
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
      if (v === "PARKED" || v === "REQUESTED") return "info";
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
  const style = STATUS_TEXT_STYLES[variant] ?? STATUS_TEXT_STYLES.muted;
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
  if (isEmpty) return <span className="text-slate-400">—</span>;
  const href = params.linkType === "email" ? `mailto:${value}` : `tel:${value}`;
  return (
    <a
      href={href}
      className="text-sky-600 dark:text-sky-400 hover:underline truncate block"
      title={params.linkType === "email" ? value : value}
    >
      {value}
    </a>
  );
}

type DetailRow<T> = { __detail: true; __parent: T };

const DETAIL_ROW_MIN_HEIGHT = 100;

function DetailRowMeasureWrapper({
  children,
  onMeasured,
}: {
  children: React.ReactNode;
  onMeasured: (height: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const height = Math.max(el.scrollHeight, el.getBoundingClientRect().height);
    onMeasured(Math.max(DETAIL_ROW_MIN_HEIGHT, Math.ceil(height)));
  }, [onMeasured]);
  return <div ref={ref}>{children}</div>;
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
      className="p-2 rounded-lg text-text-muted hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
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
  /** Callback al hacer clic en Eliminar (opcional). Si se pasa, se muestra el botón Eliminar. Tras eliminar se recarga la tabla. */
  onDelete?: (row: T) => void | Promise<void>;
  /** Mensaje de confirmación antes de eliminar (opcional). */
  getConfirmDeleteMessage?: (row: T) => string;
  /** Callback al editar una celda inline. Se llama con la fila actualizada tras cambiar el valor. Requerido para columnas editable. */
  onUpdate?: (row: T) => void | Promise<void>;
  /** Callback para crear un registro nuevo (opcional). Si se pasa, se muestra el botón Agregar y una fila editable temporal. */
  onCreate?: (draft: Partial<T>) => void | Promise<void>;
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
  }
) {
  const { data, onView, onEdit, onRequestDelete, viewLabel, editLabel, deleteLabel, saveLabel, cancelLabel, firstEditableColId, onCreate, onCancelCreate, renderRowDetail } = params;
  const [saving, setSaving] = useState(false);

  if (!data) return null;
  const isNew = Boolean((data as unknown as { __isNew?: boolean }).__isNew);
  const hasView = !isNew && typeof onView === "function" && renderRowDetail == null;
  const hasEdit = !isNew && (typeof onEdit === "function" || firstEditableColId != null);
  const hasDelete = typeof onRequestDelete === "function";
  const hasCreate = isNew && typeof onCreate === "function";

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

  if (!hasView && !hasEdit && !hasDelete && !hasCreate) return null;

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
            <X className="w-4 h-4" />
          </button>
        </>
      )}
      {hasView && (
        <button
          type="button"
          onClick={() => onView!(data)}
          className="p-2 rounded-lg text-text-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
          title={viewLabel}
          aria-label={viewLabel}
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {hasEdit && (
        <button
          type="button"
          onClick={handleEdit}
          className="p-2 rounded-lg text-text-muted hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
          title={editLabel}
          aria-label={editLabel}
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {hasDelete && (
        <button
          type="button"
          onClick={() => onRequestDelete?.(data)}
          className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
          title={deleteLabel}
          aria-label={deleteLabel}
        >
          <Trash2 className="w-4 h-4" />
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
}: DashboardDataTablePageProps<T>) {
  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  const [rows, setRows] = useState<T[]>([]);
  const [draftRow, setDraftRow] = useState<(T & { __isNew?: true }) | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(null);
  const [detailRowHeight, setDetailRowHeight] = useState(DETAIL_ROW_MIN_HEIGHT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteRow, setPendingDeleteRow] = useState<T | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const gridRef = useRef<AgGridReact<T>>(null);

  useEffect(() => {
    setDetailRowHeight(DETAIL_ROW_MIN_HEIGHT);
  }, [expandedRowId]);

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
      "applyFilter", "resetFilter", "clearFilter", "notContains",
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
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, fetchData, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshToken]);

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

  const handleCellValueChanged = useCallback(
    async (e: { data?: T }) => {
      if (e.data && onUpdate) {
        if ((e.data as unknown as { __isNew?: boolean }).__isNew) return;
        try {
          await onUpdate(e.data);
          await loadData();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to update");
        }
      }
    },
    [onUpdate, loadData]
  );

  const columnDefs = useMemo<ColDef<T>[]>(() => {
    const dataCols: ColDef<T>[] = [];
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
      const hasField = Boolean(column.editable && column.field);
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
        dataCols.push({
          ...base,
          ...badgeParams,
          ...linkProps,
          field,
          editable: (params: { data?: unknown }) =>
            Boolean((params.data as { __isNew?: boolean } | undefined)?.__isNew) || Boolean(onUpdate),
          valueGetter: (params: ValueGetterParams<T>) =>
            params.data != null ? (params.data as Record<string, unknown>)[field] : undefined,
          valueFormatter: (params: ValueGetterParams<T>) =>
            params.data ? String(column.render(params.data) ?? "") : "",
          valueSetter: (params: ValueSetterParams<T>) => {
            if (params.data != null) {
              (params.data as Record<string, unknown>)[field] = params.newValue;
            }
          },
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
        minWidth: (onEdit != null || onView != null || renderRowDetail != null) && onEdit != null ? 145 : 110,
        maxWidth: (onEdit != null || onView != null || renderRowDetail != null) && onEdit != null ? 145 : 110,
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onView: onView ?? undefined,
          onEdit: onEdit ?? undefined,
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
        },
      });
    }
    return dataCols;
  }, [columns, locale, onView, onEdit, onDelete, onCreate, onRequestDelete, handleCreate, onUpdate, renderRowDetail, hasRowDetail, expandedRowId]);

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
    // Esperar a que pinte la fila para abrir edición
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

  const fullWidthCellRenderer = useCallback(
    (params: ICellRendererParams<T | DetailRow<T>>) => {
      const data = params.data as DetailRow<T>;
      if (!data?.__detail || !data.__parent || !renderRowDetail) return null;
      const content = (
        <div className="w-full border-b border-slate-200/80 dark:border-slate-600/50 bg-slate-100/90 dark:bg-slate-800/70 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <div className="flex items-stretch gap-6 px-5 py-3 w-full">
            <div className="shrink-0 w-0.5 min-h-[2rem] rounded-full bg-sky-400/50 dark:bg-sky-400/60 self-stretch" aria-hidden />
            <div className="min-w-0 flex-1 [&_dl]:grid [&_dl]:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] [&_dl]:gap-x-6 [&_dl]:gap-y-3 [&_dl]:text-sm [&_dl]:w-full [&_dl]:content-start">
              {renderRowDetail(data.__parent)}
            </div>
          </div>
        </div>
      );
      return (
        <DetailRowMeasureWrapper
          onMeasured={(height) => {
            if (height === detailRowHeight) return;
            setDetailRowHeight(height);
            params.api?.resetRowHeights();
          }}
        >
          {content}
        </DetailRowMeasureWrapper>
      );
    },
    [renderRowDetail, detailRowHeight]
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
    (params: { data?: T | DetailRow<T> }) =>
      (params.data as DetailRow<T>)?.__detail === true ? detailRowHeight : 44,
    [detailRowHeight]
  );

  const showAddInBar = onCreate != null && canCreate && headerAction == null;
  const setHeaderAction = useHeaderAction();

  useEffect(() => {
    if (headerAction != null || showAddInBar) {
      const node = headerAction ?? (
        <button
          type="button"
          onClick={startCreate}
          disabled={draftRow != null}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" strokeWidth={2.25} />
          {t(locale, "common.add")}
        </button>
      );
      setHeaderAction?.(node);
    }
    return () => { setHeaderAction?.(null); };
  }, [headerAction, showAddInBar, setHeaderAction, startCreate, draftRow, locale]);

  return (
    <div className="flex-1 flex flex-col min-h-0 pt-6 md:pt-8 px-4 md:px-10 lg:px-12 pb-4 md:pb-10 lg:pb-12 max-w-[1600px] mx-auto w-full">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl">
                <span className="font-medium">{error}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-2 border-sky-500/30 border-t-sky-400 rounded-full animate-spin" />
              </div>
            ) : (
              <div className="relative flex-1 flex flex-col min-h-[400px] bg-transparent">
                <div className="ag-theme-quartz ag-theme-parkit flex-1 min-h-0 w-full">
                  <AgGridReact<T | DetailRow<T>>
                    key={locale}
                    theme="legacy"
                    ref={gridRef as React.RefObject<AgGridReact<T | DetailRow<T>>>}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={{
                      sortable: true,
                      filter: true,
                      resizable: true,
                      flex: 1,
                      minWidth: 140,
                    }}
                    overlayNoRowsTemplate={`<div class="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500"><svg class="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><span>${emptyMessage}</span></div>`}
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
