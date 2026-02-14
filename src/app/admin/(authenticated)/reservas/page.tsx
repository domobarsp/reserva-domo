import { ReservasPageContent } from "@/components/features/admin/reservations/reservas-page-content";
import { getReservationsFull } from "./actions";
import { getAccommodationTypes } from "@/app/admin/(authenticated)/configuracoes/acomodacoes/actions";
import { getTimeSlots } from "@/app/admin/(authenticated)/configuracoes/horarios/actions";

export default async function ReservasPage() {
  const [reservations, accommodationTypes, timeSlots] = await Promise.all([
    getReservationsFull(),
    getAccommodationTypes(),
    getTimeSlots(),
  ]);

  return (
    <ReservasPageContent
      initialReservations={reservations}
      accommodationTypes={accommodationTypes}
      timeSlots={timeSlots}
    />
  );
}
