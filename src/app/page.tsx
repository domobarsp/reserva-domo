import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <span className="text-xl font-bold tracking-tight">Domo</span>
          <Link href="/reserva">
            <Button size="sm">Reservar</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Domo
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Faça sua reserva online de forma rápida e simples.
          </p>
          <div className="mt-8">
            <Link href="/reserva">
              <Button size="lg" className="text-base">
                Fazer Reserva
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Domo. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
