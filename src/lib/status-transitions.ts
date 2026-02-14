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
      "bg-yellow-100 text-yellow-800 border-yellow-200",
    [ReservationStatus.CONFIRMED]:
      "bg-blue-100 text-blue-800 border-blue-200",
    [ReservationStatus.SEATED]:
      "bg-green-100 text-green-800 border-green-200",
    [ReservationStatus.COMPLETE]:
      "bg-gray-100 text-gray-800 border-gray-200",
    [ReservationStatus.NO_SHOW]: "bg-red-100 text-red-800 border-red-200",
    [ReservationStatus.CANCELLED]:
      "bg-gray-100 text-gray-500 border-gray-200",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
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
      "bg-yellow-100 text-yellow-800 border-yellow-200",
    [WaitlistStatus.SEATED]: "bg-green-100 text-green-800 border-green-200",
    [WaitlistStatus.REMOVED]: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return colors[status] ?? "bg-gray-100 text-gray-800 border-gray-200";
}
