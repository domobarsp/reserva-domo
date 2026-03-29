import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { apiReservationSchema } from "@/lib/validations/reservation";
import {
  getAvailableTimeSlotsFrom,
  isDateClosedFrom,
  getBookingWindowDatesFrom,
} from "@/lib/availability";
import type {
  TimeSlot,
  ExceptionDate,
  Settings,
} from "@/types";
import {
  sendConfirmationEmail,
  sendAdminNotificationEmail,
} from "@/services/email-service";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success: rateLimitOk } = checkRateLimit(`reservations:${ip}`, 5, 60_000);
  if (!rateLimitOk) return rateLimitResponse();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body JSON inválido" },
      { status: 400 }
    );
  }

  // Validar dados com Zod
  const parsed = apiReservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const supabase = createAdminClient();

  // Buscar restaurant_id
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .single();

  if (!restaurant) {
    return NextResponse.json(
      { error: "Restaurante não encontrado" },
      { status: 500 }
    );
  }

  const restaurantId = restaurant.id;

  // Buscar dados necessários para validações de regras de negócio
  const [
    { data: timeSlots },
    { data: exceptionDates },
    { data: settings },
    { data: accommodationTypes },
  ] = await Promise.all([
    supabase
      .from("time_slots")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true),
    supabase
      .from("exception_dates")
      .select("*")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("settings")
      .select("*")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("accommodation_types")
      .select("id, name")
      .eq("restaurant_id", restaurantId),
  ]);

  const allTimeSlots = (timeSlots ?? []) as TimeSlot[];
  const allExceptionDates = (exceptionDates ?? []) as ExceptionDate[];
  const allSettings = (settings ?? []) as Settings[];

  // Validar: data não está fechada
  if (isDateClosedFrom(data.date, allExceptionDates)) {
    return NextResponse.json(
      { error: "Esta data está fechada para reservas" },
      { status: 400 }
    );
  }

  // Validar: data está dentro do booking window
  const bookingWindow = getBookingWindowDatesFrom(allSettings);
  const [year, month, day] = data.date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  if (dateObj < bookingWindow.min || dateObj > bookingWindow.max) {
    return NextResponse.json(
      { error: "Data fora da janela de reservas" },
      { status: 400 }
    );
  }

  // Validar: time slot existe e está disponível para o dia
  const availableSlots = getAvailableTimeSlotsFrom(
    data.date,
    allTimeSlots,
    allExceptionDates
  );
  const timeSlot = availableSlots.find((ts) => ts.id === data.time_slot_id);
  if (!timeSlot) {
    return NextResponse.json(
      { error: "Horário não disponível para esta data" },
      { status: 400 }
    );
  }

  // Encontrar tipo de acomodação para o email
  const accommodationType = (accommodationTypes ?? []).find(
    (at) => at.id === data.accommodation_type_id
  );

  // Atomic reservation creation (prevents double-booking)
  const { data: rpcResult, error: rpcError } = await supabase
    .rpc("create_reservation_atomic", {
      p_restaurant_id: restaurantId,
      p_first_name: data.first_name,
      p_last_name: data.last_name,
      p_email: data.email,
      p_phone: data.phone ?? null,
      p_preferred_locale: data.preferred_locale,
      p_accommodation_type_id: data.accommodation_type_id,
      p_time_slot_id: data.time_slot_id,
      p_date: data.date,
      p_reservation_time: timeSlot.start_time,
      p_party_size: data.party_size,
      p_special_requests: data.special_requests || null,
      p_source: "online",
      p_stripe_customer_id: data.stripe_customer_id ?? null,
      p_stripe_payment_method_id: data.stripe_payment_method_id ?? null,
    });

  if (rpcError) {
    console.error("RPC create_reservation_atomic error:", rpcError);
    return NextResponse.json({ error: "Erro ao criar reserva" }, { status: 500 });
  }

  const result = rpcResult as { id?: string; cancellation_token?: string; customer_id?: string; error?: string };

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Fire-and-forget — don't block response
  const cancellationLink = `${process.env.NEXT_PUBLIC_APP_URL}/cancelar/${result.cancellation_token}`;

  Promise.all([
    sendConfirmationEmail({
      to: data.email,
      firstName: data.first_name,
      date: data.date,
      timeLabel: timeSlot.name,
      accommodationLabel: accommodationType?.name ?? "",
      partySize: data.party_size,
      specialRequests: data.special_requests ?? undefined,
      cancellationLink,
      locale: data.preferred_locale,
    }),
    sendAdminNotificationEmail({
      customerName: `${data.first_name} ${data.last_name}`,
      email: data.email,
      phone: data.phone,
      date: data.date,
      timeLabel: timeSlot.name,
      accommodationLabel: accommodationType?.name ?? "",
      partySize: data.party_size,
      specialRequests: data.special_requests ?? undefined,
      hasCard: !!data.stripe_payment_method_id,
      reservationId: result.id!,
    }),
  ]).catch(console.error);

  return NextResponse.json({
    id: result.id,
    cancellation_token: result.cancellation_token,
  });
}
