"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ActionResult } from "@/lib/actions/types";
import type { WalkIn, CreateWalkInInput } from "@/types";

export async function getWalkIns(): Promise<WalkIn[]> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("walk_ins")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar passantes:", error);
    return [];
  }

  return (data ?? []) as WalkIn[];
}

export async function createWalkIn(
  input: CreateWalkInInput
): Promise<ActionResult<WalkIn>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("walk_ins")
    .insert({
      restaurant_id: restaurantId,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone,
      party_size: input.party_size,
      special_requests: input.special_requests,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Erro ao registrar: " + error.message };
  }

  revalidatePath("/admin/passantes");
  return { success: true, data: data as WalkIn };
}
