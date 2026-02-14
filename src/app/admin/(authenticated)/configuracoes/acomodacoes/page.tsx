import { AcomodacoesContent } from "@/components/features/admin/settings/acomodacoes-content";
import { getAccommodationTypes } from "./actions";

export default async function AcomodacoesPage() {
  const accommodationTypes = await getAccommodationTypes();

  return <AcomodacoesContent initialAccommodationTypes={accommodationTypes} />;
}
