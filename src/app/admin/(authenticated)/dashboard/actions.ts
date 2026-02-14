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

export interface DashboardData {
  todayReservations: ReservationFull[];
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();
  const today = new Date().toISOString().split("T")[0];

  const [reservationsRes, timeSlotsRes, accommodationsRes, capacityRes, exceptionsRes] =
    await Promise.all([
      supabase
        .from("reservations")
        .select(
          `
          *,
          customer:customers(*),
          accommodation_type:accommodation_types(*),
          time_slot:time_slots(*)
        `
        )
        .eq("restaurant_id", restaurantId)
        .eq("date", today)
        .order("reservation_time", { ascending: true }),
      supabase
        .from("time_slots")
        .select("*")
        .eq("restaurant_id", restaurantId),
      supabase
        .from("accommodation_types")
        .select("*")
        .eq("restaurant_id", restaurantId),
      supabase
        .from("capacity_rules")
        .select("*")
        .eq("restaurant_id", restaurantId),
      supabase
        .from("exception_dates")
        .select("*")
        .eq("restaurant_id", restaurantId),
    ]);

  return {
    todayReservations: (reservationsRes.data ?? []) as unknown as ReservationFull[],
    timeSlots: (timeSlotsRes.data ?? []) as TimeSlot[],
    accommodationTypes: (accommodationsRes.data ?? []) as AccommodationType[],
    capacityRules: (capacityRes.data ?? []) as CapacityRule[],
    exceptionDates: (exceptionsRes.data ?? []) as ExceptionDate[],
  };
}
