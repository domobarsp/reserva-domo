import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Users,
  Armchair,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDatePtBr } from "@/lib/availability";

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const id = (params.id as string) ?? "";
  const token = (params.token as string) ?? "";
  const date = (params.date as string) ?? "";
  const timeSlotId = (params.time_slot_id as string) ?? "";
  const accommodationTypeId = (params.accommodation_type_id as string) ?? "";
  const partySize = parseInt((params.party_size as string) ?? "0", 10);
  const firstName = (params.first_name as string) ?? "";
  const lastName = (params.last_name as string) ?? "";
  const email = (params.email as string) ?? "";

  const supabase = createAdminClient();
  const [{ data: timeSlotData }, { data: accommodationData }] =
    await Promise.all([
      supabase.from("time_slots").select("*").eq("id", timeSlotId).single(),
      supabase
        .from("accommodation_types")
        .select("*")
        .eq("id", accommodationTypeId)
        .single(),
    ]);
  const timeSlot = timeSlotData;
  const accommodation = accommodationData;

  if (!id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-muted-foreground">
          Nenhuma reserva encontrada.{" "}
          <Link href="/reserva" className="text-primary underline">
            Fazer uma reserva
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="bg-background px-4 py-16">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Check icon */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Reserva Confirmada!
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sua reserva foi realizada com sucesso.
            </p>
          </div>
        </div>

        {/* Details card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
            Detalhes
          </h2>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm">
                {date ? formatDatePtBr(date) : "—"}
              </span>
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
                {partySize} {partySize === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-0.5">
            <p className="text-sm font-medium">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Email confirmation */}
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Um email de confirmação foi enviado para{" "}
            <strong className="text-foreground">{email}</strong> com os
            detalhes da reserva.
          </p>
        </div>

        {/* Cancellation link */}
        {token && (
          <p className="text-center text-sm text-muted-foreground">
            Precisa cancelar?{" "}
            <Link
              href={`/cancelar/${token}`}
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Link de cancelamento
            </Link>
          </p>
        )}

        {/* Action buttons */}
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
