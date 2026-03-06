"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ValueGetterParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";

ModuleRegistry.registerModules([AllCommunityModule]);

type TableColumn<T> = {
  header: string;
  render: (item: T) => string | number | boolean | null | undefined;
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
}

export function DashboardDataTablePage<T extends { id?: string | number }>({
  title,
  description,
  endpoint,
  fetchData,
  columns,
  emptyMessage,
  headerAction,
}: DashboardDataTablePageProps<T>) {
  const { user } = useAuthStore();
  const locale = useLocaleStore((s) => s.locale);
  const [rows, setRows] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      "pageSize", "pageSizeLabel", "rowsPerPage", "pageSizeSelectLabel",
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

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = fetchData
          ? await fetchData(user.id)
          : await apiClient.get<T[] | T>(typeof endpoint === "function" ? endpoint(user.id) : endpoint);
        setRows(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [endpoint, fetchData, user?.id]);

  const columnDefs = useMemo<ColDef<T>[]>(
    () =>
      columns.map((column) => ({
        headerName: column.header,
        colId: column.header,
        valueGetter: (params: ValueGetterParams<T>) =>
          params.data ? column.render(params.data) : "",
      })),
    [columns]
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-page">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col min-h-0 p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto w-full">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-2 tracking-tight">
                  {title}
                </h1>
                <p className="text-text-secondary text-sm">
                  {description}
                </p>
              </div>
              {headerAction != null ? <div className="shrink-0">{headerAction}</div> : null}
            </div>

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
              <div className="relative flex-1 flex flex-col min-h-[400px] rounded-2xl overflow-hidden bg-transparent">
                <div className="ag-theme-quartz ag-theme-parkit flex-1 min-h-0 w-full">
                  <AgGridReact<T>
                    key={locale}
                    theme="legacy"
                    rowData={rows}
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
                    suppressCellFocus
                    rowHeight={44}
                    headerHeight={48}
                    localeText={localeText}
                    getLocaleText={getLocaleText}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
