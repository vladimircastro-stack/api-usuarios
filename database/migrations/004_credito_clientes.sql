-- Migración 004: Cuentas por cobrar (crédito a clientes)
BEGIN;

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_pago VARCHAR(20) DEFAULT 'contado';
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_tipo_pago_check;
ALTER TABLE ventas ADD CONSTRAINT ventas_tipo_pago_check
    CHECK (tipo_pago IN ('contado', 'credito'));

CREATE TABLE IF NOT EXISTS credito_movimientos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('cargo', 'abono')),
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    venta_id INTEGER REFERENCES ventas(id) ON DELETE SET NULL,
    notas TEXT,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credito_cliente ON credito_movimientos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_credito_venta ON credito_movimientos(venta_id);

COMMIT;
