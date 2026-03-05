import type {
  TimeSlot,
  AccommodationType,
  CapacityRule,
  Reservation,
  ExceptionDate,
  Settings,
  CardGuaranteeDaysSettings,
  BookingWindowSettings,
} from "@/types";
import { ReservationStatus } from "@/types";

// ===========================
// Pure helpers (no data dependency)
// ===========================

/**
 * Retorna o dia da semana (0=Dom, 6=Sáb) para uma data string "YYYY-MM-DD"
 */
export function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

/**
 * Retorna a data de hoje no formato "YYYY-MM-DD"
 */
export function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Converte Date para string "YYYY-MM-DD"
 */
export function dateToStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Retorna hoje como string "YYYY-MM-DD"
 */
export function getToday(): string {
  return getTodayStr();
}

/**
 * Formata data "YYYY-MM-DD" para exibição em PT-BR (formato longo)
 */
export function formatDatePtBr(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formata data "YYYY-MM-DD" para formato compacto: "Sex., 27/02/2026"
 */
export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" });
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${dd}/${mm}/${year}`;
}

// ===========================
// Parameterized functions (accept data as arguments)
// Used by admin pages that have mutable state via Context
// ===========================

const ACTIVE_STATUSES = [
  ReservationStatus.PENDING,
  ReservationStatus.CONFIRMED,
  ReservationStatus.SEATED,
];

/**
 * Verifica se uma data está fechada.
 */
export function isDateClosedFrom(
  dateStr: string,
  exceptionDates: ExceptionDate[]
): boolean {
  return exceptionDates.some((ex) => ex.date === dateStr && ex.is_closed);
}

/**
 * Retorna time_slots ativos para o dia da semana da data.
 */
export function getAvailableTimeSlotsFrom(
  dateStr: string,
  allTimeSlots: TimeSlot[],
  exceptionDates: ExceptionDate[]
): TimeSlot[] {
  if (isDateClosedFrom(dateStr, exceptionDates)) return [];
  const dayOfWeek = getDayOfWeek(dateStr);
  return allTimeSlots.filter(
    (ts) => ts.is_active && ts.days_of_week.includes(dayOfWeek)
  );
}

/**
 * Calcula vagas restantes para uma combinação de data + horário + acomodação.
 */
export function getRemainingCapacityFrom(
  dateStr: string,
  timeSlotId: string,
  accommodationTypeId: string,
  capacityRules: CapacityRule[],
  reservations: Reservation[],
  exceptionDates: ExceptionDate[]
): number {
  const rule = capacityRules.find(
    (cr) =>
      cr.time_slot_id === timeSlotId &&
      cr.accommodation_type_id === accommodationTypeId
  );
  if (!rule) return 0;

  let maxCovers = rule.max_covers;

  const exception = exceptionDates.find((ex) => ex.date === dateStr);
  if (exception?.capacity_override?.[accommodationTypeId]) {
    maxCovers = exception.capacity_override[accommodationTypeId].max_covers;
  }

  const bookedCovers = reservations
    .filter(
      (r) =>
        r.date === dateStr &&
        r.time_slot_id === timeSlotId &&
        r.accommodation_type_id === accommodationTypeId &&
        ACTIVE_STATUSES.includes(r.status)
    )
    .reduce((sum, r) => sum + r.party_size, 0);

  return Math.max(0, maxCovers - bookedCovers);
}

/**
 * Retorna accommodation_types com vagas restantes para data + horário.
 */
export function getAvailableAccommodationsFrom(
  dateStr: string,
  timeSlotId: string,
  allAccommodationTypes: AccommodationType[],
  capacityRules: CapacityRule[],
  reservations: Reservation[],
  exceptionDates: ExceptionDate[]
): (AccommodationType & { remaining: number })[] {
  return allAccommodationTypes
    .filter((at) => at.is_active)
    .map((at) => ({
      ...at,
      remaining: getRemainingCapacityFrom(
        dateStr,
        timeSlotId,
        at.id,
        capacityRules,
        reservations,
        exceptionDates
      ),
    }));
}

/**
 * Calcula o total de max_covers para uma data (soma de todas as combinações de acomodação × horário).
 */
export function getTotalCapacityForDate(
  dateStr: string,
  allTimeSlots: TimeSlot[],
  allAccommodationTypes: AccommodationType[],
  capacityRules: CapacityRule[],
  exceptionDates: ExceptionDate[]
): number {
  const availableSlots = getAvailableTimeSlotsFrom(
    dateStr,
    allTimeSlots,
    exceptionDates
  );
  let total = 0;
  for (const ts of availableSlots) {
    for (const at of allAccommodationTypes.filter((a) => a.is_active)) {
      const rule = capacityRules.find(
        (cr) =>
          cr.time_slot_id === ts.id && cr.accommodation_type_id === at.id
      );
      if (!rule) continue;
      let maxCovers = rule.max_covers;
      const exception = exceptionDates.find((ex) => ex.date === dateStr);
      if (exception?.capacity_override?.[at.id]) {
        maxCovers = exception.capacity_override[at.id].max_covers;
      }
      total += maxCovers;
    }
  }
  return total;
}

/**
 * Verifica se a data exige garantia de cartão.
 */
export function requiresCardGuaranteeFrom(
  dateStr: string,
  exceptionDates: ExceptionDate[],
  allSettings: Settings[]
): boolean {
  const exception = exceptionDates.find((ex) => ex.date === dateStr);
  if (
    exception?.card_guarantee_override !== undefined &&
    exception.card_guarantee_override !== null
  ) {
    return exception.card_guarantee_override;
  }

  const cardGuaranteeSetting = allSettings.find(
    (s) => s.key === "card_guarantee_days"
  );
  if (!cardGuaranteeSetting) return false;

  const { days } =
    cardGuaranteeSetting.value as unknown as CardGuaranteeDaysSettings;
  const dayOfWeek = getDayOfWeek(dateStr);
  return days.includes(dayOfWeek);
}

/**
 * Retorna min e max de datas aceitáveis para reserva.
 */
export function getBookingWindowDatesFrom(
  allSettings: Settings[]
): { min: Date; max: Date } {
  const bookingWindowSetting = allSettings.find(
    (s) => s.key === "booking_window_days"
  );
  const windowDays = bookingWindowSetting
    ? (bookingWindowSetting.value as unknown as BookingWindowSettings).value
    : 30;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + windowDays);

  return { min: today, max: maxDate };
}

