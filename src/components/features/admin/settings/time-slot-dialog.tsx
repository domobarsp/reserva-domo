"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { SectionLabel } from "@/components/shared/drawer-primitives";
import { timeSlotSchema, type TimeSlotData } from "@/lib/validations/admin";
import type { TimeSlot } from "@/types";

const DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

interface TimeSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TimeSlotData) => void;
  editingSlot?: TimeSlot | null;
}

export function TimeSlotDialog({
  open,
  onOpenChange,
  onSubmit,
  editingSlot,
}: TimeSlotDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TimeSlotData>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      name: "",
      start_time: "",
      end_time: "",
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      is_active: true,
    },
  });

  useEffect(() => {
    if (editingSlot) {
      reset({
        name: editingSlot.name,
        start_time: editingSlot.start_time,
        end_time: editingSlot.end_time,
        days_of_week: editingSlot.days_of_week,
        is_active: editingSlot.is_active,
      });
    } else {
      reset({
        name: "",
        start_time: "",
        end_time: "",
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        is_active: true,
      });
    }
  }, [editingSlot, reset, open]);

  const selectedDays = watch("days_of_week");
  const isActive = watch("is_active");

  function toggleDay(day: number) {
    const current = selectedDays || [];
    if (current.includes(day)) {
      setValue(
        "days_of_week",
        current.filter((d) => d !== day),
        { shouldValidate: true }
      );
    } else {
      setValue("days_of_week", [...current, day], { shouldValidate: true });
    }
  }

  function onFormSubmit(data: TimeSlotData) {
    setIsSubmitting(true);
    onSubmit(data);
    setIsSubmitting(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-zinc-100">
          <DialogTitle>
            {editingSlot ? "Editar Horário" : "Novo Horário"}
          </DialogTitle>
          <DialogDescription>
            Configure um período de funcionamento para reservas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="px-6 py-5 space-y-6">
            <div>
              <SectionLabel>Informações</SectionLabel>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Ex: Jantar 19h" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-5">
              <SectionLabel>Horário</SectionLabel>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Início</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...register("start_time")}
                  />
                  {errors.start_time && (
                    <p className="text-sm text-red-500">
                      {errors.start_time.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Término</Label>
                  <Input id="end_time" type="time" {...register("end_time")} />
                  {errors.end_time && (
                    <p className="text-sm text-red-500">
                      {errors.end_time.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-5">
              <SectionLabel>Dias da Semana</SectionLabel>
              <div className="flex flex-wrap gap-3">
                {DAYS.map((day) => (
                  <label
                    key={day.value}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Checkbox
                      checked={selectedDays?.includes(day.value) ?? false}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
              {errors.days_of_week && (
                <p className="text-sm text-red-500 mt-2">
                  {errors.days_of_week.message}
                </p>
              )}
            </div>

            <div className="border-t border-zinc-100 pt-5">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) =>
                    setValue("is_active", checked)
                  }
                />
                <Label>Ativo</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSlot ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
