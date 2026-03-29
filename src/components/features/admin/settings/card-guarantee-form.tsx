"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Settings, CardGuaranteeDaysSettings } from "@/types";
import { toast } from "sonner";
import { updateSetting } from "@/app/admin/(authenticated)/configuracoes/actions";

const DAYS = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
];

interface CardGuaranteeFormProps {
  settings: Settings[];
}

export function CardGuaranteeForm({ settings }: CardGuaranteeFormProps) {
  const router = useRouter();

  const setting = settings.find((s) => s.key === "card_guarantee_days");
  const currentDays = setting
    ? (setting.value as unknown as CardGuaranteeDaysSettings).days
    : [];

  const [selectedDays, setSelectedDays] = useState<number[]>(currentDays);
  const [isLoading, setIsLoading] = useState(false);

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    setIsLoading(true);
    try {
      const result = await updateSetting("card_guarantee_days", { days: selectedDays });
      if (result.success) {
        toast.success("Dias de garantia atualizados");
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
          <h1 className="text-2xl font-semibold">Garantia com Cartão</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Configure os dias que exigem cartão de crédito
          </p>
        </div>
      </div>

      {/* Card with form */}
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-4">
        <p className="text-muted-foreground text-sm">
          Selecione os dias da semana em que reservas exigem garantia com
          cartão de crédito.
        </p>
        <div className="space-y-3">
          {DAYS.map((day) => (
            <label
              key={day.value}
              className="flex items-center gap-3 text-sm"
            >
              <Checkbox
                checked={selectedDays.includes(day.value)}
                onCheckedChange={() => toggleDay(day.value)}
              />
              {day.label}
            </label>
          ))}
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
