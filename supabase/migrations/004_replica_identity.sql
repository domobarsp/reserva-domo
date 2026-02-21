-- =============================================
-- REPLICA IDENTITY FULL para tabelas com Realtime + RLS
--
-- Sem isso, eventos UPDATE/DELETE não carregam os dados
-- da linha anterior, o que impede a verificação correta
-- das RLS policies pelo Supabase Realtime.
-- =============================================

ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER TABLE public.waitlist_entries REPLICA IDENTITY FULL;
