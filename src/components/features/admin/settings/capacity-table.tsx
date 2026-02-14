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
import { Pencil, Trash2, Users } from "lucide-react";
import type { CapacityRule, AccommodationType, TimeSlot } from "@/types";

interface CapacityTableProps {
  capacityRules: CapacityRule[];
  accommodationTypes: AccommodationType[];
  timeSlots: TimeSlot[];
  onEdit: (rule: CapacityRule) => void;
  onDelete: (id: string) => void;
}

export function CapacityTable({
  capacityRules,
  accommodationTypes,
  timeSlots,
  onEdit,
  onDelete,
}: CapacityTableProps) {
  if (capacityRules.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="Nenhuma regra de capacidade"
        description="Adicione regras de capacidade por acomodação e horário."
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
    <div className="rounded-md border">
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
            <TableRow key={cr.id}>
              <TableCell className="font-medium">
                {getAccommodationName(cr.accommodation_type_id)}
              </TableCell>
              <TableCell>
                {getTimeSlotName(cr.time_slot_id)}
              </TableCell>
              <TableCell>{cr.max_covers} pessoas</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(cr)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(cr.id)}
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
