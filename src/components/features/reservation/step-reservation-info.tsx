"use client";

import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { CalendarIcon, Loader2, Users } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const selectedDate = form.watch("date");
  const selectedTimeSlotId = form.watch("time_slot_id");
  const selectedAccommodationId = form.watch("accommodation_type_id");

  const minDate = useMemo(() => {
    const [y, m, d] = bookingWindow.min.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [bookingWindow.min]);

  const maxDate = useMemo(() => {
    const [y, m, d] = bookingWindow.max.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [bookingWindow.max]);

  // Available time slots from API response
  const availableTimeSlots = useMemo(() => {
    if (!availabilityData?.available) return [];
    return availabilityData.timeSlots;
  }, [availabilityData]);

  // Available accommodations from the selected time slot
  const availableAccommodations = useMemo(() => {
    if (!selectedTimeSlotId || !availabilityData?.available) return [];
    const slot = availabilityData.timeSlots.find(
      (ts) => ts.id === selectedTimeSlotId
    );
    return slot?.accommodations ?? [];
  }, [selectedTimeSlotId, availabilityData]);

  // Selected accommodation details for party size range
  const selectedAccommodation = useMemo(() => {
    return availableAccommodations.find(
      (a) => a.id === selectedAccommodationId
    );
  }, [availableAccommodations, selectedAccommodationId]);

  // Party size range based on selected accommodation
  const partySizeRange = useMemo(() => {
    if (!selectedAccommodation) return [];
    const sizes: number[] = [];
    const maxAllowed = Math.min(
      selectedAccommodation.max_seats,
      selectedAccommodation.remaining
    );
    for (let i = selectedAccommodation.min_seats; i <= maxAllowed; i++) {
      sizes.push(i);
    }
    return sizes;
  }, [selectedAccommodation]);

  // Calendar disabled dates matcher
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
    // Reset dependent fields
    form.setValue("time_slot_id", "", { shouldValidate: false });
    form.setValue("accommodation_type_id", "", { shouldValidate: false });
    form.setValue("party_size", 0, { shouldValidate: false });
  };

  const handleTimeSlotChange = (timeSlotId: string) => {
    form.setValue("time_slot_id", timeSlotId, { shouldValidate: true });
    // Reset dependent fields
    form.setValue("accommodation_type_id", "", { shouldValidate: false });
    form.setValue("party_size", 0, { shouldValidate: false });
  };

  const handleAccommodationChange = (accommodationId: string) => {
    form.setValue("accommodation_type_id", accommodationId, {
      shouldValidate: true,
    });
    // Reset party size
    form.setValue("party_size", 0, { shouldValidate: false });
  };

  // Parse selected date for calendar
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
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
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

      {/* Loading indicator */}
      {selectedDate && isLoadingAvailability && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando horários...</span>
        </div>
      )}

      {/* Time Slot Selection */}
      {selectedDate && !isLoadingAvailability && (
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
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent",
                        selectedTimeSlotId === ts.id &&
                          "border-primary bg-primary/5"
                      )}
                    >
                      <RadioGroupItem value={ts.id} id={`ts-${ts.id}`} />
                      <div>
                        <p className="font-medium">{ts.name}</p>
                        <p className="text-sm text-muted-foreground">
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
      )}

      {/* Accommodation Selection */}
      {selectedDate && selectedTimeSlotId && !isLoadingAvailability && (
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
                          "flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors",
                          isAvailable && "hover:bg-accent",
                          !isAvailable && "cursor-not-allowed opacity-50",
                          selectedAccommodationId === at.id &&
                            isAvailable &&
                            "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem
                            value={at.id}
                            id={`at-${at.id}`}
                            disabled={!isAvailable}
                          />
                          <div>
                            <p className="font-medium">{at.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {at.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {at.min_seats}–{at.max_seats} pessoas
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={cn(
                              "flex items-center gap-1 text-sm",
                              at.remaining <= 3
                                ? "text-orange-600"
                                : "text-green-600"
                            )}
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>
                              {isAvailable
                                ? `${at.remaining} vagas`
                                : "Esgotado"}
                            </span>
                          </div>
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
      )}

      {/* Party Size */}
      {selectedAccommodation && selectedAccommodation.remaining > 0 && (
        <FormField
          control={form.control}
          name="party_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de pessoas</FormLabel>
              <Select
                value={field.value ? String(field.value) : ""}
                onValueChange={(val) =>
                  field.onChange(parseInt(val, 10))
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {partySizeRange.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} {size === 1 ? "pessoa" : "pessoas"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Special Requests */}
      <FormField
        control={form.control}
        name="special_requests"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Solicitações especiais{" "}
              <span className="font-normal text-muted-foreground">
                (opcional)
              </span>
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ex: Mesa perto da janela, aniversário, alergias alimentares..."
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
