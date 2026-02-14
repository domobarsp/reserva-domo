import { createAdminClient } from "@/utils/supabase/admin";
import { ReservationForm } from "@/components/features/reservation/reservation-form";
import { getBookingWindowDatesFrom, dateToStr } from "@/lib/availability";
import type { Settings, ExceptionDate } from "@/types";

export default async function ReservaPage() {
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .single();

  const restaurantId = restaurant?.id;

  const [{ data: settings }, { data: exceptionDates }] = await Promise.all([
    supabase.from("settings").select("*").eq("restaurant_id", restaurantId),
    supabase
      .from("exception_dates")
      .select("*")
      .eq("restaurant_id", restaurantId),
  ]);

  const allSettings = (settings ?? []) as Settings[];
  const allExceptionDates = (exceptionDates ?? []) as ExceptionDate[];

  const bookingWindow = getBookingWindowDatesFrom(allSettings);
  const closedDates = allExceptionDates
    .filter((ex) => ex.is_closed)
    .map((ex) => ex.date);

  return (
    <ReservationForm
      initialBookingWindow={{
        min: dateToStr(bookingWindow.min),
        max: dateToStr(bookingWindow.max),
      }}
      closedDates={closedDates}
    />
  );
}
