import { DashboardStats } from "@/components/features/admin/dashboard/dashboard-stats";
import { TodayReservations } from "@/components/features/admin/dashboard/today-reservations";
import { getDashboardData } from "./actions";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-1">Visao geral do dia</p>
      <DashboardStats
        className="mt-6"
        todayReservations={data.todayReservations}
        timeSlots={data.timeSlots}
        accommodationTypes={data.accommodationTypes}
        capacityRules={data.capacityRules}
        exceptionDates={data.exceptionDates}
      />
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Reservas de Hoje</h2>
        <TodayReservations
          className="mt-4"
          reservations={data.todayReservations}
        />
      </div>
    </div>
  );
}
