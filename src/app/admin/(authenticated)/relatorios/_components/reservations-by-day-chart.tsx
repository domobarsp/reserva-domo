"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DayData } from "../actions";

// Cores semânticas alinhadas com os badges de status do projeto
const STATUS_CHART_CONFIG = {
  pending:   { label: "Pendente",        color: "#f59e0b" }, // amber-500
  confirmed: { label: "Confirmado",      color: "#3b82f6" }, // blue-500
  seated:    { label: "Sentado",         color: "#10b981" }, // emerald-500
  complete:  { label: "Completo",        color: "#6b7280" }, // gray-500
  no_show:   { label: "Não Compareceu", color: "#f43f5e" }, // rose-500
  cancelled: { label: "Cancelado",       color: "#cbd5e1" }, // slate-300
} satisfies ChartConfig;

const STATUS_KEYS = Object.keys(STATUS_CHART_CONFIG) as (keyof typeof STATUS_CHART_CONFIG)[];

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

interface ReservationsByDayChartProps {
  data: DayData[];
}

export function ReservationsByDayChart({ data }: ReservationsByDayChartProps) {
  const isEmpty = data.every((d) => d.count === 0);
  const tickInterval = data.length > 60
    ? Math.floor(data.length / 10)
    : data.length > 14 ? 2 : 0;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold">Reservas por Dia</h3>
        <p className="text-sm text-muted-foreground">Volume e distribuição por status</p>
      </div>

      {isEmpty ? (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border/50">
          <p className="text-sm text-muted-foreground">Nenhuma reserva no período</p>
        </div>
      ) : (
        <ChartContainer config={STATUS_CHART_CONFIG} className="h-64 w-full">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, bottom: 4, left: -16 }}
            barSize={data.length > 60 ? 4 : data.length > 30 ? 8 : 16}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDateLabel}
              interval={tickInterval}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const [year, month, day] = (value as string).split("-");
                    return `${day}/${month}/${year}`;
                  }}
                />
              }
            />
            {STATUS_KEYS.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="status"
                fill={STATUS_CHART_CONFIG[key].color}
                radius={0}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
