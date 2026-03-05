"use client";

import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ValueGetterParams } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

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
}

export function DashboardDataTablePage<T extends { id?: string | number }>({
  title,
  description,
  endpoint,
  fetchData,
  columns,
  emptyMessage,
}: DashboardDataTablePageProps<T>) {
  const { user } = useAuthStore();
  const [rows, setRows] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex min-h-screen bg-[#0a0a0f]">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight">
                  {title}
                </h1>
                <p className="text-slate-400 text-sm">
                  {description}
                </p>
              </div>
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
              <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden backdrop-blur-sm">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-500/20 to-transparent" />
                <div className="ag-theme-quartz dashboard-grid w-full h-[620px]">
                  <AgGridReact<T>
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
                    paginationPageSize={12}
                    animateRows
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
