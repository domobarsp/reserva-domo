"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeSubscription } from "@/hooks/use-realtime";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableFilters } from "@/components/shared/table-filters";
import { WaitlistTable } from "@/components/features/admin/waitlist/waitlist-table";
import { WaitlistDetailDrawer } from "@/components/features/admin/waitlist/waitlist-detail-drawer";
import { WaitlistCreateDialog } from "@/components/features/admin/waitlist/waitlist-create-dialog";
import type { WaitlistEntry } from "@/types";
import { WaitlistStatus } from "@/types";
import { updateWaitlistStatus } from "@/app/admin/(authenticated)/lista-espera/actions";

interface ListaEsperaContentProps {
  initialEntries: WaitlistEntry[];
}

export function ListaEsperaContent({ initialEntries }: ListaEsperaContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [isPending, startTransition] = useTransition();

  useRealtimeSubscription({
    table: "waitlist_entries",
    onEvent: useCallback(
      () => startTransition(() => router.refresh()),
      [router]
    ),
  });

  const handleSeat = useCallback(
    async (id: string) => {
      const result = await updateWaitlistStatus(id, WaitlistStatus.SEATED);
      if (result.success) {
        toast.success("Cliente acomodado com sucesso");
        startTransition(() => router.refresh());
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
        startTransition(() => router.refresh());
      } else {
        toast.error(result.error);
      }
    },
    [router]
  );

  const handleSuccess = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lista de Espera</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar
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
        <WaitlistTable
          entries={initialEntries}
          onSeat={handleSeat}
          onRemove={handleRemove}
          onRowClick={setSelectedEntry}
          onAdd={() => setDialogOpen(true)}
        />
      )}

      <WaitlistCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
      <WaitlistDetailDrawer
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onActionSuccess={handleSuccess}
      />
    </div>
  );
}
