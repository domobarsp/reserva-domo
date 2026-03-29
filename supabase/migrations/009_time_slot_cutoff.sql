-- 009_time_slot_cutoff.sql
-- Add cutoff_minutes to time_slots for reservation deadline per slot

ALTER TABLE public.time_slots
  ADD COLUMN cutoff_minutes INTEGER NOT NULL DEFAULT 60;

COMMENT ON COLUMN public.time_slots.cutoff_minutes IS 'Minutes before start_time that reservations are no longer accepted. Default 60 (1 hour).';
