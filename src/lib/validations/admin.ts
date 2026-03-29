import { z } from "zod";

// ===========================
// Reserva (criação manual pelo admin)
// ===========================

export const adminReservationSchema = z.object({
  first_name: z
    .string()
    .min(1, "Informe o nome")
    .max(100, "Nome muito longo"),
  last_name: z
    .string()
    .min(1, "Informe o sobrenome")
    .max(100, "Sobrenome muito longo"),
  email: z.string().min(1, "Informe o email").email("Email inválido"),
  phone: z
    .string()
    .min(1, "Informe o telefone")
    .regex(/^\+?[\d\s()-]{8,20}$/, "Telefone inválido"),
  date: z.string().min(1, "Selecione uma data"),
  reservation_time: z.string().min(1, "Informe o horário"),
  accommodation_type_id: z.string().min(1, "Selecione uma acomodação"),
  party_size: z
    .number({ error: "Informe o número de pessoas" })
    .int("Número deve ser inteiro")
    .min(1, "Mínimo de 1 pessoa"),
  special_requests: z.string(),
  source: z.enum(["admin", "phone"]),
  preferred_locale: z.enum(["pt", "en", "es"]),
});

export type AdminReservationData = z.infer<typeof adminReservationSchema>;

// ===========================
// Edição de reserva
// ===========================

export const editReservationSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  reservation_time: z.string().min(1, "Informe o horário"),
  accommodation_type_id: z.string().min(1, "Selecione uma acomodação"),
  party_size: z
    .number({ error: "Informe o número de pessoas" })
    .int("Número deve ser inteiro")
    .min(1, "Mínimo de 1 pessoa"),
  special_requests: z.string(),
  no_show_fee_override: z.number().int().min(0).nullable(),
});

export type EditReservationData = z.infer<typeof editReservationSchema>;

// ===========================
// Lista de espera
// ===========================

export const waitlistEntrySchema = z.object({
  customer_name: z
    .string()
    .min(1, "Informe o nome")
    .max(200, "Nome muito longo"),
  customer_phone: z
    .string()
    .min(1, "Informe o telefone")
    .regex(/^\+?[\d\s()-]{8,20}$/, "Telefone inválido"),
  customer_email: z
    .string()
    .email("Email inválido")
    .or(z.literal("")),
  party_size: z
    .number({ error: "Informe o número de pessoas" })
    .int("Número deve ser inteiro")
    .min(1, "Mínimo de 1 pessoa"),
  special_requests: z.string(),
});

export type WaitlistEntryData = z.infer<typeof waitlistEntrySchema>;

// ===========================
// Passantes (Walk-ins)
// ===========================

export const walkInSchema = z.object({
  customer_name: z
    .string()
    .min(1, "Informe o nome")
    .max(200, "Nome muito longo"),
  customer_phone: z.string(),
  customer_email: z
    .string()
    .email("Email inválido")
    .or(z.literal("")),
  party_size: z
    .number({ error: "Informe o número de pessoas" })
    .int("Número deve ser inteiro")
    .min(1, "Mínimo de 1 pessoa"),
  special_requests: z.string(),
});

export type WalkInData = z.infer<typeof walkInSchema>;

// ===========================
// Time Slot
// ===========================

export const timeSlotSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(100, "Nome muito longo"),
  start_time: z
    .string()
    .min(1, "Informe o horário de início")
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Formato inválido (HH:MM)")
    .transform((v) => v.slice(0, 5)),
  end_time: z
    .string()
    .min(1, "Informe o horário de término")
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Formato inválido (HH:MM)")
    .transform((v) => v.slice(0, 5)),
  days_of_week: z
    .array(z.number().int().min(0).max(6))
    .min(1, "Selecione pelo menos um dia"),
  cutoff_minutes: z.number().int().min(0, "Mínimo 0 minutos").max(1440, "Máximo 24 horas"),
  is_active: z.boolean(),
});

export type TimeSlotData = z.infer<typeof timeSlotSchema>;

// ===========================
// Tipo de Acomodação
// ===========================

export const accommodationTypeSchema = z.object({
  name: z.string().min(1, "Informe o nome").max(100, "Nome muito longo"),
  description: z.string(),
  min_seats: z
    .number({ error: "Informe o mínimo de lugares" })
    .int("Número deve ser inteiro")
    .min(1, "Mínimo de 1 lugar"),
  max_seats: z
    .number({ error: "Informe o máximo de lugares" })
    .int("Número deve ser inteiro")
    .min(1, "Mínimo de 1 lugar"),
  display_order: z
    .number({ error: "Informe a ordem" })
    .int("Número deve ser inteiro")
    .min(0),
  is_active: z.boolean(),
});

export type AccommodationTypeData = z.infer<typeof accommodationTypeSchema>;

// ===========================
// Regra de Capacidade
// ===========================

export const capacityRuleSchema = z.object({
  accommodation_type_id: z.string().min(1, "Selecione uma acomodação"),
  time_slot_id: z.string().min(1, "Selecione um horário"),
  max_covers: z
    .number({ error: "Informe a capacidade máxima" })
    .int("Número deve ser inteiro")
    .min(0, "Mínimo de 0"),
});

export type CapacityRuleData = z.infer<typeof capacityRuleSchema>;

// ===========================
// Data de Exceção
// ===========================

export const exceptionDateSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  is_closed: z.boolean(),
  reason: z.string(),
  card_guarantee_override: z.boolean().nullable(),
  no_show_fee_override: z.number().int().min(0).nullable(),
  capacity_override: z
    .record(z.string(), z.object({ max_covers: z.number().int().min(0) }))
    .nullable(),
});

export type ExceptionDateData = z.infer<typeof exceptionDateSchema>;
