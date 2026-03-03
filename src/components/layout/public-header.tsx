import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-primary"
        >
          Domo
        </Link>

        <nav className="flex items-center gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            <Link
              href="/#como-funciona"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Como funciona
            </Link>
            <Link
              href="/#informacoes"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Informações
            </Link>
          </div>
          <Button asChild size="sm" className="rounded-lg px-5">
            <Link href="/reserva">Reservar</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
