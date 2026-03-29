import { getReportData, getDateRangeForPeriod, type ReportPeriod } from "./actions";
import { PeriodSelector } from "./_components/period-selector";
import { ReportKpiCards } from "./_components/report-kpi-cards";
import { ReservationsByDayChart } from "./_components/reservations-by-day-chart";
import { ReservationsByStatusChart } from "./_components/reservations-by-status-chart";
import { TopAccommodationsTable } from "./_components/top-accommodations-table";
import { ExportCsvButton } from "./_components/export-csv-button";
import { Suspense } from "react";

interface RelatoriosPageProps {
  searchParams: Promise<{
    period?: string;
    start?: string;
    end?: string;
  }>;
}

function isPeriod(value: string | undefined): value is ReportPeriod {
  return value === "7d" || value === "30d" || value === "90d" || value === "custom";
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export default async function RelatoriosPage({ searchParams }: RelatoriosPageProps) {
  const params = await searchParams;
  const period: ReportPeriod = isPeriod(params.period) ? params.period : "30d";
  const { start, end } = await getDateRangeForPeriod(period, params.start, params.end);

  const data = await getReportData(start, end);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Relatórios</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDisplayDate(start)} — {formatDisplayDate(end)}
          </p>
        </div>
        <ExportCsvButton startDate={start} endDate={end} />
      </div>

      {/* Period selector */}
      <Suspense>
        <PeriodSelector
          currentPeriod={period}
          customStart={period === "custom" ? params.start : undefined}
          customEnd={period === "custom" ? params.end : undefined}
        />
      </Suspense>

      {/* KPI Cards */}
      <ReportKpiCards
        kpis={data.kpis}
        previousKPIs={data.previousKPIs}
        walkIns={data.walkIns}
        waitlist={data.waitlist}
      />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ReservationsByDayChart data={data.byDay} />
        <ReservationsByStatusChart data={data.byStatus} total={data.kpis.totalReservations} />
      </div>

      {/* Top Accommodations */}
      <TopAccommodationsTable data={data.byAccommodation} />
    </div>
  );
}
