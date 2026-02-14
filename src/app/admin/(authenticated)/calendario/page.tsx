import { CalendarioContent } from "@/components/features/admin/calendar/calendario-content";
import { getCalendarioData } from "./actions";

export default async function CalendarioPage() {
  const data = await getCalendarioData();

  return (
    <CalendarioContent
      reservations={data.reservations}
      timeSlots={data.timeSlots}
      accommodationTypes={data.accommodationTypes}
      capacityRules={data.capacityRules}
      exceptionDates={data.exceptionDates}
    />
  );
}
