import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Users,
  Armchair,
  CheckCircle2,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

  // Fetch time slot and accommodation from Supabase
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
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma reserva encontrada. Acesse a{" "}
              <Link href="/reserva" className="underline text-primary">
                página de reserva
              </Link>{" "}
              para fazer uma nova reserva.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Reserva Confirmada!</CardTitle>
          <p className="text-muted-foreground">
            Sua reserva foi realizada com sucesso.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Reservation ID */}
          <div className="rounded-lg border bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              ID da reserva
            </p>
            <p className="font-mono text-sm font-medium break-all">{id}</p>
          </div>

          {/* Reservation Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Detalhes da reserva</h3>

            <div className="grid gap-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">
                  {date ? formatDatePtBr(date) : "—"}
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
                  {partySize} {partySize === 1 ? "pessoa" : "pessoas"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="space-y-2">
            <h3 className="font-semibold">Reservado por</h3>
            <p className="text-sm">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>

          <Separator />

          {/* Email confirmation mock */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Email de confirmação enviado
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Um email de confirmação foi enviado para{" "}
                <strong>{email}</strong> com os detalhes da reserva.
              </p>
              <Badge variant="outline" className="mt-2">
                Mock — email real na Fase 6
              </Badge>
            </div>
          </div>

          {/* Cancellation link */}
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground mb-2">
              Precisa cancelar? Use o link abaixo:
            </p>
            <Link
              href={`/cancelar/${token}`}
              className="text-sm text-primary underline break-all"
            >
              /cancelar/{token}
            </Link>
          </div>

          {/* Action buttons */}
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
