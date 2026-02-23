import { Suspense } from "react";
import { DashboardStats } from "@/components/features/admin/dashboard/dashboard-stats";
import { PeriodReservations } from "@/components/features/admin/dashboard/period-reservations";
import { PeriodSelector } from "@/components/features/admin/dashboard/period-selector";
import { getDashboardData, type DashboardPeriod } from "./actions";

interface DashboardPageProps {
  searchParams: Promise<{ period?: string }>;
}

function parsePeriod(value: string | undefined): DashboardPeriod {
  if (value === "week" || value === "15days") return value;
  return "today";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { period: periodParam } = await searchParams;
  const period = parsePeriod(periodParam);
  const data = await getDashboardData(period);

  const sectionLabel =
    period === "today"
      ? "Reservas de Hoje"
      : period === "week"
      ? "Reservas desta Semana"
      : "Reservas dos Próximos 15 Dias";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Visão geral das reservas</p>
        </div>
        <Suspense>
          <PeriodSelector currentPeriod={period} />
        </Suspense>
      </div>

      <DashboardStats
        className="mt-0"
        periodReservations={data.periodReservations}
        period={period}
        timeSlots={data.timeSlots}
        accommodationTypes={data.accommodationTypes}
        capacityRules={data.capacityRules}
        exceptionDates={data.exceptionDates}
      />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{sectionLabel}</h2>
        <PeriodReservations
          reservations={data.periodReservations}
          period={period}
        />
      </div>
    </div>
  );
}
