"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Users, Plus } from "lucide-react";
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
  onAdd?: () => void;
}

export function WaitlistTable({ entries, onSeat, onRemove, onRowClick, onAdd }: WaitlistTableProps) {
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
        action={
          onAdd ? (
            <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Adicionar à lista
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
            <TableHead>Horário</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Pessoas</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((entry) => {
            const arrival = parseISO(entry.arrival_time);
            const dateStr = format(arrival, "dd/MM");
            const timeStr = format(arrival, "HH:mm");

            return (
              <TableRow
                key={entry.id}
                className={onRowClick ? "cursor-pointer hover:bg-zinc-50 transition-colors" : "hover:bg-zinc-50 transition-colors"}
                onClick={() => onRowClick?.(entry)}
              >
                <TableCell>
                  <span className="text-zinc-400 text-xs">{dateStr}</span>{" "}
                  <span className="font-medium text-zinc-900">{timeStr}</span>
                </TableCell>
                <TableCell className="font-medium">{entry.customer_name}</TableCell>
                <TableCell className="text-zinc-600">{entry.customer_phone}</TableCell>
                <TableCell className="text-zinc-600">{entry.party_size}</TableCell>
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
                        className="text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
                        onClick={() => onRemove(entry.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
