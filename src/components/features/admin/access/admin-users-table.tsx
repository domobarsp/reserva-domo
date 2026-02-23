"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AdminRole } from "@/types";
import {
  toggleAdminUserStatus,
  updateAdminUserRole,
} from "@/app/admin/(authenticated)/acessos/actions";
import type { AdminUserWithEmail } from "@/app/admin/(authenticated)/acessos/actions";

const roleLabels: Record<AdminRole, string> = {
  [AdminRole.OWNER]: "Proprietário",
  [AdminRole.MANAGER]: "Gerente",
  [AdminRole.STAFF]: "Operador",
};

const roleBadgeClasses: Record<AdminRole, string> = {
  [AdminRole.OWNER]: "bg-violet-100 text-violet-800 border-violet-200",
  [AdminRole.MANAGER]: "bg-primary/10 text-primary border-primary/20",
  [AdminRole.STAFF]: "bg-muted text-muted-foreground border-border",
};

interface AdminUsersTableProps {
  users: AdminUserWithEmail[];
  currentUserId: string;
}

type PendingAction =
  | { type: "deactivate"; userId: string; displayName: string }
  | null;

export function AdminUsersTable({ users, currentUserId }: AdminUsersTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  async function handleToggleStatus(id: string, currentlyActive: boolean) {
    if (!currentlyActive) {
      // Ativar diretamente, sem confirmação
      setLoadingId(id);
      const result = await toggleAdminUserStatus(id, true);
      setLoadingId(null);
      if (result.error) toast.error(result.error);
      else toast.success("Usuário ativado.");
      return;
    }
    // Desativar: pedir confirmação
    const user = users.find((u) => u.id === id);
    if (user) setPendingAction({ type: "deactivate", userId: id, displayName: user.display_name });
  }

  async function handleConfirmDeactivate() {
    if (!pendingAction) return;
    setLoadingId(pendingAction.userId);
    const result = await toggleAdminUserStatus(pendingAction.userId, false);
    setLoadingId(null);
    setPendingAction(null);
    if (result.error) toast.error(result.error);
    else toast.success("Usuário desativado.");
  }

  async function handleChangeRole(id: string, role: AdminRole) {
    setLoadingId(id);
    const result = await updateAdminUserRole(id, role);
    setLoadingId(null);
    if (result.error) toast.error(result.error);
    else toast.success("Cargo atualizado.");
  }

  return (
    <>
      <div className="rounded border border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={!user.is_active ? "opacity-60" : undefined}>
                <TableCell className="font-medium">
                  {user.display_name}
                  {user.id === currentUserId && (
                    <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {user.email.endsWith("@domo.local")
                    ? user.email.replace("@domo.local", "")
                    : user.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={roleBadgeClasses[user.role]}
                  >
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={loadingId === user.id}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Alterar cargo */}
                      {Object.values(AdminRole)
                        .filter((r) => r !== user.role)
                        .map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleChangeRole(user.id, role)}
                            disabled={user.id === currentUserId}
                          >
                            Mudar para {roleLabels[role]}
                          </DropdownMenuItem>
                        ))}
                      <DropdownMenuSeparator />
                      {/* Ativar/desativar */}
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                        disabled={user.id === currentUserId}
                        className={user.is_active ? "text-destructive focus:text-destructive" : undefined}
                      >
                        {user.is_active ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={pendingAction?.type === "deactivate"}
        onOpenChange={(open) => { if (!open) setPendingAction(null); }}
        title="Desativar usuário"
        description={`Desativar ${pendingAction?.displayName ?? "este usuário"}? Ele perderá acesso ao painel imediatamente.`}
        confirmLabel="Desativar"
        variant="destructive"
        onConfirm={handleConfirmDeactivate}
      />
    </>
  );
}
