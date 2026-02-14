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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  capacityRuleSchema,
  type CapacityRuleData,
} from "@/lib/validations/admin";
import type { CapacityRule, AccommodationType, TimeSlot } from "@/types";

interface CapacityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CapacityRuleData) => void;
  editing?: CapacityRule | null;
  accommodationTypes: AccommodationType[];
  timeSlots: TimeSlot[];
}

export function CapacityDialog({
  open,
  onOpenChange,
  onSubmit,
  editing,
  accommodationTypes,
  timeSlots,
}: CapacityDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CapacityRuleData>({
    resolver: zodResolver(capacityRuleSchema),
    defaultValues: {
      accommodation_type_id: "",
      time_slot_id: "",
      max_covers: 0,
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        accommodation_type_id: editing.accommodation_type_id,
        time_slot_id: editing.time_slot_id,
        max_covers: editing.max_covers,
      });
    } else {
      reset({
        accommodation_type_id: "",
        time_slot_id: "",
        max_covers: 0,
      });
    }
  }, [editing, reset, open]);

  const accommodationId = watch("accommodation_type_id");
  const timeSlotId = watch("time_slot_id");

  function onFormSubmit(data: CapacityRuleData) {
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar Capacidade" : "Nova Regra de Capacidade"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Acomodação</Label>
            <Select
              value={accommodationId}
              onValueChange={(v) =>
                setValue("accommodation_type_id", v, {
                  shouldValidate: true,
                })
              }
              disabled={!!editing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {accommodationTypes
                  .filter((a) => a.is_active)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.accommodation_type_id && (
              <p className="text-sm text-red-500">
                {errors.accommodation_type_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Horário</Label>
            <Select
              value={timeSlotId}
              onValueChange={(v) =>
                setValue("time_slot_id", v, { shouldValidate: true })
              }
              disabled={!!editing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots
                  .filter((t) => t.is_active)
                  .map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.time_slot_id && (
              <p className="text-sm text-red-500">
                {errors.time_slot_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_covers">Capacidade Máxima (pessoas)</Label>
            <Input
              id="max_covers"
              type="number"
              {...register("max_covers", { valueAsNumber: true })}
            />
            {errors.max_covers && (
              <p className="text-sm text-red-500">
                {errors.max_covers.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
