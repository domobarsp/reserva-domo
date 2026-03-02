"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportCsvButtonProps {
  startDate: string;
  endDate: string;
}

export function ExportCsvButton({ startDate, endDate }: ExportCsvButtonProps) {
  const href = `/api/relatorios/export?start=${startDate}&end=${endDate}`;

  return (
    <Button variant="outline" size="sm" asChild>
      <a href={href} download>
        <Download className="mr-2 h-4 w-4" />
        Exportar CSV
      </a>
    </Button>
  );
}
