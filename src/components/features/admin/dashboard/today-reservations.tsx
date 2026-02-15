"use client";

import { useMemo } from "react";
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
import { cn, formatTime } from "@/lib/utils";

interface TodayReservationsProps {
  className?: string;
  reservations: ReservationFull[];
}

export function TodayReservations({
  className,
  reservations,
}: TodayReservationsProps) {
  const sortedReservations = useMemo((): ReservationFull[] => {
    return [...reservations].sort((a, b) =>
      a.reservation_time.localeCompare(b.reservation_time)
    );
  }, [reservations]);

  if (sortedReservations.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed p-8 text-center text-muted-foreground",
          className
        )}
      >
        Nenhuma reserva para hoje
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Horario</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Pessoas</TableHead>
            <TableHead>Acomodacao</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReservations.map((reservation) => (
            <TableRow key={reservation.id}>
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
