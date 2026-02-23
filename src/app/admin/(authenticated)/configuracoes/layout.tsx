import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/queries/admin-users";
import { AdminRole } from "@/types";

export default async function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getCurrentAdminUser();

  if (!adminUser || adminUser.role === AdminRole.STAFF) {
    redirect("/admin/dashboard");
  }

  return <>{children}</>;
}
