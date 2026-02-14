"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ActionResult } from "@/lib/actions/types";
import type {
  CapacityRule,
  CreateCapacityRuleInput,
  AccommodationType,
  TimeSlot,
} from "@/types";

export async function getCapacityData(): Promise<{
  capacityRules: CapacityRule[];
  accommodationTypes: AccommodationType[];
  timeSlots: TimeSlot[];
}> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const [rulesRes, accommodationsRes, timeSlotsRes] = await Promise.all([
    supabase
      .from("capacity_rules")
      .select("*")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("accommodation_types")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: true }),
    supabase
      .from("time_slots")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("start_time", { ascending: true }),
  ]);

  return {
    capacityRules: (rulesRes.data ?? []) as CapacityRule[],
    accommodationTypes: (accommodationsRes.data ?? []) as AccommodationType[],
    timeSlots: (timeSlotsRes.data ?? []) as TimeSlot[],
  };
}

export async function createCapacityRule(
  input: CreateCapacityRuleInput
): Promise<ActionResult<CapacityRule>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("capacity_rules")
    .insert({
      restaurant_id: restaurantId,
      accommodation_type_id: input.accommodation_type_id,
      time_slot_id: input.time_slot_id,
      max_covers: input.max_covers,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: "Erro ao criar regra: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/capacidade");
  return { success: true, data: data as CapacityRule };
}

export async function updateCapacityRule(
  id: string,
  updates: Partial<CapacityRule>
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { id: _id, restaurant_id: _rid, created_at: _ca, updated_at: _ua, ...safeUpdates } = updates;

  const { error } = await supabase
    .from("capacity_rules")
    .update(safeUpdates)
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao atualizar regra: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/capacidade");
  return { success: true, data: undefined };
}

export async function deleteCapacityRule(
  id: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("capacity_rules")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao excluir regra: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/capacidade");
  return { success: true, data: undefined };
}
