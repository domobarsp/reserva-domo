"use client";

import { useMemo } from "react";
import { Footprints } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import type { WalkIn } from "@/types";

interface WalkinTableProps {
  walkIns: WalkIn[];
  onRowClick?: (walkIn: WalkIn) => void;
}

export function WalkinTable({ walkIns, onRowClick }: WalkinTableProps) {
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
      />
    );
  }

  return (
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
          const createdAt = new Date(walkIn.created_at);
          const dateStr = createdAt.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });
          const timeStr = createdAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <TableRow
                key={walkIn.id}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(walkIn)}
              >
              <TableCell>
                <span className="text-muted-foreground">{dateStr}</span>{" "}
                <span className="font-medium">{timeStr}</span>
              </TableCell>
              <TableCell className="font-medium">
                {walkIn.customer_name}
              </TableCell>
              <TableCell>{walkIn.customer_phone || "—"}</TableCell>
              <TableCell>{walkIn.customer_email || "—"}</TableCell>
              <TableCell>{walkIn.party_size}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {walkIn.special_requests || "—"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
