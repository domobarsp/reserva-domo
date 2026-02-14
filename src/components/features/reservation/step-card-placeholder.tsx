"use client";

import { CreditCard, Lock, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StepCardPlaceholder() {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Garantia com cartão de crédito
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Para reservas nesta data, é necessário fornecer um cartão de crédito
            como garantia. Nenhuma cobrança será realizada no momento da reserva.
            O cartão só será utilizado em caso de não comparecimento (no-show).
          </p>
        </div>
      </div>

      {/* Placeholder card fields */}
      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Dados do cartão</span>
          <Lock className="ml-auto h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-4 opacity-60">
          <div>
            <Label className="text-muted-foreground">Número do cartão</Label>
            <Input
              disabled
              placeholder="0000 0000 0000 0000"
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Validade</Label>
              <Input disabled placeholder="MM/AA" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-muted-foreground">CVV</Label>
              <Input disabled placeholder="000" className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">
              Nome no cartão
            </Label>
            <Input disabled placeholder="NOME COMPLETO" className="mt-1.5" />
          </div>
        </div>

        {/* Implementation note */}
        <div className="mt-4 rounded-md bg-muted p-3">
          <p className="text-center text-xs text-muted-foreground">
            Integração com Stripe será implementada na Fase 5.
            <br />
            Por enquanto, avance para confirmar a reserva.
          </p>
        </div>
      </div>
    </div>
  );
}
