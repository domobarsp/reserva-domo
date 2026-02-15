import { ReservasPageContent } from "@/components/features/admin/reservations/reservas-page-content";
import { getReservationsFull } from "./actions";
import { getAccommodationTypes } from "@/app/admin/(authenticated)/configuracoes/acomodacoes/actions";
import { getTimeSlots } from "@/app/admin/(authenticated)/configuracoes/horarios/actions";
import { getTodayStr } from "@/lib/availability";

function getSingleParam(
  value: string | string[] | undefined
): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const filterDate = getSingleParam(params.date) ?? getTodayStr();
  const filterStatus = getSingleParam(params.status) ?? "";
  const filterAccommodationType = getSingleParam(params.accommodation) ?? "";

  const [reservations, accommodationTypes, timeSlots] = await Promise.all([
    getReservationsFull({
      date: filterDate,
      status: filterStatus || undefined,
      accommodation_type_id: filterAccommodationType || undefined,
    }),
    getAccommodationTypes(),
    getTimeSlots(),
  ]);

  return (
    <ReservasPageContent
      initialReservations={reservations}
      accommodationTypes={accommodationTypes}
      timeSlots={timeSlots}
      filterDate={filterDate}
      filterStatus={filterStatus}
      filterAccommodationType={filterAccommodationType}
    />
  );
}
