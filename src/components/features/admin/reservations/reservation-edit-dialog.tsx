"use client";

import { useEffect } from "react";
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
  editReservationSchema,
  type EditReservationData,
} from "@/lib/validations/admin";
import { dateToStr, formatDatePtBr } from "@/lib/availability";
import type { ReservationFull, AccommodationType } from "@/types";
import { cn } from "@/lib/utils";
import { updateReservation } from "@/app/admin/(authenticated)/reservas/actions";

interface ReservationEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationFull | null;
  accommodationTypes: AccommodationType[];
  onSuccess: () => void;
}

export function ReservationEditDialog({
  open,
  onOpenChange,
  reservation,
  accommodationTypes,
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

  // Reset form values whenever the reservation changes
  useEffect(() => {
    if (reservation) {
      form.reset({
        date: reservation.date,
        reservation_time: reservation.reservation_time,
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

    const result = await updateReservation(reservation.id, {
      date: data.date,
      reservation_time: data.reservation_time,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Reserva</DialogTitle>
          <DialogDescription>
            Altere os dados da reserva abaixo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <FormControl>
                      <Input placeholder="19:00" {...field} />
                    </FormControl>
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
                      placeholder="Deixe vazio para usar o padrao"
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Alteracoes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
