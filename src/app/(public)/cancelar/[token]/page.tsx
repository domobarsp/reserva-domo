import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/utils/supabase/admin";
import { CancelPageContent } from "@/components/features/reservation/cancel-page-content";
import { ReservationStatus } from "@/types";

export default async function CancelarPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = createAdminClient();

  const { data: reservation } = await supabase
    .from("reservations")
    .select(
      "*, customer:customers(*), time_slot:time_slots(*), accommodation_type:accommodation_types(*)"
    )
    .eq("cancellation_token", token)
    .single();

  // Not found
  if (!reservation) {
    return (
      <div className="bg-background px-4 py-16">
        <div className="mx-auto max-w-lg text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">
            Reserva não encontrada
          </h2>
          <p className="text-sm text-muted-foreground">
            O link de cancelamento é inválido ou a reserva não existe. Verifique
            o link enviado por email.
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const customer = reservation.customer;
  const timeSlot = reservation.time_slot;
  const accommodation = reservation.accommodation_type;
  const isAlreadyCancelled = reservation.status === ReservationStatus.CANCELLED;

  return (
    <CancelPageContent
      token={token}
      reservation={{
        date: reservation.date,
        party_size: reservation.party_size,
        status: reservation.status,
      }}
      customer={{
        first_name: customer?.first_name ?? "",
        last_name: customer?.last_name ?? "",
        email: customer?.email ?? "",
      }}
      timeSlot={
        timeSlot
          ? {
              name: timeSlot.name,
              start_time: timeSlot.start_time,
              end_time: timeSlot.end_time,
            }
          : null
      }
      accommodation={accommodation ? { name: accommodation.name } : null}
      isAlreadyCancelled={isAlreadyCancelled}
    />
  );
}
