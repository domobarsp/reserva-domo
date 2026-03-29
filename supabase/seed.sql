-- =============================================
-- Domo — Seed Data
-- =============================================
-- UUIDs determinísticos para consistência

-- =============================================
-- 1. Restaurante
-- =============================================
INSERT INTO public.restaurants (id, name, slug, address, phone, email, timezone)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Dōmo',
  'domo',
  'Rua Major Sertório, 452, São Paulo, SP 01222-001',
  '+55 11 97570-9056',
  'contato@domo.com.br',
  'America/Sao_Paulo'
);

-- =============================================
-- 2. Tipos de Acomodação
-- =============================================
INSERT INTO public.accommodation_types (id, restaurant_id, name, description, min_seats, max_seats, display_order, is_active)
VALUES
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mesa', 'Mesa tradicional para refeições', 1, 6, 1, true),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Balcão', 'Assento no balcão do chef', 1, 3, 2, true);

-- =============================================
-- 3. Horários
-- =============================================
INSERT INTO public.time_slots (id, restaurant_id, name, start_time, end_time, days_of_week, is_active)
VALUES
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jantar 19h', '19:00', '21:00', '{0,1,2,3,4,5,6}', true),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Jantar 21h30', '21:30', '23:30', '{0,1,2,3,4,5,6}', true);

-- =============================================
-- 4. Regras de Capacidade (2 acomodações × 2 horários)
-- =============================================
INSERT INTO public.capacity_rules (id, restaurant_id, accommodation_type_id, time_slot_id, max_covers)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'd4e5f6a7-b8c9-0123-defa-234567890123', 30),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'e5f6a7b8-c9d0-1234-efab-345678901234', 30),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'd4e5f6a7-b8c9-0123-defa-234567890123', 8),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'e5f6a7b8-c9d0-1234-efab-345678901234', 8);

-- =============================================
-- 5. Configurações
-- =============================================
INSERT INTO public.settings (id, restaurant_id, key, value)
VALUES
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'no_show_fee', '{"amount": 5000, "currency": "brl"}'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'card_guarantee_days', '{"days": [5, 6]}'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'booking_window_days', '{"value": 30}'),
  (gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cancellation_deadline_hours', '{"value": 2}');

-- =============================================
-- 6. Exceção de exemplo (Natal 2026)
-- =============================================
INSERT INTO public.exception_dates (id, restaurant_id, date, is_closed, reason)
VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '2026-12-25',
  true,
  'Natal'
);

-- =============================================
-- 7. Admin User
-- =============================================
-- NOTA: O admin user deve ser criado primeiro via Supabase Auth (Dashboard > Authentication > Users > Add User).
-- Use email: admin@domo.com.br e uma senha segura.
-- Após criar o auth user, copie o UUID gerado e execute:
--
-- INSERT INTO public.admin_users (id, restaurant_id, role, display_name, is_active)
-- VALUES (
--   '<UUID_DO_AUTH_USER>',
--   'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
--   'owner',
--   'Admin Domo',
--   true
-- );
