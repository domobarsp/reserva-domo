"use client";

import { useState, useCallback } from "react";
import { CalendarIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AccommodationType } from "@/types";
import { ReservationStatus } from "@/types";
import { getStatusLabel } from "@/lib/status-transitions";
import { getTodayStr, dateToStr, formatDateShort } from "@/lib/availability";
import { cn } from "@/lib/utils";

interface ReservationFiltersProps {
  onFilterChange: (filters: {
    date: string;
    status: string;
    accommodationType: string;
  }) => void;
  defaultDate?: string;
  defaultStatus?: string;
  defaultAccommodationType?: string;
  accommodationTypes: AccommodationType[];
  isPending?: boolean;
}

export function ReservationFilters({
  onFilterChange,
  defaultDate,
  defaultStatus,
  defaultAccommodationType,
  accommodationTypes,
  isPending = false,
}: ReservationFiltersProps) {
  const today = getTodayStr();

  const [date, setDate] = useState(defaultDate ?? today);
  const [status, setStatus] = useState(defaultStatus ?? "");
  const [accommodationType, setAccommodationType] = useState(defaultAccommodationType ?? "");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const fireChange = useCallback(
    (newDate: string, newStatus: string, newAccommodationType: string) => {
      onFilterChange({
        date: newDate,
        status: newStatus,
        accommodationType: newAccommodationType,
      });
    },
    [onFilterChange]
  );

  const handleDateSelect = (selected: Date | undefined) => {
    const newDate = selected ? dateToStr(selected) : "";
    setDate(newDate);
    setCalendarOpen(false);
    fireChange(newDate, status, accommodationType);
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value === "all" ? "" : value;
    setStatus(newStatus);
    fireChange(date, newStatus, accommodationType);
  };

  const handleAccommodationChange = (value: string) => {
    const newAccommodation = value === "all" ? "" : value;
    setAccommodationType(newAccommodation);
    fireChange(date, status, newAccommodation);
  };

  const hasNonDefaultFilters =
    date !== today || status !== "" || accommodationType !== "";

  const handleClearFilters = () => {
    setDate(today);
    setStatus("");
    setAccommodationType("");
    fireChange(today, "", "");
  };

  const selectedDateObj = date
    ? (() => {
        const [y, m, d] = date.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;

  return (
    <div className="flex flex-wrap items-center gap-3" aria-busy={isPending}>
      {/* Date Picker */}
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={isPending}
            className={cn(
              "w-[220px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">
              {date ? formatDateShort(date) : "Selecionar data"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDateObj}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Status Select */}
      <Select
        value={status || "all"}
        onValueChange={handleStatusChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {Object.values(ReservationStatus).map((s) => (
            <SelectItem key={s} value={s}>
              {getStatusLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Accommodation Type Select */}
      <Select
        value={accommodationType || "all"}
        onValueChange={handleAccommodationChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Acomodacao" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as acomodações</SelectItem>
          {accommodationTypes
            .filter((at) => at.is_active)
            .map((at) => (
              <SelectItem key={at.id} value={at.id}>
                {at.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasNonDefaultFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          disabled={isPending}
          className="text-muted-foreground"
        >
          <XIcon className="mr-1 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}
