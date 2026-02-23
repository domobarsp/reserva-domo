"use client";

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
          "rounded-lg border border-dashed p-8 text-center text-muted-foreground",
          className
        )}
      >
        {period === "today"
          ? "Nenhuma reserva para hoje"
          : "Nenhuma reserva no período"}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {showDate && <TableHead>Data</TableHead>}
            <TableHead>Horário</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Pessoas</TableHead>
            <TableHead>Acomodação</TableHead>
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
              <TableCell>{reservation.party_size}</TableCell>
              <TableCell>{reservation.accommodation_type.name}</TableCell>
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
