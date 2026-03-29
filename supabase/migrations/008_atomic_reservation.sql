-- 008_atomic_reservation.sql
-- Atomic reservation creation with capacity check to prevent double-booking

CREATE OR REPLACE FUNCTION public.create_reservation_atomic(
  p_restaurant_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_preferred_locale TEXT,
  p_accommodation_type_id UUID,
  p_time_slot_id UUID,
  p_date DATE,
  p_reservation_time TIME,
  p_party_size INTEGER,
  p_special_requests TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'online',
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_stripe_payment_method_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_reservation_id UUID;
  v_cancellation_token UUID;
  v_max_capacity INTEGER;
  v_current_covers INTEGER;
  v_remaining INTEGER;
  v_override INTEGER;
BEGIN
  -- Lock capacity rules for this accommodation+timeslot to prevent concurrent reads
  SELECT cr.max_covers INTO v_max_capacity
  FROM capacity_rules cr
  WHERE cr.restaurant_id = p_restaurant_id
    AND cr.accommodation_type_id = p_accommodation_type_id
    AND cr.time_slot_id = p_time_slot_id
  FOR UPDATE;

  -- Check exception_date capacity override
  SELECT (eco.value)::INTEGER INTO v_override
  FROM exception_dates ed,
       jsonb_each_text(ed.capacity_override) eco(key, value)
  WHERE ed.restaurant_id = p_restaurant_id
    AND ed.date = p_date
    AND eco.key = p_accommodation_type_id::TEXT;

  IF v_override IS NOT NULL THEN
    v_max_capacity := v_override;
  END IF;

  IF v_max_capacity IS NULL THEN
    v_max_capacity := 0;
  END IF;

  -- Count current active reservations for this slot
  SELECT COALESCE(SUM(r.party_size), 0) INTO v_current_covers
  FROM reservations r
  WHERE r.restaurant_id = p_restaurant_id
    AND r.date = p_date
    AND r.time_slot_id = p_time_slot_id
    AND r.accommodation_type_id = p_accommodation_type_id
    AND r.status NOT IN ('cancelled', 'no_show');

  v_remaining := v_max_capacity - v_current_covers;

  IF v_remaining < p_party_size THEN
    RETURN json_build_object(
      'error', 'Capacidade insuficiente para o número de pessoas',
      'remaining', v_remaining
    );
  END IF;

  -- Find or create customer
  SELECT id INTO v_customer_id
  FROM customers
  WHERE LOWER(email) = LOWER(p_email)
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO customers (first_name, last_name, email, phone, preferred_locale)
    VALUES (p_first_name, p_last_name, p_email, p_phone, p_preferred_locale)
    RETURNING id INTO v_customer_id;
  END IF;

  -- Create reservation
  v_cancellation_token := gen_random_uuid();

  INSERT INTO reservations (
    restaurant_id, customer_id, accommodation_type_id, time_slot_id,
    date, reservation_time, party_size, special_requests, source, locale,
    status, cancellation_token, stripe_customer_id, stripe_payment_method_id
  ) VALUES (
    p_restaurant_id, v_customer_id, p_accommodation_type_id, p_time_slot_id,
    p_date, p_reservation_time, p_party_size, p_special_requests, p_source, p_preferred_locale,
    'pending', v_cancellation_token, p_stripe_customer_id, p_stripe_payment_method_id
  ) RETURNING id INTO v_reservation_id;

  -- Insert status history
  INSERT INTO reservation_status_history (reservation_id, from_status, to_status)
  VALUES (v_reservation_id, NULL, 'pending');

  RETURN json_build_object(
    'id', v_reservation_id,
    'cancellation_token', v_cancellation_token,
    'customer_id', v_customer_id
  );
END;
$$;
