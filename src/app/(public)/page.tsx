import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEstablishmentPageData } from "@/lib/queries/establishment";
import { EstablishmentHero } from "@/components/features/establishment/establishment-hero";
import { EstablishmentAbout } from "@/components/features/establishment/establishment-about";
import { EstablishmentGallery } from "@/components/features/establishment/establishment-gallery";
import { EstablishmentHours } from "@/components/features/establishment/establishment-hours";
import { EstablishmentMap } from "@/components/features/establishment/establishment-map";
import { EstablishmentCta } from "@/components/features/establishment/establishment-cta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const data = await getEstablishmentPageData();
  if (!data) {
    return { title: "Dōmo" };
  }

  const { restaurant } = data;
  const description =
    restaurant.description?.slice(0, 160) ??
    `Faça sua reserva online no ${restaurant.name}.`;

  return {
    title: restaurant.name,
    description,
    openGraph: {
      title: `${restaurant.name} — Reservas`,
      description,
      type: "website",
      locale: "pt_BR",
      ...(restaurant.cover_image_url
        ? { images: [{ url: restaurant.cover_image_url, alt: restaurant.name }] }
        : {}),
    },
  };
}

export default async function HomePage() {
  const data = await getEstablishmentPageData();
  if (!data) notFound();

  const { restaurant, photos, timeSlots } = data;

  return (
    <>
      <EstablishmentHero restaurant={restaurant} />
      <EstablishmentAbout restaurant={restaurant} />
      <EstablishmentGallery photos={photos} />
      <EstablishmentHours timeSlots={timeSlots} />
      <EstablishmentMap restaurant={restaurant} />
      <EstablishmentCta />
    </>
  );
}
