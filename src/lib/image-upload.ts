export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_MB = 5;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_IMAGE_TYPES_SET = new Set<string>(ALLOWED_IMAGE_TYPES);

export const COVER_ASPECT_HINT = "21:9";
export const GALLERY_ASPECT_HINT = "4:3";

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES_SET.has(file.type)) {
    return "Formato inválido. Use JPEG, PNG ou WebP.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `Arquivo muito grande. Máximo ${MAX_IMAGE_MB} MB.`;
  }
  return null;
}

export function formatImageUploadHint(aspect: "cover" | "gallery"): string {
  const ratio = aspect === "cover" ? COVER_ASPECT_HINT : GALLERY_ASPECT_HINT;
  const example =
    aspect === "cover" ? "2100×900 px" : "1200×900 px";
  return `JPEG, PNG ou WebP · máx. ${MAX_IMAGE_MB} MB · proporção recomendada ${ratio} (ex.: ${example})`;
}

export const UPLOAD_ERROR_MESSAGE =
  "Não foi possível enviar a imagem. Verifique se o arquivo tem no máximo 5 MB (JPEG, PNG ou WebP).";

export function extFromMime(mime: string): "jpg" | "png" | "webp" {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}
