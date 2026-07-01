"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { RestaurantPhoto } from "@/types";
import {
  formatImageUploadHint,
  UPLOAD_ERROR_MESSAGE,
  validateImageFile,
} from "@/lib/image-upload";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type GalleryPhotoDialogMode = "add" | "edit";

interface GalleryPhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: GalleryPhotoDialogMode;
  photo?: RestaurantPhoto | null;
  onAdd: (file: File, caption: string) => Promise<boolean>;
  onUpdateCaption: (photoId: string, caption: string) => Promise<boolean>;
  onDelete: (photoId: string) => Promise<boolean>;
}

export function GalleryPhotoDialog({
  open,
  onOpenChange,
  mode,
  photo,
  onAdd,
  onUpdateCaption,
  onDelete,
}: GalleryPhotoDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && photo) {
      setCaption(photo.caption ?? "");
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      setCaption("");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [open, mode, photo]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  function handleFileSelect(file: File) {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSelectedFile(file);
  }

  async function handleAdd() {
    if (!selectedFile) {
      toast.error("Selecione uma imagem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onAdd(selectedFile, caption);
      if (ok) {
        onOpenChange(false);
      }
    } catch {
      toast.error(UPLOAD_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveCaption() {
    if (!photo) return;

    setIsSubmitting(true);
    try {
      const ok = await onUpdateCaption(photo.id, caption);
      if (ok) {
        onOpenChange(false);
      }
    } catch {
      toast.error("Não foi possível salvar a legenda.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!photo) return;

    setIsSubmitting(true);
    try {
      const ok = await onDelete(photo.id);
      if (ok) {
        onOpenChange(false);
      }
    } catch {
      toast.error("Não foi possível excluir a foto.");
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  }

  const displayPreview = mode === "edit" ? photo?.url : previewUrl;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Adicionar foto" : "Editar foto"}
            </DialogTitle>
            <DialogDescription>
              {formatImageUploadHint("gallery")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {mode === "add" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 transition-colors hover:border-primary/50 hover:bg-zinc-100"
                >
                  {displayPreview ? (
                    <div className="relative aspect-[4/3] w-full max-w-xs overflow-hidden rounded-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={displayPreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 text-zinc-400" />
                      <span className="text-sm text-zinc-600">
                        Clique para selecionar uma imagem
                      </span>
                    </>
                  )}
                </button>
                {selectedFile && (
                  <p className="text-center text-xs text-zinc-500">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </>
            )}

            {mode === "edit" && displayPreview && (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-100">
                <Image
                  src={displayPreview}
                  alt={photo?.caption ?? "Foto da galeria"}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="gallery-caption">Legenda (opcional)</Label>
              <Input
                id="gallery-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ex: Negroni da casa"
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            {mode === "edit" && (
              <Button
                type="button"
                variant="outline"
                className="text-rose-600 border-rose-200 sm:mr-auto"
                disabled={isSubmitting}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isSubmitting || (mode === "add" && !selectedFile)}
                onClick={() =>
                  void (mode === "add" ? handleAdd() : handleSaveCaption())
                }
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : mode === "add" ? (
                  <Upload className="mr-2 h-4 w-4" />
                ) : null}
                {mode === "add" ? "Enviar" : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Excluir foto"
        description="Tem certeza que deseja remover esta foto da galeria? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => void handleDelete()}
        variant="destructive"
      />
    </>
  );
}
