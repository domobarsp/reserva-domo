"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface UseRealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  onEvent?: () => void;
}

export function useRealtimeSubscription({
  table,
  filter,
  onEvent,
}: UseRealtimeSubscriptionOptions) {
  const router = useRouter();
  // Ref estável para o callback — evita re-subscrição quando a função muda referência
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    const supabase = createClient();
    // Canal com nome único por instância para evitar conflito entre páginas
    const channelName = `realtime-${table}-${Math.random().toString(36).slice(2, 8)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          if (onEventRef.current) {
            onEventRef.current();
          } else {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // Apenas table e filter determinam o canal — o callback é lido via ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter]);
}
