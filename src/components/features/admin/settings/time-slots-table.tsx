"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2, Clock, Plus } from "lucide-react";
import type { TimeSlot } from "@/types";
import { formatTime } from "@/lib/utils";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface TimeSlotsTableProps {
  timeSlots: TimeSlot[];
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onAdd?: () => void;
}

export function TimeSlotsTable({
  timeSlots,
  onEdit,
  onDelete,
  onToggleActive,
  onAdd,
}: TimeSlotsTableProps) {
  if (timeSlots.length === 0) {
    return (
      <EmptyState
        icon={<Clock className="h-12 w-12" />}
        title="Nenhum horário cadastrado"
        description="Adicione horários disponíveis para reservas."
        action={
          onAdd ? (
            <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Criar horário
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Término</TableHead>
            <TableHead>Dias da Semana</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {timeSlots.map((ts) => (
            <TableRow key={ts.id} className="hover:bg-zinc-50 transition-colors">
              <TableCell className="font-medium">{ts.name}</TableCell>
              <TableCell>{formatTime(ts.start_time)}</TableCell>
              <TableCell>{formatTime(ts.end_time)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                    const isActive = ts.days_of_week.includes(d);
                    return (
                      <span
                        key={d}
                        className={
                          isActive
                            ? "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                            : "inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-300 line-through"
                        }
                      >
                        {DAY_LABELS[d]}
                      </span>
                    );
                  })}
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={ts.is_active}
                  onCheckedChange={(checked) =>
                    onToggleActive(ts.id, checked)
                  }
                />
              </TableCell>
              <TableCell>
                <TooltipProvider>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(ts)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(ts.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
