import { PassantesContent } from "@/components/features/admin/walk-ins/passantes-content";
import { getWalkIns } from "./actions";

export default async function PassantesPage() {
  const walkIns = await getWalkIns();

  return <PassantesContent initialWalkIns={walkIns} />;
}
