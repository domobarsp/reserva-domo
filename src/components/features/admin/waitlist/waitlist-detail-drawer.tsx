"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Loader2,
  Phone,
  Mail,
  Users,
  Clock,
  MessageSquare,
  CheckCheck,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { WaitlistStatusBadge } from "@/components/shared/status-badge";
import type { WaitlistEntry } from "@/types";
import { WaitlistStatus } from "@/types";
import { updateWaitlistStatus } from "@/app/admin/(authenticated)/lista-espera/actions";

interface WaitlistDetailDrawerProps {
  entry: WaitlistEntry | null;
  onClose: () => void;
  onActionSuccess: () => void;
}

export function WaitlistDetailDrawer({
  entry,
  onClose,
  onActionSuccess,
}: WaitlistDetailDrawerProps) {
  const [loadingStatus, setLoadingStatus] = useState<WaitlistStatus | null>(
    null
  );

  async function handleAction(status: WaitlistStatus) {
    if (!entry) return;
    setLoadingStatus(status);
    const result = await updateWaitlistStatus(entry.id, status);
    setLoadingStatus(null);

    if (result.success) {
      const msg =
        status === WaitlistStatus.SEATED
          ? "Cliente acomodado com sucesso"
          : "Cliente removido da lista de espera";
      toast.success(msg);
      onClose();
      onActionSuccess();
    } else {
      toast.error(result.error);
    }
  }

  const isWaiting = entry?.status === WaitlistStatus.WAITING;

  return (
    <Sheet
      open={!!entry}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex flex-col overflow-hidden p-0 sm:max-w-lg">
        <SheetTitle className="sr-only">Detalhes — Lista de Espera</SheetTitle>

        {/* ── Cabeçalho ────────────────────────────────────────────── */}
        {entry && (
          <div className="border-b bg-muted/30 px-6 pb-4 pt-5 pr-14">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Lista de Espera
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              {entry.customer_name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <WaitlistStatusBadge status={entry.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Chegada:{" "}
                {format(parseISO(entry.arrival_time), "HH:mm", {
                  locale: ptBR,
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {entry.party_size}{" "}
                {entry.party_size === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>
          </div>
        )}

        {/* ── Corpo (scrollável) ───────────────────────────────────── */}
        {entry && (
          <div className="flex-1 divide-y divide-border/60 overflow-y-auto">
            {/* Contato */}
            <section className="space-y-3 px-6 py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contato
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <span>{entry.customer_phone}</span>
                </li>
                {entry.customer_email && (
                  <li className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    <span>{entry.customer_email}</span>
                  </li>
                )}
              </ul>
            </section>

            {/* Solicitações especiais */}
            {entry.special_requests && (
              <section className="space-y-2 px-6 py-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Solicitações Especiais
                </h3>
                <div className="flex gap-2.5">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <p className="text-sm italic text-foreground/80">
                    {entry.special_requests}
                  </p>
                </div>
              </section>
            )}

            {/* Linha do tempo */}
            <section className="space-y-3 px-6 py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Linha do Tempo
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Chegada registrada</dt>
                  <dd>
                    {format(parseISO(entry.arrival_time), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </dd>
                </div>
                {entry.seated_at && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Acomodado em</dt>
                    <dd>
                      {format(
                        parseISO(entry.seated_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR }
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        )}

        {/* ── Rodapé de ações ─────────────────────────────────────── */}
        {entry && isWaiting && (
          <div className="border-t bg-background px-6 py-4">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Ações
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAction(WaitlistStatus.SEATED)}
                disabled={!!loadingStatus}
                className="flex-1 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {loadingStatus === WaitlistStatus.SEATED ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                Acomodar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction(WaitlistStatus.REMOVED)}
                disabled={!!loadingStatus}
                className="flex-1 gap-2 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              >
                {loadingStatus === WaitlistStatus.REMOVED ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Remover
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
