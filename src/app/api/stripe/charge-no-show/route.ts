import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/utils/stripe/client";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import type { ExceptionDate, Settings } from "@/types";
import { sendNoShowChargeEmail } from "@/services/email-service";
import type { Locale } from "@/lib/email-translations";

// Resolve o valor do no-show pela ordem de prioridade definida no schema:
// 1. no_show_fee_override da reserva
// 2. no_show_fee_override da exception_date da data da reserva
// 3. settings.no_show_fee.amount (global)
function resolveNoShowFee(
  reservationOverride: number | null,
  exceptionDates: ExceptionDate[],
  reservationDate: string,
  allSettings: Settings[]
): number {
  if (reservationOverride != null) return reservationOverride;

  const exception = exceptionDates.find((e) => e.date === reservationDate);
  if (exception?.no_show_fee_override != null)
    return exception.no_show_fee_override;

  const feeSetting = allSettings.find((s) => s.key === "no_show_fee");
  if (feeSetting) {
    const val = feeSetting.value as { amount?: number };
    if (val.amount != null) return val.amount;
  }

  return 5000; // fallback: R$ 50,00
}

export async function POST(request: NextRequest) {
  // Verificar autenticação via Supabase
  const supabaseAuth = await createClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON inválido" }, { status: 400 });
  }

  const { reservationId } = body as { reservationId?: string };

  if (!reservationId) {
    return NextResponse.json(
      { error: "reservationId é obrigatório" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Buscar reserva (com joins para o email de no-show)
  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select(`
      *,
      customer:customers(first_name, last_name, email),
      time_slot:time_slots(name)
    `)
    .eq("id", reservationId)
    .single();

  if (fetchError || !reservation) {
    return NextResponse.json(
      { error: "Reserva não encontrada" },
      { status: 404 }
    );
  }

  // Validar pré-condições
  if (reservation.status !== "no_show") {
    return NextResponse.json(
      { error: "Reserva não está com status no-show" },
      { status: 400 }
    );
  }
  if (!reservation.stripe_payment_method_id) {
    return NextResponse.json(
      { error: "Reserva não possui cartão registrado" },
      { status: 400 }
    );
  }
  if (reservation.no_show_charged) {
    return NextResponse.json(
      { error: "No-show já foi cobrado para esta reserva" },
      { status: 400 }
    );
  }

  // Resolver valor
  const [{ data: exceptionDates }, { data: settings }] = await Promise.all([
    supabase
      .from("exception_dates")
      .select("*")
      .eq("restaurant_id", reservation.restaurant_id),
    supabase
      .from("settings")
      .select("*")
      .eq("restaurant_id", reservation.restaurant_id),
  ]);

  const amount = resolveNoShowFee(
    reservation.no_show_fee_override,
    (exceptionDates ?? []) as ExceptionDate[],
    reservation.date,
    (settings ?? []) as Settings[]
  );

  // Criar PaymentIntent
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "brl",
      customer: reservation.stripe_customer_id,
      payment_method: reservation.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      description: `No-show — Reserva ${reservationId}`,
      metadata: { reservation_id: reservationId },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro no pagamento";
    // Registrar tentativa com falha
    await supabase.from("no_show_charges").insert({
      reservation_id: reservationId,
      stripe_payment_intent_id: "failed_before_create",
      amount,
      currency: "brl",
      status: "failed",
      error_message: message,
      charged_by: user.id,
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const chargeStatus =
    paymentIntent.status === "succeeded" ? "succeeded" : "pending";

  // Inserir em no_show_charges
  await supabase.from("no_show_charges").insert({
    reservation_id: reservationId,
    stripe_payment_intent_id: paymentIntent.id,
    amount,
    currency: "brl",
    status: chargeStatus,
    charged_by: user.id,
  });

  // Atualizar reserva
  await supabase
    .from("reservations")
    .update({
      no_show_charged: true,
      no_show_charge_amount: amount,
      no_show_charge_id: paymentIntent.id,
    })
    .eq("id", reservationId);

  // Enviar email de no-show (não-bloqueante)
  const customer = Array.isArray(reservation.customer)
    ? reservation.customer[0]
    : reservation.customer;
  const timeSlot = Array.isArray(reservation.time_slot)
    ? reservation.time_slot[0]
    : reservation.time_slot;

  if (customer?.email) {
    await sendNoShowChargeEmail({
      to: customer.email,
      firstName: customer.first_name,
      date: reservation.date,
      timeLabel: timeSlot?.name ?? "",
      amount,
      locale: (reservation.locale as Locale) ?? "pt",
    });
  }

  return NextResponse.json({
    success: true,
    chargeId: paymentIntent.id,
    status: chargeStatus,
    amount,
  });
}
