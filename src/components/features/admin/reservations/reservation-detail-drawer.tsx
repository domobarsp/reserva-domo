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
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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
  type NoShowFeeSource,
} from "@/app/admin/(authenticated)/reservas/actions";
import type { ReservationEditHistory } from "@/types";

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

const noShowFeeSourceLabel: Record<NoShowFeeSource, string> = {
  reservation_override: "valor personalizado",
  date_override: "override desta data",
  default: "valor padrão",
  none: "",
};

// ─── configuração de ações ────────────────────────────────────────────────────

/** Ações primárias (positivas): botão cheio, full-width */
const PRIMARY_ACTIONS = new Set([
  ReservationStatus.CONFIRMED,
  ReservationStatus.SEATED,
  ReservationStatus.COMPLETE,
]);

const primaryActionConfig: Partial<
  Record<ReservationStatus, { label: string; className: string }>
> = {
  [ReservationStatus.CONFIRMED]: {
    label: "Confirmar reserva",
    className: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  [ReservationStatus.SEATED]: {
    label: "Marcar como sentado",
    className: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  [ReservationStatus.COMPLETE]: {
    label: "Concluir atendimento",
    className: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
};

/** Ações secundárias (destrutivas/neutras): outline, linha de baixo */
const secondaryActionConfig: Partial<
  Record<ReservationStatus, { label: string }>
> = {
  [ReservationStatus.NO_SHOW]: { label: "Não compareceu" },
  [ReservationStatus.CANCELLED]: { label: "Cancelar reserva" },
};

// ─── subcomponentes ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3.5">
      {children}
    </h3>
  );
}

function IconRow({
  icon: Icon,
  children,
  iconClassName,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  iconClassName?: string;
}) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100",
          iconClassName
        )}
      >
        <Icon className="h-3 w-3 text-zinc-500" />
      </div>
      {children}
    </li>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────

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
  const primaryStatuses = nextStatuses.filter((s) => PRIMARY_ACTIONS.has(s));
  const secondaryStatuses = nextStatuses.filter(
    (s) => !PRIMARY_ACTIONS.has(s)
  );
  const canChargeNoShow =
    details?.status === ReservationStatus.NO_SHOW &&
    !!details.stripe_payment_method_id &&
    !details.no_show_charged;

  const hasFooter =
    details && !loading && (nextStatuses.length > 0 || canChargeNoShow);

  // Data de criação (primeiro evento do histórico, sem from_status)
  const creationEntry = details?.statusHistory.find((e) => !e.from_status);

  return (
    <Sheet
      open={!!reservationId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex flex-col overflow-hidden p-0 w-full sm:max-w-[460px] bg-white">
        <SheetTitle className="sr-only">Detalhes da Reserva</SheetTitle>

        {/* ── Loading ──────────────────────────────────────────────── */}
        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
          </div>
        )}

        {/* ── Cabeçalho ────────────────────────────────────────────── */}
        {details && !loading && (
          <div className="flex-shrink-0 border-b border-zinc-100 bg-zinc-50/60 px-6 pt-6 pb-5 pr-14">
            {/* Eyebrow */}
            <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-2">
              Reserva
            </p>

            {/* Nome */}
            <h2 className="text-[22px] font-semibold tracking-tight text-zinc-900 leading-snug">
              {details.customer.first_name} {details.customer.last_name}
            </h2>

            {/* Badges: status + origem abaixo do nome */}
            <div className="mt-2 flex items-center gap-2">
              <ReservationStatusBadge status={details.status} />
              <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-[11px] text-zinc-500">
                {sourceLabels[details.source as ReservationSource]}
              </span>
            </div>

            {/* Metadata 2×2 */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                <CalendarDays className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                {format(parseISO(details.date), "dd/MM/yyyy (EEE)", {
                  locale: ptBR,
                })}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                {formatTime(details.reservation_time)}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                <Armchair className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                {details.accommodation_type.name}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                {details.party_size}{" "}
                {details.party_size === 1 ? "pessoa" : "pessoas"}
              </div>
            </div>

            {/* Data de criação da reserva */}
            {creationEntry && (
              <p className="mt-3 text-xs text-zinc-400 border-t border-zinc-100 pt-3">
                Reservado em{" "}
                {format(
                  parseISO(creationEntry.created_at),
                  "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                  { locale: ptBR }
                )}
              </p>
            )}
          </div>
        )}

        {/* ── Corpo (scrollável) ───────────────────────────────────── */}
        {details && !loading && (
          <div className="flex-1 overflow-y-auto">
            {/* Cliente */}
            <section className="px-6 py-4 border-b border-zinc-100">
              <SectionLabel>Cliente</SectionLabel>
              <ul className="space-y-2.5">
                <IconRow icon={Mail}>
                  <span className="font-medium text-zinc-800 break-all">
                    {details.customer.email}
                  </span>
                </IconRow>
                {details.customer.phone && (
                  <IconRow icon={Phone}>
                    <span className="text-zinc-700">
                      {details.customer.phone}
                    </span>
                  </IconRow>
                )}
                <IconRow icon={Globe}>
                  <span className="text-zinc-500">
                    {localeLabels[details.locale as Locale]}
                  </span>
                </IconRow>
              </ul>
            </section>

            {/* Solicitações especiais */}
            {details.special_requests && (
              <section className="px-6 py-4 border-b border-zinc-100">
                <SectionLabel>Solicitações Especiais</SectionLabel>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 mt-0.5">
                    <MessageSquare className="h-3 w-3 text-zinc-500" />
                  </div>
                  <p className="text-sm italic text-zinc-600 leading-relaxed">
                    &ldquo;{details.special_requests}&rdquo;
                  </p>
                </div>
              </section>
            )}

            {/* Garantia & Cobrança */}
            {details.stripe_payment_method_id && (
              <section className="px-6 py-4 border-b border-zinc-100">
                <SectionLabel>Garantia & Cobrança</SectionLabel>
                <ul className="space-y-2.5">
                  <IconRow icon={CreditCard}>
                    <span className="text-zinc-500">
                      Cartão registrado como garantia
                    </span>
                  </IconRow>

                  {/* Effective no-show fee */}
                  {details.no_show_charged && details.no_show_charge_amount ? (
                    <li className="flex items-center gap-3 text-sm">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-emerald-700">
                        No-show cobrado:{" "}
                        <strong>
                          {formatCurrency(details.no_show_charge_amount)}
                        </strong>
                      </span>
                    </li>
                  ) : details.status === ReservationStatus.NO_SHOW ? (
                    <li className="flex items-center gap-3 text-sm">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-50">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                      </div>
                      <span className="text-amber-700">
                        No-show pendente de cobrança
                        {details.effectiveNoShowFee ? (
                          <> — <strong>{formatCurrency(details.effectiveNoShowFee)}</strong></>
                        ) : null}
                      </span>
                    </li>
                  ) : details.effectiveNoShowFee === null || details.effectiveNoShowFee === 0 ? (
                    <li className="flex items-center gap-3 text-sm">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                        <X className="h-3 w-3 text-zinc-400" />
                      </div>
                      <span className="text-zinc-500">
                        {details.effectiveNoShowFee === 0
                          ? "Isento de taxa de no-show"
                          : "Sem taxa de no-show configurada"}
                      </span>
                    </li>
                  ) : (
                    <li className="flex items-center gap-3 text-sm">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                        <AlertTriangle className="h-3 w-3 text-zinc-500" />
                      </div>
                      <div>
                        <span className="text-zinc-700">
                          Taxa de no-show:{" "}
                          <strong>{formatCurrency(details.effectiveNoShowFee)}</strong>
                        </span>
                        {details.noShowFeeSource !== "default" && (
                          <span className="ml-1.5 text-zinc-400 text-xs">
                            ({noShowFeeSourceLabel[details.noShowFeeSource]})
                          </span>
                        )}
                      </div>
                    </li>
                  )}
                </ul>
              </section>
            )}

            {/* Histórico */}
            {(details.statusHistory.length > 0 || details.editHistory.length > 0) && (
              <section className="px-6 py-4">
                <SectionLabel>Histórico</SectionLabel>
                {/* Merge and sort status + edit events by date */}
                {(() => {
                  type TimelineItem =
                    | { kind: "status"; event: (typeof details.statusHistory)[0]; created_at: string }
                    | { kind: "edit"; event: ReservationEditHistory; created_at: string };

                  const items: TimelineItem[] = [
                    ...details.statusHistory.map((e) => ({ kind: "status" as const, event: e, created_at: e.created_at })),
                    ...details.editHistory.map((e) => ({ kind: "edit" as const, event: e, created_at: e.created_at })),
                  ].sort((a, b) => a.created_at.localeCompare(b.created_at));

                  return (
                    <ol className="space-y-0">
                      {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                          <li key={item.event.id} className="flex gap-4">
                            {/* Coluna esquerda: dot + conector */}
                            <div className="flex flex-col items-center pt-[3px]">
                              <div className={cn(
                                "h-2.5 w-2.5 shrink-0 rounded-full border-2 bg-white",
                                item.kind === "edit" ? "border-zinc-400" : "border-zinc-300"
                              )} />
                              {!isLast && (
                                <div className="w-px flex-1 bg-zinc-200 my-1" />
                              )}
                            </div>

                            {/* Coluna direita: conteúdo */}
                            <div className={cn("flex-1 min-w-0", !isLast ? "pb-4" : "pb-0")}>
                              <p className="text-[11px] text-zinc-400 mb-1.5 leading-none">
                                {format(parseISO(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>

                              {item.kind === "status" ? (
                                item.event.from_status ? (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getStatusColor(item.event.from_status))}>
                                      {getStatusLabel(item.event.from_status)}
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-zinc-300" />
                                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getStatusColor(item.event.to_status))}>
                                      {getStatusLabel(item.event.to_status)}
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-zinc-500">
                                    Criado como{" "}
                                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", getStatusColor(item.event.to_status))}>
                                      {getStatusLabel(item.event.to_status)}
                                    </span>
                                  </p>
                                )
                              ) : (
                                <div>
                                  <p className="text-sm text-zinc-600 font-medium mb-1">Reserva editada</p>
                                  <ul className="space-y-0.5">
                                    {item.event.changes.map((c, ci) => (
                                      <li key={ci} className="text-xs text-zinc-500 flex items-center gap-1.5">
                                        <span className="text-zinc-400">{c.label}:</span>
                                        <span className="line-through text-zinc-400">{c.from}</span>
                                        <ArrowRight className="h-2.5 w-2.5 text-zinc-300 shrink-0" />
                                        <span className="text-zinc-600">{c.to}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  );
                })()}
              </section>
            )}
          </div>
        )}

        {/* ── Rodapé de ações ─────────────────────────────────────── */}
        {hasFooter && (
          <div className="flex-shrink-0 border-t border-zinc-200 bg-white px-5 py-4">
            {chargeConfirm ? (
              /* ── Confirmação de cobrança ── */
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">
                        Confirmar cobrança de no-show?
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500 leading-snug">
                        Esta ação é irreversível. O cartão registrado de{" "}
                        <strong className="text-zinc-700">
                          {details!.customer.first_name}
                        </strong>{" "}
                        será cobrado{details!.effectiveNoShowFee ? (
                          <> no valor de{" "}
                            <strong className="text-zinc-700">
                              {formatCurrency(details!.effectiveNoShowFee)}
                            </strong>
                          </>
                        ) : null}{" "}
                        imediatamente.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleChargeNoShow}
                    disabled={isCharging}
                    className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800"
                  >
                    {isCharging ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Confirmar cobrança"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setChargeConfirm(false)}
                    disabled={isCharging}
                    className="px-3 border-zinc-200"
                    aria-label="Cancelar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              /* ── Ações de status ── */
              <div className="space-y-2">
                {/* Ações primárias: botão cheio, full-width */}
                {primaryStatuses.map((status) => {
                  const cfg = primaryActionConfig[status];
                  if (!cfg) return null;
                  const isActing = actionLoadingStatus === status;
                  return (
                    <Button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={!!actionLoadingStatus || isCharging}
                      className={cn("w-full gap-2", cfg.className)}
                    >
                      {isActing && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {cfg.label}
                    </Button>
                  );
                })}

                {/* Ações secundárias: outline, em linha */}
                {secondaryStatuses.length > 0 && (
                  <div className="flex gap-2">
                    {secondaryStatuses.map((status) => {
                      const cfg = secondaryActionConfig[status];
                      if (!cfg) return null;
                      const isActing = actionLoadingStatus === status;
                      return (
                        <Button
                          key={status}
                          variant="outline"
                          onClick={() => handleStatusChange(status)}
                          disabled={!!actionLoadingStatus || isCharging}
                          className="flex-1 gap-2 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
                        >
                          {isActing && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          )}
                          {cfg.label}
                        </Button>
                      );
                    })}
                  </div>
                )}

                {/* Cobrar no-show */}
                {canChargeNoShow && (
                  <Button
                    onClick={() => setChargeConfirm(true)}
                    disabled={!!actionLoadingStatus}
                    className="w-full gap-2 bg-amber-600 text-white hover:bg-amber-700"
                  >
                    <CreditCard className="h-4 w-4" />
                    Cobrar no-show
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
