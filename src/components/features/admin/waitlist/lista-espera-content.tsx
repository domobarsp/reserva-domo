"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WaitlistTable } from "@/components/features/admin/waitlist/waitlist-table";
import { WaitlistCreateDialog } from "@/components/features/admin/waitlist/waitlist-create-dialog";
import type { WaitlistEntry } from "@/types";
import { WaitlistStatus } from "@/types";
import { updateWaitlistStatus } from "@/app/admin/(authenticated)/lista-espera/actions";

interface ListaEsperaContentProps {
  initialEntries: WaitlistEntry[];
}

export function ListaEsperaContent({
  initialEntries,
}: ListaEsperaContentProps) {
  const router = useRouter();
  useRealtimeSubscription({ table: "waitlist_entries" });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSeat = useCallback(
    async (id: string) => {
      const result = await updateWaitlistStatus(id, WaitlistStatus.SEATED);
      if (result.success) {
        toast.success("Cliente acomodado com sucesso");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    },
    [router]
  );

  const handleRemove = useCallback(
    async (id: string) => {
      const result = await updateWaitlistStatus(id, WaitlistStatus.REMOVED);
      if (result.success) {
        toast.success("Cliente removido da lista de espera");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    },
    [router]
  );

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lista de Espera</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <WaitlistTable
        entries={initialEntries}
        onSeat={handleSeat}
        onRemove={handleRemove}
      />

      <WaitlistCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
