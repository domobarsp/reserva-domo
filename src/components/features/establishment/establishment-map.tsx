import { MapPin, ExternalLink } from "lucide-react";
import type { Restaurant } from "@/types";

interface EstablishmentMapProps {
  restaurant: Restaurant;
}

function buildMapQuery(restaurant: Restaurant) {
  if (restaurant.lat != null && restaurant.lng != null) {
    return `${restaurant.lat},${restaurant.lng}`;
  }
  if (restaurant.address) {
    return encodeURIComponent(restaurant.address);
  }
  return null;
}

function buildExternalMapsUrl(restaurant: Restaurant) {
  const q = buildMapQuery(restaurant);
  if (!q) return null;
  const query =
    restaurant.lat != null && restaurant.lng != null
      ? `${restaurant.lat},${restaurant.lng}`
      : encodeURIComponent(restaurant.address ?? "");
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function EstablishmentMap({ restaurant }: EstablishmentMapProps) {
  const mapQuery = buildMapQuery(restaurant);
  const externalUrl = buildExternalMapsUrl(restaurant);

  if (!mapQuery) return null;

  const embedSrc = `https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`;

  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Localização
        </h2>
        {restaurant.address && (
          <p className="mt-3 flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{restaurant.address}</span>
          </p>
        )}
        <div className="mt-6 overflow-hidden rounded-xl border border-border shadow-sm">
          <iframe
            title={`Mapa — ${restaurant.name}`}
            src={embedSrc}
            className="h-[320px] w-full border-0 md:h-[400px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Abrir no Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </section>
  );
}
