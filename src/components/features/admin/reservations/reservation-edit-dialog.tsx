"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

import {
  editReservationSchema,
  type EditReservationData,
} from "@/lib/validations/admin";
import { dateToStr, formatDateShort } from "@/lib/availability";
import type { ReservationFull, AccommodationType, TimeSlot } from "@/types";
import { cn, formatTime } from "@/lib/utils";
import { updateReservation } from "@/app/admin/(authenticated)/reservas/actions";

interface ReservationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationFull | null;
  accommodationTypes: AccommodationType[];
  timeSlots: TimeSlot[];
  onSuccess: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
      {children}
    </p>
  );
}

export function ReservationEditDialog({
  open,
  onOpenChange,
  reservation,
  accommodationTypes,
  timeSlots,
  onSuccess,
}: ReservationEditDialogProps) {
  const form = useForm<EditReservationData>({
    resolver: zodResolver(editReservationSchema),
    defaultValues: {
      date: "",
      reservation_time: "",
      accommodation_type_id: "",
      party_size: 2,
      special_requests: "",
      no_show_fee_override: null,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (reservation) {
      form.reset({
        date: reservation.date,
        reservation_time: `${reservation.time_slot_id}|${reservation.reservation_time}`,
        accommodation_type_id: reservation.accommodation_type_id,
        party_size: reservation.party_size,
        special_requests: reservation.special_requests ?? "",
        no_show_fee_override:
          reservation.no_show_fee_override !== null
            ? reservation.no_show_fee_override / 100
            : null,
      });
    }
  }, [reservation, form]);

  const onSubmit = async (data: EditReservationData) => {
    if (!reservation) return;

    const [selectedSlotId, selectedTime] = data.reservation_time.split("|");

    const result = await updateReservation(reservation.id, {
      date: data.date,
      reservation_time: selectedTime,
      time_slot_id: selectedSlotId,
      accommodation_type_id: data.accommodation_type_id,
      party_size: data.party_size,
      special_requests: data.special_requests || null,
      no_show_fee_override:
        data.no_show_fee_override !== null
          ? Math.round(data.no_show_fee_override * 100)
          : null,
    });

    if (result.success) {
      toast.success("Reserva atualizada com sucesso");
      onOpenChange(false);
      onSuccess();
    } else {
      toast.error(result.error);
    }
  };

  const selectedDate = form.watch("date");
  const selectedDateObj = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;

  const customerName = reservation
    ? `${reservation.customer.first_name} ${reservation.customer.last_name}`
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg p-0 gap-0">
        {/* Cabeçalho */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-zinc-100">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Editar Reserva
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 mt-0.5">
            {customerName ? `Alterando reserva de ${customerName}.` : "Altere os dados da reserva abaixo."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-6">

              {/* ── Seção: Reserva ───────────────────────────────── */}
              <div className="space-y-4">
                <SectionLabel>Reserva</SectionLabel>

                {/* Data + Horário */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                                <span className="truncate">
                                  {field.value
                                    ? formatDateShort(field.value)
                                    : "Selecionar data"}
                                </span>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={selectedDateObj}
                              onSelect={(date) => {
                                field.onChange(date ? dateToStr(date) : "");
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reservation_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots
                              .filter((ts) => ts.is_active)
                              .map((ts) => (
                                <SelectItem
                                  key={ts.id}
                                  value={`${ts.id}|${ts.start_time}`}
                                >
                                  {ts.name} · {formatTime(ts.start_time)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Acomodação + Pessoas */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="accommodation_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acomodação</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {accommodationTypes
                              .filter((at) => at.is_active)
                              .map((at) => (
                                <SelectItem key={at.id} value={at.id}>
                                  {at.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="party_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pessoas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value)
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Solicitações especiais */}
                <FormField
                  control={form.control}
                  name="special_requests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solicitações especiais</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Alergias, aniversário, preferências de mesa…"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ── Separador ────────────────────────────────────── */}
              <div className="border-t border-zinc-100" />

              {/* ── Seção: Avançado ──────────────────────────────── */}
              <div className="space-y-4">
                <SectionLabel>Avançado</SectionLabel>
                <FormField
                  control={form.control}
                  name="no_show_fee_override"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de no-show (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Vazio = usar valor padrão configurado"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === "" ? null : Number(val));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t border-zinc-100 bg-zinc-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="border-zinc-200"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
