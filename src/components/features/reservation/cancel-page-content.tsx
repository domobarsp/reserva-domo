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
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  // Already cancelled (either from DB status or from user action in this session)
  if (isAlreadyCancelled || isCancelled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <CheckCircle2 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl">
              {isCancelled ? "Reserva Cancelada" : "Reserva Já Cancelada"}
            </CardTitle>
            <p className="text-muted-foreground">
              {isCancelled
                ? "Sua reserva foi cancelada com sucesso."
                : "Esta reserva já foi cancelada anteriormente."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  {formatDatePtBr(reservation.date)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  {timeSlot
                    ? `${timeSlot.name} (${timeSlot.start_time} — ${timeSlot.end_time})`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <Link href="/">Voltar ao início</Link>
              </Button>
              <Button asChild>
                <Link href="/reserva">Fazer nova reserva</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active reservation — show details and cancel button
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Cancelar Reserva</CardTitle>
          <p className="text-muted-foreground">
            Revise os detalhes antes de cancelar.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Reservation Details */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Detalhes da reserva</h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  {formatDatePtBr(reservation.date)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  {timeSlot
                    ? `${timeSlot.name} (${timeSlot.start_time} — ${timeSlot.end_time})`
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
                  {reservation.party_size}{" "}
                  {reservation.party_size === 1 ? "pessoa" : "pessoas"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Reservado por</h3>
            <p className="text-sm">
              {customer.first_name} {customer.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>

          <Separator />

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Esta ação não pode ser desfeita. Após cancelar, você precisará
              fazer uma nova reserva.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <Link href="/">Manter reserva</Link>
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelando..." : "Cancelar Reserva"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
