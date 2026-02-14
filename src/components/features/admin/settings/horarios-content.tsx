"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { TimeSlotsTable } from "@/components/features/admin/settings/time-slots-table";
import { TimeSlotDialog } from "@/components/features/admin/settings/time-slot-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { TimeSlot } from "@/types";
import type { TimeSlotData } from "@/lib/validations/admin";
import { toast } from "sonner";
import {
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from "@/app/admin/(authenticated)/configuracoes/horarios/actions";

interface HorariosContentProps {
  initialTimeSlots: TimeSlot[];
}

export function HorariosContent({ initialTimeSlots }: HorariosContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TimeSlot | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleCreate(data: TimeSlotData) {
    const result = await createTimeSlot(data);
    if (result.success) {
      toast.success("Horário criado com sucesso");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleEdit(data: TimeSlotData) {
    if (!editing) return;
    const result = await updateTimeSlot(editing.id, data);
    if (result.success) {
      toast.success("Horário atualizado");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleToggleActive(id: string, active: boolean) {
    const result = await updateTimeSlot(id, { is_active: active });
    if (result.success) {
      toast.success(active ? "Horário ativado" : "Horário desativado");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteTimeSlot(deleteId);
    if (result.success) {
      toast.success("Horário removido");
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
          <h1 className="text-2xl font-bold">Horários</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure os horários disponíveis para reservas.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Horário
        </Button>
      </div>

      <TimeSlotsTable
        timeSlots={initialTimeSlots}
        onEdit={(ts) => { setEditing(ts); setDialogOpen(true); }}
        onDelete={(id) => setDeleteId(id)}
        onToggleActive={handleToggleActive}
      />

      <TimeSlotDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editing ? handleEdit : handleCreate}
        editingSlot={editing}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover Horário"
        description="Tem certeza que deseja remover este horário? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
