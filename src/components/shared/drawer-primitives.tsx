import { cn } from "@/lib/utils";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-3.5">
      {children}
    </h3>
  );
}

export function IconRow({
  icon: Icon,
  children,
  iconClassName,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  iconClassName?: string;
}) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100",
          iconClassName
        )}
      >
        <Icon className="h-3 w-3 text-zinc-500" />
      </div>
      {children}
    </li>
  );
}
