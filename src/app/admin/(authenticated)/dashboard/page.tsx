import { DashboardStats } from "@/components/features/admin/dashboard/dashboard-stats";
import { TodayReservations } from "@/components/features/admin/dashboard/today-reservations";
import { getDashboardData } from "./actions";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Visao geral do dia</p>
      </div>
      <DashboardStats
        className="mt-0"
        todayReservations={data.todayReservations}
        timeSlots={data.timeSlots}
        accommodationTypes={data.accommodationTypes}
        capacityRules={data.capacityRules}
        exceptionDates={data.exceptionDates}
      />
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Reservas de Hoje</h2>
        <TodayReservations reservations={data.todayReservations} />
      </div>
    </div>
  );
}
