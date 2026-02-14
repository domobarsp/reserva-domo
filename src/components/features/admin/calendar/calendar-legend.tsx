const LEGEND_ITEMS = [
  { color: "bg-green-50 border-green-200", label: "Baixa ocupação (até 50%)" },
  { color: "bg-yellow-50 border-yellow-200", label: "Média ocupação (51-80%)" },
  { color: "bg-red-50 border-red-200", label: "Alta ocupação (81-100%)" },
  { color: "bg-gray-100 border-gray-300", label: "Fechado" },
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
