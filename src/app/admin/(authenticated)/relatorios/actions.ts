"use server";

import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ReservationFull, AccommodationType } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReportPeriod = "7d" | "30d" | "90d" | "custom";

export interface ReportKPIs {
  totalReservations: number;
  totalPessoas: number;
  noShowRate: number;       // 0-100
  cancellationRate: number; // 0-100
  confirmedRate: number;    // 0-100 (confirmed + seated + complete)
}

export interface DayData {
  date: string; // YYYY-MM-DD
  count: number;
  pessoas: number;
  // per-status breakdown for stacked bar chart
  pending: number;
  confirmed: number;
  seated: number;
  complete: number;
  no_show: number;
  cancelled: number;
}

export interface StatusData {
  status: string;
  label: string;
  count: number;
}

export interface AccommodationData {
  name: string;
  total: number;
  pessoas: number;
  noShows: number;
  noShowRate: number; // 0-100
}

export interface WalkInsMetrics {
  total: number;
  totalPessoas: number;
}

export interface WaitlistMetrics {
  total: number;
  seated: number;
  seatedRate: number; // 0-100
}

export interface ReportData {
  kpis: ReportKPIs;
  previousKPIs: ReportKPIs;
  byDay: DayData[];
  byStatus: StatusData[];
  byAccommodation: AccommodationData[];
  walkIns: WalkInsMetrics;
  waitlist: WaitlistMetrics;
  startDate: string;
  endDate: string;
  previousStartDate: string;
  previousEndDate: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  seated: "Sentado",
  complete: "Completo",
  no_show: "Não Compareceu",
  cancelled: "Cancelado",
};

function computeKPIs(reservations: ReservationFull[]): ReportKPIs {
  const total = reservations.length;
  const totalPessoas = reservations.reduce((s, r) => s + r.party_size, 0);
  const noShows = reservations.filter((r) => r.status === "no_show").length;
  const cancelled = reservations.filter((r) => r.status === "cancelled").length;
  const confirmed = reservations.filter(
    (r) => r.status === "confirmed" || r.status === "seated" || r.status === "complete"
  ).length;

  return {
    totalReservations: total,
    totalPessoas,
    noShowRate: total > 0 ? Math.round((noShows / total) * 100) : 0,
    cancellationRate: total > 0 ? Math.round((cancelled / total) * 100) : 0,
    confirmedRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
  };
}

type DayAccumulator = Omit<DayData, "date">;

function emptyDayAcc(): DayAccumulator {
  return { count: 0, pessoas: 0, pending: 0, confirmed: 0, seated: 0, complete: 0, no_show: 0, cancelled: 0 };
}

function buildByDay(reservations: ReservationFull[], startDate: string, endDate: string): DayData[] {
  const map = new Map<string, DayAccumulator>();

  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    map.set(d.toISOString().split("T")[0], emptyDayAcc());
  }

  for (const r of reservations) {
    const acc = map.get(r.date) ?? emptyDayAcc();
    acc.count += 1;
    acc.pessoas += r.party_size;
    const s = r.status as keyof DayAccumulator;
    if (s in acc) (acc[s] as number) += 1;
    map.set(r.date, acc);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, acc]) => ({ date, ...acc }));
}

function buildByStatus(reservations: ReservationFull[]): StatusData[] {
  const map = new Map<string, number>();
  for (const r of reservations) {
    map.set(r.status, (map.get(r.status) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([status, count]) => ({
    status,
    label: STATUS_LABELS[status] ?? status,
    count,
  }));
}

function buildByAccommodation(
  reservations: ReservationFull[],
  accommodationTypes: AccommodationType[]
): AccommodationData[] {
  const map = new Map<string, { name: string; total: number; pessoas: number; noShows: number }>();

  for (const at of accommodationTypes) {
    map.set(at.id, { name: at.name, total: 0, pessoas: 0, noShows: 0 });
  }

  for (const r of reservations) {
    const existing = map.get(r.accommodation_type_id);
    if (existing) {
      existing.total += 1;
      existing.pessoas += r.party_size;
      if (r.status === "no_show") existing.noShows += 1;
    }
  }

  return Array.from(map.values())
    .filter((a) => a.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((a) => ({
      ...a,
      noShowRate: a.total > 0 ? Math.round((a.noShows / a.total) * 100) : 0,
    }));
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

export async function getDateRangeForPeriod(
  period: ReportPeriod,
  customStart?: string,
  customEnd?: string
): Promise<{ start: string; end: string }> {
  if (period === "custom" && customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const end = new Date();
  const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

function getPreviousDateRange(startDate: string, endDate: string): { start: string; end: string } {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  const diffMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
  const prevStart = new Date(prevEnd.getTime() - diffMs);
  return {
    start: prevStart.toISOString().split("T")[0],
    end: prevEnd.toISOString().split("T")[0],
  };
}

// ---------------------------------------------------------------------------
// Main action
// ---------------------------------------------------------------------------

export async function getReportData(
  startDate: string,
  endDate: string
): Promise<ReportData> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { start: prevStart, end: prevEnd } = getPreviousDateRange(startDate, endDate);

  const startTs = `${startDate}T00:00:00`;
  const endTs = `${endDate}T23:59:59`;

  const [currentRes, previousRes, accommodationsRes, walkInsRes, waitlistRes] = await Promise.all([
    supabase
      .from("reservations")
      .select(`*, customer:customers(*), accommodation_type:accommodation_types(*), time_slot:time_slots(*)`)
      .eq("restaurant_id", restaurantId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("reservation_time", { ascending: true }),
    supabase
      .from("reservations")
      .select("status, party_size")
      .eq("restaurant_id", restaurantId)
      .gte("date", prevStart)
      .lte("date", prevEnd),
    supabase
      .from("accommodation_types")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true),
    supabase
      .from("walk_ins")
      .select("party_size")
      .eq("restaurant_id", restaurantId)
      .gte("created_at", startTs)
      .lte("created_at", endTs),
    supabase
      .from("waitlist_entries")
      .select("status, party_size")
      .eq("restaurant_id", restaurantId)
      .gte("arrival_time", startTs)
      .lte("arrival_time", endTs),
  ]);

  const current = (currentRes.data ?? []) as unknown as ReservationFull[];
  const previous = (previousRes.data ?? []) as unknown as ReservationFull[];
  const accommodationTypes = (accommodationsRes.data ?? []) as AccommodationType[];

  const walkInsData = walkInsRes.data ?? [];
  const walkIns: WalkInsMetrics = {
    total: walkInsData.length,
    totalPessoas: walkInsData.reduce((s, r) => s + (r.party_size ?? 0), 0),
  };

  const waitlistData = waitlistRes.data ?? [];
  const waitlistSeated = waitlistData.filter((e) => e.status === "seated").length;
  const waitlist: WaitlistMetrics = {
    total: waitlistData.length,
    seated: waitlistSeated,
    seatedRate: waitlistData.length > 0 ? Math.round((waitlistSeated / waitlistData.length) * 100) : 0,
  };

  return {
    kpis: computeKPIs(current),
    previousKPIs: computeKPIs(previous),
    byDay: buildByDay(current, startDate, endDate),
    byStatus: buildByStatus(current),
    byAccommodation: buildByAccommodation(current, accommodationTypes),
    walkIns,
    waitlist,
    startDate,
    endDate,
    previousStartDate: prevStart,
    previousEndDate: prevEnd,
  };
}
