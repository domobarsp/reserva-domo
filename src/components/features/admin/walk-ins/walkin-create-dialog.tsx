"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { walkInSchema, type WalkInData } from "@/lib/validations/admin";
import { createWalkIn } from "@/app/admin/(authenticated)/passantes/actions";

interface WalkinCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WalkinCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: WalkinCreateDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WalkInData>({
    resolver: zodResolver(walkInSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      party_size: 1,
      special_requests: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        party_size: 1,
        special_requests: "",
      });
    }
  }, [open, reset]);

  async function onSubmit(data: WalkInData) {
    const result = await createWalkIn({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone === "" ? null : data.customer_phone,
      customer_email: data.customer_email === "" ? null : data.customer_email,
      party_size: data.party_size,
      special_requests:
        data.special_requests === "" ? null : data.special_requests,
    });

    if (result.success) {
      toast.success("Passante registrado com sucesso");
      onOpenChange(false);
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Passante</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wi-customer_name">Nome</Label>
            <Input
              id="wi-customer_name"
              placeholder="Nome do cliente"
              {...register("customer_name")}
            />
            {errors.customer_name && (
              <p className="text-sm text-red-500">
                {errors.customer_name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wi-customer_phone">Telefone (opcional)</Label>
            <Input
              id="wi-customer_phone"
              placeholder="+55 (11) 99999-9999"
              {...register("customer_phone")}
            />
            {errors.customer_phone && (
              <p className="text-sm text-red-500">
                {errors.customer_phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wi-customer_email">Email (opcional)</Label>
            <Input
              id="wi-customer_email"
              type="email"
              placeholder="email@exemplo.com"
              {...register("customer_email")}
            />
            {errors.customer_email && (
              <p className="text-sm text-red-500">
                {errors.customer_email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wi-party_size">Pessoas</Label>
            <Input
              id="wi-party_size"
              type="number"
              min={1}
              {...register("party_size", { valueAsNumber: true })}
            />
            {errors.party_size && (
              <p className="text-sm text-red-500">
                {errors.party_size.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wi-special_requests">
              Solicitações Especiais (opcional)
            </Label>
            <textarea
              id="wi-special_requests"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Alguma solicitação especial..."
              {...register("special_requests")}
            />
            {errors.special_requests && (
              <p className="text-sm text-red-500">
                {errors.special_requests.message}
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
            <Button type="submit">Registrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
