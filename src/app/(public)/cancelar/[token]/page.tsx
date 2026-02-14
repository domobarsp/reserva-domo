import Link from "next/link";
import { XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

  // Fetch reservation by cancellation token with joined data
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
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold">Reserva não encontrada</h2>
            <p className="text-muted-foreground">
              O link de cancelamento é inválido ou a reserva não existe.
            </p>
            <Button asChild variant="outline">
              <Link href="/">Voltar ao início</Link>
            </Button>
          </CardContent>
        </Card>
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
