"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { AccommodationsTable } from "@/components/features/admin/settings/accommodations-table";
import { AccommodationDialog } from "@/components/features/admin/settings/accommodation-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { AccommodationType } from "@/types";
import type { AccommodationTypeData } from "@/lib/validations/admin";
import { toast } from "sonner";
import {
  createAccommodationType,
  updateAccommodationType,
  deleteAccommodationType,
} from "@/app/admin/(authenticated)/configuracoes/acomodacoes/actions";

interface AcomodacoesContentProps {
  initialAccommodationTypes: AccommodationType[];
}

export function AcomodacoesContent({ initialAccommodationTypes }: AcomodacoesContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AccommodationType | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleCreate(data: AccommodationTypeData) {
    const result = await createAccommodationType({
      ...data,
      description: data.description || null,
    });
    if (result.success) {
      toast.success("Acomodação criada com sucesso");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleEdit(data: AccommodationTypeData) {
    if (!editing) return;
    const result = await updateAccommodationType(editing.id, {
      ...data,
      description: data.description || null,
    });
    if (result.success) {
      toast.success("Acomodação atualizada");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    const result = await updateAccommodationType(id, { is_active: active });
    if (result.success) {
      toast.success(active ? "Acomodação ativada" : "Acomodação desativada");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteAccommodationType(deleteId);
    if (result.success) {
      toast.success("Acomodação removida");
      setDeleteId(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/configuracoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Acomodações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure os tipos de acomodação disponíveis.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Acomodação
        </Button>
      </div>

      <AccommodationsTable
        accommodationTypes={initialAccommodationTypes}
        onEdit={(at) => { setEditing(at); setDialogOpen(true); }}
        onDelete={(id) => setDeleteId(id)}
        onToggleActive={handleToggleActive}
      />

      <AccommodationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editing ? handleEdit : handleCreate}
        editing={editing}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover Acomodação"
        description="Tem certeza que deseja remover este tipo de acomodação?"
        confirmLabel="Remover"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
