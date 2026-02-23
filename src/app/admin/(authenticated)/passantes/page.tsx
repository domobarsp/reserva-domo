import { PassantesContent } from "@/components/features/admin/walk-ins/passantes-content";
import { getWalkIns } from "./actions";

interface PassantesPageProps {
  searchParams: Promise<{ name?: string; date?: string; phone?: string }>;
}

export default async function PassantesPage({ searchParams }: PassantesPageProps) {
  const { name, date, phone } = await searchParams;
  const walkIns = await getWalkIns({ name, date, phone });

  return <PassantesContent initialWalkIns={walkIns} />;
}
