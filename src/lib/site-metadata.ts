import type { Metadata } from "next";

export const SITE_NAME = "Dōmo";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://reserva-domo.vercel.app";
}

export const DEFAULT_OG_IMAGE = "/logo_domo.png";

export function getOgImageUrl(imagePath?: string | null): string {
  if (imagePath) return imagePath;
  return DEFAULT_OG_IMAGE;
}

export function buildTwitterMetadata(options: {
  title: string;
  description: string;
  image?: string | null;
}): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: options.title,
    description: options.description,
    images: [getOgImageUrl(options.image)],
  };
}

export function buildOpenGraphMetadata(options: {
  title: string;
  description: string;
  url?: string;
  image?: string | null;
}): Metadata["openGraph"] {
  return {
    title: options.title,
    description: options.description,
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    ...(options.url ? { url: options.url } : {}),
    images: [
      {
        url: getOgImageUrl(options.image),
        alt: options.title,
      },
    ],
  };
}
