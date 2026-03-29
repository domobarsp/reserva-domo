import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Users,
  Armchair,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/utils/supabase/admin";
import { formatDatePtBr } from "@/lib/availability";
import { formatTime } from "@/lib/utils";

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

  const subtitleDate = date ? formatDatePtBr(date) : null;
  const subtitleTime = timeSlot ? formatTime(timeSlot.start_time) : null;

  return (
    <div className="bg-background min-h-full px-4 py-12">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <Image src="/logo_domo.jpeg" alt="Domo" width={56} height={56} className="rounded-2xl" />
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          Restaurante Domo
        </p>
      </div>

      <div className="mx-auto max-w-xl space-y-4">

        {/* ── Card principal ─────────────────────────────────────── */}
        <Card className="overflow-hidden rounded-2xl shadow-md py-0 gap-0">

          {/* Header — confirmação, verde claro */}
          <div className="bg-accent px-6 pt-5 pb-5">
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
              Reservas online
            </p>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" strokeWidth={2} />
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Sua mesa está reservada.
              </h1>
            </div>
            {subtitleDate && subtitleTime && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Esperamos você em{" "}
                <span className="font-medium text-foreground">{subtitleDate}</span>
                {" "}às{" "}
                <span className="font-medium text-foreground">{subtitleTime}</span>.
              </p>
            )}
          </div>

          <CardContent className="pt-6 pb-6 space-y-5">

            {/* Bloco 1 — Detalhes da reserva */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Detalhes da reserva
              </p>
              <div className="grid gap-2.5">
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
                    {partySize} {partySize === 1 ? "pessoa" : "pessoas"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Bloco 2 — Hóspede */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Reserva em nome de
              </p>
              <p className="text-sm font-medium">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>

            <div className="border-t border-border" />

            {/* Confirmação por email */}
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Confirmação enviada para{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Não recebeu? Verifique a caixa de spam.
                </p>
              </div>
            </div>

            {/* Mensagem de acolhimento */}
            <p className="text-center text-sm text-muted-foreground italic leading-relaxed">
              Estamos ansiosos para recebê-lo no Domo.
            </p>

          </CardContent>
        </Card>

        {/* ── Box de cancelamento ────────────────────────────────── */}
        {token && (
          <Card className="overflow-hidden rounded-2xl py-0 gap-0 shadow-sm">
            <CardContent className="py-4 text-center space-y-0.5">
              <p className="text-sm font-medium text-foreground">
                Precisa alterar ou cancelar?
              </p>
              <Link
                href={`/cancelar/${token}`}
                className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
              >
                Gerenciar reserva
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Navegação */}
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
