"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { SectionLabel } from "@/components/shared/drawer-primitives";
import { updateAdminUserDisplayName } from "@/app/admin/(authenticated)/acessos/actions";

interface EditAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentDisplayName: string;
  onSuccess: () => void;
}

export function EditAdminDialog({
  open,
  onOpenChange,
  userId,
  currentDisplayName,
  onSuccess,
}: EditAdminDialogProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setDisplayName(currentDisplayName);
    onOpenChange(nextOpen);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await updateAdminUserDisplayName(userId, displayName);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Nome atualizado com sucesso.");
      onOpenChange(false);
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-zinc-100">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Editar Usuário
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 mt-0.5">
            Altere as informações do usuário.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <SectionLabel>Perfil</SectionLabel>
            <div className="space-y-2">
              <Label htmlFor="edit-display-name">Nome de exibição</Label>
              <Input
                id="edit-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome completo"
                minLength={2}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || displayName.trim().length < 2}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
