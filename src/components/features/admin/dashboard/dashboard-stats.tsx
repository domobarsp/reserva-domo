"use client";

import { useMemo } from "react";
import { CalendarCheck, Clock, Users, BarChart3, PersonStanding } from "lucide-react";
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
import type { DashboardPeriod } from "@/app/admin/(authenticated)/dashboard/actions";

interface DashboardStatsProps {
  className?: string;
  periodReservations: ReservationFull[];
  period: DashboardPeriod;
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
}

export function DashboardStats({
  className,
  periodReservations,
  period,
  timeSlots,
  accommodationTypes,
  capacityRules,
  exceptionDates,
}: DashboardStatsProps) {
  useRealtimeSubscription({ table: "reservations" });

  const stats = useMemo(() => {
    const nonCancelled = periodReservations.filter(
      (r) => r.status !== ReservationStatus.CANCELLED
    );
    const confirmed = nonCancelled.filter(
      (r) => r.status === ReservationStatus.CONFIRMED
    );
    const pending = nonCancelled.filter(
      (r) => r.status === ReservationStatus.PENDING
    );
    const activeStatuses = [
      ReservationStatus.PENDING,
      ReservationStatus.CONFIRMED,
      ReservationStatus.SEATED,
    ];
    const activePartySize = nonCancelled
      .filter((r) => activeStatuses.includes(r.status))
      .reduce((sum, r) => sum + r.party_size, 0);

    // Ocupação só faz sentido para "hoje"
    const totalCapacity =
      period === "today"
        ? getTotalCapacityForDate(
            getTodayStr(),
            timeSlots,
            accommodationTypes,
            capacityRules,
            exceptionDates
          )
        : 0;
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
      total: nonCancelled.length,
      confirmed: confirmed.length,
      pending: pending.length,
      confirmedRate,
      pendingRate,
      activePartySize,
      totalCapacity,
      occupancyPercent,
    };
  }, [
    periodReservations,
    period,
    timeSlots,
    accommodationTypes,
    capacityRules,
    exceptionDates,
  ]);

  const isToday = period === "today";
  const periodLabel = isToday
    ? "Hoje"
    : period === "week"
    ? "Esta semana"
    : "Próximos 15 dias";

  const cards = [
    {
      label: isToday ? "Reservas Hoje" : "Reservas no Período",
      value: stats.total,
      icon: CalendarCheck,
      dotColor: "bg-primary/70",
      iconColor: "text-primary",
      badgeText: `${stats.total} ${isToday ? "no dia" : "no período"}`,
      badgeClasses: "border-primary/20 bg-primary/10 text-primary",
      insight: isToday ? "Movimento principal do dia" : `Movimento em ${periodLabel.toLowerCase()}`,
      description: "Inclui reservas pendentes, confirmadas e sentadas",
    },
    {
      label: "Confirmadas",
      value: stats.confirmed,
      icon: Clock,
      dotColor: "bg-emerald-500/80",
      iconColor: "text-emerald-700",
      badgeText: `${stats.confirmedRate}%`,
      badgeClasses: "border-emerald-200/80 bg-emerald-100/80 text-emerald-800",
      insight: "Boa taxa de confirmação",
      description: "Percentual sobre o total de reservas",
    },
    {
      label: "Pendentes",
      value: stats.pending,
      icon: Users,
      dotColor: "bg-amber-500/80",
      iconColor: "text-amber-700",
      badgeText: `${stats.pendingRate}%`,
      badgeClasses: "border-amber-200/80 bg-amber-100/80 text-amber-800",
      insight: "Reservas aguardando ação",
      description: "Foco de acompanhamento para a equipe",
    },
    isToday
      ? {
          label: "Ocupação",
          value: `${stats.occupancyPercent}%`,
          icon: BarChart3,
          dotColor: "bg-violet-500/80",
          iconColor: "text-violet-700",
          badgeText: `${stats.activePartySize}/${stats.totalCapacity}`,
          badgeClasses: "border-violet-200/80 bg-violet-100/80 text-violet-800",
          insight: "Uso da capacidade operacional",
          description: "Relação entre pessoas ativas e capacidade total",
        }
      : {
          label: "Pessoas no Período",
          value: stats.activePartySize,
          icon: PersonStanding,
          dotColor: "bg-violet-500/80",
          iconColor: "text-violet-700",
          badgeText: `${stats.activePartySize} pessoas`,
          badgeClasses: "border-violet-200/80 bg-violet-100/80 text-violet-800",
          insight: "Total de cobertos esperados",
          description: "Soma de pessoas em reservas ativas",
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
