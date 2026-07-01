import type { Restaurant } from "@/types";
import { getSiteUrl, DEFAULT_OG_IMAGE } from "@/lib/site-metadata";

interface EstablishmentJsonLdProps {
  restaurant: Restaurant;
}

export function EstablishmentJsonLd({ restaurant }: EstablishmentJsonLdProps) {
  const siteUrl = getSiteUrl();
  const image = restaurant.cover_image_url ?? `${siteUrl}${DEFAULT_OG_IMAGE}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.description ?? undefined,
    url: siteUrl,
    image,
    telephone: restaurant.phone ?? undefined,
    email: restaurant.email ?? undefined,
    address: restaurant.address
      ? {
          "@type": "PostalAddress",
          streetAddress: restaurant.address,
          addressLocality: "São Paulo",
          addressCountry: "BR",
        }
      : undefined,
    ...(restaurant.lat != null && restaurant.lng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: restaurant.lat,
            longitude: restaurant.lng,
          },
        }
      : {}),
    ...(restaurant.instagram_url
      ? { sameAs: [restaurant.instagram_url] }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
