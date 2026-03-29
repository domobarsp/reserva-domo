"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/shared/drawer-primitives";
import { resetAdminUserPassword } from "@/app/admin/(authenticated)/acessos/actions";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  displayName: string;
  onSuccess: () => void;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  userId,
  displayName,
  onSuccess,
}: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleClose(openState: boolean) {
    if (!openState) {
      setTemporaryPassword(null);
      setCopied(false);
    }
    onOpenChange(openState);
  }

  async function handleReset() {
    setIsSubmitting(true);
    const result = await resetAdminUserPassword(userId);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.temporaryPassword) {
      setTemporaryPassword(result.temporaryPassword);
      onSuccess();
    }
  }

  async function handleCopy() {
    if (!temporaryPassword) return;
    await navigator.clipboard.writeText(temporaryPassword);
    setCopied(true);
    toast.success("Senha copiada!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-zinc-100">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {temporaryPassword ? "Senha Resetada" : "Resetar Senha"}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-500 mt-0.5">
            {temporaryPassword
              ? `Nova senha temporária gerada para ${displayName}.`
              : `Gerar uma nova senha temporária para ${displayName}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {temporaryPassword ? (
            <div className="space-y-4">
              <SectionLabel>Senha Temporária</SectionLabel>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <code className="flex-1 font-mono text-sm font-medium text-zinc-900">
                  {temporaryPassword}
                </code>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 shrink-0">
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                O usuário será obrigado a definir uma nova senha no próximo acesso. Copie e compartilhe esta senha de forma segura.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">Tem certeza?</p>
                  <p className="mt-0.5 text-sm text-zinc-500 leading-snug">
                    A senha atual de <strong className="text-zinc-700">{displayName}</strong> será
                    substituída por uma senha temporária. O usuário precisará definir uma nova senha
                    no próximo acesso.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
          {temporaryPassword ? (
            <Button onClick={() => handleClose(false)}>Fechar</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => handleClose(false)} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button onClick={handleReset} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Resetar senha
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
