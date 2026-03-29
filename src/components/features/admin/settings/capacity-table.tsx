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
import { EmptyState } from "@/components/shared/empty-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pencil, Trash2, Users, Plus } from "lucide-react";
import type { CapacityRule, AccommodationType, TimeSlot } from "@/types";

interface CapacityTableProps {
  capacityRules: CapacityRule[];
  accommodationTypes: AccommodationType[];
  timeSlots: TimeSlot[];
  onEdit: (rule: CapacityRule) => void;
  onDelete: (id: string) => void;
  onAdd?: () => void;
}

export function CapacityTable({
  capacityRules,
  accommodationTypes,
  timeSlots,
  onEdit,
  onDelete,
  onAdd,
}: CapacityTableProps) {
  if (capacityRules.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="Nenhuma regra de capacidade"
        description="Adicione regras de capacidade por acomodação e horário."
        action={
          onAdd ? (
            <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Criar regra
            </Button>
          ) : undefined
        }
      />
    );
  }

  function getAccommodationName(id: string) {
    return accommodationTypes.find((a) => a.id === id)?.name ?? "—";
  }

  function getTimeSlotName(id: string) {
    return timeSlots.find((t) => t.id === id)?.name ?? "—";
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Acomodação</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead>Capacidade Máx.</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {capacityRules.map((cr) => (
            <TableRow key={cr.id} className="hover:bg-zinc-50 transition-colors">
              <TableCell className="font-medium">
                {getAccommodationName(cr.accommodation_type_id)}
              </TableCell>
              <TableCell>
                {getTimeSlotName(cr.time_slot_id)}
              </TableCell>
              <TableCell>{cr.max_covers} pessoas</TableCell>
              <TableCell>
                <TooltipProvider>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(cr)}
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
                          onClick={() => onDelete(cr.id)}
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
