import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "@/lib/env";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Dōmo — Reservas",
    template: "%s | Dōmo",
  },
  description: "Faça sua reserva online no Dōmo. Bar & restaurante na Rua Major Sertório, 452, São Paulo. Terça a sábado, 19h–24h.",
  openGraph: {
    title: "Dōmo — Reservas Online",
    description: "Faça sua reserva online no Dōmo. Bar & restaurante na Rua Major Sertório, 452, São Paulo. Terça a sábado, 19h–24h.",
    type: "website",
    locale: "pt_BR",
  },
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
