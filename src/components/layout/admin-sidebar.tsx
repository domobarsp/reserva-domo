"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminRole } from "@/types";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Clock,
  Users,
  Settings,
  BarChart3,
  Shield,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, staffHidden: false, ownerOnly: false },
  { href: "/admin/reservas", label: "Reservas", icon: BookOpen, staffHidden: false, ownerOnly: false },
  { href: "/admin/calendario", label: "Calendário", icon: CalendarDays, staffHidden: false, ownerOnly: false },
  { href: "/admin/lista-espera", label: "Lista de Espera", icon: Clock, staffHidden: false, ownerOnly: false },
  { href: "/admin/passantes", label: "Passantes", icon: Users, staffHidden: false, ownerOnly: false },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3, staffHidden: false, ownerOnly: false },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, staffHidden: true, ownerOnly: false },
  { href: "/admin/acessos", label: "Acessos", icon: Shield, staffHidden: false, ownerOnly: true },
];

const roleLabels: Record<AdminRole, string> = {
  [AdminRole.OWNER]: "Proprietário",
  [AdminRole.MANAGER]: "Gerente",
  [AdminRole.STAFF]: "Operador",
};

interface AdminSidebarProps {
  userRole: AdminRole;
  displayName: string;
}

export function AdminSidebar({ userRole, displayName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isStaff = userRole === AdminRole.STAFF;
  const isOwner = userRole === AdminRole.OWNER;

  const visibleItems = navItems.filter((item) => {
    if (item.staffHidden && isStaff) return false;
    if (item.ownerOnly && !isOwner) return false;
    return true;
  });

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-6">
        <Link href="/admin/dashboard" className="text-xl font-bold tracking-tight text-primary">
          Dōmo
        </Link>
        <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-0.5">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-primary"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer — user info + logout */}
      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100">
            <span className="text-xs font-semibold text-zinc-600">{initials}</span>
          </div>
          {/* Name + role */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-800">{displayName}</p>
            <p className="text-xs text-zinc-400">{roleLabels[userRole]}</p>
          </div>
          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sair"
            className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
