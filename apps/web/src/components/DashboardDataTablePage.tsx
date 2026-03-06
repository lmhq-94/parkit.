"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, ValueGetterParams, ValueSetterParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";

ModuleRegistry.registerModules([AllCommunityModule]);

type TableColumn<T> = {
  header: string;
  render: (item: T) => string | number | boolean | null | undefined;
  /** Campo en el objeto row para edición inline. Si se usa con editable: true, la celda se puede editar. */
  field?: keyof T & string;
  /** Si true y field está definido, la celda es editable directamente en el grid. */
  editable?: boolean;
};

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
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void | Promise<void>;
    getConfirmDeleteMessage?: (row: T) => string;
    confirmDeleteMessage: string;
    editLabel: string;
    deleteLabel: string;
    saveLabel: string;
    cancelLabel: string;
    /** Si está definido, al hacer clic en Editar se abre la primera celda editable de la fila. */
    firstEditableColId?: string;
    /** Crear/Cancelar creación para filas temporales */
    onCreate?: (draft: Partial<T>) => void | Promise<void>;
    onCancelCreate?: () => void;
  }
) {
  const { data, onEdit, onDelete, getConfirmDeleteMessage, confirmDeleteMessage, editLabel, deleteLabel, saveLabel, cancelLabel, firstEditableColId, onCreate, onCancelCreate } = params;
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!data) return null;
  const isNew = Boolean((data as unknown as { __isNew?: boolean }).__isNew);
  const hasEdit = !isNew && (typeof onEdit === "function" || firstEditableColId != null);
  const hasDelete = typeof onDelete === "function";
  const hasCreate = isNew && typeof onCreate === "function";

  const handleEdit = () => {
    if (firstEditableColId != null && params.api != null && params.node?.rowIndex != null) {
      params.api.startEditingCell({ rowIndex: params.node.rowIndex, colKey: firstEditableColId });
    } else {
      onEdit?.(data);
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

  const handleDelete = async () => {
    const message = getConfirmDeleteMessage?.(data) ?? confirmDeleteMessage;
    if (!window.confirm(message)) return;
    setDeleting(true);
    try {
      await onDelete?.(data);
    } finally {
      setDeleting(false);
    }
  };

  if (!hasEdit && !hasDelete && !hasCreate) return null;

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
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
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
  onEdit,
  onDelete,
  getConfirmDeleteMessage,
  onUpdate,
  onCreate,
}: DashboardDataTablePageProps<T>) {
  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  const [rows, setRows] = useState<T[]>([]);
  const [draftRow, setDraftRow] = useState<(T & { __isNew?: true }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gridRef = useRef<AgGridReact<T>>(null);

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

  const handleDelete = useCallback(
    async (row: T) => {
      await onDelete?.(row);
      await loadData();
    },
    [onDelete, loadData]
  );

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
    const dataCols: ColDef<T>[] = columns.map((column) => {
      const hasField = Boolean(column.editable && column.field);
      const base: ColDef<T> = {
        headerName: column.header,
        colId: column.header,
      };
      if (hasField && column.field) {
        const field = column.field;
        return {
          ...base,
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
        } as unknown as ColDef<T>;
      }
      return {
        ...base,
        valueGetter: (params: ValueGetterParams<T>) =>
          params.data ? column.render(params.data) : "",
      };
    });
    const hasEditableCols = columns.some((c) => Boolean(c.editable && c.field));
    const firstEditableColId = hasEditableCols ? columns.find((c) => c.editable && c.field)?.header : undefined;
    const hasActions =
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
        minWidth: 110,
        maxWidth: 110,
        cellRenderer: ActionsCellRenderer,
        cellRendererParams: {
          onEdit: onEdit ?? undefined,
          onDelete: onDelete ? handleDelete : undefined,
          getConfirmDeleteMessage: getConfirmDeleteMessage ?? undefined,
          confirmDeleteMessage: t(locale, "common.confirmDelete"),
          editLabel: t(locale, "common.edit"),
          deleteLabel: t(locale, "common.delete"),
          saveLabel: t(locale, "common.save"),
          cancelLabel: t(locale, "common.cancel"),
          firstEditableColId,
          onCreate: onCreate ? handleCreate : undefined,
          onCancelCreate: () => setDraftRow(null),
        },
      });
    }
    return dataCols;
  }, [columns, locale, onEdit, onDelete, onCreate, getConfirmDeleteMessage, handleDelete, handleCreate, onUpdate]);

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

  const rowData = useMemo(
    () => (draftRow ? ([draftRow as unknown as T, ...rows] as T[]) : rows),
    [draftRow, rows]
  );

  const showAddInBar = onCreate != null && canCreate && headerAction == null;

  return (
    <div className="flex-1 flex flex-col min-h-0 pt-0 px-4 md:px-10 lg:px-12 pb-4 md:pb-10 lg:pb-12 max-w-[1600px] mx-auto w-full">
            {(headerAction != null || showAddInBar) ? (
              <div className="mt-4 mb-2 md:mt-0 md:mb-4 flex flex-col md:flex-row md:items-center justify-end">
                {headerAction != null ? headerAction : (
                  <button
                    type="button"
                    onClick={startCreate}
                    disabled={draftRow != null}
                    className="inline-flex items-center px-4 py-2.5 rounded-xl bg-sky-500 text-white text-sm font-semibold hover:bg-sky-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {t(locale, "common.add")}
                  </button>
                )}
              </div>
            ) : null}

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
                {onCreate && !showAddInBar && (
                  <button
                    type="button"
                    onClick={startCreate}
                    disabled={!canCreate || draftRow != null}
                    title={t(locale, "common.add")}
                    aria-label={t(locale, "common.add")}
                    className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-500 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 hover:shadow focus:outline-none focus:ring-2 focus:ring-slate-300/50 dark:border-slate-600/80 dark:bg-slate-800/95 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:bg-slate-700/90 dark:hover:text-slate-200 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 stroke-[2.25]" strokeWidth={2.25} />
                  </button>
                )}
                <div className="ag-theme-quartz ag-theme-parkit flex-1 min-h-0 w-full">
                  <AgGridReact<T>
                    key={locale}
                    theme="legacy"
                    ref={gridRef}
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
                    rowHeight={44}
                    headerHeight={48}
                    localeText={localeText}
                    getLocaleText={getLocaleText}
                    onCellValueChanged={handleCellValueChanged}
                  />
                </div>
              </div>
            )}
    </div>
  );
}
