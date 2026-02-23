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
  created_at: string;
}

export async function getAdminUsers(): Promise<AdminUserWithEmail[]> {
  const adminClient = createAdminClient();
  const restaurantId = await getRestaurantId();

  const [{ data: adminUsers }, { data: authUsersData }] = await Promise.all([
    adminClient
      .from("admin_users")
      .select("id, display_name, role, is_active, created_at")
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

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("admin_users")
    .update({ role })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/acessos");
  return {};
}
