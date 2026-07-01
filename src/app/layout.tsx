import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "@/lib/env";
import {
  SITE_NAME,
  getSiteUrl,
  buildOpenGraphMetadata,
  buildTwitterMetadata,
} from "@/lib/site-metadata";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const defaultDescription =
  "Faça sua reserva online no Dōmo. Bar & restaurante na Rua Major Sertório, 452, São Paulo. Terça a sábado, 19h–24h.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${SITE_NAME} — Reservas`,
    template: `%s | ${SITE_NAME}`,
  },
  description: defaultDescription,
  openGraph: buildOpenGraphMetadata({
    title: `${SITE_NAME} — Reservas Online`,
    description: defaultDescription,
    url: getSiteUrl(),
  }),
  twitter: buildTwitterMetadata({
    title: `${SITE_NAME} — Reservas Online`,
    description: defaultDescription,
  }),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
