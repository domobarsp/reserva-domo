import Link from "next/link";
import { Suspense } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/features/admin/dashboard/dashboard-stats";
import { PeriodReservations } from "@/components/features/admin/dashboard/period-reservations";
import { PeriodSelector } from "@/components/features/admin/dashboard/period-selector";
import { ReservationsChart } from "@/components/features/admin/dashboard/reservations-chart";
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

  const showChart = period !== "today";

  const sectionLabel =
    period === "today"
      ? "Reservas de Hoje"
      : period === "week"
      ? "Reservas desta Semana"
      : "Reservas dos Próximos 15 Dias";

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Visão geral das reservas</p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense>
            <PeriodSelector currentPeriod={period} />
          </Suspense>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/admin/reservas">
              <Plus className="h-4 w-4" />
              Nova Reserva
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <DashboardStats periodReservations={data.periodReservations} />

      {/* Chart — multi-day periods only */}
      {showChart && (
        <ReservationsChart
          reservations={data.periodReservations}
          dateRange={data.dateRange}
        />
      )}

      {/* Reservations table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-800">{sectionLabel}</h2>
          <Link
            href="/admin/reservas"
            className="flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-700"
          >
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <PeriodReservations reservations={data.periodReservations} period={period} />
      </div>
    </div>
  );
}
