"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import { isValidTransition } from "@/lib/status-transitions";
import type { ActionResult } from "@/lib/actions/types";
import type {
  ReservationFull,
  Reservation,
  CreateReservationInput,
  CreateCustomerInput,
  Customer,
} from "@/types";
import { ReservationStatus } from "@/types";

// ===========================
// Queries
// ===========================

interface ReservationFilters {
  date?: string;
  status?: string;
  accommodation_type_id?: string;
}

export async function getReservationsFull(
  filters?: ReservationFilters
): Promise<ReservationFull[]> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  let query = supabase
    .from("reservations")
    .select(
      `
      *,
      customer:customers(*),
      accommodation_type:accommodation_types(*),
      time_slot:time_slots(*)
    `
    )
    .eq("restaurant_id", restaurantId)
    .order("date", { ascending: true })
    .order("reservation_time", { ascending: true });

  if (filters?.date) {
    query = query.eq("date", filters.date);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.accommodation_type_id) {
    query = query.eq("accommodation_type_id", filters.accommodation_type_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar reservas:", error);
    return [];
  }

  return (data ?? []) as unknown as ReservationFull[];
}

export async function getReservationsForDate(
  dateStr: string
): Promise<ReservationFull[]> {
  return getReservationsFull({ date: dateStr });
}

// ===========================
// Mutations
// ===========================

async function findOrCreateCustomer(
  data: CreateCustomerInput
): Promise<ActionResult<Customer>> {
  const supabase = await createClient();

  // Buscar por email
  const { data: existing } = await supabase
    .from("customers")
    .select("*")
    .ilike("email", data.email)
    .single();

  if (existing) {
    return { success: true, data: existing as Customer };
  }

  // Criar novo
  const { data: created, error } = await supabase
    .from("customers")
    .insert({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      preferred_locale: data.preferred_locale,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: "Erro ao criar cliente: " + error.message };
  }

  return { success: true, data: created as Customer };
}

export async function createReservation(
  customerData: CreateCustomerInput,
  reservationData: Omit<CreateReservationInput, "customer_id">
): Promise<ActionResult<Reservation>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  // 1. Find or create customer
  const customerResult = await findOrCreateCustomer(customerData);
  if (!customerResult.success) {
    return { success: false, error: customerResult.error };
  }

  // 2. Insert reservation
  const { data, error } = await supabase
    .from("reservations")
    .insert({
      restaurant_id: restaurantId,
      customer_id: customerResult.data.id,
      accommodation_type_id: reservationData.accommodation_type_id,
      time_slot_id: reservationData.time_slot_id,
      date: reservationData.date,
      reservation_time: reservationData.reservation_time,
      party_size: reservationData.party_size,
      special_requests: reservationData.special_requests,
      source: reservationData.source,
      locale: reservationData.locale,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      error: "Erro ao criar reserva: " + error.message,
    };
  }

  // 3. Insert status history
  await supabase.from("reservation_status_history").insert({
    reservation_id: data.id,
    from_status: null,
    to_status: "pending",
  });

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/calendario");

  return { success: true, data: data as Reservation };
}

export async function updateReservation(
  id: string,
  updates: Partial<Reservation>
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  // Remover campos que não devem ser atualizados diretamente
  const {
    id: _id,
    restaurant_id: _rid,
    customer_id: _cid,
    created_at: _ca,
    updated_at: _ua,
    ...safeUpdates
  } = updates;

  const { error } = await supabase
    .from("reservations")
    .update(safeUpdates)
    .eq("id", id);

  if (error) {
    return {
      success: false,
      error: "Erro ao atualizar reserva: " + error.message,
    };
  }

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/calendario");

  return { success: true, data: undefined };
}

export async function updateReservationStatus(
  id: string,
  newStatus: ReservationStatus
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  // Buscar status atual
  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select("status")
    .eq("id", id)
    .single();

  if (fetchError || !reservation) {
    return { success: false, error: "Reserva não encontrada" };
  }

  const currentStatus = reservation.status as ReservationStatus;

  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      success: false,
      error: `Transição inválida: ${currentStatus} → ${newStatus}`,
    };
  }

  // Preparar updates
  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === ReservationStatus.CANCELLED) {
    updates.cancelled_at = new Date().toISOString();
    updates.cancelled_by = "admin";
  }

  const { error: updateError } = await supabase
    .from("reservations")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return {
      success: false,
      error: "Erro ao atualizar status: " + updateError.message,
    };
  }

  // Registrar histórico
  await supabase.from("reservation_status_history").insert({
    reservation_id: id,
    from_status: currentStatus,
    to_status: newStatus,
  });

  revalidatePath("/admin/reservas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/calendario");

  return { success: true, data: undefined };
}
