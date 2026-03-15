-- =============================================
-- Migration: Fotos diretamente nos ambientes
-- Remove projetos, adiciona environment_images
-- =============================================

-- 1. Criar tabela de imagens dos ambientes
CREATE TABLE IF NOT EXISTS environment_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE environment_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read environment_images" ON environment_images FOR SELECT USING (true);
CREATE POLICY "Allow insert environment_images" ON environment_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update environment_images" ON environment_images FOR UPDATE USING (true);
CREATE POLICY "Allow delete environment_images" ON environment_images FOR DELETE USING (true);

-- 3. Migrar imagens existentes dos projetos para os ambientes
INSERT INTO environment_images (environment_id, image_url, is_cover, created_at)
SELECT p.environment_id, pi.image_url, false, pi.created_at
FROM project_images pi
JOIN projects p ON p.id = pi.project_id;

-- 4. Para cada ambiente, se não há imagem de capa marcada, marcar a primeira
-- (mantém o cover_image_url existente como referência)
DO $$
DECLARE
  env RECORD;
  first_img UUID;
BEGIN
  FOR env IN SELECT id FROM environments LOOP
    SELECT id INTO first_img FROM environment_images
    WHERE environment_id = env.id
    ORDER BY created_at ASC LIMIT 1;

    IF first_img IS NOT NULL THEN
      UPDATE environment_images SET is_cover = true WHERE id = first_img;
    END IF;
  END LOOP;
END $$;

-- 5. Remover tabelas de projetos (não mais necessárias)
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
