"use server";

import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type {
  ReservationFull,
  TimeSlot,
  AccommodationType,
  CapacityRule,
  ExceptionDate,
} from "@/types";

export interface CalendarioData {
  reservations: ReservationFull[];
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
}

export async function getCalendarioData(): Promise<CalendarioData> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const [reservationsRes, timeSlotsRes, accommodationsRes, capacityRes, exceptionsRes] =
    await Promise.all([
      supabase
        .from("reservations")
        .select(`*, customer:customers(*), accommodation_type:accommodation_types(*), time_slot:time_slots(*)`)
        .eq("restaurant_id", restaurantId),
      supabase
        .from("time_slots")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("start_time", { ascending: true }),
      supabase
        .from("accommodation_types")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("display_order", { ascending: true }),
      supabase
        .from("capacity_rules")
        .select("*")
        .eq("restaurant_id", restaurantId),
      supabase
        .from("exception_dates")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("date", { ascending: true }),
    ]);

  return {
    reservations: (reservationsRes.data ?? []) as ReservationFull[],
    timeSlots: (timeSlotsRes.data ?? []) as TimeSlot[],
    accommodationTypes: (accommodationsRes.data ?? []) as AccommodationType[],
    capacityRules: (capacityRes.data ?? []) as CapacityRule[],
    exceptionDates: (exceptionsRes.data ?? []) as ExceptionDate[],
  };
}
