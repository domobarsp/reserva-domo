import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Domo
        </Link>
        <nav>
          <Link
            href="/reserva"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reservar
          </Link>
        </nav>
      </div>
    </header>
  );
}
