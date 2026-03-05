"use client";

import { useMemo } from "react";
import { MoreHorizontal, Pencil, BanknoteIcon, CreditCard, CheckCircle2 } from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  onChargeNoShow: (reservation: ReservationFull) => void;
  onRowClick: (reservation: ReservationFull) => void;
  loadingStatusId: string | null;
  hideDate?: boolean;
}

function formatDateDdMmYyyy(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function ReservationTable({
  reservations,
  onStatusChange,
  onEdit,
  onChargeNoShow,
  onRowClick,
  loadingStatusId,
  hideDate = false,
}: ReservationTableProps) {
  const sorted = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
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
    <TooltipProvider delayDuration={300}>
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {!hideDate && <TableHead>Data</TableHead>}
              <TableHead>Horário</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Acomodação</TableHead>
              <TableHead>Pessoas</TableHead>
              <TableHead>Status</TableHead>
              {/* Coluna de indicador de cartão/cobrança — sem título */}
              <TableHead className="w-8" />
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((reservation) => {
              const hasCard = !!reservation.stripe_payment_method_id;
              const wasCharged = reservation.no_show_charged;
              const isNoShow = reservation.status === ReservationStatus.NO_SHOW;
              const canChargeNoShow = isNoShow && hasCard && !wasCharged;

              return (
                <TableRow
                  key={reservation.id}
                  className="cursor-pointer hover:bg-zinc-50 transition-colors"
                  onClick={() => onRowClick(reservation)}
                >
                  {!hideDate && <TableCell>{formatDateDdMmYyyy(reservation.date)}</TableCell>}
                  <TableCell>
                    {formatTime(reservation.reservation_time)}
                  </TableCell>
                  <TableCell>
                    {reservation.customer.first_name}{" "}
                    {reservation.customer.last_name}
                  </TableCell>
                  <TableCell>{reservation.accommodation_type.name}</TableCell>
                  <TableCell>{reservation.party_size}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <StatusDropdown
                      reservation={reservation}
                      onStatusChange={onStatusChange}
                      isLoading={loadingStatusId === reservation.id}
                    />
                  </TableCell>

                  {/* Indicador de cartão/cobrança */}
                  <TableCell className="text-center">
                    {wasCharged ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p className="font-medium">No-show cobrado</p>
                          {reservation.no_show_charge_amount != null && (
                            <p className="text-xs text-muted-foreground">
                              R${" "}
                              {(reservation.no_show_charge_amount / 100)
                                .toFixed(2)
                                .replace(".", ",")}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : canChargeNoShow ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CreditCard className="h-4 w-4 text-amber-500 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          <p className="font-medium">Cobrança pendente</p>
                          <p className="text-xs text-muted-foreground">
                            Cartão registrado, no-show não cobrado
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : hasCard ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <CreditCard className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        </TooltipTrigger>
                        <TooltipContent side="left">
                          Cartão registrado como garantia
                        </TooltipContent>
                      </Tooltip>
                    ) : null}
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(reservation)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {canChargeNoShow && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onChargeNoShow(reservation)}
                              className="text-destructive focus:text-destructive"
                            >
                              <BanknoteIcon className="mr-2 h-4 w-4" />
                              Cobrar No-Show
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
