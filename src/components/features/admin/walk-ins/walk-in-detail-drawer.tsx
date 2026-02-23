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
      <SheetContent className="flex flex-col overflow-hidden p-0 sm:max-w-lg">
        <SheetTitle className="sr-only">Detalhes do Passante</SheetTitle>

        {/* ── Cabeçalho ────────────────────────────────────────────── */}
        {walkIn && (
          <div className="border-b bg-muted/30 px-6 pb-4 pt-5 pr-14">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Passante
            </p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">
              {walkIn.customer_name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {format(parseISO(walkIn.created_at), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {walkIn.party_size}{" "}
                {walkIn.party_size === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>
          </div>
        )}

        {/* ── Corpo (scrollável) ───────────────────────────────────── */}
        {walkIn && (
          <div className="flex-1 divide-y divide-border/60 overflow-y-auto">
            {/* Contato */}
            <section className="space-y-3 px-6 py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contato
              </h3>
              <ul className="space-y-2">
                {walkIn.customer_phone && (
                  <li className="flex items-center gap-2.5 text-sm">
                    <Phone className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    <span>{walkIn.customer_phone}</span>
                  </li>
                )}
                {walkIn.customer_email && (
                  <li className="flex items-center gap-2.5 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                    <span>{walkIn.customer_email}</span>
                  </li>
                )}
                {!walkIn.customer_phone && !walkIn.customer_email && (
                  <li className="text-sm text-muted-foreground">
                    Nenhum contato registrado
                  </li>
                )}
              </ul>
            </section>

            {/* Solicitações especiais */}
            {walkIn.special_requests && (
              <section className="space-y-2 px-6 py-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Solicitações Especiais
                </h3>
                <div className="flex gap-2.5">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                  <p className="text-sm italic text-foreground/80">
                    {walkIn.special_requests}
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
