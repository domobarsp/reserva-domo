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

export type DashboardPeriod = "today" | "week" | "15days";

function getDateRange(period: DashboardPeriod): { start: string; end: string } {
  const today = new Date();
  const start = today.toISOString().split("T")[0];
  const daysAhead = period === "week" ? 6 : period === "15days" ? 14 : 0;
  const end = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  return { start, end };
}

export interface DashboardData {
  periodReservations: ReservationFull[];
  period: DashboardPeriod;
  dateRange: { start: string; end: string };
  timeSlots: TimeSlot[];
  accommodationTypes: AccommodationType[];
  capacityRules: CapacityRule[];
  exceptionDates: ExceptionDate[];
}

export async function getDashboardData(
  period: DashboardPeriod = "today"
): Promise<DashboardData> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();
  const dateRange = getDateRange(period);

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
        .gte("date", dateRange.start)
        .lte("date", dateRange.end)
        .order("date", { ascending: true })
        .order("reservation_time", { ascending: true }),
      supabase.from("time_slots").select("*").eq("restaurant_id", restaurantId),
      supabase.from("accommodation_types").select("*").eq("restaurant_id", restaurantId),
      supabase.from("capacity_rules").select("*").eq("restaurant_id", restaurantId),
      supabase.from("exception_dates").select("*").eq("restaurant_id", restaurantId),
    ]);

  return {
    periodReservations: (reservationsRes.data ?? []) as unknown as ReservationFull[],
    period,
    dateRange,
    timeSlots: (timeSlotsRes.data ?? []) as TimeSlot[],
    accommodationTypes: (accommodationsRes.data ?? []) as AccommodationType[],
    capacityRules: (capacityRes.data ?? []) as CapacityRule[],
    exceptionDates: (exceptionsRes.data ?? []) as ExceptionDate[],
  };
}
