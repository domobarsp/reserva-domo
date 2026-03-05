"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import { isValidTransition } from "@/lib/status-transitions";
import type { ActionResult } from "@/lib/actions/types";
import type {
  ReservationFull,
  Reservation,
  ReservationEditHistory,
  NoShowFeeSettings,
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

export type NoShowFeeSource =
  | "reservation_override"
  | "date_override"
  | "default"
  | "none";

export interface ReservationDetails extends ReservationFull {
  statusHistory: import("@/types").ReservationStatusHistory[];
  editHistory: ReservationEditHistory[];
  effectiveNoShowFee: number | null;
  noShowFeeSource: NoShowFeeSource;
}

export async function getReservationDetails(
  id: string
): Promise<ReservationDetails | null> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const [reservationRes, statusHistoryRes, editHistoryRes] = await Promise.all([
    supabase
      .from("reservations")
      .select(
        `
        *,
        customer:customers(*),
        accommodation_type:accommodation_types(*),
        time_slot:time_slots(*)
      `
      )
      .eq("id", id)
      .single(),
    supabase
      .from("reservation_status_history")
      .select("*")
      .eq("reservation_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("reservation_edit_history")
      .select("*")
      .eq("reservation_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (reservationRes.error || !reservationRes.data) return null;

  const reservation = reservationRes.data as unknown as ReservationFull;

  // Resolve effective no-show fee
  let effectiveNoShowFee: number | null = null;
  let noShowFeeSource: NoShowFeeSource = "none";

  if (reservation.no_show_fee_override !== null) {
    effectiveNoShowFee = reservation.no_show_fee_override;
    noShowFeeSource = "reservation_override";
  } else {
    // Check exception date
    const { data: exceptionDate } = await supabase
      .from("exception_dates")
      .select("no_show_fee_override")
      .eq("restaurant_id", restaurantId)
      .eq("date", reservation.date)
      .maybeSingle();

    if (exceptionDate?.no_show_fee_override !== null && exceptionDate?.no_show_fee_override !== undefined) {
      effectiveNoShowFee = exceptionDate.no_show_fee_override;
      noShowFeeSource = "date_override";
    } else {
      // Check global settings
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("restaurant_id", restaurantId)
        .eq("key", "no_show_fee")
        .maybeSingle();

      if (setting?.value) {
        const feeSettings = setting.value as NoShowFeeSettings;
        effectiveNoShowFee = feeSettings.amount ?? null;
        noShowFeeSource = effectiveNoShowFee !== null ? "default" : "none";
      }
    }
  }

  return {
    ...reservation,
    statusHistory: (statusHistoryRes.data ?? []) as import("@/types").ReservationStatusHistory[],
    editHistory: (editHistoryRes.data ?? []) as ReservationEditHistory[],
    effectiveNoShowFee,
    noShowFeeSource,
  };
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

  // Fetch current reservation (with joins) to detect changes
  const { data: current } = await supabase
    .from("reservations")
    .select("*, accommodation_type:accommodation_types(id, name)")
    .eq("id", id)
    .single();

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

  // Log edit history when relevant fields change
  if (current) {
    type ChangeEntry = { field: string; label: string; from: string; to: string };
    const changes: ChangeEntry[] = [];

    if (safeUpdates.date && safeUpdates.date !== current.date) {
      changes.push({ field: "date", label: "Data", from: current.date, to: safeUpdates.date });
    }
    if (safeUpdates.reservation_time && safeUpdates.reservation_time !== current.reservation_time) {
      changes.push({ field: "reservation_time", label: "Horário", from: current.reservation_time, to: safeUpdates.reservation_time });
    }
    if (safeUpdates.accommodation_type_id && safeUpdates.accommodation_type_id !== current.accommodation_type_id) {
      // Fetch new accommodation name
      const { data: newAccom } = await supabase
        .from("accommodation_types")
        .select("name")
        .eq("id", safeUpdates.accommodation_type_id)
        .single();
      const currentAccom = (current as unknown as { accommodation_type?: { name?: string } }).accommodation_type;
      changes.push({
        field: "accommodation_type_id",
        label: "Acomodação",
        from: currentAccom?.name ?? current.accommodation_type_id,
        to: newAccom?.name ?? safeUpdates.accommodation_type_id,
      });
    }
    if (safeUpdates.party_size !== undefined && safeUpdates.party_size !== current.party_size) {
      changes.push({ field: "party_size", label: "Pessoas", from: String(current.party_size), to: String(safeUpdates.party_size) });
    }
    if ("special_requests" in safeUpdates && safeUpdates.special_requests !== current.special_requests) {
      const oldVal = current.special_requests ?? "";
      const newVal = (safeUpdates.special_requests as string | null) ?? "";
      if (oldVal !== newVal) {
        changes.push({ field: "special_requests", label: "Solicitações", from: oldVal || "(vazio)", to: newVal || "(vazio)" });
      }
    }
    if ("no_show_fee_override" in safeUpdates) {
      const oldFee = current.no_show_fee_override;
      const newFee = safeUpdates.no_show_fee_override as number | null;
      if (oldFee !== newFee) {
        const fmtFee = (v: number | null) =>
          v === null ? "padrão" : v === 0 ? "isento" : `R$ ${(v / 100).toFixed(2)}`;
        changes.push({ field: "no_show_fee_override", label: "Taxa de no-show", from: fmtFee(oldFee), to: fmtFee(newFee) });
      }
    }

    if (changes.length > 0) {
      await supabase.from("reservation_edit_history").insert({
        reservation_id: id,
        changes,
      });
    }
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
