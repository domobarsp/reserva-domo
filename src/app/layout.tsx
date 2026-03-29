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
    default: "Domo — Reservas",
    template: "%s | Domo",
  },
  description: "Faça sua reserva online no Domo. Escolha data, horário e acomodação em poucos passos.",
  openGraph: {
    title: "Domo — Reservas Online",
    description: "Faça sua reserva online no Domo. Escolha data, horário e acomodação em poucos passos.",
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
