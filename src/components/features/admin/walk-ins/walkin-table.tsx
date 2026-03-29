"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Footprints, Plus } from "lucide-react";
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
import type { WalkIn } from "@/types";

interface WalkinTableProps {
  walkIns: WalkIn[];
  onRowClick?: (walkIn: WalkIn) => void;
  onAdd?: () => void;
}

export function WalkinTable({ walkIns, onRowClick, onAdd }: WalkinTableProps) {
  const sorted = useMemo(() => {
    return [...walkIns].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [walkIns]);

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={<Footprints className="h-12 w-12" />}
        title="Nenhum passante registrado"
        description="Registre passantes que chegam sem reserva."
        action={
          onAdd ? (
            <Button variant="outline" size="sm" onClick={onAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Registrar passante
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
            <TableHead>Email</TableHead>
            <TableHead>Pessoas</TableHead>
            <TableHead>Solicitações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((walkIn) => {
            const createdAt = parseISO(walkIn.created_at);
            const dateStr = format(createdAt, "dd/MM");
            const timeStr = format(createdAt, "HH:mm");

            return (
              <TableRow
                key={walkIn.id}
                className={onRowClick ? "cursor-pointer hover:bg-zinc-50 transition-colors" : "hover:bg-zinc-50 transition-colors"}
                onClick={() => onRowClick?.(walkIn)}
              >
                <TableCell>
                  <span className="text-zinc-400 text-xs">{dateStr}</span>{" "}
                  <span className="font-medium text-zinc-900">{timeStr}</span>
                </TableCell>
                <TableCell className="font-medium">{walkIn.customer_name}</TableCell>
                <TableCell className="text-zinc-600">{walkIn.customer_phone || <span className="text-zinc-300">&mdash;</span>}</TableCell>
                <TableCell className="text-zinc-600">{walkIn.customer_email || <span className="text-zinc-300">&mdash;</span>}</TableCell>
                <TableCell className="text-zinc-600">{walkIn.party_size}</TableCell>
                <TableCell className="max-w-[200px] truncate text-zinc-600">
                  {walkIn.special_requests || <span className="text-zinc-300">&mdash;</span>}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
