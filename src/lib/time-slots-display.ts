import type { TimeSlot } from "@/types";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

export function formatTimeShort(time: string) {
  return time.slice(0, 5);
}

export function formatTimeSlotDays(days: number[]) {
  if (!days?.length) return "";
  if (days.length === 7) return "Diário";
  return days.map((d) => DAY_NAMES[d] ?? d).join(", ");
}

export type TimeSlotDisplay = Pick<
  TimeSlot,
  "id" | "name" | "start_time" | "end_time" | "days_of_week"
>;

export function formatTimeSlotLine(slot: TimeSlotDisplay) {
  const days = formatTimeSlotDays(slot.days_of_week ?? []);
  const time = `${formatTimeShort(slot.start_time)} às ${formatTimeShort(slot.end_time)}`;
  return days ? `${slot.name} — ${time} (${days})` : `${slot.name} — ${time}`;
}
