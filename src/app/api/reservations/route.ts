import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { fullReservationSchema } from "@/lib/validations/reservation";
import {
  getAvailableTimeSlotsFrom,
  getRemainingCapacityFrom,
  isDateClosedFrom,
  getBookingWindowDatesFrom,
} from "@/lib/availability";
import type {
  TimeSlot,
  CapacityRule,
  Reservation,
  ExceptionDate,
  Settings,
} from "@/types";
import { ReservationStatus } from "@/types";

export async function POST(request: NextRequest) {
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
  const parsed = fullReservationSchema.safeParse(body);
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

  // Buscar dados necessários para validação de capacidade
  const [
    { data: timeSlots },
    { data: capacityRules },
    { data: reservations },
    { data: exceptionDates },
    { data: settings },
  ] = await Promise.all([
    supabase
      .from("time_slots")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true),
    supabase
      .from("capacity_rules")
      .select("*")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("reservations")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("date", data.date),
    supabase
      .from("exception_dates")
      .select("*")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("settings")
      .select("*")
      .eq("restaurant_id", restaurantId),
  ]);

  const allTimeSlots = (timeSlots ?? []) as TimeSlot[];
  const allCapacityRules = (capacityRules ?? []) as CapacityRule[];
  const allReservations = (reservations ?? []) as Reservation[];
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

  // Validar: capacidade disponível
  const remaining = getRemainingCapacityFrom(
    data.date,
    data.time_slot_id,
    data.accommodation_type_id,
    allCapacityRules,
    allReservations,
    allExceptionDates
  );

  if (remaining < data.party_size) {
    return NextResponse.json(
      { error: "Capacidade insuficiente para o número de pessoas" },
      { status: 400 }
    );
  }

  // 1. Find or create customer
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("*")
    .ilike("email", data.email)
    .single();

  let customerId: string;

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone,
        preferred_locale: data.preferred_locale,
      })
      .select()
      .single();

    if (customerError || !newCustomer) {
      return NextResponse.json(
        { error: "Erro ao criar cliente" },
        { status: 500 }
      );
    }

    customerId = newCustomer.id;
  }

  // 2. Create reservation
  const cancellationToken = crypto.randomUUID();

  const { data: reservation, error: reservationError } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: restaurantId,
      customer_id: customerId,
      accommodation_type_id: data.accommodation_type_id,
      time_slot_id: data.time_slot_id,
      date: data.date,
      reservation_time: timeSlot.start_time,
      party_size: data.party_size,
      special_requests: data.special_requests || null,
      source: "online",
      locale: data.preferred_locale,
      status: ReservationStatus.PENDING,
      cancellation_token: cancellationToken,
    })
    .select()
    .single();

  if (reservationError || !reservation) {
    return NextResponse.json(
      { error: "Erro ao criar reserva" },
      { status: 500 }
    );
  }

  // 3. Insert status history
  await supabase.from("reservation_status_history").insert({
    reservation_id: reservation.id,
    from_status: null,
    to_status: ReservationStatus.PENDING,
  });

  return NextResponse.json({
    id: reservation.id,
    cancellation_token: cancellationToken,
    date: data.date,
    time_slot_id: data.time_slot_id,
    accommodation_type_id: data.accommodation_type_id,
    party_size: data.party_size,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    status: ReservationStatus.PENDING,
  });
}
