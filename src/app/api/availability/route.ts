import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  getAvailableTimeSlotsFrom,
  getAvailableAccommodationsFrom,
  isDateClosedFrom,
  requiresCardGuaranteeFrom,
  getBookingWindowDatesFrom,
  dateToStr,
} from "@/lib/availability";
import type {
  TimeSlot,
  AccommodationType,
  CapacityRule,
  Reservation,
  ExceptionDate,
  Settings,
} from "@/types";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Parâmetro 'date' obrigatório no formato YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Buscar restaurant_id (single-tenant)
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

  // Buscar todos os dados necessários em paralelo
  const [
    { data: timeSlots },
    { data: accommodationTypes },
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
      .from("accommodation_types")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .order("display_order"),
    supabase
      .from("capacity_rules")
      .select("*")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("reservations")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("date", date),
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
  const allAccommodationTypes = (accommodationTypes ?? []) as AccommodationType[];
  const allCapacityRules = (capacityRules ?? []) as CapacityRule[];
  const allReservations = (reservations ?? []) as Reservation[];
  const allExceptionDates = (exceptionDates ?? []) as ExceptionDate[];
  const allSettings = (settings ?? []) as Settings[];

  // Verificar se a data está fechada
  if (isDateClosedFrom(date, allExceptionDates)) {
    return NextResponse.json({
      available: false,
      reason: "closed",
      timeSlots: [],
      accommodations: [],
      requiresCard: false,
      bookingWindow: null,
    });
  }

  // Verificar booking window
  const bookingWindow = getBookingWindowDatesFrom(allSettings);
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);

  if (dateObj < bookingWindow.min || dateObj > bookingWindow.max) {
    return NextResponse.json({
      available: false,
      reason: "outside_booking_window",
      timeSlots: [],
      accommodations: [],
      requiresCard: false,
      bookingWindow: {
        min: dateToStr(bookingWindow.min),
        max: dateToStr(bookingWindow.max),
      },
    });
  }

  // Buscar time slots disponíveis para o dia da semana
  const availableTimeSlots = getAvailableTimeSlotsFrom(
    date,
    allTimeSlots,
    allExceptionDates
  );

  // Para cada time slot, buscar acomodações com vagas
  const timeSlotsWithAccommodations = availableTimeSlots.map((ts) => {
    const accommodations = getAvailableAccommodationsFrom(
      date,
      ts.id,
      allAccommodationTypes,
      allCapacityRules,
      allReservations,
      allExceptionDates
    );

    return {
      id: ts.id,
      name: ts.name,
      start_time: ts.start_time,
      end_time: ts.end_time,
      accommodations,
    };
  });

  const requiresCard = requiresCardGuaranteeFrom(
    date,
    allExceptionDates,
    allSettings
  );

  return NextResponse.json({
    available: true,
    timeSlots: timeSlotsWithAccommodations,
    requiresCard,
    bookingWindow: {
      min: dateToStr(bookingWindow.min),
      max: dateToStr(bookingWindow.max),
    },
  });
}
