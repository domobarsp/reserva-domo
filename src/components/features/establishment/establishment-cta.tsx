import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EstablishmentCta() {
  return (
    <section className="bg-primary/5">
      <div className="mx-auto max-w-5xl px-4 py-14 text-center md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Pronto para reservar?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Garanta sua mesa em poucos minutos. Você recebe um email ao reservar e outro quando confirmarmos.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-lg px-8">
          <Link href="/reserva">Fazer reserva</Link>
        </Button>
      </div>
    </section>
  );
}
