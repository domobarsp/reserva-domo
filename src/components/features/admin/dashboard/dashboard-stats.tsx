"use client";

import { useMemo } from "react";
import { CalendarCheck, Clock, Users, BarChart3 } from "lucide-react";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { Card, CardContent } from "@/components/ui/card";
import { ReservationStatus } from "@/types";
import type {
  ReservationFull,
  TimeSlot,
  AccommodationType,
  CapacityRule,
  ExceptionDate,
} from "@/types";
import { getTotalCapacityForDate, getTodayStr } from "@/lib/availability";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  className?: string;
  todayReservations: ReservationFull[];
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
}

export function DashboardStats({
  className,
  todayReservations,
  timeSlots,
  accommodationTypes,
  capacityRules,
  exceptionDates,
}: DashboardStatsProps) {
  useRealtimeSubscription({ table: "reservations" });

  const stats = useMemo(() => {
    const nonCancelled = todayReservations.filter(
      (r) => r.status !== ReservationStatus.CANCELLED
    );

    const confirmed = todayReservations.filter(
      (r) => r.status === ReservationStatus.CONFIRMED
    );

    const pending = todayReservations.filter(
      (r) => r.status === ReservationStatus.PENDING
    );

    const activeStatuses = [
      ReservationStatus.PENDING,
      ReservationStatus.CONFIRMED,
      ReservationStatus.SEATED,
    ];
    const activePartySize = todayReservations
      .filter((r) => activeStatuses.includes(r.status))
      .reduce((sum, r) => sum + r.party_size, 0);

    const totalCapacity = getTotalCapacityForDate(
      getTodayStr(),
      timeSlots,
      accommodationTypes,
      capacityRules,
      exceptionDates
    );

    const occupancyPercent =
      totalCapacity > 0
        ? Math.round((activePartySize / totalCapacity) * 100)
        : 0;
    const confirmedRate =
      nonCancelled.length > 0
        ? Math.round((confirmed.length / nonCancelled.length) * 100)
        : 0;
    const pendingRate =
      nonCancelled.length > 0
        ? Math.round((pending.length / nonCancelled.length) * 100)
        : 0;

    return {
      totalToday: nonCancelled.length,
      confirmed: confirmed.length,
      pending: pending.length,
      confirmedRate,
      pendingRate,
      activePartySize,
      totalCapacity,
      occupancyPercent,
    };
  }, [
    todayReservations,
    timeSlots,
    accommodationTypes,
    capacityRules,
    exceptionDates,
  ]);

  const cards = [
    {
      label: "Reservas Hoje",
      value: stats.totalToday,
      icon: CalendarCheck,
      dotColor: "bg-primary/70",
      iconColor: "text-primary",
      badgeText: `${stats.totalToday} no dia`,
      badgeClasses: "border-primary/20 bg-primary/10 text-primary",
      insight: "Movimento principal do dia",
      description: "Inclui reservas pendentes, confirmadas e sentadas",
    },
    {
      label: "Confirmadas",
      value: stats.confirmed,
      icon: Clock,
      dotColor: "bg-emerald-500/80",
      iconColor: "text-emerald-700",
      badgeText: `${stats.confirmedRate}%`,
      badgeClasses:
        "border-emerald-200/80 bg-emerald-100/80 text-emerald-800",
      insight: "Boa taxa de confirmacao",
      description: "Percentual sobre o total de reservas do dia",
    },
    {
      label: "Pendentes",
      value: stats.pending,
      icon: Users,
      dotColor: "bg-amber-500/80",
      iconColor: "text-amber-700",
      badgeText: `${stats.pendingRate}%`,
      badgeClasses: "border-amber-200/80 bg-amber-100/80 text-amber-800",
      insight: "Reservas aguardando acao",
      description: "Foco de acompanhamento para a equipe",
    },
    {
      label: "Ocupacao",
      value: `${stats.occupancyPercent}%`,
      icon: BarChart3,
      dotColor: "bg-violet-500/80",
      iconColor: "text-violet-700",
      badgeText: `${stats.activePartySize}/${stats.totalCapacity}`,
      badgeClasses: "border-violet-200/80 bg-violet-100/80 text-violet-800",
      insight: "Uso da capacidade operacional",
      description: "Relacao entre pessoas ativas e capacidade total",
    },
  ] as const;

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {cards.map((card) => (
        <Card
          key={card.label}
          className="rounded-3xl border-border/70 py-0 shadow-sm"
        >
          <CardContent className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", card.dotColor)} />
                <p className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold",
                  card.badgeClasses
                )}
              >
                <card.icon className={cn("h-3.5 w-3.5", card.iconColor)} />
                {card.badgeText}
              </span>
            </div>

            <p className="text-4xl font-semibold leading-none tracking-tight text-foreground">
              {card.value}
            </p>

            <div className="space-y-1">
              <p className="text-base font-semibold leading-snug text-foreground">
                {card.insight}
              </p>
              <p className="text-sm leading-snug text-muted-foreground">
                {card.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
