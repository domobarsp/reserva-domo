"use client";

import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Minus,
  CalendarDays, Users, AlertTriangle, XCircle,
  FootprintsIcon, ClipboardList,
} from "lucide-react";
import type { ReportKPIs, WalkInsMetrics, WaitlistMetrics } from "../actions";

interface KpiCardProps {
  label: string;
  value: string;
  subvalue?: string;
  delta?: number | null;
  invertDelta?: boolean;
  icon: React.ReactNode;
  accentClass: string;
}

function KpiCard({ label, value, subvalue, delta, invertDelta, icon, accentClass }: KpiCardProps) {
  const isPositive = delta != null && delta > 0;
  const isNeutral = delta == null || delta === 0;
  const isGood = isNeutral ? false : invertDelta ? !isPositive : isPositive;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
          {subvalue && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subvalue}</p>
          )}
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", accentClass)}>
          {icon}
        </div>
      </div>

      {delta != null && (
        <div className="mt-3 flex items-center gap-1.5">
          {isNeutral ? (
            <>
              <Minus className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Igual ao período anterior</span>
            </>
          ) : isGood ? (
            <>
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs text-emerald-600">
                {isPositive ? "+" : ""}{delta}% vs. período anterior
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
              <span className="text-xs text-rose-600">
                {isPositive ? "+" : ""}{delta}% vs. período anterior
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function calcDelta(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

interface ReportKpiCardsProps {
  kpis: ReportKPIs;
  previousKPIs: ReportKPIs;
  walkIns: WalkInsMetrics;
  waitlist: WaitlistMetrics;
}

export function ReportKpiCards({ kpis, previousKPIs, walkIns, waitlist }: ReportKpiCardsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Reservas */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Reservas</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total de Reservas"
            value={kpis.totalReservations.toString()}
            delta={calcDelta(kpis.totalReservations, previousKPIs.totalReservations)}
            icon={<CalendarDays className="h-5 w-5 text-primary" />}
            accentClass="bg-primary/10"
          />
          <KpiCard
            label="Total de Pessoas"
            value={kpis.totalPessoas.toString()}
            subvalue="pessoas com reserva"
            delta={calcDelta(kpis.totalPessoas, previousKPIs.totalPessoas)}
            icon={<Users className="h-5 w-5 text-violet-600" />}
            accentClass="bg-violet-50"
          />
          <KpiCard
            label="Taxa de No-Show"
            value={`${kpis.noShowRate}%`}
            delta={calcDelta(kpis.noShowRate, previousKPIs.noShowRate)}
            invertDelta
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            accentClass="bg-amber-50"
          />
          <KpiCard
            label="Taxa de Cancelamento"
            value={`${kpis.cancellationRate}%`}
            delta={calcDelta(kpis.cancellationRate, previousKPIs.cancellationRate)}
            invertDelta
            icon={<XCircle className="h-5 w-5 text-rose-600" />}
            accentClass="bg-rose-50"
          />
        </div>
      </div>

      {/* Operações em balcão */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Operações em Balcão</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <KpiCard
            label="Passantes"
            value={walkIns.total.toString()}
            subvalue={`${walkIns.totalPessoas} pessoas registradas`}
            icon={<FootprintsIcon className="h-5 w-5 text-sky-600" />}
            accentClass="bg-sky-50"
          />
          <KpiCard
            label="Lista de Espera"
            value={waitlist.total.toString()}
            subvalue={`${waitlist.seated} acomodados (${waitlist.seatedRate}%)`}
            icon={<ClipboardList className="h-5 w-5 text-emerald-600" />}
            accentClass="bg-emerald-50"
          />
        </div>
      </div>
    </div>
  );
}
