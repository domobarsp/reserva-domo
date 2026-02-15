import { ReservationStatus, WaitlistStatus } from "@/types";

/**
 * Mapa de transições válidas de status de reserva.
 * Cada chave é o status atual, o valor é um array de status possíveis.
 */
const VALID_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  [ReservationStatus.PENDING]: [
    ReservationStatus.CONFIRMED,
    ReservationStatus.CANCELLED,
  ],
  [ReservationStatus.CONFIRMED]: [
    ReservationStatus.SEATED,
    ReservationStatus.NO_SHOW,
    ReservationStatus.CANCELLED,
  ],
  [ReservationStatus.SEATED]: [
    ReservationStatus.COMPLETE,
    ReservationStatus.NO_SHOW,
  ],
  [ReservationStatus.COMPLETE]: [],
  [ReservationStatus.NO_SHOW]: [],
  [ReservationStatus.CANCELLED]: [],
};

/**
 * Retorna os próximos status válidos a partir do status atual.
 */
export function getValidNextStatuses(
  currentStatus: ReservationStatus
): ReservationStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

/**
 * Verifica se uma transição de status é válida.
 */
export function isValidTransition(
  from: ReservationStatus,
  to: ReservationStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Retorna o label em português para um status de reserva.
 */
export function getStatusLabel(status: ReservationStatus): string {
  const labels: Record<ReservationStatus, string> = {
    [ReservationStatus.PENDING]: "Pendente",
    [ReservationStatus.CONFIRMED]: "Confirmado",
    [ReservationStatus.SEATED]: "Sentado",
    [ReservationStatus.COMPLETE]: "Completo",
    [ReservationStatus.NO_SHOW]: "Não Compareceu",
    [ReservationStatus.CANCELLED]: "Cancelado",
  };
  return labels[status] ?? status;
}

/**
 * Retorna a variante de cor (para Badge) baseada no status.
 * Retorna classe CSS do Tailwind.
 */
export function getStatusColor(status: ReservationStatus): string {
  const colors: Record<ReservationStatus, string> = {
    [ReservationStatus.PENDING]:
      "bg-amber-50 text-amber-700 border-amber-200/60",
    [ReservationStatus.CONFIRMED]:
      "bg-blue-50 text-blue-700 border-blue-200/60",
    [ReservationStatus.SEATED]:
      "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    [ReservationStatus.COMPLETE]:
      "bg-gray-50 text-gray-600 border-gray-200/60",
    [ReservationStatus.NO_SHOW]: "bg-rose-50 text-rose-700 border-rose-200/60",
    [ReservationStatus.CANCELLED]:
      "bg-gray-50 text-gray-400 border-gray-200/60",
  };
  return colors[status] ?? "bg-gray-50 text-gray-600 border-gray-200/60";
}

/**
 * Retorna o label em português para um status da lista de espera.
 */
export function getWaitlistStatusLabel(status: WaitlistStatus): string {
  const labels: Record<WaitlistStatus, string> = {
    [WaitlistStatus.WAITING]: "Aguardando",
    [WaitlistStatus.SEATED]: "Acomodado",
    [WaitlistStatus.REMOVED]: "Removido",
  };
  return labels[status] ?? status;
}

/**
 * Retorna a variante de cor para status da lista de espera.
 */
export function getWaitlistStatusColor(status: WaitlistStatus): string {
  const colors: Record<WaitlistStatus, string> = {
    [WaitlistStatus.WAITING]:
      "bg-amber-50 text-amber-700 border-amber-200/60",
    [WaitlistStatus.SEATED]: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    [WaitlistStatus.REMOVED]: "bg-gray-50 text-gray-400 border-gray-200/60",
  };
  return colors[status] ?? "bg-gray-50 text-gray-600 border-gray-200/60";
}
