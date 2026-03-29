// ===========================
// Enums
// ===========================

export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  SEATED = "seated",
  COMPLETE = "complete",
  NO_SHOW = "no_show",
  CANCELLED = "cancelled",
}

export enum ReservationSource {
  ONLINE = "online",
  ADMIN = "admin",
  PHONE = "phone",
}

export enum Locale {
  PT = "pt",
  EN = "en",
  ES = "es",
}

export enum WaitlistStatus {
  WAITING = "waiting",
  SEATED = "seated",
  REMOVED = "removed",
}

export enum AdminRole {
  OWNER = "owner",
  MANAGER = "manager",
  STAFF = "staff",
}

export enum NoShowChargeStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
}

// ===========================
// Entities
// ===========================

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface AccommodationType {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  min_seats: number;
  max_seats: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  id: string;
  restaurant_id: string;
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  cutoff_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CapacityRule {
  id: string;
  restaurant_id: string;
  accommodation_type_id: string;
  time_slot_id: string;
  max_covers: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  preferred_locale: Locale;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_id: string;
  accommodation_type_id: string;
  time_slot_id: string;
  date: string;
  reservation_time: string;
  party_size: number;
  status: ReservationStatus;
  special_requests: string | null;
  stripe_customer_id: string | null;
  stripe_setup_intent_id: string | null;
  stripe_payment_method_id: string | null;
  cancellation_token: string | null;
  cancelled_at: string | null;
  cancelled_by: "customer" | "admin" | null;
  no_show_fee_override: number | null;
  no_show_charged: boolean;
  no_show_charge_amount: number | null;
  no_show_charge_id: string | null;
  source: ReservationSource;
  locale: Locale;
  created_at: string;
  updated_at: string;
}

export interface ReservationStatusHistory {
  id: string;
  reservation_id: string;
  from_status: ReservationStatus | null;
  to_status: ReservationStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  party_size: number;
  arrival_time: string;
  special_requests: string | null;
  status: WaitlistStatus;
  seated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalkIn {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  party_size: number;
  special_requests: string | null;
  created_at: string;
}

export interface ExceptionDate {
  id: string;
  restaurant_id: string;
  date: string;
  is_closed: boolean;
  reason: string | null;
  capacity_override: Record<string, { max_covers: number }> | null;
  card_guarantee_override: boolean | null;
  no_show_fee_override: number | null;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  restaurant_id: string;
  key: string;
  value: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  restaurant_id: string;
  role: AdminRole;
  display_name: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReservationEditHistory {
  id: string;
  reservation_id: string;
  changes: Array<{ field: string; label: string; from: string; to: string }>;
  changed_by: string | null;
  created_at: string;
}

export interface NoShowCharge {
  id: string;
  reservation_id: string;
  stripe_payment_intent_id: string;
  amount: number;
  currency: string;
  status: NoShowChargeStatus;
  error_message: string | null;
  charged_by: string | null;
  created_at: string;
  updated_at: string;
}

// ===========================
// Settings value types
// ===========================

export interface NoShowFeeSettings {
  amount: number;
  currency: string;
}

export interface CardGuaranteeDaysSettings {
  days: number[];
}

export interface BookingWindowSettings {
  value: number;
}

export interface CancellationDeadlineSettings {
  value: number;
}

// ===========================
// Joined / enriched types (for UI)
// ===========================

export interface ReservationWithCustomer extends Reservation {
  customer: Customer;
}

export interface ReservationFull extends Reservation {
  customer: Customer;
  accommodation_type: AccommodationType;
  time_slot: TimeSlot;
}

// ===========================
// Input types (for mutations)
// ===========================

export interface CreateReservationInput {
  customer_id: string;
  accommodation_type_id: string;
  time_slot_id: string;
  date: string;
  reservation_time: string;
  party_size: number;
  special_requests: string | null;
  source: ReservationSource;
  locale: Locale;
}

export interface CreateCustomerInput {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  preferred_locale: Locale;
}

export interface CreateWaitlistInput {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  party_size: number;
  special_requests: string | null;
}

export interface CreateWalkInInput {
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  party_size: number;
  special_requests: string | null;
}

export interface CreateTimeSlotInput {
  name: string;
  start_time: string;
  end_time: string;
  days_of_week: number[];
  is_active: boolean;
}

export interface CreateAccommodationInput {
  name: string;
  description: string | null;
  min_seats: number;
  max_seats: number;
  display_order: number;
  is_active: boolean;
}

export interface CreateCapacityRuleInput {
  accommodation_type_id: string;
  time_slot_id: string;
  max_covers: number;
}

export interface CreateExceptionDateInput {
  date: string;
  is_closed: boolean;
  reason: string | null;
  capacity_override: Record<string, { max_covers: number }> | null;
  card_guarantee_override: boolean | null;
  no_show_fee_override: number | null;
}

// ===========================
// API Response types
// ===========================

export interface AvailabilityTimeSlot {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  accommodations: (AccommodationType & { remaining: number })[];
}

export interface AvailabilityResponse {
  available: boolean;
  reason?: string;
  timeSlots: AvailabilityTimeSlot[];
  requiresCard: boolean;
  bookingWindow: { min: string; max: string } | null;
}
