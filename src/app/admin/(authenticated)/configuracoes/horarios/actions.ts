"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ActionResult } from "@/lib/actions/types";
import type { TimeSlot, CreateTimeSlotInput } from "@/types";

export async function getTimeSlots(): Promise<TimeSlot[]> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Erro ao buscar horários:", error);
    return [];
  }

  return (data ?? []) as TimeSlot[];
}

export async function createTimeSlot(
  input: CreateTimeSlotInput
): Promise<ActionResult<TimeSlot>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("time_slots")
    .insert({
      restaurant_id: restaurantId,
      name: input.name,
      start_time: input.start_time,
      end_time: input.end_time,
      days_of_week: input.days_of_week,
      is_active: input.is_active,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Erro ao criar horário: " + error.message };
  }

  revalidatePath("/admin/configuracoes/horarios");
  return { success: true, data: data as TimeSlot };
}

export async function updateTimeSlot(
  id: string,
  updates: Partial<TimeSlot>
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { id: _id, restaurant_id: _rid, created_at: _ca, updated_at: _ua, ...safeUpdates } = updates;

  const { error } = await supabase
    .from("time_slots")
    .update(safeUpdates)
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao atualizar horário: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/horarios");
  return { success: true, data: undefined };
}

export async function deleteTimeSlot(
  id: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase.from("time_slots").delete().eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao excluir horário: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/horarios");
  return { success: true, data: undefined };
}
