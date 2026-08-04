-- Migración 002: Funciones distribuidora de frutas
-- Ejecutar sobre base existente: psql -U postgres -d api_usuarios -f database/migrations/002_distribuidora.sql

BEGIN;

-- Roles extendidos
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios ADD CONSTRAINT usuarios_rol_check
    CHECK (rol IN ('admin', 'vendedor', 'almacen', 'repartidor', 'usuario'));

-- Clientes: cocinas industriales
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS tipo VARCHAR(40) DEFAULT 'cocina_industrial';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS contacto VARCHAR(120);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS horario_entrega VARCHAR(120);

-- Productos: control de inventario
ALTER TABLE productos ADD COLUMN IF NOT EXISTS stock_minimo NUMERIC(12, 2) DEFAULT 10;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- Ventas / entregas a cocinas
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS estado_entrega VARCHAR(20) DEFAULT 'pendiente';
ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_estado_entrega_check;
ALTER TABLE ventas ADD CONSTRAINT ventas_estado_entrega_check
    CHECK (estado_entrega IN ('pendiente', 'en_ruta', 'entregada', 'cancelada'));
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_entrega_programada TIMESTAMPTZ;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS notas_entrega TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS entregado_en TIMESTAMPTZ;

-- Movimientos de inventario (auditoría)
CREATE TABLE IF NOT EXISTS inventario_movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste', 'venta', 'devolucion')),
    cantidad NUMERIC(12, 2) NOT NULL CHECK (cantidad > 0),
    cantidad_anterior NUMERIC(12, 2) NOT NULL,
    cantidad_nueva NUMERIC(12, 2) NOT NULL,
    referencia VARCHAR(120),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventario_mov_producto ON inventario_movimientos(producto_id);
CREATE INDEX IF NOT EXISTS idx_inventario_mov_fecha ON inventario_movimientos(creado_en);
CREATE INDEX IF NOT EXISTS idx_ventas_estado_entrega ON ventas(estado_entrega);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

COMMIT;
