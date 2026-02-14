-- =============================================
-- Habilitar Realtime para tabelas que precisam
-- de atualizações em tempo real no admin
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.waitlist_entries;
