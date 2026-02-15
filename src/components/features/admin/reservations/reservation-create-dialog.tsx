"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
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
  adminReservationSchema,
  type AdminReservationData,
} from "@/lib/validations/admin";
import { getTodayStr, dateToStr, formatDatePtBr } from "@/lib/availability";
import { ReservationSource, Locale } from "@/types";
import type { AccommodationType, TimeSlot } from "@/types";
import { cn, formatTime } from "@/lib/utils";
import { createReservation } from "@/app/admin/(authenticated)/reservas/actions";

interface ReservationCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodationTypes: AccommodationType[];
  timeSlots: TimeSlot[];
  onSuccess: () => void;
}

export function ReservationCreateDialog({
  open,
  onOpenChange,
  accommodationTypes,
  timeSlots,
  onSuccess,
}: ReservationCreateDialogProps) {
  const form = useForm<AdminReservationData>({
    resolver: zodResolver(adminReservationSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date: getTodayStr(),
      reservation_time: "",
      accommodation_type_id: "",
      party_size: 2,
      special_requests: "",
      source: "admin",
      preferred_locale: "pt",
    },
  });

  const onSubmit = async (data: AdminReservationData) => {
    // reservation_time contains "time_slot_id|start_time"
    const [selectedSlotId, selectedTime] = data.reservation_time.split("|");

    const result = await createReservation(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        preferred_locale: data.preferred_locale as Locale,
      },
      {
        accommodation_type_id: data.accommodation_type_id,
        time_slot_id: selectedSlotId,
        date: data.date,
        reservation_time: selectedTime,
        party_size: data.party_size,
        special_requests: data.special_requests || null,
        source: data.source as ReservationSource,
        locale: data.preferred_locale as Locale,
      }
    );

    if (result.success) {
      toast.success("Reserva criada com sucesso");
      form.reset();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar uma nova reserva manualmente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Customer Info Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input placeholder="Sobrenome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+55 11 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reservation Info Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value
                              ? formatDatePtBr(field.value)
                              : "Selecionar data"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                    <FormLabel>Horario</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecionar horário" />
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
                              {ts.name} ({formatTime(ts.start_time)} — {formatTime(ts.end_time)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="accommodation_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acomodacao</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecionar acomodacao" />
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

            <FormField
              control={form.control}
              name="special_requests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solicitacoes especiais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alergias, aniversario, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Origem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="phone">Telefone</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferred_locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma do cliente</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Idioma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pt">Portugues</SelectItem>
                        <SelectItem value="en">Ingles</SelectItem>
                        <SelectItem value="es">Espanhol</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Criar Reserva</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
