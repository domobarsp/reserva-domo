"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { ExceptionsTable } from "@/components/features/admin/settings/exceptions-table";
import { ExceptionDialog } from "@/components/features/admin/settings/exception-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { ExceptionDate, AccommodationType } from "@/types";
import type { ExceptionDateData } from "@/lib/validations/admin";
import { toast } from "sonner";
import {
  createExceptionDate,
  updateExceptionDate,
  deleteExceptionDate,
} from "@/app/admin/(authenticated)/configuracoes/excecoes/actions";

interface ExcecoesContentProps {
  initialExceptionDates: ExceptionDate[];
  accommodationTypes: AccommodationType[];
}

export function ExcecoesContent({
  initialExceptionDates,
  accommodationTypes,
}: ExcecoesContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKey, setDialogKey] = useState(0);
  const [editing, setEditing] = useState<ExceptionDate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function handleCreate(data: ExceptionDateData) {
    const result = await createExceptionDate({
      ...data,
      reason: data.reason || null,
    });
    if (result.success) {
      toast.success("Exceção criada com sucesso");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleEdit(data: ExceptionDateData) {
    if (!editing) return;
    const result = await updateExceptionDate(editing.id, {
      ...data,
      reason: data.reason || null,
    });
    if (result.success) {
      toast.success("Exceção atualizada");
      setEditing(null);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const result = await deleteExceptionDate(deleteId);
    if (result.success) {
      toast.success("Exceção removida");
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
          <h1 className="text-2xl font-bold">Exceções</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure exceções para datas específicas (fechamentos, overrides).
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogKey(k => k + 1); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Exceção
        </Button>
      </div>

      <ExceptionsTable
        exceptionDates={initialExceptionDates}
        accommodationTypes={accommodationTypes}
        onEdit={(ed) => { setEditing(ed); setDialogKey(k => k + 1); setDialogOpen(true); }}
        onDelete={(id) => setDeleteId(id)}
      />

      <ExceptionDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editing ? handleEdit : handleCreate}
        editing={editing}
        accommodationTypes={accommodationTypes}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Remover Exceção"
        description="Tem certeza que deseja remover esta exceção de data?"
        confirmLabel="Remover"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
