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
import { Pencil, Trash2, Armchair, Plus } from "lucide-react";
import type { AccommodationType } from "@/types";

interface AccommodationsTableProps {
  accommodationTypes: AccommodationType[];
  onEdit: (at: AccommodationType) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onAdd?: () => void;
}

export function AccommodationsTable({
  accommodationTypes,
  onEdit,
  onDelete,
  onToggleActive,
  onAdd,
}: AccommodationsTableProps) {
  if (accommodationTypes.length === 0) {
    return (
      <EmptyState
        icon={<Armchair className="h-12 w-12" />}
        title="Nenhuma acomodação cadastrada"
        description="Adicione tipos de acomodação disponíveis."
        action={
          onAdd ? (
            <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Adicionar acomodação
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
              <TableRow key={at.id} className="hover:bg-zinc-50 transition-colors">
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
                  <TooltipProvider>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(at)}
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
                            onClick={() => onDelete(at.id)}
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
