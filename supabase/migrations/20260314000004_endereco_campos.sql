-- Substituir campo único de endereço por campos separados
ALTER TABLE site_settings ADD COLUMN endereco_rua TEXT;
ALTER TABLE site_settings ADD COLUMN endereco_numero TEXT;
ALTER TABLE site_settings ADD COLUMN endereco_bairro TEXT;
ALTER TABLE site_settings ADD COLUMN endereco_cidade TEXT;
ALTER TABLE site_settings ADD COLUMN endereco_estado TEXT;
ALTER TABLE site_settings ADD COLUMN endereco_cep TEXT;

-- Migrar dados existentes
UPDATE site_settings SET
  endereco_rua = 'R. Bonifácio Haendchen',
  endereco_numero = '1095',
  endereco_bairro = 'Belchior Central',
  endereco_cidade = 'Gaspar',
  endereco_estado = 'SC',
  endereco_cep = '89114-442'
WHERE endereco IS NOT NULL;

-- Remover campo antigo
ALTER TABLE site_settings DROP COLUMN endereco;
