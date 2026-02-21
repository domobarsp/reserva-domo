"use client";

import { Loader2, TriangleAlert, CreditCard, CalendarDays, Clock, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ReservationFull } from "@/types";
import { formatTime } from "@/lib/utils";
import { formatDatePtBr } from "@/lib/availability";

interface ChargeNoShowDialogProps {
  reservation: ReservationFull | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isCharging: boolean;
}

function formatFee(reservation: ReservationFull): string {
  if (reservation.no_show_fee_override != null) {
    return `R$ ${(reservation.no_show_fee_override / 100)
      .toFixed(2)
      .replace(".", ",")}`;
  }
  return "Valor padrão definido nas configurações";
}

export function ChargeNoShowDialog({
  reservation,
  open,
  onOpenChange,
  onConfirm,
  isCharging,
}: ChargeNoShowDialogProps) {
  if (!reservation) return null;

  const customerName = `${reservation.customer.first_name} ${reservation.customer.last_name}`;
  const fee = formatFee(reservation);
  const hasCustomFee = reservation.no_show_fee_override != null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">
            Cobrar taxa de no-show
          </AlertDialogTitle>
        </AlertDialogHeader>

        {/* Reservation summary */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2.5 text-sm">
          <div className="font-medium text-base">{customerName}</div>
          <div className="flex flex-col gap-1.5 text-muted-foreground">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {formatDatePtBr(reservation.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {formatTime(reservation.reservation_time)}
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              {reservation.party_size}{" "}
              {reservation.party_size === 1 ? "pessoa" : "pessoas"}
            </span>
          </div>
        </div>

        <Separator />

        {/* Fee */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            Valor a cobrar
          </span>
          <span className={`font-semibold ${hasCustomFee ? "" : "text-muted-foreground text-xs"}`}>
            {fee}
          </span>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            Esta ação debitará o cartão registrado na reserva. A operação
            não pode ser desfeita após confirmada.
          </p>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCharging}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isCharging}
          >
            {isCharging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cobrando...
              </>
            ) : (
              <>Confirmar cobrança</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
