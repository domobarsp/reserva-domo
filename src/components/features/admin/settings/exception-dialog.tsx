"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateToStr } from "@/lib/availability";
import type { ExceptionDate, AccommodationType } from "@/types";
import type { ExceptionDateData } from "@/lib/validations/admin";

interface ExceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExceptionDateData) => void;
  editing?: ExceptionDate | null;
  accommodationTypes?: AccommodationType[];
}

export function ExceptionDialog({
  open,
  onOpenChange,
  onSubmit,
  editing,
  accommodationTypes = [],
}: ExceptionDialogProps) {
  function getInitialCapacityOverrides(): Record<string, string> {
    if (!editing?.capacity_override) return {};
    const overrides: Record<string, string> = {};
    for (const [atId, val] of Object.entries(editing.capacity_override)) {
      overrides[atId] = String(val.max_covers);
    }
    return overrides;
  }

  const [date, setDate] = useState<string>(editing?.date ?? "");
  const [isClosed, setIsClosed] = useState(editing?.is_closed ?? false);
  const [reason, setReason] = useState(editing?.reason ?? "");
  const [cardGuarantee, setCardGuarantee] = useState<string>(
    editing
      ? editing.card_guarantee_override === null
        ? "null"
        : editing.card_guarantee_override
          ? "true"
          : "false"
      : "null"
  );
  const [noShowFee, setNoShowFee] = useState<string>(
    editing?.no_show_fee_override != null
      ? (editing.no_show_fee_override / 100).toFixed(2)
      : ""
  );
  const [capacityOverrides, setCapacityOverrides] = useState<
    Record<string, string>
  >(getInitialCapacityOverrides);

  function handleDateSelect(d: Date | undefined) {
    if (d) setDate(dateToStr(d));
  }

  function handleCapacityChange(atId: string, value: string) {
    setCapacityOverrides((prev) => ({ ...prev, [atId]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!date) return;

    const capOverride: Record<string, { max_covers: number }> | null = {};
    let hasCapOverride = false;
    for (const [atId, val] of Object.entries(capacityOverrides)) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && val.trim() !== "") {
        capOverride[atId] = { max_covers: num };
        hasCapOverride = true;
      }
    }

    const noShowCents =
      noShowFee.trim() !== ""
        ? Math.round(parseFloat(noShowFee) * 100)
        : null;

    const data: ExceptionDateData = {
      date,
      is_closed: isClosed,
      reason: reason || "",
      card_guarantee_override:
        cardGuarantee === "null"
          ? null
          : cardGuarantee === "true",
      no_show_fee_override:
        noShowCents !== null && !isNaN(noShowCents) ? noShowCents : null,
      capacity_override: hasCapOverride ? capOverride : null,
    };

    onSubmit(data);
    onOpenChange(false);
  }

  const selectedDate = date
    ? (() => {
        const [y, m, d] = date.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar Exceção" : "Nova Exceção"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date || "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={isClosed} onCheckedChange={setIsClosed} />
            <Label>Restaurante fechado nesta data</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Feriado, Evento privado"
            />
          </div>

          <div className="space-y-2">
            <Label>Garantia de Cartão</Label>
            <Select value={cardGuarantee} onValueChange={setCardGuarantee}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Seguir regra padrão</SelectItem>
                <SelectItem value="true">Exigir cartão</SelectItem>
                <SelectItem value="false">Dispensar cartão</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="noShowFee">Taxa de No-Show (R$)</Label>
            <Input
              id="noShowFee"
              type="number"
              step="0.01"
              min="0"
              value={noShowFee}
              onChange={(e) => setNoShowFee(e.target.value)}
              placeholder="Deixe vazio para usar padrão"
            />
            <p className="text-muted-foreground text-xs">
              Deixe vazio para usar o valor padrão global.
            </p>
          </div>

          {!isClosed && (
            <div className="space-y-3">
              <Label>Override de Capacidade (por acomodação)</Label>
              <p className="text-muted-foreground text-xs">
                Deixe vazio para manter a capacidade padrão.
              </p>
              {accommodationTypes
                .filter((a) => a.is_active)
                .map((at) => (
                  <div key={at.id} className="flex items-center gap-3">
                    <Label className="min-w-[100px] text-sm">
                      {at.name}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={capacityOverrides[at.id] ?? ""}
                      onChange={(e) =>
                        handleCapacityChange(at.id, e.target.value)
                      }
                      placeholder="Padrão"
                      className="max-w-[120px]"
                    />
                    <span className="text-muted-foreground text-xs">
                      pessoas
                    </span>
                  </div>
                ))}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!date}>
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
