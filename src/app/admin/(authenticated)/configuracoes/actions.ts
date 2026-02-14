"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ActionResult } from "@/lib/actions/types";
import type { Settings } from "@/types";

export async function getSettings(): Promise<Settings[]> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("restaurant_id", restaurantId);

  if (error) {
    console.error("Erro ao buscar configurações:", error);
    return [];
  }

  return (data ?? []) as Settings[];
}

export async function updateSetting(
  key: string,
  value: Record<string, unknown>
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { error } = await supabase
    .from("settings")
    .update({ value })
    .eq("restaurant_id", restaurantId)
    .eq("key", key);

  if (error) {
    return {
      success: false,
      error: "Erro ao atualizar configuração: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes");
  return { success: true, data: undefined };
}
