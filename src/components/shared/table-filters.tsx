"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState } from "react";
import { Search, CalendarIcon, X } from "lucide-react";
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
  nameLabel = "Buscar por nome",
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
        "flex flex-wrap items-center gap-2 transition-opacity",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      {/* Nome */}
      <div className="relative min-w-48 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

      {/* Telefone */}
      <div className="relative min-w-36">
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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "min-w-36 justify-start gap-2 font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy") : "Data"}
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

      {/* Limpar */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="gap-1.5 text-muted-foreground"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
