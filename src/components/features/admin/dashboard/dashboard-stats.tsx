"use client";

import { useMemo } from "react";
import { CalendarDays, CheckCircle2, Clock, XCircle, Users } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { ReservationStatus } from "@/types";
import type { ReservationFull } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  className?: string;
  periodReservations: ReservationFull[];
}

export function DashboardStats({ className, periodReservations }: DashboardStatsProps) {
  useRealtimeSubscription({ table: "reservations" });

  const stats = useMemo(() => {
    const total = periodReservations.length;
    const confirmed = periodReservations.filter(
      (r) => r.status === ReservationStatus.CONFIRMED
    ).length;
    const pending = periodReservations.filter(
      (r) => r.status === ReservationStatus.PENDING
    ).length;
    const cancelled = periodReservations.filter(
      (r) => r.status === ReservationStatus.CANCELLED
    ).length;
    const people = periodReservations
      .filter(
        (r) =>
          r.status !== ReservationStatus.CANCELLED &&
          r.status !== ReservationStatus.NO_SHOW
      )
      .reduce((sum, r) => sum + r.party_size, 0);

    const confirmedRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;
    const cancelledRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    return { total, confirmed, pending, cancelled, people, confirmedRate, cancelledRate };
  }, [periodReservations]);

  const cards = [
    {
      label: "Total de Reservas",
      value: stats.total,
      icon: CalendarDays,
      iconBg: "bg-zinc-100",
      iconColor: "text-zinc-500",
      description: "no período selecionado",
    },
    {
      label: "Confirmadas",
      value: stats.confirmed,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      description:
        stats.total > 0 ? `${stats.confirmedRate}% do total` : "nenhuma ainda",
    },
    {
      label: "Pendentes",
      value: stats.pending,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      description: stats.pending > 0 ? "aguardando confirmação" : "nenhuma pendente",
    },
    {
      label: "Canceladas",
      value: stats.cancelled,
      icon: XCircle,
      iconBg: "bg-zinc-100",
      iconColor: "text-zinc-400",
      description:
        stats.total > 0 && stats.cancelled > 0
          ? `${stats.cancelledRate}% do total`
          : "nenhum cancelamento",
    },
    {
      label: "Clientes esperados",
      value: stats.people,
      icon: Users,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      description: "em reservas ativas",
    },
  ];

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
        className
      )}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{card.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
            </div>
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", card.iconBg)}>
              <card.icon className={cn("h-5 w-5", card.iconColor)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
