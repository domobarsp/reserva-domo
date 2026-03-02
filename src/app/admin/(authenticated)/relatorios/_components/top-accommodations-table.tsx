"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AccommodationData } from "../actions";

interface TopAccommodationsTableProps {
  data: AccommodationData[];
}

export function TopAccommodationsTable({ data }: TopAccommodationsTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b p-5">
        <h3 className="font-semibold">Acomodações</h3>
        <p className="text-sm text-muted-foreground">Desempenho por tipo de acomodação no período</p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <p className="text-sm text-muted-foreground">Nenhuma reserva no período</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Acomodação</TableHead>
              <TableHead className="text-right">Reservas</TableHead>
              <TableHead className="text-right">Pessoas</TableHead>
              <TableHead className="text-right">No-Shows</TableHead>
              <TableHead className="text-right">Taxa No-Show</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell className="text-right">{row.total}</TableCell>
                <TableCell className="text-right">{row.pessoas}</TableCell>
                <TableCell className="text-right">{row.noShows}</TableCell>
                <TableCell className="text-right">
                  <span
                    className={
                      row.noShowRate > 20
                        ? "text-rose-600 font-medium"
                        : row.noShowRate > 10
                        ? "text-amber-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {row.noShowRate}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
