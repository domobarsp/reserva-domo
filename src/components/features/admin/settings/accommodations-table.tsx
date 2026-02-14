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
import { Pencil, Trash2, Armchair } from "lucide-react";
import type { AccommodationType } from "@/types";

interface AccommodationsTableProps {
  accommodationTypes: AccommodationType[];
  onEdit: (at: AccommodationType) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function AccommodationsTable({
  accommodationTypes,
  onEdit,
  onDelete,
  onToggleActive,
}: AccommodationsTableProps) {
  if (accommodationTypes.length === 0) {
    return (
      <EmptyState
        icon={<Armchair className="h-12 w-12" />}
        title="Nenhuma acomodação cadastrada"
        description="Adicione tipos de acomodação disponíveis."
      />
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Min</TableHead>
            <TableHead>Max</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accommodationTypes
            .sort((a, b) => a.display_order - b.display_order)
            .map((at) => (
              <TableRow key={at.id}>
                <TableCell className="font-medium">{at.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {at.description || "—"}
                </TableCell>
                <TableCell>{at.min_seats}</TableCell>
                <TableCell>{at.max_seats}</TableCell>
                <TableCell>{at.display_order}</TableCell>
                <TableCell>
                  <Switch
                    checked={at.is_active}
                    onCheckedChange={(checked) =>
                      onToggleActive(at.id, checked)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(at)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(at.id)}
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
