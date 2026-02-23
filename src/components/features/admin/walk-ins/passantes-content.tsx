"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableFilters } from "@/components/shared/table-filters";
import { WalkinTable } from "@/components/features/admin/walk-ins/walkin-table";
import { WalkInDetailDrawer } from "@/components/features/admin/walk-ins/walk-in-detail-drawer";
import { WalkinCreateDialog } from "@/components/features/admin/walk-ins/walkin-create-dialog";
import type { WalkIn } from "@/types";

interface PassantesContentProps {
  initialWalkIns: WalkIn[];
}

export function PassantesContent({ initialWalkIns }: PassantesContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWalkIn, setSelectedWalkIn] = useState<WalkIn | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSuccess = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Passantes</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar
        </Button>
      </div>

      <TableFilters nameLabel="Buscar por nome" phonePlaceholder="Telefone" />

      {isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : (
        <WalkinTable
            walkIns={initialWalkIns}
            onRowClick={setSelectedWalkIn}
          />
      )}

      <WalkinCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
      <WalkInDetailDrawer
        walkIn={selectedWalkIn}
        onClose={() => setSelectedWalkIn(null)}
      />
    </div>
  );
}
