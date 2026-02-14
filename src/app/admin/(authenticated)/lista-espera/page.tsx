import { ListaEsperaContent } from "@/components/features/admin/waitlist/lista-espera-content";
import { getWaitlistEntries } from "./actions";

export default async function ListaEsperaPage() {
  const entries = await getWaitlistEntries();

  return <ListaEsperaContent initialEntries={entries} />;
}
