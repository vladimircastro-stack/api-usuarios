-- Actualizar nombre por defecto si aún dice SGCRD
UPDATE empresa_config
SET valor = 'Mi Distribuidora'
WHERE clave = 'nombre_empresa' AND valor = 'SGCRD';
