import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { AdminProviders } from "@/components/layout/admin-providers";
import { getCurrentAdminUser } from "@/lib/queries/admin-users";
import { AdminRole } from "@/types";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getCurrentAdminUser();

  // Conta desativada — força sign-out via route handler
  if (adminUser && !adminUser.is_active) {
    redirect("/admin/logout");
  }

  const userRole = adminUser?.role ?? AdminRole.STAFF;

  const displayName = adminUser?.display_name ?? "Admin";

  return (
    <AdminProviders>
      <div className="flex min-h-svh bg-zinc-100">
        <AdminSidebar userRole={userRole} displayName={displayName} />
        <div className="flex flex-1 flex-col">
          <AdminTopbar userRole={userRole} displayName={displayName} />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
