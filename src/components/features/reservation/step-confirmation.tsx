"use client";

import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { CalendarDays, Clock, Users, Armchair, CreditCard } from "lucide-react";
import type { FullReservationData } from "@/lib/validations/reservation";
import type { AvailabilityResponse } from "@/types";
import { formatDatePtBr } from "@/lib/availability";
import { formatTime } from "@/lib/utils";

interface StepConfirmationProps {
  needsCard: boolean;
  availabilityData: AvailabilityResponse | null;
}

const BOX = "rounded-xl border border-border p-5 space-y-3";

export function StepConfirmation({
  needsCard,
  availabilityData,
}: StepConfirmationProps) {
  const form = useFormContext<FullReservationData>();
  const values = form.getValues();

  const timeSlot = useMemo(
    () => availabilityData?.timeSlots.find((ts) => ts.id === values.time_slot_id),
    [values.time_slot_id, availabilityData]
  );

  const accommodation = useMemo(
    () =>
      timeSlot?.accommodations.find((at) => at.id === values.accommodation_type_id),
    [timeSlot, values.accommodation_type_id]
  );

  const localeLabel =
    { pt: "Português", en: "English", es: "Español" }[values.preferred_locale] ??
    values.preferred_locale;

  return (
    <div className="space-y-4">
      {/* Box 1 — Detalhes da reserva */}
      <div className={BOX}>
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Reserva
        </p>
        <div className="grid gap-2.5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">
              {values.date ? formatDatePtBr(values.date) : "—"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">
              {timeSlot
                ? `${timeSlot.name} (${formatTime(timeSlot.start_time)} — ${formatTime(timeSlot.end_time)})`
                : "—"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Armchair className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">{accommodation?.name ?? "—"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">
              {values.party_size}{" "}
              {values.party_size === 1 ? "pessoa" : "pessoas"}
            </span>
          </div>

          {values.special_requests && (
            <div className="mt-1 rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground mb-0.5">
                Solicitações especiais
              </p>
              <p className="text-sm">{values.special_requests}</p>
            </div>
          )}
        </div>
      </div>

      {/* Box 2 — Dados pessoais */}
      <div className={BOX}>
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Dados pessoais
        </p>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Nome</span>
            <span className="text-right truncate">
              {values.first_name} {values.last_name}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Email</span>
            <span className="text-right truncate">{values.email}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Telefone</span>
            <span className="text-right">{values.phone}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground shrink-0">Idioma</span>
            <span className="text-right">{localeLabel}</span>
          </div>
        </div>
      </div>

      {/* Box 3 — Cartão de garantia (mesmo estilo dos demais) */}
      {needsCard && (
        <div className={BOX}>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Garantia
          </p>
          <div className="flex items-start gap-3">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Cartão de garantia registrado</p>
              <p className="text-sm text-muted-foreground">
                Nenhuma cobrança foi realizada agora.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Termos de uso */}
      <p className="pt-1 text-center text-xs text-muted-foreground leading-relaxed">
        Ao confirmar, você concorda com os{" "}
        <a
          href="/termos"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          termos de uso
        </a>{" "}
        e a{" "}
        <a
          href="/privacidade"
          className="underline underline-offset-2 transition-colors hover:text-foreground"
        >
          política de privacidade
        </a>
        .
      </p>
    </div>
  );
}
