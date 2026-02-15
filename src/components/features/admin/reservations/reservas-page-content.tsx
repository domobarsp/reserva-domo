"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
  filterDate: string;
  filterStatus: string;
  filterAccommodationType: string;
}

function buildFiltersQuery(filters: {
  date: string;
  status: string;
  accommodationType: string;
}): string {
  const params = new URLSearchParams();
  if (filters.date) {
    params.set("date", filters.date);
  }
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.accommodationType) {
    params.set("accommodation", filters.accommodationType);
  }
  return params.toString();
}

function ReservationTableLoading() {
  return (
    <div
      className="space-y-2 overflow-hidden rounded-xl border border-border/60 p-3"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-11 w-full rounded-lg" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function ReservasPageContent({
  initialReservations,
  accommodationTypes,
  timeSlots,
  filterDate,
  filterStatus,
  filterAccommodationType,
}: ReservasPageContentProps) {
  const router = useRouter();
  const [isFiltering, startFilteringNavigation] = useTransition();
  const [, startRefreshTransition] = useTransition();

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<ReservationFull | null>(null);
  const [reservations, setReservations] =
    useState<ReservationFull[]>(initialReservations);

  useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

  const refreshReservations = useCallback(() => {
    startRefreshTransition(() => {
      router.refresh();
    });
  }, [router, startRefreshTransition]);

  useRealtimeSubscription({
    table: "reservations",
    onEvent: refreshReservations,
  });

  const handleFilterChange = useCallback(
    (newFilters: {
      date: string;
      status: string;
      accommodationType: string;
    }) => {
      const normalizedFilters = {
        date: newFilters.date || getTodayStr(),
        status: newFilters.status,
        accommodationType: newFilters.accommodationType,
      };
      const nextQuery = buildFiltersQuery(normalizedFilters);
      const currentQuery = buildFiltersQuery({
        date: filterDate,
        status: filterStatus,
        accommodationType: filterAccommodationType,
      });

      if (nextQuery === currentQuery) {
        return;
      }

      startFilteringNavigation(() => {
        router.replace(`/admin/reservas${nextQuery ? `?${nextQuery}` : ""}`);
      });
    },
    [router, filterDate, filterStatus, filterAccommodationType, startFilteringNavigation]
  );

  const handleStatusChange = useCallback(
    async (id: string, newStatus: ReservationStatus) => {
      const result = await updateReservationStatus(id, newStatus);
      if (result.success) {
        setReservations((current) => {
          const updated = current
            .map((reservation) => {
              if (reservation.id !== id) return reservation;
              return {
                ...reservation,
                status: newStatus,
                cancelled_at:
                  newStatus === ReservationStatus.CANCELLED
                    ? new Date().toISOString()
                    : reservation.cancelled_at,
                cancelled_by:
                  newStatus === ReservationStatus.CANCELLED
                    ? "admin"
                    : reservation.cancelled_by,
              };
            });

          if (filterStatus && newStatus !== filterStatus) {
            return updated.filter((reservation) => reservation.id !== id);
          }

          return updated;
        });

        toast.success(
          `Status alterado para ${getStatusLabel(newStatus)}`
        );
        refreshReservations();
      } else {
        toast.error(result.error);
      }
    },
    [filterStatus, refreshReservations]
  );

  const handleEdit = useCallback((reservation: ReservationFull) => {
    setEditingReservation(reservation);
    setEditDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    refreshReservations();
  }, [refreshReservations]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Reservas</h1>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          disabled={isFiltering}
          aria-busy={isFiltering}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Reserva
        </Button>
      </div>

      {/* Filters */}
      <ReservationFilters
        key={`${filterDate}-${filterStatus}-${filterAccommodationType}`}
        onFilterChange={handleFilterChange}
        defaultDate={filterDate}
        defaultStatus={filterStatus}
        defaultAccommodationType={filterAccommodationType}
        accommodationTypes={accommodationTypes}
        isPending={isFiltering}
      />

      {/* Table */}
      <div aria-busy={isFiltering}>
        {isFiltering ? (
          <ReservationTableLoading />
        ) : (
          <ReservationTable
            reservations={reservations}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
          />
        )}
      </div>

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
