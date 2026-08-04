-- Nombre comercial en facturas y comprobantes
BEGIN;

UPDATE empresa_config
SET valor = 'RYV Frutas del Caribe', actualizado_en = CURRENT_TIMESTAMP
WHERE clave = 'nombre_empresa';

INSERT INTO empresa_config (clave, valor)
VALUES ('nombre_empresa', 'RYV Frutas del Caribe')
ON CONFLICT (clave) DO NOTHING;

COMMIT;
