-- =============================================
-- M7 Marcenaria - Supabase Database Setup
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- 1. Tabela de configurações do site
CREATE TABLE site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_url TEXT,
  hero_image_url TEXT,
  about_image_url TEXT,
  whatsapp TEXT,
  facebook TEXT,
  instagram TEXT,
  tiktok TEXT,
  email TEXT,
  endereco TEXT,
  horario_funcionamento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de ambientes
CREATE TABLE environments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cover_image_url TEXT,
  show_on_home BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de projetos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de imagens dos projetos
CREATE TABLE project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS (Row Level Security) - Políticas
-- =============================================

-- Habilitar RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (para o site)
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read environments" ON environments FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read project_images" ON project_images FOR SELECT USING (true);

-- Políticas de escrita (usando anon key por enquanto - para produção, use auth)
CREATE POLICY "Allow insert site_settings" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update site_settings" ON site_settings FOR UPDATE USING (true);
CREATE POLICY "Allow insert environments" ON environments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update environments" ON environments FOR UPDATE USING (true);
CREATE POLICY "Allow delete environments" ON environments FOR DELETE USING (true);
CREATE POLICY "Allow insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Allow delete projects" ON projects FOR DELETE USING (true);
CREATE POLICY "Allow insert project_images" ON project_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete project_images" ON project_images FOR DELETE USING (true);

-- =============================================
-- Storage Bucket
-- =============================================
-- IMPORTANTE: Criar manualmente no Supabase Dashboard:
-- 1. Vá em Storage > New Bucket
-- 2. Nome: "site-assets"
-- 3. Marque como "Public bucket"
-- 4. Em Policies, adicione uma policy para permitir upload/leitura pública

-- Inserir configurações iniciais
INSERT INTO site_settings (whatsapp, email, endereco, horario_funcionamento)
VALUES (
  '5547991424101',
  'contatom7marcenaria@gmail.com',
  'R. Bonifácio Haendchen, 1095, Belchior Central, Gaspar - SC, 89114-442',
  'Seg a Sex: 8h às 18h | Sáb: 8h às 12h'
);
