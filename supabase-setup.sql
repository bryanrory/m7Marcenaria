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
  endereco_rua TEXT,
  endereco_numero TEXT,
  endereco_bairro TEXT,
  endereco_cidade TEXT,
  endereco_estado TEXT,
  endereco_cep TEXT,
  horario_funcionamento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de ambientes
CREATE TABLE environments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  slug TEXT UNIQUE,
  show_on_home BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de imagens dos ambientes
CREATE TABLE environment_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  environment_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Tabela de admin
-- =============================================
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- RLS (Row Level Security) - Políticas
-- =============================================

-- Habilitar RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE environment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (para o site)
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read environments" ON environments FOR SELECT USING (true);
CREATE POLICY "Public read environment_images" ON environment_images FOR SELECT USING (true);

-- Políticas de escrita
CREATE POLICY "Allow insert site_settings" ON site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update site_settings" ON site_settings FOR UPDATE USING (true);
CREATE POLICY "Allow insert environments" ON environments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update environments" ON environments FOR UPDATE USING (true);
CREATE POLICY "Allow delete environments" ON environments FOR DELETE USING (true);
CREATE POLICY "Allow insert environment_images" ON environment_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update environment_images" ON environment_images FOR UPDATE USING (true);
CREATE POLICY "Allow delete environment_images" ON environment_images FOR DELETE USING (true);

-- Admin users
CREATE POLICY "Public read admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Allow insert admin_users" ON admin_users FOR INSERT WITH CHECK (true);

-- =============================================
-- Storage Bucket
-- =============================================
-- IMPORTANTE: Criar manualmente no Supabase Dashboard:
-- 1. Vá em Storage > New Bucket
-- 2. Nome: "site-assets"
-- 3. Marque como "Public bucket"
-- 4. Em Policies, adicione uma policy para permitir upload/leitura pública

-- Inserir configurações iniciais
INSERT INTO site_settings (whatsapp, email, endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep, horario_funcionamento)
VALUES (
  '5547991424101',
  'contatom7marcenaria@gmail.com',
  'R. Bonifácio Haendchen',
  '1095',
  'Belchior Central',
  'Gaspar',
  'SC',
  '89114-442',
  'Seg a Sex: 8h às 18h | Sáb: 8h às 12h'
);
