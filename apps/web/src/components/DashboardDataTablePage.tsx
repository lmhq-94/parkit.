"use client";

import { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ValueGetterParams } from "ag-grid-community";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

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
    const fetchData = async () => {
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

    fetchData();
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
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1">
          <div className="container-narrow py-12">
            <h1 className="text-3xl font-bold mb-3">{title}</h1>
            <p className="text-gray-600 mb-8">{description}</p>

            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading data...</div>
            ) : (
              <div className="card">
                <div className="ag-theme-quartz w-full h-[520px]">
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
                    overlayNoRowsTemplate={`<span class="text-gray-500">${emptyMessage}</span>`}
                    pagination
                    paginationPageSize={10}
                    animateRows
                    getRowId={(params) =>
                      params.data?.id !== undefined ? String(params.data.id) : crypto.randomUUID()
                    }
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
