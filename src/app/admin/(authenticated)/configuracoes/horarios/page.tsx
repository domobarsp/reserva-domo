import { HorariosContent } from "@/components/features/admin/settings/horarios-content";
import { getTimeSlots } from "./actions";

export default async function HorariosPage() {
  const timeSlots = await getTimeSlots();

  return <HorariosContent initialTimeSlots={timeSlots} />;
}
