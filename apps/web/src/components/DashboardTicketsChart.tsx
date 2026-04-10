"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  date: string;
  count: number;
  label: string;
}

interface DashboardTicketsChartProps {
  data: ChartDataPoint[];
  ticketsLabel: string;
}

export function DashboardTicketsChart({ data, ticketsLabel }: DashboardTicketsChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div className="w-full h-full" />;
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ticketsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--company-primary, #2563eb)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--company-primary, #2563eb)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--card-border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={{ stroke: "var(--card-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--text-muted)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "12px",
            fontSize: "12px",
          }}
          labelStyle={{ color: "var(--text-primary)" }}
          formatter={(value) => [Number(value ?? 0), ticketsLabel]}
          labelFormatter={(label) => label}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--company-primary, #2563eb)"
          strokeWidth={2}
          fill="url(#ticketsGradient)"
        />
      </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
