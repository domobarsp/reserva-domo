import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { ReservationForm } from "@/components/features/reservation/reservation-form";
import { getBookingWindowDatesFrom, dateToStr } from "@/lib/availability";
import type { Settings, ExceptionDate } from "@/types";
import {
  SITE_NAME,
  getSiteUrl,
  buildOpenGraphMetadata,
  buildTwitterMetadata,
} from "@/lib/site-metadata";

const title = "Reservar mesa";
const description =
  "Faça sua reserva online no Dōmo. Escolha data, horário e acomodação.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/reserva",
  },
  openGraph: buildOpenGraphMetadata({
    title: `${title} | ${SITE_NAME}`,
    description,
    url: `${getSiteUrl()}/reserva`,
  }),
  twitter: buildTwitterMetadata({
    title: `${title} | ${SITE_NAME}`,
    description,
  }),
  robots: {
    index: true,
    follow: true,
  },
};

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

  const noShowFeeSetting = allSettings.find((s) => s.key === "no_show_fee");
  const noShowFee =
    noShowFeeSetting != null
      ? ((noShowFeeSetting.value as { amount?: number }).amount ?? null)
      : null;

  return (
    <ReservationForm
      initialBookingWindow={{
        min: dateToStr(bookingWindow.min),
        max: dateToStr(bookingWindow.max),
      }}
      closedDates={closedDates}
      noShowFee={noShowFee ?? undefined}
    />
  );
}
