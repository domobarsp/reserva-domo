"use client";

import { Badge } from "@/components/ui/badge";
import { ReservationStatus, WaitlistStatus } from "@/types";
import {
  getStatusLabel,
  getStatusColor,
  getWaitlistStatusLabel,
  getWaitlistStatusColor,
} from "@/lib/status-transitions";
import { cn } from "@/lib/utils";

interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  className?: string;
}

export function ReservationStatusBadge({
  status,
  className,
}: ReservationStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getStatusColor(status), className)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}

interface WaitlistStatusBadgeProps {
  status: WaitlistStatus;
  className?: string;
}

export function WaitlistStatusBadge({
  status,
  className,
}: WaitlistStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getWaitlistStatusColor(status), className)}
    >
      {getWaitlistStatusLabel(status)}
    </Badge>
  );
}
