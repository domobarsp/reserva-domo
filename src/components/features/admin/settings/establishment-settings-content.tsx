"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Upload,
  Trash2,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import type { Restaurant, RestaurantPhoto } from "@/types";
import {
  formatImageUploadHint,
  UPLOAD_ERROR_MESSAGE,
  validateImageFile,
} from "@/lib/image-upload";
import {
  updateEstablishmentProfile,
  uploadCoverImage,
  deleteCoverImage,
  addGalleryPhoto,
  updateGalleryPhotoCaption,
  deleteGalleryPhoto,
  reorderGalleryPhotos,
} from "@/app/admin/(authenticated)/configuracoes/estabelecimento/actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { GalleryPhotoDialog } from "@/components/features/admin/settings/gallery-photo-dialog";

interface EstablishmentSettingsContentProps {
  restaurant: Restaurant;
  photos: RestaurantPhoto[];
}

export function EstablishmentSettingsContent({
  restaurant,
  photos: initialPhotos,
}: EstablishmentSettingsContentProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState(restaurant.description ?? "");
  const [address, setAddress] = useState(restaurant.address ?? "");
  const [phone, setPhone] = useState(restaurant.phone ?? "");
  const [email, setEmail] = useState(restaurant.email ?? "");
  const [instagramUrl, setInstagramUrl] = useState(restaurant.instagram_url ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(restaurant.website_url ?? "");
  const [lat, setLat] = useState(
    restaurant.lat != null ? String(restaurant.lat) : ""
  );
  const [lng, setLng] = useState(
    restaurant.lng != null ? String(restaurant.lng) : ""
  );
  const [photos, setPhotos] = useState(initialPhotos);
  const [coverUrl, setCoverUrl] = useState(restaurant.cover_image_url);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [showDeleteCoverConfirm, setShowDeleteCoverConfirm] = useState(false);
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  const [galleryDialogMode, setGalleryDialogMode] = useState<"add" | "edit">("add");
  const [editingPhoto, setEditingPhoto] = useState<RestaurantPhoto | null>(null);

  async function handleSaveProfile() {
    setIsSavingProfile(true);
    try {
      const result = await updateEstablishmentProfile({
        description,
        address,
        phone,
        email,
        instagram_url: instagramUrl,
        website_url: websiteUrl,
        lat,
        lng,
      });
      if (result.success) {
        toast.success("Perfil atualizado");
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleCoverUpload(file: File) {
    const clientError = validateImageFile(file);
    if (clientError) {
      toast.error(clientError);
      return;
    }

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadCoverImage(formData);
      if (result.success) {
        setCoverUrl(result.data);
        toast.success("Foto de capa atualizada");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(UPLOAD_ERROR_MESSAGE);
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleDeleteCover() {
    setIsUploadingCover(true);
    try {
      const result = await deleteCoverImage();
      if (result.success) {
        setCoverUrl(null);
        toast.success("Foto de capa removida");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Não foi possível remover a foto de capa.");
    } finally {
      setIsUploadingCover(false);
      setShowDeleteCoverConfirm(false);
    }
  }

  async function handleAddGalleryPhoto(file: File, caption: string) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("caption", caption);
    const result = await addGalleryPhoto(formData);
    if (result.success) {
      setPhotos((prev) => [...prev, result.data]);
      toast.success("Foto adicionada à galeria");
      return true;
    }
    toast.error(result.error);
    return false;
  }

  async function handleUpdateGalleryCaption(photoId: string, caption: string) {
    const result = await updateGalleryPhotoCaption(photoId, caption);
    if (result.success) {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, caption: caption.trim() || null } : p
        )
      );
      toast.success("Legenda atualizada");
      return true;
    }
    toast.error(result.error);
    return false;
  }

  async function handleDeleteGalleryPhoto(photoId: string) {
    const result = await deleteGalleryPhoto(photoId);
    if (result.success) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast.success("Foto removida");
      return true;
    }
    toast.error(result.error);
    return false;
  }

  async function handleDeletePhoto(photoId: string) {
    try {
      await handleDeleteGalleryPhoto(photoId);
    } finally {
      setDeletePhotoId(null);
    }
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const previous = photos;
    const next = [...photos];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setPhotos(next);
    const result = await reorderGalleryPhotos(next.map((p) => p.id));
    if (!result.success) {
      toast.error(result.error);
      setPhotos(previous);
    }
  }

  function openAddGalleryDialog() {
    setGalleryDialogMode("add");
    setEditingPhoto(null);
    setGalleryDialogOpen(true);
  }

  function openEditGalleryDialog(photo: RestaurantPhoto) {
    setGalleryDialogMode("edit");
    setEditingPhoto(photo);
    setGalleryDialogOpen(true);
  }

  return (
    <div className="space-y-8">
      {/* Perfil textual */}
      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-zinc-800">Informações</h2>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição da casa</Label>
          <Textarea
            id="description"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Conte a história do Domo, o ambiente, a cozinha..."
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram (URL)</Label>
            <Input
              id="instagram"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (URL)</Label>
            <Input
              id="website"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lat">Latitude (opcional)</Label>
            <Input
              id="lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="-23.5447"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude (opcional)</Label>
            <Input
              id="lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="-46.6528"
            />
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Se latitude/longitude estiverem vazios, o mapa usa o endereço.
        </p>
        <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
          {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar informações
        </Button>
      </section>

      {/* Capa */}
      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-800">Foto de capa</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {formatImageUploadHint("cover")}
          </p>
        </div>
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-zinc-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt="Capa do estabelecimento"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleCoverUpload(file);
            e.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isUploadingCover}
            onClick={() => coverInputRef.current?.click()}
          >
            {isUploadingCover ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {coverUrl ? "Trocar capa" : "Enviar capa"}
          </Button>
          {coverUrl && (
            <Button
              type="button"
              variant="outline"
              className="text-rose-600 border-rose-200"
              disabled={isUploadingCover}
              onClick={() => setShowDeleteCoverConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover capa
            </Button>
          )}
        </div>
      </section>

      {/* Galeria */}
      <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-800">
              Galeria (pratos & coquetéis)
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {formatImageUploadHint("gallery")}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={openAddGalleryDialog}>
            <Upload className="mr-2 h-4 w-4" />
            Adicionar foto
          </Button>
        </div>

        {photos.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhuma foto na galeria ainda.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
              >
                <div className="relative aspect-[4/3] bg-zinc-100">
                  <Image
                    src={photo.url}
                    alt={photo.caption ?? "Foto da galeria"}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <p className="truncate text-sm text-zinc-700">
                    {photo.caption || (
                      <span className="text-zinc-400 italic">Sem legenda</span>
                    )}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      disabled={index === 0}
                      onClick={() => void movePhoto(index, -1)}
                      aria-label="Mover para cima"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      disabled={index === photos.length - 1}
                      onClick={() => void movePhoto(index, 1)}
                      aria-label="Mover para baixo"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => openEditGalleryDialog(photo)}
                      aria-label="Editar foto"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-rose-600"
                      onClick={() => setDeletePhotoId(photo.id)}
                      aria-label="Excluir foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={showDeleteCoverConfirm}
        onOpenChange={setShowDeleteCoverConfirm}
        title="Remover foto de capa"
        description="Tem certeza que deseja remover a foto de capa? A home voltará a exibir o gradiente padrão."
        confirmLabel="Remover"
        onConfirm={() => void handleDeleteCover()}
        variant="destructive"
      />

      <ConfirmDialog
        open={!!deletePhotoId}
        onOpenChange={(open) => {
          if (!open) setDeletePhotoId(null);
        }}
        title="Excluir foto"
        description="Tem certeza que deseja remover esta foto da galeria? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (deletePhotoId) void handleDeletePhoto(deletePhotoId);
        }}
        variant="destructive"
      />

      <GalleryPhotoDialog
        open={galleryDialogOpen}
        onOpenChange={setGalleryDialogOpen}
        mode={galleryDialogMode}
        photo={editingPhoto}
        onAdd={handleAddGalleryPhoto}
        onUpdateCaption={handleUpdateGalleryCaption}
        onDelete={handleDeleteGalleryPhoto}
      />
    </div>
  );
}
