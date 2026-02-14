"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ActionResult } from "@/lib/actions/types";
import type { AccommodationType, CreateAccommodationInput } from "@/types";

export async function getAccommodationTypes(): Promise<AccommodationType[]> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("accommodation_types")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Erro ao buscar acomodações:", error);
    return [];
  }

  return (data ?? []) as AccommodationType[];
}

export async function createAccommodationType(
  input: CreateAccommodationInput
): Promise<ActionResult<AccommodationType>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("accommodation_types")
    .insert({
      restaurant_id: restaurantId,
      name: input.name,
      description: input.description,
      min_seats: input.min_seats,
      max_seats: input.max_seats,
      display_order: input.display_order,
      is_active: input.is_active,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: "Erro ao criar acomodação: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/acomodacoes");
  return { success: true, data: data as AccommodationType };
}

export async function updateAccommodationType(
  id: string,
  updates: Partial<AccommodationType>
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { id: _id, restaurant_id: _rid, created_at: _ca, updated_at: _ua, ...safeUpdates } = updates;

  const { error } = await supabase
    .from("accommodation_types")
    .update(safeUpdates)
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao atualizar acomodação: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/acomodacoes");
  return { success: true, data: undefined };
}

export async function deleteAccommodationType(
  id: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("accommodation_types")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao excluir acomodação: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/acomodacoes");
  return { success: true, data: undefined };
}
