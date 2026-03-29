"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatTime } from "@/lib/utils";
import type { ReservationFull } from "@/types";
import { ReservationStatus } from "@/types";

interface DayPopoverProps {
  dateStr: string;
  reservations: ReservationFull[];
  children: React.ReactNode;
}

const STATUS_CONFIG: Record<
  ReservationStatus,
  { dot: string; label: string }
> = {
  [ReservationStatus.CONFIRMED]: {
    dot: "bg-emerald-500",
    label: "Confirmada",
  },
  [ReservationStatus.PENDING]: {
    dot: "bg-amber-400",
    label: "Pendente",
  },
  [ReservationStatus.SEATED]: {
    dot: "bg-emerald-400",
    label: "Sentado",
  },
  [ReservationStatus.COMPLETE]: {
    dot: "bg-zinc-400",
    label: "Concluída",
  },
  [ReservationStatus.NO_SHOW]: {
    dot: "bg-red-500",
    label: "Não compareceu",
  },
  [ReservationStatus.CANCELLED]: {
    dot: "bg-zinc-300",
    label: "Cancelada",
  },
};

export function DayPopover({ dateStr, reservations, children }: DayPopoverProps) {
  const dayReservations = reservations
    .filter((r) => r.date === dateStr && r.status !== ReservationStatus.CANCELLED)
    .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));

  if (dayReservations.length === 0) {
    return <>{children}</>;
  }

  const totalCovers = dayReservations.reduce((sum, r) => sum + r.party_size, 0);

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        side="right"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold text-zinc-800">
            {dayReservations.length}{" "}
            {dayReservations.length === 1 ? "reserva" : "reservas"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalCovers} pessoas no total
          </p>
        </div>

        {/* Lista */}
        <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100">
          {dayReservations.map((r) => {
            const config = STATUS_CONFIG[r.status];
            return (
              <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                {/* Status dot */}
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${config.dot}`}
                />
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 truncate">
                    {r.customer.first_name} {r.customer.last_name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {formatTime(r.reservation_time)} · {r.party_size} pax
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">{config.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3">
          <Link
            href={`/admin/reservas?date=${dateStr}`}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Ver todas as reservas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
