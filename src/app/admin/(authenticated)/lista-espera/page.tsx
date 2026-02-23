import { ListaEsperaContent } from "@/components/features/admin/waitlist/lista-espera-content";
import { getWaitlistEntries } from "./actions";

interface ListaEsperaPageProps {
  searchParams: Promise<{ name?: string; date?: string; phone?: string }>;
}

export default async function ListaEsperaPage({ searchParams }: ListaEsperaPageProps) {
  const { name, date, phone } = await searchParams;
  const entries = await getWaitlistEntries({ name, date, phone });

  return <ListaEsperaContent initialEntries={entries} />;
}
