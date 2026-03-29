"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUsersTable } from "./admin-users-table";
import { InviteAdminDialog } from "./invite-admin-dialog";
import { EditAdminDialog } from "@/components/features/admin/access/edit-admin-dialog";
import { ResetPasswordDialog } from "@/components/features/admin/access/reset-password-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteAdminUser } from "@/app/admin/(authenticated)/acessos/actions";
import type { AdminUserWithEmail } from "@/app/admin/(authenticated)/acessos/actions";
import { toast } from "sonner";

interface AcessosContentProps {
  users: AdminUserWithEmail[];
  currentUserId: string;
}

export function AcessosContent({ users, currentUserId }: AcessosContentProps) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUserWithEmail | null>(null);
  const [resetUser, setResetUser] = useState<AdminUserWithEmail | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUserWithEmail | null>(null);

  function handleSuccess() {
    router.refresh();
  }

  async function handleDeleteUser() {
    if (!deleteUser) return;
    const result = await deleteAdminUser(deleteUser.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Usuário excluído permanentemente.");
      setDeleteUser(null);
      handleSuccess();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Controle de Acesso</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gerencie os usuários do painel administrativo
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      <AdminUsersTable
        users={users}
        currentUserId={currentUserId}
        onEdit={setEditUser}
        onResetPassword={setResetUser}
        onDelete={setDeleteUser}
      />

      <InviteAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      <EditAdminDialog
        open={!!editUser}
        onOpenChange={(open) => { if (!open) setEditUser(null); }}
        userId={editUser?.id ?? ""}
        currentDisplayName={editUser?.display_name ?? ""}
        onSuccess={handleSuccess}
      />

      <ResetPasswordDialog
        open={!!resetUser}
        onOpenChange={(open) => { if (!open) setResetUser(null); }}
        userId={resetUser?.id ?? ""}
        displayName={resetUser?.display_name ?? ""}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        open={!!deleteUser}
        onOpenChange={(open) => { if (!open) setDeleteUser(null); }}
        title="Excluir usuário"
        description={`Excluir permanentemente ${deleteUser?.display_name ?? "este usuário"}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
