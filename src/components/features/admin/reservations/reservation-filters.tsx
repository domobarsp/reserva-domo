"use client";

import { useState, useCallback } from "react";
import { CalendarIcon, X, SlidersHorizontal } from "lucide-react";
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
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition-opacity",
        isPending && "opacity-60 pointer-events-none"
      )}
      aria-busy={isPending}
    >
      {/* Title row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
        </div>
        {hasNonDefaultFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={isPending}
            className="h-7 gap-1.5 text-xs text-zinc-500 hover:text-zinc-700"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Data */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Data</label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isPending}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
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
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Status</label>
          <Select
            value={status || "all"}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
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
        </div>

        {/* Acomodação */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Acomodação</label>
          <Select
            value={accommodationType || "all"}
            onValueChange={handleAccommodationChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Acomodação" />
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
        </div>
      </div>
    </div>
  );
}
