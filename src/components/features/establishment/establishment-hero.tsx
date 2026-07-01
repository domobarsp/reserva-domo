import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types";

interface EstablishmentHeroProps {
  restaurant: Restaurant;
}

export function EstablishmentHero({ restaurant }: EstablishmentHeroProps) {
  const tagline =
    restaurant.description?.split("\n")[0]?.slice(0, 120) ??
    "Bar & restaurante em São Paulo";

  return (
    <section className="relative min-h-[55vh] md:min-h-[65vh]">
      {restaurant.cover_image_url ? (
        <Image
          src={restaurant.cover_image_url}
          alt={restaurant.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-zinc-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
      <div className="relative mx-auto flex min-h-[55vh] max-w-5xl flex-col justify-end px-4 pb-12 pt-24 md:min-h-[65vh] md:pb-16">
        <p className="text-xs font-medium uppercase tracking-widest text-white/70">
          Reservas online
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          {restaurant.name}
        </h1>
        <p className="mt-3 max-w-xl text-base text-white/85 md:text-lg">
          {tagline}
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="rounded-lg px-8">
            <Link href="/reserva">Reservar mesa</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
