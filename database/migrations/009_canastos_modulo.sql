-- Modulo de control de canastos: conteo variable y frutas por peso

ALTER TABLE canastos_movimientos
    ADD COLUMN IF NOT EXISTS producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cantidad_producto NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS peso_lb NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS modo VARCHAR(20) DEFAULT 'vacio',
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'confirmado';

COMMENT ON COLUMN canastos_movimientos.modo IS 'vacio | conteo | peso';
COMMENT ON COLUMN canastos_movimientos.estado IS 'confirmado | pendiente_canastos';

CREATE INDEX IF NOT EXISTS idx_canastos_estado ON canastos_movimientos(estado);
CREATE INDEX IF NOT EXISTS idx_canastos_modo ON canastos_movimientos(modo);
