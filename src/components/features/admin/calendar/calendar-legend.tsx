const LEGEND_ITEMS = [
  { color: "bg-emerald-50 border-emerald-200", label: "Baixa ocupação (até 50%)" },
  { color: "bg-amber-50 border-amber-200", label: "Média ocupação (51-80%)" },
  { color: "bg-rose-50 border-rose-200", label: "Alta ocupação (81-100%)" },
  { color: "bg-muted border-border", label: "Fechado" },
];

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={`h-4 w-4 rounded border ${item.color}`}
          />
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
