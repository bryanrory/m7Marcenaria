-- Tabela de usuários admin
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para validar login
CREATE POLICY "Public read admin_users" ON admin_users FOR SELECT USING (true);

-- Inserir credenciais
INSERT INTO admin_users (username, password_hash)
VALUES ('adminm7', 'fe8262414d08c6e1eae5ce3b987f7aafa659f07955842a388bab4203af8230e5');
