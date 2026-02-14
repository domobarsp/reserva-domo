import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isValidTransition } from "@/lib/status-transitions";
import { ReservationStatus } from "@/types";

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

  // Buscar reserva pelo token
  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select("id, status")
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

  return NextResponse.json({ success: true });
}
