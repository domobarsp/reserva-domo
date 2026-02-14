-- =============================================
-- Domo — Schema Inicial (13 tabelas)
-- =============================================

-- gen_random_uuid() é nativo do PostgreSQL 13+ (usado pelo Supabase)

-- =============================================
-- Função trigger para updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 1. restaurants
-- =============================================
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_restaurants_slug ON public.restaurants(slug);

CREATE TRIGGER set_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 2. accommodation_types
-- =============================================
CREATE TABLE public.accommodation_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  name TEXT NOT NULL,
  description TEXT,
  min_seats INT NOT NULL DEFAULT 1,
  max_seats INT NOT NULL DEFAULT 6,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accommodation_types_restaurant ON public.accommodation_types(restaurant_id);

CREATE TRIGGER set_accommodation_types_updated_at
  BEFORE UPDATE ON public.accommodation_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 3. time_slots
-- =============================================
CREATE TABLE public.time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INT[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_time_slots_restaurant ON public.time_slots(restaurant_id);

CREATE TRIGGER set_time_slots_updated_at
  BEFORE UPDATE ON public.time_slots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 4. capacity_rules
-- =============================================
CREATE TABLE public.capacity_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  accommodation_type_id UUID NOT NULL REFERENCES public.accommodation_types(id),
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  max_covers INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_capacity_rules_unique
  ON public.capacity_rules(accommodation_type_id, time_slot_id);

CREATE TRIGGER set_capacity_rules_updated_at
  BEFORE UPDATE ON public.capacity_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 5. customers
-- =============================================
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_locale TEXT NOT NULL DEFAULT 'pt',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON public.customers(email);

CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 6. reservations
-- =============================================
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  accommodation_type_id UUID NOT NULL REFERENCES public.accommodation_types(id),
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  party_size INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  stripe_customer_id TEXT,
  stripe_setup_intent_id TEXT,
  stripe_payment_method_id TEXT,
  cancellation_token UUID DEFAULT gen_random_uuid(),
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT,
  no_show_fee_override INT,
  no_show_charged BOOLEAN NOT NULL DEFAULT FALSE,
  no_show_charge_amount INT,
  no_show_charge_id TEXT,
  source TEXT NOT NULL DEFAULT 'online',
  locale TEXT NOT NULL DEFAULT 'pt',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_reservations_status CHECK (status IN ('pending', 'confirmed', 'seated', 'complete', 'no_show', 'cancelled')),
  CONSTRAINT chk_reservations_party_size CHECK (party_size > 0),
  CONSTRAINT chk_reservations_source CHECK (source IN ('online', 'admin', 'phone')),
  CONSTRAINT chk_reservations_locale CHECK (locale IN ('pt', 'en', 'es'))
);

CREATE INDEX idx_reservations_date ON public.reservations(date);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_restaurant_date ON public.reservations(restaurant_id, date);
CREATE INDEX idx_reservations_cancellation_token ON public.reservations(cancellation_token);

CREATE TRIGGER set_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 7. reservation_status_history
-- =============================================
CREATE TABLE public.reservation_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reservation_status_history_reservation
  ON public.reservation_status_history(reservation_id);

-- =============================================
-- 8. waitlist_entries
-- =============================================
CREATE TABLE public.waitlist_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  party_size INT NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'waiting',
  seated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_waitlist_status CHECK (status IN ('waiting', 'seated', 'removed')),
  CONSTRAINT chk_waitlist_party_size CHECK (party_size > 0)
);

CREATE TRIGGER set_waitlist_entries_updated_at
  BEFORE UPDATE ON public.waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 9. walk_ins
-- =============================================
CREATE TABLE public.walk_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  party_size INT NOT NULL,
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_walk_ins_party_size CHECK (party_size > 0)
);

-- =============================================
-- 10. exception_dates
-- =============================================
CREATE TABLE public.exception_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  date DATE NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  reason TEXT,
  capacity_override JSONB,
  card_guarantee_override BOOLEAN,
  no_show_fee_override INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_exception_dates_restaurant_date
  ON public.exception_dates(restaurant_id, date);

CREATE TRIGGER set_exception_dates_updated_at
  BEFORE UPDATE ON public.exception_dates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 11. settings
-- =============================================
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_settings_restaurant_key
  ON public.settings(restaurant_id, key);

CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 12. admin_users
-- =============================================
CREATE TABLE public.admin_users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  role TEXT NOT NULL DEFAULT 'staff',
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_admin_users_role CHECK (role IN ('owner', 'manager', 'staff'))
);

CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================
-- 13. no_show_charges
-- =============================================
CREATE TABLE public.no_show_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES public.reservations(id),
  stripe_payment_intent_id TEXT NOT NULL,
  amount INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'brl',
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  charged_by UUID REFERENCES public.admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_no_show_charges_status CHECK (status IN ('pending', 'succeeded', 'failed'))
);

CREATE TRIGGER set_no_show_charges_updated_at
  BEFORE UPDATE ON public.no_show_charges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
