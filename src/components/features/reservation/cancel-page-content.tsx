"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Users,
  Armchair,
  AlertTriangle,
  Info,
  Loader2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDatePtBr } from "@/lib/availability";
import { formatTime } from "@/lib/utils";

interface CancelPageContentProps {
  token: string;
  reservation: {
    date: string;
    party_size: number;
    status: string;
  };
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  timeSlot: {
    name: string;
    start_time: string;
    end_time: string;
  } | null;
  accommodation: {
    name: string;
  } | null;
  isAlreadyCancelled: boolean;
}

// ── Logo reutilizável ──────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="mb-10 mt-2 flex justify-center">
      <Image src="/logo_domo.png" alt="Dōmo" width={160} height={160} className="rounded-2xl" priority />
    </div>
  );
}

// ── Bloco de detalhes reutilizável ────────────────────────────────────────────

function DetailsBlock({
  reservation,
  timeSlot,
  accommodation,
}: Pick<CancelPageContentProps, "reservation" | "timeSlot" | "accommodation">) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
        Detalhes da reserva
      </p>
      <div className="grid gap-2.5">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm">{formatDatePtBr(reservation.date)}</span>
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
            {reservation.party_size}{" "}
            {reservation.party_size === 1 ? "pessoa" : "pessoas"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function CancelPageContent({
  token,
  reservation,
  customer,
  timeSlot,
  accommodation,
  isAlreadyCancelled,
}: CancelPageContentProps) {
  const [isCancelled, setIsCancelled] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await fetch("/api/reservations/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setIsCancelled(true);
      } else {
        const errorData = await res.json();
        console.error("Erro ao cancelar reserva:", errorData.error);
      }
    } catch {
      console.error("Erro ao cancelar reserva");
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Estado 1: Cancelada com sucesso nesta sessão ───────────────────────────
  if (isCancelled) {
    return (
      <div className="bg-background min-h-full px-4 py-12">
        <Logo />
        <div className="mx-auto max-w-xl space-y-4">
          <Card className="overflow-hidden rounded-2xl shadow-md py-0 gap-0">
            <div className="bg-muted px-6 pt-5 pb-5">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Reservas online
              </p>
              <div className="flex items-center gap-2.5">
                <XCircle className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2} />
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Reserva cancelada.
                </h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Sua reserva foi cancelada com sucesso. Esperamos vê-lo em
                breve.
              </p>
            </div>
            <CardContent className="pt-6 pb-6">
              <DetailsBlock
                reservation={reservation}
                timeSlot={timeSlot}
                accommodation={accommodation}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center pt-2">
            <Link
              href="/reserva"
              className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
            >
              Fazer nova reserva
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Estado 2: Já estava cancelada no banco ────────────────────────────────
  if (isAlreadyCancelled) {
    return (
      <div className="bg-background min-h-full px-4 py-12">
        <Logo />
        <div className="mx-auto max-w-xl space-y-4">
          <Card className="overflow-hidden rounded-2xl shadow-md py-0 gap-0">
            <div className="bg-muted px-6 pt-5 pb-5">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Reservas online
              </p>
              <div className="flex items-center gap-2.5">
                <Info className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2} />
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Esta reserva já foi cancelada.
                </h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Esta reserva foi cancelada anteriormente.
              </p>
            </div>
            <CardContent className="pt-6 pb-6">
              <DetailsBlock
                reservation={reservation}
                timeSlot={timeSlot}
                accommodation={accommodation}
              />
            </CardContent>
          </Card>

          <div className="flex justify-center pt-2">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Estado 3: Ativa — confirmar cancelamento ──────────────────────────────
  return (
    <div className="bg-background min-h-full px-4 py-12">
      <Logo />
      <div className="mx-auto max-w-xl space-y-4">
        <Card className="overflow-hidden rounded-2xl shadow-md py-0 gap-0">
          <div className="bg-muted px-6 pt-5 pb-5">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
              Reservas online
            </p>
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2} />
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Cancelar reserva
              </h1>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Revise os detalhes antes de confirmar o cancelamento.
            </p>
          </div>

          <CardContent className="pt-6 pb-6 space-y-5">

            {/* Detalhes da reserva */}
            <DetailsBlock
              reservation={reservation}
              timeSlot={timeSlot}
              accommodation={accommodation}
            />

            <div className="border-t border-border" />

            {/* Hóspede */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Reserva em nome de
              </p>
              <p className="text-sm font-medium">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>

            <div className="border-t border-border" />

            {/* Aviso */}
            <div className="flex items-start gap-3 rounded-xl border border-[#C9A96E] bg-[#FAF4E8] p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#8B6914]" />
              <p className="text-sm text-[#5C4510]">
                Esta ação não pode ser desfeita. Após cancelar, você precisará
                fazer uma nova reserva.
              </p>
            </div>

            {/* Botões */}
            <div className="border-t border-border pt-5 flex justify-between gap-3">
              <Button
                asChild
                variant="ghost"
                className="h-12 rounded-xl px-8 font-medium text-muted-foreground"
              >
                <Link href="/">Manter reserva</Link>
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
                className="h-12 rounded-xl px-8 font-medium"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  "Confirmar cancelamento"
                )}
              </Button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
