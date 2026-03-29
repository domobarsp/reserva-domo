"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { AdminRole } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Menu,
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

interface AdminTopbarProps {
  userRole: AdminRole;
  displayName: string;
}

export function AdminTopbar({ userRole, displayName }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isStaff = userRole === AdminRole.STAFF;
  const isOwner = userRole === AdminRole.OWNER;

  const visibleItems = navItems.filter((item) => {
    if (item.staffHidden && isStaff) return false;
    if (item.ownerOnly && !isOwner) return false;
    return true;
  });

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  // Mobile-only bar — hidden on desktop (lg+)
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="-ml-1">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>

          {/* Logo */}
          <div className="flex h-14 shrink-0 items-center border-b px-6">
            <span className="text-xl font-bold tracking-tight text-primary">Dōmo</span>
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
                        ? "bg-zinc-100 text-zinc-900 font-medium"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="shrink-0 border-t p-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800">{displayName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="shrink-0 rounded p-1 text-zinc-400 hover:text-zinc-700"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <span className="text-base font-bold text-primary">Dōmo</span>
    </header>
  );
}
