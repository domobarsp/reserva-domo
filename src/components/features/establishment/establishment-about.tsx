import type { Restaurant } from "@/types";

interface EstablishmentAboutProps {
  restaurant: Restaurant;
}

export function EstablishmentAbout({ restaurant }: EstablishmentAboutProps) {
  if (!restaurant.description?.trim()) return null;

  return (
    <section id="informacoes" className="scroll-mt-20 border-b border-border bg-background">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Sobre
        </h2>
        <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground whitespace-pre-line">
          {restaurant.description}
        </div>
        {(restaurant.instagram_url || restaurant.website_url) && (
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            {restaurant.instagram_url && (
              <a
                href={restaurant.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Instagram
              </a>
            )}
            {restaurant.website_url && (
              <a
                href={restaurant.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Website
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
