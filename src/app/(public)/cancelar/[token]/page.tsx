import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="bg-background min-h-full px-4 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <span className="text-2xl font-bold tracking-tight">D</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground tracking-wide">
            Restaurante Domo
          </p>
        </div>
        <div className="mx-auto max-w-xl space-y-4">
          <Card className="overflow-hidden rounded-2xl shadow-md py-0 gap-0">
            <div className="bg-muted px-6 pt-5 pb-5">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
                Reservas online
              </p>
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={2} />
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  Reserva não encontrada.
                </h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                O link de cancelamento é inválido ou a reserva não existe.
                Verifique o link enviado por email.
              </p>
            </div>
            <CardContent className="py-5 text-center">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Voltar ao início
              </Link>
            </CardContent>
          </Card>
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
