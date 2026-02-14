"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ActionResult } from "@/lib/actions/types";
import type { WaitlistEntry, CreateWaitlistInput } from "@/types";
import { WaitlistStatus } from "@/types";

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("waitlist_entries")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("arrival_time", { ascending: false });

  if (error) {
    console.error("Erro ao buscar lista de espera:", error);
    return [];
  }

  return (data ?? []) as WaitlistEntry[];
}

export async function createWaitlistEntry(
  input: CreateWaitlistInput
): Promise<ActionResult<WaitlistEntry>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("waitlist_entries")
    .insert({
      restaurant_id: restaurantId,
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone,
      party_size: input.party_size,
      special_requests: input.special_requests,
      status: "waiting",
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Erro ao adicionar: " + error.message };
  }

  revalidatePath("/admin/lista-espera");
  return { success: true, data: data as WaitlistEntry };
}

export async function updateWaitlistStatus(
  id: string,
  status: WaitlistStatus
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = { status };
  if (status === WaitlistStatus.SEATED) {
    updates.seated_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("waitlist_entries")
    .update(updates)
    .eq("id", id);

  if (error) {
    return { success: false, error: "Erro ao atualizar: " + error.message };
  }

  revalidatePath("/admin/lista-espera");
  return { success: true, data: undefined };
}
