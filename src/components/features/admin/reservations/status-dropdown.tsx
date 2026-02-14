"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReservationStatusBadge } from "@/components/shared/status-badge";
import { getValidNextStatuses, getStatusLabel } from "@/lib/status-transitions";
import type { ReservationFull } from "@/types";
import { ReservationStatus } from "@/types";

interface StatusDropdownProps {
  reservation: ReservationFull;
  onStatusChange: (id: string, status: ReservationStatus) => void;
}

export function StatusDropdown({
  reservation,
  onStatusChange,
}: StatusDropdownProps) {
  const validNextStatuses = getValidNextStatuses(reservation.status);

  if (validNextStatuses.length === 0) {
    return <ReservationStatusBadge status={reservation.status} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex cursor-pointer items-center gap-1 rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <ReservationStatusBadge status={reservation.status} />
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {validNextStatuses.map((nextStatus) => (
          <DropdownMenuItem
            key={nextStatus}
            onClick={() => onStatusChange(reservation.id, nextStatus)}
          >
            {getStatusLabel(nextStatus)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
