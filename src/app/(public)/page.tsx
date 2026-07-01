import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEstablishmentPageData } from "@/lib/queries/establishment";
import { EstablishmentHero } from "@/components/features/establishment/establishment-hero";
import { EstablishmentAbout } from "@/components/features/establishment/establishment-about";
import { EstablishmentGallery } from "@/components/features/establishment/establishment-gallery";
import { EstablishmentHours } from "@/components/features/establishment/establishment-hours";
import { EstablishmentMap } from "@/components/features/establishment/establishment-map";
import { EstablishmentCta } from "@/components/features/establishment/establishment-cta";
import { EstablishmentJsonLd } from "@/components/features/establishment/establishment-json-ld";
import {
  SITE_NAME,
  getSiteUrl,
  buildOpenGraphMetadata,
  buildTwitterMetadata,
} from "@/lib/site-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getEstablishmentPageData();
  if (!data) {
    return { title: SITE_NAME };
  }

  const { restaurant } = data;
  const description =
    restaurant.description?.slice(0, 160) ??
    `Faça sua reserva online no ${restaurant.name}.`;
  const ogTitle = `${restaurant.name} — Reservas`;

  return {
    title: { absolute: `${restaurant.name} | ${SITE_NAME}` },
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: buildOpenGraphMetadata({
      title: ogTitle,
      description,
      url: getSiteUrl(),
      image: restaurant.cover_image_url,
    }),
    twitter: buildTwitterMetadata({
      title: ogTitle,
      description,
      image: restaurant.cover_image_url,
    }),
  };
}

export default async function HomePage() {
  const data = await getEstablishmentPageData();
  if (!data) notFound();

  const { restaurant, photos, timeSlots } = data;

  return (
    <>
      <EstablishmentJsonLd restaurant={restaurant} />
      <EstablishmentHero restaurant={restaurant} />
      <EstablishmentAbout restaurant={restaurant} />
      <EstablishmentGallery photos={photos} />
      <EstablishmentHours timeSlots={timeSlots} />
      <EstablishmentMap restaurant={restaurant} />
      <EstablishmentCta />
    </>
  );
}
