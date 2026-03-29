"use client";

import { CalendarX2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReservationStatusBadge } from "@/components/shared/status-badge";
import type { ReservationFull } from "@/types";
import type { DashboardPeriod } from "@/app/admin/(authenticated)/dashboard/actions";
import { cn, formatTime } from "@/lib/utils";

interface PeriodReservationsProps {
  className?: string;
  reservations: ReservationFull[];
  period: DashboardPeriod;
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function PeriodReservations({
  className,
  reservations,
  period,
}: PeriodReservationsProps) {
  const showDate = period !== "today";

  if (reservations.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center",
          className
        )}
      >
        <CalendarX2 className="h-9 w-9 text-muted-foreground/40" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {period === "today" ? "Nenhuma reserva hoje" : "Nenhuma reserva no período"}
          </p>
          <p className="text-sm text-muted-foreground">
            {period === "today"
              ? "Quando novas reservas chegarem, aparecerão aqui"
              : "Tente selecionar um período diferente"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card shadow-sm", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {showDate && <TableHead>Data</TableHead>}
            <TableHead>Horário</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden sm:table-cell">Pessoas</TableHead>
            <TableHead className="hidden md:table-cell">Acomodação</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              {showDate && (
                <TableCell className="text-muted-foreground">
                  {formatDate(reservation.date)}
                </TableCell>
              )}
              <TableCell className="font-medium">
                {formatTime(reservation.reservation_time)}
              </TableCell>
              <TableCell>
                {reservation.customer.first_name}{" "}
                {reservation.customer.last_name}
              </TableCell>
              <TableCell className="hidden sm:table-cell">{reservation.party_size}</TableCell>
              <TableCell className="hidden md:table-cell">{reservation.accommodation_type.name}</TableCell>
              <TableCell>
                <ReservationStatusBadge status={reservation.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
