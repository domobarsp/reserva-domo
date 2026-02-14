import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { AdminProviders } from "@/components/layout/admin-providers";

export default function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProviders>
      <div className="flex min-h-svh">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminTopbar />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}
