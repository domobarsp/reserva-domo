"use client";

import { useEffect, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Loader2,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  Globe,
  Users,
  CalendarDays,
  Clock,
  Armchair,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ReservationStatusBadge } from "@/components/shared/status-badge";
import {
  getStatusLabel,
  getStatusColor,
  getValidNextStatuses,
} from "@/lib/status-transitions";
import { formatTime, cn } from "@/lib/utils";
import { ReservationStatus, ReservationSource, Locale } from "@/types";
import {
  getReservationDetails,
  updateReservationStatus,
  type ReservationDetails,
} from "@/app/admin/(authenticated)/reservas/actions";

// ─── helpers ──────────────────────────────────────────────────────────────────

const sourceLabels: Record<ReservationSource, string> = {
  [ReservationSource.ONLINE]: "Online",
  [ReservationSource.ADMIN]: "Admin",
  [ReservationSource.PHONE]: "Telefone",
};

const localeLabels: Record<Locale, string> = {
  [Locale.PT]: "Português",
  [Locale.EN]: "Inglês",
  [Locale.ES]: "Espanhol",
};

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Estilo do botão de ação por próximo status */
const nextStatusConfig: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  [ReservationStatus.CONFIRMED]: {
    label: "Confirmar",
    className: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  [ReservationStatus.SEATED]: {
    label: "Sentar",
    className: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  [ReservationStatus.COMPLETE]: {
    label: "Concluir",
    className: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  [ReservationStatus.NO_SHOW]: {
    label: "No-Show",
    className:
      "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
  [ReservationStatus.CANCELLED]: {
    label: "Cancelar",
    className:
      "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  },
  [ReservationStatus.PENDING]: {
    label: "Pendente",
    className: "border bg-muted text-muted-foreground",
  },
};

// ─── componente ───────────────────────────────────────────────────────────────

interface ReservationDetailDrawerProps {
  reservationId: string | null;
  onClose: () => void;
  onActionSuccess?: () => void;
}

export function ReservationDetailDrawer({
  reservationId,
  onClose,
  onActionSuccess,
}: ReservationDetailDrawerProps) {
  const [details, setDetails] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoadingStatus, setActionLoadingStatus] =
    useState<ReservationStatus | null>(null);
  const [chargeConfirm, setChargeConfirm] = useState(false);
  const [isCharging, setIsCharging] = useState(false);

  const loadDetails = useCallback(async (id: string) => {
    setLoading(true);
    setChargeConfirm(false);
    const data = await getReservationDetails(id);
    setDetails(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!reservationId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDetails(reservationId);
  }, [reservationId, loadDetails]);

  async function handleStatusChange(nextStatus: ReservationStatus) {
    if (!details) return;
    setActionLoadingStatus(nextStatus);
    const result = await updateReservationStatus(details.id, nextStatus);
    setActionLoadingStatus(null);
    if (result.success) {
      await loadDetails(details.id);
      onActionSuccess?.();
    }
  }

  async function handleChargeNoShow() {
    if (!details) return;
    setIsCharging(true);
    const res = await fetch("/api/stripe/charge-no-show", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reservationId: details.id }),
    });
    setIsCharging(false);
    setChargeConfirm(false);
    if (res.ok) {
      await loadDetails(details.id);
      onActionSuccess?.();
    }
  }

  const nextStatuses = details ? getValidNextStatuses(details.status) : [];
  const canChargeNoShow =
    details?.status === ReservationStatus.NO_SHOW &&
    !!details.stripe_payment_method_id &&
    !details.no_show_charged;

  return (
    <Sheet
      open={!!reservationId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex flex-col overflow-hidden p-0 sm:max-w-lg">
        <SheetTitle className="sr-only">Detalhes da Reserva</SheetTitle>

        {/* ── Cabeçalho ────────────────────────────────────────────── */}
        {details && !loading && (
          <div className="border-b bg-muted/30 px-6 pb-4 pt-5 pr-14">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Reserva
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              {details.customer.first_name} {details.customer.last_name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <ReservationStatusBadge status={details.status} />
              <span className="rounded-full border border-border/60 bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                {sourceLabels[details.source as ReservationSource]}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {format(parseISO(details.date), "dd/MM/yyyy (EEE)", {
                  locale: ptBR,
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {formatTime(details.reservation_time)}
              </span>
              <span className="flex items-center gap-1.5">
                <Armchair className="h-3.5 w-3.5" />
                {details.accommodation_type.name}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {details.party_size}{" "}
                {details.party_size === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* ── Corpo (scrollável) ───────────────────────────────────── */}
        {details && !loading && (
          <div className="flex-1 space-y-0 overflow-y-auto divide-y divide-border/60">
            {/* Cliente */}
            <section className="px-6 py-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cliente
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <span>{details.customer.email}</span>
                </li>
                {details.customer.phone && (
                  <li className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    <span>{details.customer.phone}</span>
                  </li>
                )}
                <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <span>{localeLabels[details.locale as Locale]}</span>
                </li>
              </ul>
            </section>

            {/* Solicitações especiais */}
            {details.special_requests && (
              <section className="px-6 py-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Solicitações Especiais
                </h3>
                <div className="flex gap-2.5">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <p className="text-sm italic text-foreground/80">
                    {details.special_requests}
                  </p>
                </div>
              </section>
            )}

            {/* Garantia & Cobrança */}
            {details.stripe_payment_method_id && (
              <section className="px-6 py-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Garantia & Cobrança
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    <span>Cartão registrado como garantia</span>
                  </div>
                  {details.no_show_charged && details.no_show_charge_amount ? (
                    <div className="flex items-center gap-2.5 text-sm text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        No-show cobrado:{" "}
                        <strong>
                          {formatCurrency(details.no_show_charge_amount)}
                        </strong>
                      </span>
                    </div>
                  ) : details.status === ReservationStatus.NO_SHOW ? (
                    <div className="flex items-center gap-2.5 text-sm text-amber-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>No-show pendente de cobrança</span>
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            {/* Histórico */}
            {details.statusHistory.length > 0 && (
              <section className="px-6 py-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Histórico
                </h3>
                <ol className="space-y-2.5">
                  {details.statusHistory.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0 rounded-full border border-border/60 bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {format(parseISO(entry.created_at), "dd/MM HH:mm")}
                      </span>
                      {entry.from_status ? (
                        <span className="flex flex-wrap items-center gap-1.5 text-sm">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              getStatusColor(entry.from_status)
                            )}
                          >
                            {getStatusLabel(entry.from_status)}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              getStatusColor(entry.to_status)
                            )}
                          >
                            {getStatusLabel(entry.to_status)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Criado como{" "}
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              getStatusColor(entry.to_status)
                            )}
                          >
                            {getStatusLabel(entry.to_status)}
                          </span>
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}

        {/* ── Rodapé de ações ─────────────────────────────────────── */}
        {details && !loading && (nextStatuses.length > 0 || canChargeNoShow) && (
          <div className="border-t bg-background px-6 py-4 space-y-3">
            {/* Confirmação de cobrança */}
            {chargeConfirm ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">
                      Confirmar cobrança de no-show?
                    </p>
                    <p className="mt-0.5 text-amber-700">
                      Esta ação é irreversível. O cartão de{" "}
                      <strong>{details.customer.first_name}</strong> será
                      cobrado.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleChargeNoShow}
                    disabled={isCharging}
                    className="flex-1 bg-amber-600 text-white hover:bg-amber-700"
                  >
                    {isCharging ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirmar cobrança"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setChargeConfirm(false)}
                    disabled={isCharging}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Transições de status */}
                {nextStatuses.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Alterar status
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map((status) => {
                        const cfg = nextStatusConfig[status];
                        const isLoading = actionLoadingStatus === status;
                        return (
                          <Button
                            key={status}
                            size="sm"
                            onClick={() => handleStatusChange(status)}
                            disabled={!!actionLoadingStatus || isCharging}
                            className={cn("gap-1.5", cfg.className)}
                          >
                            {isLoading && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            {cfg.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cobrar no-show */}
                {canChargeNoShow && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setChargeConfirm(true)}
                    disabled={!!actionLoadingStatus}
                    className="w-full gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  >
                    <CreditCard className="h-4 w-4" />
                    Cobrar No-Show
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
