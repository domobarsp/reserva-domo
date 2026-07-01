"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getRestaurantId } from "@/lib/queries/restaurant";
import type { ActionResult } from "@/lib/actions/types";
import type { Restaurant, RestaurantPhoto } from "@/types";
import {
  establishmentProfileSchema,
  type EstablishmentProfileData,
} from "@/lib/validations/admin";
import { extFromMime, validateImageFile } from "@/lib/image-upload";

const BUCKET = "restaurant-media";

function revalidateEstablishment() {
  revalidatePath("/");
  revalidatePath("/admin/configuracoes/estabelecimento");
}

function publicUrl(path: string) {
  const supabase = createAdminClient();
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function getEstablishmentProfile(): Promise<{
  restaurant: Restaurant;
  photos: RestaurantPhoto[];
}> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const [{ data: restaurant }, { data: photos }] = await Promise.all([
    supabase.from("restaurants").select("*").eq("id", restaurantId).single(),
    supabase
      .from("restaurant_photos")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("display_order", { ascending: true }),
  ]);

  return {
    restaurant: restaurant as Restaurant,
    photos: (photos ?? []) as RestaurantPhoto[],
  };
}

export async function updateEstablishmentProfile(
  input: EstablishmentProfileData
): Promise<ActionResult<void>> {
  const parsed = establishmentProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const restaurantId = await getRestaurantId();
  const d = parsed.data;

  const { error } = await supabase
    .from("restaurants")
    .update({
      description: d.description || null,
      address: d.address || null,
      phone: d.phone || null,
      email: d.email || null,
      instagram_url: d.instagram_url || null,
      website_url: d.website_url || null,
      lat: d.lat ? Number(d.lat) : null,
      lng: d.lng ? Number(d.lng) : null,
    })
    .eq("id", restaurantId);

  if (error) {
    return { success: false, error: "Erro ao salvar perfil: " + error.message };
  }

  revalidateEstablishment();
  return { success: true, data: undefined };
}

export async function uploadCoverImage(
  formData: FormData
): Promise<ActionResult<string>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecione uma imagem." };
  }

  const validationError = validateImageFile(file);
  if (validationError) return { success: false, error: validationError };

  const restaurantId = await getRestaurantId();
  const admin = createAdminClient();
  const ext = extFromMime(file.type);
  const path = `${restaurantId}/cover.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    return { success: false, error: "Erro no upload: " + uploadError.message };
  }

  const url = publicUrl(path);
  const { error: dbError } = await admin
    .from("restaurants")
    .update({ cover_image_url: url })
    .eq("id", restaurantId);

  if (dbError) {
    return { success: false, error: "Erro ao salvar URL: " + dbError.message };
  }

  revalidateEstablishment();
  return { success: true, data: url };
}

export async function deleteCoverImage(): Promise<ActionResult<void>> {
  const restaurantId = await getRestaurantId();
  const admin = createAdminClient();

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("cover_image_url")
    .eq("id", restaurantId)
    .single();

  if (restaurant?.cover_image_url) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = restaurant.cover_image_url.indexOf(marker);
    if (idx >= 0) {
      const storagePath = restaurant.cover_image_url.slice(idx + marker.length);
      await admin.storage.from(BUCKET).remove([storagePath]);
    }
  }

  const { error } = await admin
    .from("restaurants")
    .update({ cover_image_url: null })
    .eq("id", restaurantId);

  if (error) {
    return { success: false, error: "Erro ao remover capa: " + error.message };
  }

  revalidateEstablishment();
  return { success: true, data: undefined };
}

export async function addGalleryPhoto(
  formData: FormData
): Promise<ActionResult<RestaurantPhoto>> {
  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Selecione uma imagem." };
  }

  const validationError = validateImageFile(file);
  if (validationError) return { success: false, error: validationError };

  const restaurantId = await getRestaurantId();
  const admin = createAdminClient();
  const photoId = crypto.randomUUID();
  const ext = extFromMime(file.type);
  const path = `${restaurantId}/gallery/${photoId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return { success: false, error: "Erro no upload: " + uploadError.message };
  }

  const url = publicUrl(path);

  const { data: maxOrderRow } = await admin
    .from("restaurant_photos")
    .select("display_order")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const displayOrder = (maxOrderRow?.display_order ?? -1) + 1;

  const { data, error } = await admin
    .from("restaurant_photos")
    .insert({
      id: photoId,
      restaurant_id: restaurantId,
      url,
      caption: caption || null,
      display_order: displayOrder,
    })
    .select("*")
    .single();

  if (error) {
    await admin.storage.from(BUCKET).remove([path]);
    return { success: false, error: "Erro ao salvar foto: " + error.message };
  }

  revalidateEstablishment();
  return { success: true, data: data as RestaurantPhoto };
}

export async function updateGalleryPhotoCaption(
  photoId: string,
  caption: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  const { error } = await supabase
    .from("restaurant_photos")
    .update({ caption: caption.trim() || null })
    .eq("id", photoId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    return { success: false, error: "Erro ao atualizar legenda: " + error.message };
  }

  revalidateEstablishment();
  return { success: true, data: undefined };
}

export async function deleteGalleryPhoto(
  photoId: string
): Promise<ActionResult<void>> {
  const restaurantId = await getRestaurantId();
  const admin = createAdminClient();

  const { data: photo } = await admin
    .from("restaurant_photos")
    .select("url")
    .eq("id", photoId)
    .eq("restaurant_id", restaurantId)
    .single();

  if (photo?.url) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = photo.url.indexOf(marker);
    if (idx >= 0) {
      const storagePath = photo.url.slice(idx + marker.length);
      await admin.storage.from(BUCKET).remove([storagePath]);
    }
  }

  const { error } = await admin
    .from("restaurant_photos")
    .delete()
    .eq("id", photoId)
    .eq("restaurant_id", restaurantId);

  if (error) {
    return { success: false, error: "Erro ao excluir foto: " + error.message };
  }

  revalidateEstablishment();
  return { success: true, data: undefined };
}

export async function reorderGalleryPhotos(
  orderedIds: string[]
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const restaurantId = await getRestaurantId();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("restaurant_photos")
      .update({ display_order: i })
      .eq("id", orderedIds[i])
      .eq("restaurant_id", restaurantId);

    if (error) {
      return { success: false, error: "Erro ao reordenar: " + error.message };
    }
  }

  revalidateEstablishment();
  return { success: true, data: undefined };
}
