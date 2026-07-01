import { createAdminClient } from "@/utils/supabase/admin";
import type { Restaurant, RestaurantPhoto, TimeSlot } from "@/types";

export interface EstablishmentPageData {
  restaurant: Restaurant;
  photos: RestaurantPhoto[];
  timeSlots: Pick<
    TimeSlot,
    "id" | "name" | "start_time" | "end_time" | "days_of_week"
  >[];
}

export async function getEstablishmentPageData(): Promise<EstablishmentPageData | null> {
  const supabase = createAdminClient();

  const [{ data: restaurantData }, { data: photosData }, { data: timeSlotsData }] =
    await Promise.all([
      supabase.from("restaurants").select("*").single(),
      supabase
        .from("restaurant_photos")
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("time_slots")
        .select("id, name, start_time, end_time, days_of_week")
        .eq("is_active", true)
        .order("start_time"),
    ]);

  if (!restaurantData) return null;

  return {
    restaurant: restaurantData as Restaurant,
    photos: (photosData ?? []) as RestaurantPhoto[],
    timeSlots: (timeSlotsData ?? []) as EstablishmentPageData["timeSlots"],
  };
}
