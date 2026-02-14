import { CapacidadeContent } from "@/components/features/admin/settings/capacidade-content";
import { getCapacityData } from "./actions";

export default async function CapacidadePage() {
  const data = await getCapacityData();

  return (
    <CapacidadeContent
      initialCapacityRules={data.capacityRules}
      accommodationTypes={data.accommodationTypes}
      timeSlots={data.timeSlots}
    />
  );
}
