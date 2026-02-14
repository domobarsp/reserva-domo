"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ActionResult } from "@/lib/actions/types";
import type {
  ExceptionDate,
  CreateExceptionDateInput,
  AccommodationType,
} from "@/types";

export async function getExceptionData(): Promise<{
  exceptionDates: ExceptionDate[];
  accommodationTypes: AccommodationType[];
}> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const [exceptionsRes, accommodationsRes] = await Promise.all([
    supabase
      .from("exception_dates")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("date", { ascending: true }),
    supabase
      .from("accommodation_types")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: true }),
  ]);

  return {
    exceptionDates: (exceptionsRes.data ?? []) as ExceptionDate[],
    accommodationTypes: (accommodationsRes.data ?? []) as AccommodationType[],
  };
}

export async function createExceptionDate(
  input: CreateExceptionDateInput
): Promise<ActionResult<ExceptionDate>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from("exception_dates")
    .insert({
      restaurant_id: restaurantId,
      date: input.date,
      is_closed: input.is_closed,
      reason: input.reason,
      capacity_override: input.capacity_override,
      card_guarantee_override: input.card_guarantee_override,
      no_show_fee_override: input.no_show_fee_override,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: "Erro ao criar exceção: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/excecoes");
  return { success: true, data: data as ExceptionDate };
}

export async function updateExceptionDate(
  id: string,
  updates: Partial<ExceptionDate>
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { id: _id, restaurant_id: _rid, created_at: _ca, updated_at: _ua, ...safeUpdates } = updates;

  const { error } = await supabase
    .from("exception_dates")
    .update(safeUpdates)
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao atualizar exceção: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/excecoes");
  return { success: true, data: undefined };
}

export async function deleteExceptionDate(
  id: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("exception_dates")
    .delete()
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao excluir exceção: " + error.message,
    };
  }

  revalidatePath("/admin/configuracoes/excecoes");
  return { success: true, data: undefined };
}
