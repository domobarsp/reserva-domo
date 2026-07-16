"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RestaurantPhoto } from "@/types";

interface EstablishmentGalleryProps {
  photos: RestaurantPhoto[];
}

export function EstablishmentGallery({ photos }: EstablishmentGalleryProps) {
  const [active, setActive] = useState<RestaurantPhoto | null>(null);

  if (photos.length === 0) return null;

  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Galeria
        </h2>
        <p className="mt-2 text-muted-foreground">
          Pratos, coquetéis e momentos no {photos.length > 1 ? "Domo" : "espaço"}.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setActive(photo)}
            >
              <Image
                src={photo.url}
                alt={photo.caption ?? "Foto do estabelecimento"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-sm font-medium text-white line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent
          className="max-w-fit border-0 bg-transparent p-0 shadow-none sm:max-w-fit"
          overlayClassName="bg-black/70"
          showCloseButton
        >
          <DialogTitle className="sr-only">
            {active?.caption ?? "Foto ampliada"}
          </DialogTitle>
          {active && (
            <div className="flex max-h-[85vh] max-w-[min(90vw,56rem)] flex-col overflow-hidden rounded-xl bg-zinc-900">
              <div className="relative flex max-h-[85vh] items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- natural aspect for portrait/landscape lightbox */}
                <img
                  src={active.url}
                  alt={active.caption ?? "Foto ampliada"}
                  className="max-h-[85vh] w-auto max-w-full object-contain"
                />
              </div>
              {active.caption && (
                <p className="px-4 py-3 text-sm text-zinc-300">
                  {active.caption}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
