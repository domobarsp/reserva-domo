"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Users,
  Armchair,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDatePtBr } from "@/lib/availability";

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

function ReservationDetailsCard({
  reservation,
  timeSlot,
  accommodation,
}: Pick<CancelPageContentProps, "reservation" | "timeSlot" | "accommodation">) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm">{formatDatePtBr(reservation.date)}</span>
      </div>
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm">
          {timeSlot
            ? `${timeSlot.name} (${timeSlot.start_time} — ${timeSlot.end_time})`
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
  );
}

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

  // Cancelled successfully in this session
  if (isCancelled) {
    return (
      <div className="bg-background px-4 py-16">
        <div className="mx-auto max-w-lg text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Reserva Cancelada
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sua reserva foi cancelada com sucesso.
              </p>
            </div>
          </div>
          <ReservationDetailsCard
            reservation={reservation}
            timeSlot={timeSlot}
            accommodation={accommodation}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/">Voltar ao início</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/reserva">Nova Reserva</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Already cancelled in DB
  if (isAlreadyCancelled) {
    return (
      <div className="bg-background px-4 py-16">
        <div className="mx-auto max-w-lg text-center space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Info className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Reserva Já Cancelada
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Esta reserva já foi cancelada anteriormente.
              </p>
            </div>
          </div>
          <ReservationDetailsCard
            reservation={reservation}
            timeSlot={timeSlot}
            accommodation={accommodation}
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="ghost" className="text-muted-foreground">
              <Link href="/">Voltar ao início</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/reserva">Nova Reserva</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Active reservation — confirm cancellation
  return (
    <div className="bg-background px-4 py-16">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Cancelar Reserva
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revise os detalhes antes de confirmar o cancelamento.
          </p>
        </div>

        <ReservationDetailsCard
          reservation={reservation}
          timeSlot={timeSlot}
          accommodation={accommodation}
        />

        <Separator />

        <div>
          <p className="text-sm font-medium">
            {customer.first_name} {customer.last_name}
          </p>
          <p className="text-sm text-muted-foreground">{customer.email}</p>
        </div>

        <Separator />

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-700">
            Esta ação não pode ser desfeita. Após cancelar, você precisará fazer
            uma nova reserva.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild variant="ghost" className="text-muted-foreground">
            <Link href="/">Manter reserva</Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling}
            className="rounded-xl"
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelando...
              </>
            ) : (
              "Cancelar Reserva"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
