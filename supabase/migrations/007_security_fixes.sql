-- 007_security_fixes.sql
-- Fix Supabase linter warnings: RLS, search_path, permissive policies

-- 1. Enable RLS on reservation_edit_history
ALTER TABLE public.reservation_edit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservation_edit_history_select_admin"
  ON public.reservation_edit_history FOR SELECT
  USING (public.is_admin());

CREATE POLICY "reservation_edit_history_insert_admin"
  ON public.reservation_edit_history FOR INSERT
  WITH CHECK (public.is_admin());

-- 2. Fix function search_path
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;

-- 3. Restrict reservation_status_history INSERT to admins
DROP POLICY IF EXISTS "reservation_status_history_insert_public" ON public.reservation_status_history;

CREATE POLICY "reservation_status_history_insert_service"
  ON public.reservation_status_history FOR INSERT
  WITH CHECK (public.is_admin());
