"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalkinTable } from "@/components/features/admin/walk-ins/walkin-table";
import { WalkinCreateDialog } from "@/components/features/admin/walk-ins/walkin-create-dialog";
import type { WalkIn } from "@/types";

interface PassantesContentProps {
  initialWalkIns: WalkIn[];
}

export function PassantesContent({ initialWalkIns }: PassantesContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Passantes</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Registrar
        </Button>
      </div>

      <WalkinTable walkIns={initialWalkIns} />

      <WalkinCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
