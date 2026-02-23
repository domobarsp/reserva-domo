"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUsersTable } from "./admin-users-table";
import { InviteAdminDialog } from "./invite-admin-dialog";
import type { AdminUserWithEmail } from "@/app/admin/(authenticated)/acessos/actions";

interface AcessosContentProps {
  users: AdminUserWithEmail[];
  currentUserId: string;
}

export function AcessosContent({ users, currentUserId }: AcessosContentProps) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Acessos</h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie os usuários com acesso ao painel administrativo.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>

      <AdminUsersTable users={users} currentUserId={currentUserId} />

      <InviteAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
