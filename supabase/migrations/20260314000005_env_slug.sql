-- Adicionar campo slug aos ambientes
ALTER TABLE environments ADD COLUMN slug TEXT UNIQUE;

-- Gerar slugs para ambientes existentes
UPDATE environments SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
  REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name,
  ' ', '-'), 'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'),
  'ú', 'u'), 'ã', 'a'), 'õ', 'o'), 'ç', 'c'), 'ê', 'e'));
