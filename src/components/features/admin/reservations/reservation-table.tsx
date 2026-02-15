"use client";

import { useMemo } from "react";
import { MoreHorizontal, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusDropdown } from "./status-dropdown";
import type { ReservationFull } from "@/types";
import { ReservationStatus } from "@/types";
import { formatTime } from "@/lib/utils";

interface ReservationTableProps {
  reservations: ReservationFull[];
  onStatusChange: (id: string, status: ReservationStatus) => void;
  onEdit: (reservation: ReservationFull) => void;
}

function formatDateDdMmYyyy(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function ReservationTable({
  reservations,
  onStatusChange,
  onEdit,
}: ReservationTableProps) {
  const sorted = useMemo(() => {
    return [...reservations].sort((a, b) => {
      // Date descending
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      // Time ascending
      return a.reservation_time.localeCompare(b.reservation_time);
    });
  }, [reservations]);

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="Nenhuma reserva encontrada"
        description="Nao ha reservas para os filtros selecionados."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Horario</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Acomodacao</TableHead>
          <TableHead>Pessoas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell>{formatDateDdMmYyyy(reservation.date)}</TableCell>
            <TableCell>{formatTime(reservation.reservation_time)}</TableCell>
            <TableCell>
              {reservation.customer.first_name}{" "}
              {reservation.customer.last_name}
            </TableCell>
            <TableCell>{reservation.accommodation_type.name}</TableCell>
            <TableCell>{reservation.party_size}</TableCell>
            <TableCell>
              <StatusDropdown
                reservation={reservation}
                onStatusChange={onStatusChange}
              />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(reservation)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
