"use client";

import { useMemo } from "react";
import { Bar, BarChart, XAxis, YAxis, Cell, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ReservationStatus } from "@/types";
import type { ReservationFull } from "@/types";

interface ReservationsChartProps {
  reservations: ReservationFull[];
  dateRange: { start: string; end: string };
}

const chartConfig = {
  total: {
    label: "Reservas",
    color: "#1F3A34",
  },
} satisfies ChartConfig;

const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function buildChartData(
  reservations: ReservationFull[],
  dateRange: { start: string; end: string }
) {
  const days: Array<{ date: string; label: string; total: number }> = [];
  const current = new Date(dateRange.start + "T12:00:00");
  const end = new Date(dateRange.end + "T12:00:00");

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      label: `${DAYS_PT[current.getDay()]} ${current.getDate()}`,
      total: 0,
    });
    current.setDate(current.getDate() + 1);
  }

  for (const r of reservations) {
    if (r.status === ReservationStatus.CANCELLED) continue;
    const day = days.find((d) => d.date === r.date);
    if (day) day.total++;
  }

  return days;
}

export function ReservationsChart({ reservations, dateRange }: ReservationsChartProps) {
  const today = getTodayStr();

  const data = useMemo(
    () => buildChartData(reservations, dateRange),
    [reservations, dateRange]
  );

  const maxTotal = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold">Reservas por Dia</h3>
        <p className="text-sm text-muted-foreground">Distribuição no período selecionado</p>
      </div>
      <ChartContainer config={chartConfig} className="h-40 w-full">
        <BarChart data={data} barSize={20} margin={{ top: 16, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[0, maxTotal + 1]} />
          <ChartTooltip
            cursor={{ fill: "#f4f4f5", radius: 4 }}
            content={<ChartTooltipContent hideLabel={false} />}
          />
          <Bar dataKey="total" radius={[3, 3, 0, 0]}>
            <LabelList
              dataKey="total"
              position="top"
              style={{ fontSize: 10, fill: "#a1a1aa" }}
              formatter={(v: number) => (v > 0 ? v : "")}
            />
            {data.map((entry) => (
              <Cell
                key={entry.date}
                fill={entry.date === today ? "#1F3A34" : "#d4d4d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      {/* Today legend */}
      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#1F3A34]" />
          Hoje
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-sm bg-zinc-300" />
          Outros dias
        </span>
      </div>
    </div>
  );
}
