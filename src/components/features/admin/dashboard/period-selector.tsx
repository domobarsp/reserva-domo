"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { DashboardPeriod } from "@/app/admin/(authenticated)/dashboard/actions";

const periods: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "15days", label: "Próximos 15 dias" },
];

interface PeriodSelectorProps {
  currentPeriod: DashboardPeriod;
}

export function PeriodSelector({ currentPeriod }: PeriodSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSelect(period: DashboardPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    if (period === "today") {
      params.delete("period");
    } else {
      params.set("period", period);
    }
    const query = params.toString();
    startTransition(() => {
      router.push(`/admin/dashboard${query ? `?${query}` : ""}`);
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-zinc-300 bg-zinc-200 p-1 transition-opacity",
        isPending && "opacity-60"
      )}
    >
      {periods.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleSelect(value)}
          disabled={isPending}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            currentPeriod === value
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
