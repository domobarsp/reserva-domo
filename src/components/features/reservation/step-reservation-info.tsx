"use client";

import { useFormContext } from "react-hook-form";
import { useMemo, useState } from "react";
import { CalendarIcon, Users, Minus, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, formatTime } from "@/lib/utils";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FullReservationData } from "@/lib/validations/reservation";
import type { AvailabilityResponse } from "@/types";
import { dateToStr } from "@/lib/availability";

interface StepReservationInfoProps {
  bookingWindow: { min: string; max: string };
  closedDates: string[];
  availabilityData: AvailabilityResponse | null;
  isLoadingAvailability: boolean;
}

export function StepReservationInfo({
  bookingWindow,
  closedDates,
  availabilityData,
  isLoadingAvailability,
}: StepReservationInfoProps) {
  const form = useFormContext<FullReservationData>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const selectedDate = form.watch("date");
  const selectedTimeSlotId = form.watch("time_slot_id");
  const selectedAccommodationId = form.watch("accommodation_type_id");
  const partySize = form.watch("party_size");

  const minDate = useMemo(() => {
    const [y, m, d] = bookingWindow.min.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [bookingWindow.min]);

  const maxDate = useMemo(() => {
    const [y, m, d] = bookingWindow.max.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [bookingWindow.max]);

  const availableTimeSlots = useMemo(() => {
    if (!availabilityData?.available) return [];
    return availabilityData.timeSlots;
  }, [availabilityData]);

  const availableAccommodations = useMemo(() => {
    if (!selectedTimeSlotId || !availabilityData?.available) return [];
    const slot = availabilityData.timeSlots.find(
      (ts) => ts.id === selectedTimeSlotId
    );
    return slot?.accommodations ?? [];
  }, [selectedTimeSlotId, availabilityData]);

  const selectedAccommodation = useMemo(() => {
    return availableAccommodations.find(
      (a) => a.id === selectedAccommodationId
    );
  }, [availableAccommodations, selectedAccommodationId]);

  const partySizeMin = selectedAccommodation?.min_seats ?? 1;
  const partySizeMax = selectedAccommodation
    ? Math.min(selectedAccommodation.max_seats, selectedAccommodation.remaining)
    : 1;

  const disabledDates = (date: Date) => {
    const dateStr = dateToStr(date);
    if (date < minDate || date > maxDate) return true;
    if (closedDates.includes(dateStr)) return true;
    return false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = dateToStr(date);
    form.setValue("date", dateStr, { shouldValidate: true });
    form.setValue("time_slot_id", "", { shouldValidate: false });
    form.setValue("accommodation_type_id", "", { shouldValidate: false });
    form.setValue("party_size", 0, { shouldValidate: false });
    setCalendarOpen(false);
  };

  const handleTimeSlotChange = (timeSlotId: string) => {
    form.setValue("time_slot_id", timeSlotId, { shouldValidate: true });
    form.setValue("accommodation_type_id", "", { shouldValidate: false });
    form.setValue("party_size", 0, { shouldValidate: false });
  };

  const handleAccommodationChange = (accommodationId: string) => {
    form.setValue("accommodation_type_id", accommodationId, {
      shouldValidate: true,
    });
    // Set party size to min of new accommodation
    const accom = availableAccommodations.find((a) => a.id === accommodationId);
    if (accom) {
      form.setValue("party_size", accom.min_seats, { shouldValidate: false });
    } else {
      form.setValue("party_size", 0, { shouldValidate: false });
    }
  };

  const handleDecrement = () => {
    const current = partySize || partySizeMin;
    if (current > partySizeMin) {
      form.setValue("party_size", current - 1, { shouldValidate: true });
    }
  };

  const handleIncrement = () => {
    const current = partySize || partySizeMin;
    if (current < partySizeMax) {
      form.setValue("party_size", current + 1, { shouldValidate: true });
    }
  };

  const selectedCalendarDate = useMemo(() => {
    if (!selectedDate) return undefined;
    const [year, month, day] = selectedDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <FormField
        control={form.control}
        name="date"
        render={() => (
          <FormItem>
            <FormLabel>Data da reserva</FormLabel>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedCalendarDate!, "PPP", { locale: ptBR })
                      : "Selecione uma data"}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedCalendarDate}
                  onSelect={handleDateSelect}
                  disabled={disabledDates}
                  locale={ptBR}
                  defaultMonth={minDate}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Loading skeletons */}
      {selectedDate && isLoadingAvailability && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <Skeleton className="h-4 w-16 rounded" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>
      )}

      {/* Time Slot Selection */}
      {selectedDate && !isLoadingAvailability && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <FormField
            control={form.control}
            name="time_slot_id"
            render={() => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={selectedTimeSlotId}
                    onValueChange={handleTimeSlotChange}
                    className="grid grid-cols-2 gap-3"
                  >
                    {availableTimeSlots.map((ts) => (
                      <Label
                        key={ts.id}
                        htmlFor={`ts-${ts.id}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-white p-4 transition-all hover:border-primary/40 hover:bg-primary/5",
                          selectedTimeSlotId === ts.id &&
                            "border-primary bg-primary/[6%] ring-[1.5px] ring-primary"
                        )}
                      >
                        <RadioGroupItem value={ts.id} id={`ts-${ts.id}`} />
                        <div>
                          <p className="font-medium text-sm">{ts.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTime(ts.start_time)} — {formatTime(ts.end_time)}
                          </p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </FormControl>
                {availableTimeSlots.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum horário disponível para esta data.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Accommodation Selection */}
      {selectedDate && selectedTimeSlotId && !isLoadingAvailability && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <FormField
            control={form.control}
            name="accommodation_type_id"
            render={() => (
              <FormItem>
                <FormLabel>Tipo de acomodação</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={selectedAccommodationId}
                    onValueChange={handleAccommodationChange}
                    className="grid gap-3"
                  >
                    {availableAccommodations.map((at) => {
                      const isAvailable = at.remaining > 0;
                      return (
                        <Label
                          key={at.id}
                          htmlFor={`at-${at.id}`}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border border-border bg-white p-4 transition-all",
                            isAvailable &&
                              "hover:border-primary/40 hover:bg-primary/5",
                            !isAvailable && "cursor-not-allowed opacity-50",
                            selectedAccommodationId === at.id &&
                              isAvailable &&
                              "border-primary bg-primary/[6%] ring-[1.5px] ring-primary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem
                              value={at.id}
                              id={`at-${at.id}`}
                              disabled={!isAvailable}
                            />
                            <div>
                              <p className="font-medium text-sm">{at.name}</p>
                              {at.description && (
                                <p className="text-xs text-muted-foreground">
                                  {at.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {at.min_seats}–{at.max_seats} pessoas
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs",
                                isAvailable && at.remaining <= 3
                                  ? "bg-amber-50 text-amber-700"
                                  : isAvailable
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              <Users className="h-3 w-3" />
                              {isAvailable ? `${at.remaining} vagas` : "Esgotado"}
                            </span>
                          </div>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Party Size — Incrementer */}
      {selectedAccommodation && selectedAccommodation.remaining > 0 && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <FormField
            control={form.control}
            name="party_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de pessoas</FormLabel>
                <FormControl>
                  <div className="flex items-center justify-between rounded-xl border border-input bg-white px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full shrink-0"
                      onClick={handleDecrement}
                      disabled={!field.value || field.value <= partySizeMin}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[3rem] text-center text-sm font-medium">
                      {field.value || partySizeMin}{" "}
                      {(field.value || partySizeMin) === 1 ? "pessoa" : "pessoas"}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full shrink-0"
                      onClick={handleIncrement}
                      disabled={!field.value || field.value >= partySizeMax}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Special Requests */}
      <FormField
        control={form.control}
        name="special_requests"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Alguma solicitação especial?{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: comemoração especial, restrição alimentar, preferência de assento..."
                className="min-h-[80px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
