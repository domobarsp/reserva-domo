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
}

export function AdminTopbar({ userRole }: AdminTopbarProps) {
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

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex h-16 items-center border-b px-6">
            <span className="text-xl font-bold tracking-tight">Domo</span>
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
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Page title area */}
      <div className="flex-1" />

      {/* Logout */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2 text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
