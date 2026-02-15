"use client";

import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { CalendarDays, Clock, Users, Armchair, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { FullReservationData } from "@/lib/validations/reservation";
import type { AvailabilityResponse } from "@/types";
import { formatDatePtBr } from "@/lib/availability";
import { formatTime } from "@/lib/utils";

interface StepConfirmationProps {
  needsCard: boolean;
  availabilityData: AvailabilityResponse | null;
}

export function StepConfirmation({
  needsCard,
  availabilityData,
}: StepConfirmationProps) {
  const form = useFormContext<FullReservationData>();
  const values = form.getValues();

  const timeSlot = useMemo(() => {
    return availabilityData?.timeSlots.find(
      (ts) => ts.id === values.time_slot_id
    );
  }, [values.time_slot_id, availabilityData]);

  const accommodation = useMemo(() => {
    if (!timeSlot) return undefined;
    return timeSlot.accommodations.find(
      (at) => at.id === values.accommodation_type_id
    );
  }, [timeSlot, values.accommodation_type_id]);

  const localeLabel = {
    pt: "Português",
    en: "English",
    es: "Español",
  }[values.preferred_locale];

  return (
    <div className="space-y-6">
      <p className="text-center text-muted-foreground">
        Revise os dados da sua reserva antes de confirmar.
      </p>

      {/* Reservation Details */}
      <div className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold">Detalhes da reserva</h3>

        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm">
              {values.date ? formatDatePtBr(values.date) : "—"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm">
              {timeSlot
                ? `${timeSlot.name} (${formatTime(timeSlot.start_time)} — ${formatTime(timeSlot.end_time)})`
                : "—"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Armchair className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm">{accommodation?.name ?? "—"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm">
              {values.party_size}{" "}
              {values.party_size === 1 ? "pessoa" : "pessoas"}
            </span>
          </div>

          {values.special_requests && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Solicitações especiais:
              </p>
              <p className="text-sm">{values.special_requests}</p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Customer Details */}
      <div className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold">Seus dados</h3>

        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nome</span>
            <span>
              {values.first_name} {values.last_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{values.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Telefone</span>
            <span>{values.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Idioma</span>
            <span>{localeLabel}</span>
          </div>
        </div>
      </div>

      {/* Card guarantee notice */}
      {needsCard && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <CreditCard className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Garantia com cartão exigida para esta data (placeholder — sem
            cobrança real).
          </p>
        </div>
      )}
    </div>
  );
}
