"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminRole } from "@/types";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Clock,
  Users,
  Settings,
  BarChart3,
  Shield,
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

interface AdminSidebarProps {
  userRole: AdminRole;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const isStaff = userRole === AdminRole.STAFF;
  const isOwner = userRole === AdminRole.OWNER;
  const visibleItems = navItems.filter((item) => {
    if (item.staffHidden && isStaff) return false;
    if (item.ownerOnly && !isOwner) return false;
    return true;
  });

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar lg:block">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="text-xl font-bold tracking-tight text-primary">
          Domo
        </Link>
        <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          Admin
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
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
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-muted/60 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
