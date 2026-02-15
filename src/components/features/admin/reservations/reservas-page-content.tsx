"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ReservationFilters } from "@/components/features/admin/reservations/reservation-filters";
import { ReservationTable } from "@/components/features/admin/reservations/reservation-table";
import { ReservationCreateDialog } from "@/components/features/admin/reservations/reservation-create-dialog";
import { ReservationEditDialog } from "@/components/features/admin/reservations/reservation-edit-dialog";
import type { ReservationFull, AccommodationType, TimeSlot } from "@/types";
import { ReservationStatus } from "@/types";
import { getStatusLabel } from "@/lib/status-transitions";
import { getTodayStr } from "@/lib/availability";
import { updateReservationStatus } from "@/app/admin/(authenticated)/reservas/actions";

interface ReservasPageContentProps {
  initialReservations: ReservationFull[];
  accommodationTypes: AccommodationType[];
  timeSlots: TimeSlot[];
}

export function ReservasPageContent({
  initialReservations,
  accommodationTypes,
  timeSlots,
}: ReservasPageContentProps) {
  const router = useRouter();
  useRealtimeSubscription({ table: "reservations" });
  const searchParams = useSearchParams();
  const filterDate = searchParams.get("date") ?? getTodayStr();
  const filterStatus = searchParams.get("status") ?? "";
  const filterAccommodationType = searchParams.get("accommodation") ?? "";

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<ReservationFull | null>(null);

  const filteredReservations = useMemo(() => {
    return initialReservations.filter((r) => {
      if (filterDate && r.date !== filterDate) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterAccommodationType && r.accommodation_type_id !== filterAccommodationType) return false;
      return true;
    });
  }, [initialReservations, filterDate, filterStatus, filterAccommodationType]);

  const handleFilterChange = useCallback(
    (newFilters: {
      date: string;
      status: string;
      accommodationType: string;
    }) => {
      const params = new URLSearchParams();
      if (newFilters.date) params.set("date", newFilters.date);
      if (newFilters.status) params.set("status", newFilters.status);
      if (newFilters.accommodationType) params.set("accommodation", newFilters.accommodationType);
      const query = params.toString();
      router.replace(`/admin/reservas${query ? `?${query}` : ""}`);
    },
    [router]
  );

  const handleStatusChange = useCallback(
    async (id: string, newStatus: ReservationStatus) => {
      const result = await updateReservationStatus(id, newStatus);
      if (result.success) {
        toast.success(
          `Status alterado para ${getStatusLabel(newStatus)}`
        );
        router.refresh();
      } else {
        toast.error(result.error);
      }
    },
    [router]
  );

  const handleEdit = useCallback((reservation: ReservationFull) => {
    setEditingReservation(reservation);
    setEditDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Filters */}
      <ReservationFilters
        onFilterChange={handleFilterChange}
        defaultDate={filterDate}
        defaultStatus={filterStatus}
        defaultAccommodationType={filterAccommodationType}
        accommodationTypes={accommodationTypes}
      />

      {/* Table */}
      <ReservationTable
        reservations={filteredReservations}
        onStatusChange={handleStatusChange}
        onEdit={handleEdit}
      />

      {/* Dialogs */}
      <ReservationCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        accommodationTypes={accommodationTypes}
        timeSlots={timeSlots}
        onSuccess={handleSuccess}
      />
      <ReservationEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        reservation={editingReservation}
        accommodationTypes={accommodationTypes}
        timeSlots={timeSlots}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
