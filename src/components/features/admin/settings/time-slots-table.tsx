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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/shared/empty-state";
import { Pencil, Trash2, Clock } from "lucide-react";
import type { TimeSlot } from "@/types";
import { formatTime } from "@/lib/utils";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface TimeSlotsTableProps {
  timeSlots: TimeSlot[];
  onEdit: (timeSlot: TimeSlot) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function TimeSlotsTable({
  timeSlots,
  onEdit,
  onDelete,
  onToggleActive,
}: TimeSlotsTableProps) {
  if (timeSlots.length === 0) {
    return (
      <EmptyState
        icon={<Clock className="h-12 w-12" />}
        title="Nenhum horário cadastrado"
        description="Adicione horários disponíveis para reservas."
      />
    );
  }

  return (
    <div className="rounded-md border">
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
            <TableRow key={ts.id}>
              <TableCell className="font-medium">{ts.name}</TableCell>
              <TableCell>{formatTime(ts.start_time)}</TableCell>
              <TableCell>{formatTime(ts.end_time)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {ts.days_of_week
                    .sort((a, b) => a - b)
                    .map((d) => (
                      <Badge key={d} variant="secondary" className="text-xs">
                        {DAY_LABELS[d]}
                      </Badge>
                    ))}
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
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(ts)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(ts.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
