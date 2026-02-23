"use client";

import { useMemo } from "react";
import { ClockIcon, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { WaitlistStatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import type { WaitlistEntry } from "@/types";
import { WaitlistStatus } from "@/types";

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  onSeat: (id: string) => void;
  onRemove: (id: string) => void;
  onRowClick?: (entry: WaitlistEntry) => void;
}

export function WaitlistTable({ entries, onSeat, onRemove, onRowClick }: WaitlistTableProps) {
  const sorted = useMemo(() => {
    const statusOrder: Record<WaitlistStatus, number> = {
      [WaitlistStatus.WAITING]: 0,
      [WaitlistStatus.SEATED]: 1,
      [WaitlistStatus.REMOVED]: 2,
    };

    return [...entries].sort((a, b) => {
      const orderDiff = statusOrder[a.status] - statusOrder[b.status];
      if (orderDiff !== 0) return orderDiff;
      return new Date(a.arrival_time).getTime() - new Date(b.arrival_time).getTime();
    });
  }, [entries]);

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title="Lista de espera vazia"
        description="Nenhum cliente na lista de espera no momento."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Chegada</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Pessoas</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((entry) => (
          <TableRow
              key={entry.id}
              className={onRowClick ? "cursor-pointer" : undefined}
              onClick={() => onRowClick?.(entry)}
            >
            <TableCell>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                {new Date(entry.arrival_time).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </TableCell>
            <TableCell className="font-medium">{entry.customer_name}</TableCell>
            <TableCell>{entry.customer_phone}</TableCell>
            <TableCell>{entry.party_size}</TableCell>
            <TableCell>
              <WaitlistStatusBadge status={entry.status} />
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              {entry.status === WaitlistStatus.WAITING && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSeat(entry.id)}
                  >
                    Acomodar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onRemove(entry.id)}
                  >
                    Remover
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
