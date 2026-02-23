import { createClient } from "@/utils/supabase/server";
import type { AdminUser } from "@/types";

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as AdminUser) ?? null;
}
