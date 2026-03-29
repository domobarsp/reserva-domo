"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { getRestaurantId } from "@/lib/queries/restaurant";
import { AdminRole } from "@/types";

export interface AdminUserWithEmail {
  id: string;
  display_name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

async function isLastActiveOwner(userId: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const restaurantId = await getRestaurantId();
  const { count } = await adminClient
    .from("admin_users")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", restaurantId)
    .eq("role", "owner")
    .eq("is_active", true)
    .neq("id", userId);
  return (count ?? 0) === 0;
}

export async function getAdminUsers(): Promise<AdminUserWithEmail[]> {
  const adminClient = createAdminClient();
  const restaurantId = await getRestaurantId();

  const [{ data: adminUsers }, { data: authUsersData }] = await Promise.all([
    adminClient
      .from("admin_users")
      .select("id, display_name, role, is_active, must_change_password, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: true }),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (!adminUsers) return [];

  const authById = new Map(
    (authUsersData?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  return adminUsers.map((u) => ({
    id: u.id,
    display_name: u.display_name,
    email: authById.get(u.id) ?? "",
    role: u.role as AdminRole,
    is_active: u.is_active,
    must_change_password: u.must_change_password,
    created_at: u.created_at,
  }));
}

export async function createAdminUser(data: {
  login: string;
  password: string;
  displayName: string;
  role: AdminRole;
}): Promise<{ error?: string }> {
  const adminClient = createAdminClient();
  const restaurantId = await getRestaurantId();

  const email = `${data.login.trim().toLowerCase()}@domo.local`;

  const { data: userData, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
    });

  if (createError) {
    if (createError.message.includes("already been registered") || createError.message.includes("already exists")) {
      return { error: "Este usuário já está cadastrado no sistema." };
    }
    return { error: createError.message };
  }

  const { error: insertError } = await adminClient.from("admin_users").insert({
    id: userData.user.id,
    restaurant_id: restaurantId,
    role: data.role,
    display_name: data.displayName,
    is_active: true,
  });

  if (insertError) {
    // Rollback: remove o auth user criado
    await adminClient.auth.admin.deleteUser(userData.user.id);
    return { error: "Erro ao registrar permissões do usuário." };
  }

  revalidatePath("/admin/acessos");
  return {};
}

export async function toggleAdminUserStatus(
  id: string,
  isActive: boolean
): Promise<{ error?: string }> {
  // Previne auto-desativação
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === id) {
    return { error: "Você não pode desativar sua própria conta." };
  }

  if (!isActive) {
    const adminClient2 = createAdminClient();
    const { data: targetUser } = await adminClient2
      .from("admin_users")
      .select("role")
      .eq("id", id)
      .single();

    if (targetUser?.role === "owner") {
      const lastOwner = await isLastActiveOwner(id);
      if (lastOwner) {
        return { error: "Não é possível desativar o único proprietário ativo." };
      }
    }
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("admin_users")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/acessos");
  return {};
}

export async function updateAdminUserRole(
  id: string,
  role: AdminRole
): Promise<{ error?: string }> {
  // Previne auto-rebaixamento
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === id) {
    return { error: "Você não pode alterar o cargo da sua própria conta." };
  }

  const adminClient2 = createAdminClient();
  const { data: targetUser } = await adminClient2
    .from("admin_users")
    .select("role")
    .eq("id", id)
    .single();

  if (targetUser?.role === "owner" && role !== "owner") {
    const lastOwner = await isLastActiveOwner(id);
    if (lastOwner) {
      return { error: "Não é possível rebaixar o único proprietário ativo." };
    }
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("admin_users")
    .update({ role })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/acessos");
  return {};
}

export async function updateAdminUserDisplayName(
  id: string,
  displayName: string
): Promise<{ error?: string }> {
  if (!displayName || displayName.trim().length < 2) {
    return { error: "O nome deve ter pelo menos 2 caracteres." };
  }

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("admin_users")
    .update({ display_name: displayName.trim() })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/acessos");
  return {};
}

export async function resetAdminUserPassword(
  id: string
): Promise<{ error?: string; temporaryPassword?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === id) {
    return { error: "Use a página de troca de senha para alterar sua própria senha." };
  }

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const randomBytes = new Uint8Array(12);
  crypto.getRandomValues(randomBytes);
  const temporaryPassword = Array.from(randomBytes, (b) => chars[b % chars.length]).join("");

  const adminClient = createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(id, {
    password: temporaryPassword,
  });
  if (authError) return { error: authError.message };

  const { error: dbError } = await adminClient
    .from("admin_users")
    .update({ must_change_password: true })
    .eq("id", id);
  if (dbError) return { error: dbError.message };

  revalidatePath("/admin/acessos");
  return { temporaryPassword };
}

export async function deleteAdminUser(
  id: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === id) {
    return { error: "Você não pode excluir sua própria conta." };
  }

  const adminClient = createAdminClient();

  const { data: targetUser } = await adminClient
    .from("admin_users")
    .select("is_active, role")
    .eq("id", id)
    .single();

  if (!targetUser) return { error: "Usuário não encontrado." };
  if (targetUser.is_active) return { error: "Desative o usuário antes de excluí-lo." };

  const { error: dbError } = await adminClient
    .from("admin_users")
    .delete()
    .eq("id", id);
  if (dbError) return { error: dbError.message };

  const { error: authError } = await adminClient.auth.admin.deleteUser(id);
  if (authError) {
    console.error("Failed to delete auth user:", authError.message);
  }

  revalidatePath("/admin/acessos");
  return {};
}

export async function changeOwnPassword(
  newPassword: string
): Promise<{ error?: string }> {
  if (!newPassword || newPassword.length < 8) {
    return { error: "A senha deve ter pelo menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const adminClient = createAdminClient();

  const { error: authError } = await adminClient.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (authError) return { error: authError.message };

  const { error: dbError } = await adminClient
    .from("admin_users")
    .update({ must_change_password: false })
    .eq("id", user.id);
  if (dbError) return { error: dbError.message };

  revalidatePath("/admin");
  return {};
}
