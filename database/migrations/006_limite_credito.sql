-- Migración 006: Límite de crédito por cliente (solo admin lo configura)
BEGIN;

ALTER TABLE clientes ADD COLUMN IF NOT EXISTS limite_credito NUMERIC(12, 2);

COMMIT;
