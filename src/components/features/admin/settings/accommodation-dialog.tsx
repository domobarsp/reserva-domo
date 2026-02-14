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
import { Textarea } from "@/components/ui/textarea";
import {
  accommodationTypeSchema,
  type AccommodationTypeData,
} from "@/lib/validations/admin";
import type { AccommodationType } from "@/types";

interface AccommodationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccommodationTypeData) => void;
  editing?: AccommodationType | null;
}

export function AccommodationDialog({
  open,
  onOpenChange,
  onSubmit,
  editing,
}: AccommodationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AccommodationTypeData>({
    resolver: zodResolver(accommodationTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      min_seats: 1,
      max_seats: 6,
      display_order: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        description: editing.description || "",
        min_seats: editing.min_seats,
        max_seats: editing.max_seats,
        display_order: editing.display_order,
        is_active: editing.is_active,
      });
    } else {
      reset({
        name: "",
        description: "",
        min_seats: 1,
        max_seats: 6,
        display_order: 0,
        is_active: true,
      });
    }
  }, [editing, reset, open]);

  const isActive = watch("is_active");

  function onFormSubmit(data: AccommodationTypeData) {
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar Acomodação" : "Nova Acomodação"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Ex: Mesa" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição opcional"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_seats">Mín. Lugares</Label>
              <Input
                id="min_seats"
                type="number"
                {...register("min_seats", { valueAsNumber: true })}
              />
              {errors.min_seats && (
                <p className="text-sm text-red-500">
                  {errors.min_seats.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_seats">Máx. Lugares</Label>
              <Input
                id="max_seats"
                type="number"
                {...register("max_seats", { valueAsNumber: true })}
              />
              {errors.max_seats && (
                <p className="text-sm text-red-500">
                  {errors.max_seats.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Ordem</Label>
              <Input
                id="display_order"
                type="number"
                {...register("display_order", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
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
            <Button type="submit">{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
