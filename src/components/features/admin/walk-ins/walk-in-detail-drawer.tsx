"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Phone,
  Mail,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SectionLabel, IconRow } from "@/components/shared/drawer-primitives";
import type { WalkIn } from "@/types";

interface WalkInDetailDrawerProps {
  walkIn: WalkIn | null;
  onClose: () => void;
}

export function WalkInDetailDrawer({ walkIn, onClose }: WalkInDetailDrawerProps) {
  return (
    <Sheet
      open={!!walkIn}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent className="flex flex-col overflow-hidden p-0 w-full sm:max-w-[460px] bg-white">
        <SheetTitle className="sr-only">Detalhes do Passante</SheetTitle>

        {/* ── Cabeçalho ────────────────────────────────────────────── */}
        {walkIn && (
          <div className="flex-shrink-0 border-b border-zinc-100 bg-zinc-50/60 px-6 pt-6 pb-5 pr-14">
            <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400 mb-2">
              Passante
            </p>

            <h2 className="text-[22px] font-semibold tracking-tight text-zinc-900 leading-snug">
              {walkIn.customer_name}
            </h2>

            {/* Metadata 2×2 */}
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                {format(parseISO(walkIn.created_at), "HH:mm")}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-zinc-600">
                <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                {walkIn.party_size}{" "}
                {walkIn.party_size === 1 ? "pessoa" : "pessoas"}
              </div>
            </div>

            {/* Data de registro */}
            <p className="mt-3 text-xs text-zinc-400 border-t border-zinc-100 pt-3">
              Registrado em{" "}
              {format(
                parseISO(walkIn.created_at),
                "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                { locale: ptBR }
              )}
            </p>
          </div>
        )}

        {/* ── Corpo (scrollável) ───────────────────────────────────── */}
        {walkIn && (
          <div className="flex-1 overflow-y-auto">
            {/* Contato */}
            <section className="px-6 py-4 border-b border-zinc-100">
              <SectionLabel>Contato</SectionLabel>
              <ul className="space-y-2.5">
                {walkIn.customer_phone ? (
                  <IconRow icon={Phone}>
                    <span className="text-zinc-700">{walkIn.customer_phone}</span>
                  </IconRow>
                ) : null}
                {walkIn.customer_email ? (
                  <IconRow icon={Mail}>
                    <span className="font-medium text-zinc-800 break-all">
                      {walkIn.customer_email}
                    </span>
                  </IconRow>
                ) : null}
                {!walkIn.customer_phone && !walkIn.customer_email && (
                  <li className="text-sm text-zinc-400">
                    Nenhum contato registrado
                  </li>
                )}
              </ul>
            </section>

            {/* Solicitações especiais */}
            {walkIn.special_requests && (
              <section className="px-6 py-4">
                <SectionLabel>Solicitações Especiais</SectionLabel>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 mt-0.5">
                    <MessageSquare className="h-3 w-3 text-zinc-500" />
                  </div>
                  <p className="text-sm italic text-zinc-600 leading-relaxed">
                    &ldquo;{walkIn.special_requests}&rdquo;
                  </p>
                </div>
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
