-- Migration: reservation_edit_history
-- Tracks field-level changes when an admin edits a reservation.
-- Each row stores a JSON array of { field, label, from, to } objects.

CREATE TABLE IF NOT EXISTS reservation_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  changes JSONB NOT NULL DEFAULT '[]',
  changed_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reh_reservation_id
  ON reservation_edit_history(reservation_id);
