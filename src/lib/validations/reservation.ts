import { z } from "zod";

// Step 1 — Informações da Reserva
export const reservationInfoSchema = z.object({
  date: z.string().min(1, "Selecione uma data"),
  time_slot_id: z.string().min(1, "Selecione um horário"),
  accommodation_type_id: z.string().min(1, "Selecione um tipo de acomodação"),
  party_size: z
    .number({ error: "Informe o número de pessoas" })
    .int("Número deve ser inteiro")
    .min(1, "Mínimo de 1 pessoa"),
  special_requests: z.string(),
});

// Step 2 — Dados do Cliente
export const customerInfoSchema = z.object({
  first_name: z
    .string()
    .min(1, "Informe seu nome")
    .max(100, "Nome muito longo"),
  last_name: z
    .string()
    .min(1, "Informe seu sobrenome")
    .max(100, "Sobrenome muito longo"),
  email: z
    .string()
    .min(1, "Informe seu email")
    .email("Email inválido"),
  phone: z
    .string()
    .min(1, "Informe seu telefone")
    .regex(
      /^\+?[\d\s()-]{8,20}$/,
      "Telefone inválido"
    ),
  preferred_locale: z.enum(["pt", "en", "es"]),
});

// Schema completo (composição dos dois) — usado no formulário
export const fullReservationSchema = reservationInfoSchema.merge(customerInfoSchema);

// Schema estendido para a API — inclui campos Stripe opcionais
export const apiReservationSchema = fullReservationSchema.extend({
  stripe_customer_id: z.string().optional(),
  stripe_payment_method_id: z.string().optional(),
});

// Tipos inferidos dos schemas
export type ReservationInfoData = z.infer<typeof reservationInfoSchema>;
export type CustomerInfoData = z.infer<typeof customerInfoSchema>;
export type FullReservationData = z.infer<typeof fullReservationSchema>;
export type ApiReservationData = z.infer<typeof apiReservationSchema>;
