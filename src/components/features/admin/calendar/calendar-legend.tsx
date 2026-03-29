const LEGEND_ITEMS = [
  {
    bg: "bg-emerald-50 border border-emerald-200",
    label: "Baixa ocupação (< 35%)",
  },
  {
    bg: "bg-amber-100 border border-amber-200",
    label: "Média ocupação (35–70%)",
  },
  {
    bg: "bg-rose-100 border border-rose-200",
    label: "Alta ocupação (> 70%)",
  },
  {
    bg: "bg-zinc-100 border border-zinc-200",
    label: "Fechado",
  },
];

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {/* Ocupação */}
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`inline-block h-3 w-6 rounded-sm ${item.bg}`} />
          <span className="text-xs text-zinc-500">{item.label}</span>
        </div>
      ))}

      {/* Sem reservas */}
      <div className="flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-200 border border-zinc-300" />
        <span className="text-xs text-zinc-500">Sem reservas</span>
      </div>
    </div>
  );
}
