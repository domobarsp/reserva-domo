"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Settings, NoShowFeeSettings } from "@/types";
import { toast } from "sonner";
import { updateSetting } from "@/app/admin/(authenticated)/configuracoes/actions";

interface NoShowFeeFormProps {
  settings: Settings[];
}

export function NoShowFeeForm({ settings }: NoShowFeeFormProps) {
  const router = useRouter();

  const setting = settings.find((s) => s.key === "no_show_fee");
  const current = setting
    ? (setting.value as unknown as NoShowFeeSettings)
    : { amount: 5000, currency: "brl" };

  const [amountReais, setAmountReais] = useState<string>(
    (current.amount / 100).toFixed(2)
  );
  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    const cents = Math.round(parseFloat(amountReais) * 100);
    if (isNaN(cents) || cents < 0) {
      toast.error("Valor inválido");
      return;
    }
    setIsLoading(true);
    try {
      const result = await updateSetting("no_show_fee", { amount: cents, currency: "brl" });
      if (result.success) {
        toast.success("Taxa de no-show atualizada");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Header - same pattern as other settings pages */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/configuracoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Taxa de No-Show</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Defina o valor cobrado em caso de não comparecimento
          </p>
        </div>
      </div>

      {/* Card with form */}
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <p className="text-muted-foreground text-sm">
          Define o valor padrão cobrado quando um cliente não comparece.
          Este valor pode ser substituído por data específica ou por reserva individual.
        </p>
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">R$</span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amountReais}
              onChange={(e) => setAmountReais(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Moeda</Label>
          <Input value="BRL (Real Brasileiro)" disabled className="max-w-[200px]" />
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
