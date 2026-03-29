"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import { Search, CalendarIcon, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TableFiltersProps {
  nameLabel?: string;
  phonePlaceholder?: string;
}

export function TableFilters({
  nameLabel = "Nome",
  phonePlaceholder = "Telefone",
}: TableFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [date, setDate] = useState<Date | undefined>(
    searchParams.get("date") ? parseISO(searchParams.get("date")!) : undefined
  );

  const hasFilters = !!name || !!phone || !!date;

  function applyFilters(overrides?: {
    name?: string;
    phone?: string;
    date?: Date | undefined;
  }) {
    const params = new URLSearchParams();
    const n = overrides?.name !== undefined ? overrides.name : name;
    const p = overrides?.phone !== undefined ? overrides.phone : phone;
    const d = overrides?.date !== undefined ? overrides.date : date;

    if (n) params.set("name", n);
    if (p) params.set("phone", p);
    if (d) params.set("date", format(d, "yyyy-MM-dd"));

    const query = params.toString();
    startTransition(() => {
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    });
  }

  function handleClear() {
    setName("");
    setPhone("");
    setDate(undefined);
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition-opacity",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Title row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-700">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 gap-1.5 text-xs text-zinc-500 hover:text-zinc-700"
          >
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Nome */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Nome</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder={nameLabel}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
              onBlur={() => applyFilters()}
              className="pl-9"
            />
          </div>
        </div>

        {/* Telefone */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Telefone</label>
          <Input
            placeholder={phonePlaceholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFilters();
            }}
            onBlur={() => applyFilters()}
          />
        </div>

        {/* Data */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-500">Data</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start gap-2 font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  applyFilters({ date: d });
                }}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
