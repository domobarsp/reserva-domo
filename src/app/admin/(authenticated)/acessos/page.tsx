import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/queries/admin-users";
import { AdminRole } from "@/types";
import { getAdminUsers } from "./actions";
import { AcessosContent } from "@/components/features/admin/access/acessos-content";

export default async function AcessosPage() {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser || adminUser.role !== AdminRole.OWNER) {
    redirect("/admin/dashboard");
  }

  const users = await getAdminUsers();

  return (
    <AcessosContent users={users} currentUserId={adminUser.id} />
  );
}
