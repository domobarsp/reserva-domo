-- =============================================
-- Domo — Row Level Security Policies
-- =============================================

-- =============================================
-- Helper function: verifica se o usuário é admin ativo
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- Habilitar RLS em todas as tabelas
-- =============================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.walk_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exception_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.no_show_charges ENABLE ROW LEVEL SECURITY;

-- =============================================
-- restaurants
-- =============================================
-- Leitura pública (todos podem ver dados do restaurante)
CREATE POLICY "restaurants_select_public"
  ON public.restaurants FOR SELECT
  USING (true);

-- Admin pode modificar
CREATE POLICY "restaurants_all_admin"
  ON public.restaurants FOR ALL
  USING (public.is_admin());

-- =============================================
-- accommodation_types
-- =============================================
-- Leitura pública (apenas ativos)
CREATE POLICY "accommodation_types_select_public"
  ON public.accommodation_types FOR SELECT
  USING (is_active = true);

-- Admin CRUD completo (incluindo inativos)
CREATE POLICY "accommodation_types_select_admin"
  ON public.accommodation_types FOR SELECT
  USING (public.is_admin());

CREATE POLICY "accommodation_types_insert_admin"
  ON public.accommodation_types FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "accommodation_types_update_admin"
  ON public.accommodation_types FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "accommodation_types_delete_admin"
  ON public.accommodation_types FOR DELETE
  USING (public.is_admin());

-- =============================================
-- time_slots
-- =============================================
-- Leitura pública (apenas ativos)
CREATE POLICY "time_slots_select_public"
  ON public.time_slots FOR SELECT
  USING (is_active = true);

-- Admin CRUD completo
CREATE POLICY "time_slots_select_admin"
  ON public.time_slots FOR SELECT
  USING (public.is_admin());

CREATE POLICY "time_slots_insert_admin"
  ON public.time_slots FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "time_slots_update_admin"
  ON public.time_slots FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "time_slots_delete_admin"
  ON public.time_slots FOR DELETE
  USING (public.is_admin());

-- =============================================
-- capacity_rules
-- =============================================
-- Leitura pública
CREATE POLICY "capacity_rules_select_public"
  ON public.capacity_rules FOR SELECT
  USING (true);

-- Admin CRUD
CREATE POLICY "capacity_rules_insert_admin"
  ON public.capacity_rules FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "capacity_rules_update_admin"
  ON public.capacity_rules FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "capacity_rules_delete_admin"
  ON public.capacity_rules FOR DELETE
  USING (public.is_admin());

-- =============================================
-- customers
-- =============================================
-- Insert público (criação durante reserva)
CREATE POLICY "customers_insert_public"
  ON public.customers FOR INSERT
  WITH CHECK (true);

-- Select público limitado (para página de cancelamento via join)
CREATE POLICY "customers_select_public"
  ON public.customers FOR SELECT
  USING (true);

-- Admin CRUD completo
CREATE POLICY "customers_update_admin"
  ON public.customers FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "customers_delete_admin"
  ON public.customers FOR DELETE
  USING (public.is_admin());

-- =============================================
-- reservations
-- =============================================
-- Insert público (criação de reserva)
CREATE POLICY "reservations_insert_public"
  ON public.reservations FOR INSERT
  WITH CHECK (true);

-- Select público por cancellation_token (página de cancelamento)
CREATE POLICY "reservations_select_by_token"
  ON public.reservations FOR SELECT
  USING (cancellation_token IS NOT NULL);

-- Update público para cancelamento pelo cliente
CREATE POLICY "reservations_update_cancel"
  ON public.reservations FOR UPDATE
  USING (cancellation_token IS NOT NULL AND status IN ('pending', 'confirmed'));

-- Admin CRUD completo
CREATE POLICY "reservations_select_admin"
  ON public.reservations FOR SELECT
  USING (public.is_admin());

CREATE POLICY "reservations_update_admin"
  ON public.reservations FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "reservations_delete_admin"
  ON public.reservations FOR DELETE
  USING (public.is_admin());

-- =============================================
-- reservation_status_history
-- =============================================
-- Insert público (registro de status na criação)
CREATE POLICY "reservation_status_history_insert_public"
  ON public.reservation_status_history FOR INSERT
  WITH CHECK (true);

-- Admin leitura
CREATE POLICY "reservation_status_history_select_admin"
  ON public.reservation_status_history FOR SELECT
  USING (public.is_admin());

-- =============================================
-- waitlist_entries
-- =============================================
-- Apenas admin
CREATE POLICY "waitlist_entries_select_admin"
  ON public.waitlist_entries FOR SELECT
  USING (public.is_admin());

CREATE POLICY "waitlist_entries_insert_admin"
  ON public.waitlist_entries FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "waitlist_entries_update_admin"
  ON public.waitlist_entries FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "waitlist_entries_delete_admin"
  ON public.waitlist_entries FOR DELETE
  USING (public.is_admin());

-- =============================================
-- walk_ins
-- =============================================
-- Apenas admin
CREATE POLICY "walk_ins_select_admin"
  ON public.walk_ins FOR SELECT
  USING (public.is_admin());

CREATE POLICY "walk_ins_insert_admin"
  ON public.walk_ins FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "walk_ins_delete_admin"
  ON public.walk_ins FOR DELETE
  USING (public.is_admin());

-- =============================================
-- exception_dates
-- =============================================
-- Leitura pública
CREATE POLICY "exception_dates_select_public"
  ON public.exception_dates FOR SELECT
  USING (true);

-- Admin CRUD
CREATE POLICY "exception_dates_insert_admin"
  ON public.exception_dates FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "exception_dates_update_admin"
  ON public.exception_dates FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "exception_dates_delete_admin"
  ON public.exception_dates FOR DELETE
  USING (public.is_admin());

-- =============================================
-- settings
-- =============================================
-- Leitura pública
CREATE POLICY "settings_select_public"
  ON public.settings FOR SELECT
  USING (true);

-- Admin update
CREATE POLICY "settings_update_admin"
  ON public.settings FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "settings_insert_admin"
  ON public.settings FOR INSERT
  WITH CHECK (public.is_admin());

-- =============================================
-- admin_users
-- =============================================
-- Select próprio registro
CREATE POLICY "admin_users_select_own"
  ON public.admin_users FOR SELECT
  USING (id = auth.uid());

-- Admin owner/manager pode ver todos
CREATE POLICY "admin_users_select_admin"
  ON public.admin_users FOR SELECT
  USING (public.is_admin());

-- Admin owner pode gerenciar
CREATE POLICY "admin_users_insert_admin"
  ON public.admin_users FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "admin_users_update_admin"
  ON public.admin_users FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "admin_users_delete_admin"
  ON public.admin_users FOR DELETE
  USING (public.is_admin());

-- =============================================
-- no_show_charges
-- =============================================
-- Apenas admin
CREATE POLICY "no_show_charges_select_admin"
  ON public.no_show_charges FOR SELECT
  USING (public.is_admin());

CREATE POLICY "no_show_charges_insert_admin"
  ON public.no_show_charges FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "no_show_charges_update_admin"
  ON public.no_show_charges FOR UPDATE
  USING (public.is_admin());
