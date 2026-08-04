-- Migración 005: Configuración de la empresa (precio canastos, etc.)
BEGIN;

CREATE TABLE IF NOT EXISTS empresa_config (
    clave VARCHAR(60) PRIMARY KEY,
    valor TEXT NOT NULL,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO empresa_config (clave, valor) VALUES
    ('precio_canasto', '500'),
    ('nombre_empresa', 'RYV Frutas del Caribe'),
    ('stock_minimo_default', '10')
ON CONFLICT (clave) DO NOTHING;

COMMIT;
