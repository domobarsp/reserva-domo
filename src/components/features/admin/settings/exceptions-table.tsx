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
import { EmptyState } from "@/components/shared/empty-state";
import { Pencil, Trash2, CalendarOff } from "lucide-react";
import type { ExceptionDate, AccommodationType } from "@/types";

interface ExceptionsTableProps {
  exceptionDates: ExceptionDate[];
  accommodationTypes: AccommodationType[];
  onEdit: (ed: ExceptionDate) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

export function ExceptionsTable({
  exceptionDates,
  accommodationTypes,
  onEdit,
  onDelete,
}: ExceptionsTableProps) {
  if (exceptionDates.length === 0) {
    return (
      <EmptyState
        icon={<CalendarOff className="h-12 w-12" />}
        title="Nenhuma exceção cadastrada"
        description="Adicione exceções para datas específicas."
      />
    );
  }

  function renderCapacityOverride(
    override: Record<string, { max_covers: number }> | null
  ): string {
    if (!override) return "—";
    const parts = Object.entries(override).map(([atId, val]) => {
      const name = accommodationTypes.find((a) => a.id === atId)?.name ?? atId;
      return `${name}: ${val.max_covers}`;
    });
    return parts.join(", ");
  }

  function renderCardGuarantee(val: boolean | null): React.ReactNode {
    if (val === null) return "Padrão";
    return val ? (
      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
        Exigir
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
        Dispensar
      </Badge>
    );
  }

  function renderNoShowFee(val: number | null): string {
    if (val === null) return "Padrão";
    return `R$ ${(val / 100).toFixed(2)}`;
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Fechado</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Capacidade</TableHead>
            <TableHead>Cartão</TableHead>
            <TableHead>No-Show</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exceptionDates
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((ed) => (
              <TableRow key={ed.id}>
                <TableCell className="font-medium">
                  {formatDate(ed.date)}
                </TableCell>
                <TableCell>
                  {ed.is_closed ? (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      Sim
                    </Badge>
                  ) : (
                    "Não"
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {ed.reason || "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {renderCapacityOverride(ed.capacity_override)}
                </TableCell>
                <TableCell>{renderCardGuarantee(ed.card_guarantee_override)}</TableCell>
                <TableCell>{renderNoShowFee(ed.no_show_fee_override)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(ed)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(ed.id)}
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
