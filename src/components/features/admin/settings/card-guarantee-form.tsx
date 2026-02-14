"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  function toggleDay(day: number) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    const result = await updateSetting("card_guarantee_days", { days: selectedDays });
    if (result.success) {
      toast.success("Dias de garantia atualizados");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Dias que Exigem Garantia com Cartão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </CardContent>
    </Card>
  );
}
