-- Migración 003: Descripción de venta por línea + control de canastos
BEGIN;

ALTER TABLE detalle_ventas ADD COLUMN IF NOT EXISTS descripcion TEXT;
ALTER TABLE detalle_ventas ADD COLUMN IF NOT EXISTS unidad_venta VARCHAR(40);
ALTER TABLE detalle_ventas ADD COLUMN IF NOT EXISTS cantidad_inventario NUMERIC(12, 2);

CREATE TABLE IF NOT EXISTS canastos_movimientos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrega', 'devolucion')),
    cantidad NUMERIC(12, 2) NOT NULL CHECK (cantidad > 0),
    venta_id INTEGER REFERENCES ventas(id) ON DELETE SET NULL,
    notas TEXT,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_canastos_cliente ON canastos_movimientos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_canastos_venta ON canastos_movimientos(venta_id);

COMMIT;
