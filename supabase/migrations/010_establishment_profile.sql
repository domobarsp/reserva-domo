-- =============================================
-- Fase 16 — Perfil público do estabelecimento
-- =============================================

-- Campos extras em restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS lat NUMERIC,
  ADD COLUMN IF NOT EXISTS lng NUMERIC,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Galeria de fotos (pratos, coquetéis, ambiente)
CREATE TABLE public.restaurant_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_restaurant_photos_restaurant
  ON public.restaurant_photos(restaurant_id, display_order);

ALTER TABLE public.restaurant_photos ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "restaurant_photos_select_public"
  ON public.restaurant_photos FOR SELECT
  USING (true);

-- Admin CRUD
CREATE POLICY "restaurant_photos_insert_admin"
  ON public.restaurant_photos FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "restaurant_photos_update_admin"
  ON public.restaurant_photos FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "restaurant_photos_delete_admin"
  ON public.restaurant_photos FOR DELETE
  USING (public.is_admin());

-- Storage bucket (idempotente)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurant-media',
  'restaurant-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Leitura pública dos arquivos
CREATE POLICY "restaurant_media_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurant-media');

-- Upload/update/delete apenas admins
CREATE POLICY "restaurant_media_insert_admin"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'restaurant-media'
    AND public.is_admin()
  );

CREATE POLICY "restaurant_media_update_admin"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'restaurant-media'
    AND public.is_admin()
  );

CREATE POLICY "restaurant_media_delete_admin"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'restaurant-media'
    AND public.is_admin()
  );
