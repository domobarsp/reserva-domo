import { createClient } from "@/utils/supabase/server";

let cachedRestaurantId: string | null = null;

export async function getRestaurantId(): Promise<string> {
  if (cachedRestaurantId) return cachedRestaurantId;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select("id")
    .single();

  if (error || !data) {
    throw new Error("Restaurante não encontrado");
  }

  cachedRestaurantId = data.id;
  return data.id;
}
