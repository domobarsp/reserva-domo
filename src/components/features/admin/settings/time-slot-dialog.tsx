"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingSlot ? "Editar Horário" : "Novo Horário"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex: Jantar 19h" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

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

          <div className="space-y-2">
            <Label>Dias da Semana</Label>
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
              <p className="text-sm text-red-500">
                {errors.days_of_week.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue("is_active", checked)
              }
            />
            <Label>Ativo</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingSlot ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
