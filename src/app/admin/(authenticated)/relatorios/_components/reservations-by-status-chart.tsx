"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { StatusData } from "../actions";

// Cores semânticas alinhadas com os badges de status do projeto
const STATUS_COLORS: Record<string, string> = {
  pending:   "#f59e0b", // amber-500
  confirmed: "#3b82f6", // blue-500
  seated:    "#10b981", // emerald-500
  complete:  "#6b7280", // gray-500
  no_show:   "#f43f5e", // rose-500
  cancelled: "#cbd5e1", // slate-300
};

function buildChartConfig(data: StatusData[]): ChartConfig {
  return Object.fromEntries(
    data.map((d) => [d.status, { label: d.label, color: STATUS_COLORS[d.status] ?? "#6b7280" }])
  );
}

interface ReservationsByStatusChartProps {
  data: StatusData[];
  total: number;
}

export function ReservationsByStatusChart({ data, total }: ReservationsByStatusChartProps) {
  const isEmpty = data.length === 0 || data.every((d) => d.count === 0);
  const chartConfig = buildChartConfig(data);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold">Distribuição por Status</h3>
        <p className="text-sm text-muted-foreground">Proporção de reservas por resultado</p>
      </div>

      {isEmpty ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/50">
          <p className="text-sm text-muted-foreground">Nenhuma reserva no período</p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => {
                    const pct = total > 0 ? Math.round(((value as number) / total) * 100) : 0;
                    const label = chartConfig[name]?.label ?? name;
                    return `${label}: ${value} (${pct}%)`;
                  }}
                />
              }
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius="50%"
              outerRadius="75%"
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] ?? "#6b7280"}
                />
              ))}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="status" />} />
          </PieChart>
        </ChartContainer>
      )}
    </div>
  );
}
