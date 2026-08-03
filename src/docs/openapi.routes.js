/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Sistema]
 *     summary: Verificar estado del servicio
 *     responses:
 *       200:
 *         description: Servicio operativo
 *         content:
 *           application/json:
 *             example:
 *               exito: true
 *               mensaje: API funcionando correctamente
 *               datos:
 *                 status: ok
 *                 database: connected
 */

/**
 * @openapi
 * /clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Listar clientes
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *   post:
 *     tags: [Clientes]
 *     summary: Crear cliente
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nombre: Cliente Demo
 *             telefono: '8095550000'
 *             correo: cliente@example.com
 *             direccion: Calle Principal 123
 *     responses:
 *       201:
 *         description: Cliente creado
 */

/**
 * @openapi
 * /clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Obtener cliente por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *   put:
 *     tags: [Clientes]
 *     summary: Actualizar cliente (solo admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *   delete:
 *     tags: [Clientes]
 *     summary: Eliminar cliente (solo admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente eliminado
 */

/**
 * @openapi
 * /productos:
 *   get:
 *     tags: [Productos]
 *     summary: Listar productos
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de productos
 *   post:
 *     tags: [Productos]
 *     summary: Crear producto (solo admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nombre: Arroz
 *             categoria: Granos
 *             unidad_medida: lb
 *             cantidad: 100
 *             precio_compra: 20
 *             precio_venta: 30
 *     responses:
 *       201:
 *         description: Producto creado
 */

/**
 * @openapi
 * /productos/{id}:
 *   get:
 *     tags: [Productos]
 *     summary: Obtener producto por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *   put:
 *     tags: [Productos]
 *     summary: Actualizar producto (solo admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado
 *   delete:
 *     tags: [Productos]
 *     summary: Eliminar producto (solo admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 */

/**
 * @openapi
 * /ventas:
 *   get:
 *     tags: [Ventas]
 *     summary: Listar ventas
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Lista de ventas
 *   post:
 *     tags: [Ventas]
 *     summary: Crear venta
 *     description: El total se calcula en servidor usando precio_venta. usuario_id se toma del JWT.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             cliente_id: 1
 *             productos:
 *               - producto_id: 1
 *                 cantidad: 2
 *     responses:
 *       201:
 *         description: Venta creada
 */

/**
 * @openapi
 * /ventas/{id}:
 *   get:
 *     tags: [Ventas]
 *     summary: Obtener venta por ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta encontrada
 */

module.exports = {};
