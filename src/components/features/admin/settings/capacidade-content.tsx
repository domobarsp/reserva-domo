"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { CapacityTable } from "@/components/features/admin/settings/capacity-table";
import { CapacityDialog } from "@/components/features/admin/settings/capacity-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { CapacityRule, AccommodationType, TimeSlot } from "@/types";
import type { CapacityRuleData } from "@/lib/validations/admin";
import { toast } from "sonner";
import {
  createCapacityRule,
  updateCapacityRule,
  deleteCapacityRule,
} from "@/app/admin/(authenticated)/configuracoes/capacidade/actions";

interface CapacidadeContentProps {
  initialCapacityRules: CapacityRule[];
  accommodationTypes: AccommodationType[];
  timeSlots: TimeSlot[];
}

export function CapacidadeContent({
  initialCapacityRules,
  accommodationTypes,
  timeSlots,
}: CapacidadeContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CapacityRule | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleCreate(data: CapacityRuleData) {
    const result = await createCapacityRule(data);
    if (result.success) {
      toast.success("Regra de capacidade criada");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleEdit(data: CapacityRuleData) {
    if (!editing) return;
    const result = await updateCapacityRule(editing.id, { max_covers: data.max_covers });
    if (result.success) {
      toast.success("Capacidade atualizada");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteCapacityRule(deleteId);
    if (result.success) {
      toast.success("Regra removida");
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
          <h1 className="text-2xl font-semibold">Capacidade</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Defina a capacidade máxima por acomodação e horário
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Regra
        </Button>
      </div>

      <CapacityTable
        capacityRules={initialCapacityRules}
        accommodationTypes={accommodationTypes}
        timeSlots={timeSlots}
        onEdit={(cr) => { setEditing(cr); setDialogOpen(true); }}
        onDelete={(id) => setDeleteId(id)}
        onAdd={() => { setEditing(null); setDialogOpen(true); }}
      />

      <CapacityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editing ? handleEdit : handleCreate}
        editing={editing}
        accommodationTypes={accommodationTypes}
        timeSlots={timeSlots}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover Regra"
        description="Tem certeza que deseja remover esta regra de capacidade?"
        confirmLabel="Remover"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
