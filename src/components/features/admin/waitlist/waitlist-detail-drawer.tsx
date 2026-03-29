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
import { SectionLabel, IconRow } from "@/components/shared/drawer-primitives";
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
      <SheetContent className="flex flex-col overflow-hidden p-0 w-full sm:max-w-[460px] bg-white">
        <SheetTitle className="sr-only">Detalhes — Lista de Espera</SheetTitle>

        {/* ── Cabeçalho ────────────────────────────────────────────── */}
        {entry && (
          <div className="flex-shrink-0 border-b border-zinc-100 bg-zinc-50/60 px-6 pt-6 pb-5 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-2">
              Lista de Espera
            </p>

            <h2 className="text-[22px] font-semibold tracking-tight text-zinc-900 leading-snug">
              {entry.customer_name}
            </h2>

            <div className="mt-2 flex items-center gap-2">
              <WaitlistStatusBadge status={entry.status} />
            </div>

            {/* Metadata 2×2 */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                Chegada: {format(parseISO(entry.arrival_time), "HH:mm")}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                {entry.party_size}{" "}
                {entry.party_size === 1 ? "pessoa" : "pessoas"}
              </div>
            </div>

            {/* Data de registro */}
            <p className="mt-3 text-xs text-zinc-400 border-t border-zinc-100 pt-3">
              Registrado em{" "}
              {format(
                parseISO(entry.arrival_time),
                "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                { locale: ptBR }
              )}
            </p>
          </div>
        )}

        {/* ── Corpo (scrollável) ───────────────────────────────────── */}
        {entry && (
          <div className="flex-1 overflow-y-auto">
            {/* Contato */}
            <section className="px-6 py-4 border-b border-zinc-100">
              <SectionLabel>Contato</SectionLabel>
              <ul className="space-y-2.5">
                <IconRow icon={Phone}>
                  <span className="text-zinc-700">{entry.customer_phone}</span>
                </IconRow>
                {entry.customer_email && (
                  <IconRow icon={Mail}>
                    <span className="font-medium text-zinc-800 break-all">
                      {entry.customer_email}
                    </span>
                  </IconRow>
                )}
              </ul>
            </section>

            {/* Solicitações especiais */}
            {entry.special_requests && (
              <section className="px-6 py-4 border-b border-zinc-100">
                <SectionLabel>Solicitações Especiais</SectionLabel>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 mt-0.5">
                    <MessageSquare className="h-3 w-3 text-zinc-500" />
                  </div>
                  <p className="text-sm italic text-zinc-600 leading-relaxed">
                    &ldquo;{entry.special_requests}&rdquo;
                  </p>
                </div>
              </section>
            )}

            {/* Linha do tempo */}
            <section className="px-6 py-4">
              <SectionLabel>Linha do Tempo</SectionLabel>
              <ol className="space-y-0">
                {/* Chegada */}
                <li className="flex gap-4">
                  <div className="flex flex-col items-center pt-[3px]">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-zinc-300 bg-white" />
                    {(entry.seated_at || entry.status === WaitlistStatus.REMOVED) && <div className="w-px flex-1 bg-zinc-200 my-1" />}
                  </div>
                  <div className={(entry.seated_at || entry.status === WaitlistStatus.REMOVED) ? "pb-4" : ""}>
                    <p className="text-[11px] text-zinc-400 mb-1.5 leading-none">
                      {format(parseISO(entry.arrival_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-zinc-600">Chegada registrada</p>
                  </div>
                </li>

                {/* Acomodado */}
                {entry.seated_at && (
                  <li className="flex gap-4">
                    <div className="flex flex-col items-center pt-[3px]">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-emerald-400 bg-white" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400 mb-1.5 leading-none">
                        {format(parseISO(entry.seated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-emerald-700">Cliente acomodado</p>
                    </div>
                  </li>
                )}

                {/* Removido */}
                {entry.status === WaitlistStatus.REMOVED && !entry.seated_at && (
                  <li className="flex gap-4">
                    <div className="flex flex-col items-center pt-[3px]">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-rose-400 bg-white" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400 mb-1.5 leading-none">
                        {format(parseISO(entry.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-rose-600">Removido da lista</p>
                    </div>
                  </li>
                )}
              </ol>
            </section>
          </div>
        )}

        {/* ── Rodapé de ações ─────────────────────────────────────── */}
        {entry && isWaiting && (
          <div className="flex-shrink-0 border-t border-zinc-200 bg-white px-5 py-4 space-y-2">
            <Button
              onClick={() => handleAction(WaitlistStatus.SEATED)}
              disabled={!!loadingStatus}
              className="w-full gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
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
              className="w-full gap-2 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
            >
              {loadingStatus === WaitlistStatus.REMOVED ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Remover da lista
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
