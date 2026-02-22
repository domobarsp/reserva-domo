import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isValidTransition } from "@/lib/status-transitions";
import { ReservationStatus } from "@/types";
import { sendCancellationEmail } from "@/services/email-service";
import type { Locale } from "@/lib/email-translations";

export async function POST(request: NextRequest) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido" },
      { status: 400 }
    );
  }

  const { token } = body;
  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "Token de cancelamento obrigatório" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Buscar reserva pelo token (com joins para o email de cancelamento)
  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select(`
      id, status, locale, date, party_size,
      customer:customers(first_name, last_name, email),
      time_slot:time_slots(name),
      accommodation_type:accommodation_types(name)
    `)
    .eq("cancellation_token", token)
    .single();

  if (fetchError || !reservation) {
    return NextResponse.json(
      { error: "Reserva não encontrada" },
      { status: 404 }
    );
  }

  const currentStatus = reservation.status as ReservationStatus;

  // Verificar se a transição é válida
  if (!isValidTransition(currentStatus, ReservationStatus.CANCELLED)) {
    return NextResponse.json(
      { error: `Não é possível cancelar uma reserva com status "${currentStatus}"` },
      { status: 400 }
    );
  }

  // Atualizar status para cancelado
  const { error: updateError } = await supabase
    .from("reservations")
    .update({
      status: ReservationStatus.CANCELLED,
      cancelled_at: new Date().toISOString(),
      cancelled_by: "customer",
    })
    .eq("id", reservation.id);

  if (updateError) {
    return NextResponse.json(
      { error: "Erro ao cancelar reserva" },
      { status: 500 }
    );
  }

  // Registrar histórico de status
  await supabase.from("reservation_status_history").insert({
    reservation_id: reservation.id,
    from_status: currentStatus,
    to_status: ReservationStatus.CANCELLED,
    notes: "Cancelado pelo cliente",
  });

  // Enviar email de cancelamento (não-bloqueante)
  const customer = Array.isArray(reservation.customer)
    ? reservation.customer[0]
    : reservation.customer;
  const timeSlot = Array.isArray(reservation.time_slot)
    ? reservation.time_slot[0]
    : reservation.time_slot;
  const accommodationType = Array.isArray(reservation.accommodation_type)
    ? reservation.accommodation_type[0]
    : reservation.accommodation_type;

  if (customer?.email) {
    await sendCancellationEmail({
      to: customer.email,
      firstName: customer.first_name,
      date: reservation.date,
      timeLabel: timeSlot?.name ?? "",
      accommodationLabel: accommodationType?.name ?? "",
      partySize: reservation.party_size,
      locale: (reservation.locale as Locale) ?? "pt",
    });
  }

  return NextResponse.json({ success: true });
}
