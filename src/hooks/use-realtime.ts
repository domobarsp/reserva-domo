"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        () => {
          if (onEvent) {
            onEvent();
          } else {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onEvent, router]);
}
