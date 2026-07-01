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

  const { data: restaurantData, error: restaurantError } = await supabase
    .from("restaurants")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (restaurantError) {
    console.error(
      "[getEstablishmentPageData] restaurants:",
      restaurantError.message
    );
    return null;
  }

  if (!restaurantData) return null;

  const restaurantId = restaurantData.id;

  const [{ data: photosData, error: photosError }, { data: timeSlotsData, error: timeSlotsError }] =
    await Promise.all([
      supabase
        .from("restaurant_photos")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("display_order", { ascending: true }),
      supabase
        .from("time_slots")
        .select("id, name, start_time, end_time, days_of_week")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .order("start_time"),
    ]);

  if (photosError) {
    console.error(
      "[getEstablishmentPageData] restaurant_photos:",
      photosError.message
    );
  }

  if (timeSlotsError) {
    console.error(
      "[getEstablishmentPageData] time_slots:",
      timeSlotsError.message
    );
  }

  return {
    restaurant: restaurantData as Restaurant,
    photos: (photosData ?? []) as RestaurantPhoto[],
    timeSlots: (timeSlotsData ?? []) as EstablishmentPageData["timeSlots"],
  };
}
