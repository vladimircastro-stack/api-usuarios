# VC DistribuidorPro API — api-usuarios

API REST profesional para gestión de usuarios, clientes, productos y ventas. Construida con **Node.js**, **Express 5**, **PostgreSQL** y autenticación **JWT**.

## Características

- Registro e inicio de sesión con bcrypt + JWT
- Roles: `admin` y `usuario`
- CRUD de clientes, productos y ventas
- Ventas transaccionales con descuento de inventario
- Validación de entradas y manejo centralizado de errores
- Documentación Swagger en `/api-docs`
- Docker Compose listo para despliegue
- Seguridad: Helmet, CORS, rate limiting

## Requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm

## Inicio rápido (local)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env

# 3. Crear base de datos y ejecutar schema
# psql -U postgres -c "CREATE DATABASE sgcrd;"
# psql -U postgres -d sgcrd -f database/schema.sql

# 4. Iniciar servidor
npm run dev
```

La API estará en `http://localhost:3000`  
Documentación: `http://localhost:3000/api-docs`

## Inicio con Docker

```bash
npm run docker:up
```

Servicios:
- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

Detener:

```bash
npm run docker:down
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `DB_USER` | Usuario PostgreSQL | `postgres` |
| `DB_HOST` | Host PostgreSQL | `localhost` |
| `DB_NAME` | Nombre de la BD | `api_usuarios` |
| `DB_PASSWORD` | Contraseña PostgreSQL | `postgres` |
| `DB_PORT` | Puerto PostgreSQL | `5432` |
| `JWT_SECRET` | Secreto para firmar JWT (mín. 32 chars en prod) | `tu_secreto_largo` |
| `JWT_EXPIRES_IN` | Expiración del token | `24h` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` o `https://tu-dominio.com` |
| `RATE_LIMIT_MAX` | Máx. peticiones por IP / 15 min | `300` |
| `RATE_LIMIT_AUTH_MAX` | Máx. intentos login/registro / 15 min | `20` |
| `DB_POOL_MAX` | Conexiones máximas del pool | `20` |

## Endpoints principales

| Método | Ruta | Auth | Rol | Descripción |
|---|---|---|---|---|
| GET | `/health` | No | — | Estado del servicio |
| POST | `/usuarios` | No | — | Registrar usuario |
| POST | `/login` | No | — | Iniciar sesión |
| GET | `/usuarios` | Sí | cualquiera | Listar usuarios |
| GET | `/usuarios/:id` | Sí | cualquiera | Obtener usuario |
| PUT | `/usuarios/:id` | Sí | propietario/admin | Actualizar usuario |
| DELETE | `/usuarios/:id` | Sí | admin | Eliminar usuario |
| GET | `/perfil` | Sí | cualquiera | Perfil del token |
| GET | `/clientes` | Sí | cualquiera | Listar clientes |
| POST | `/clientes` | Sí | cualquiera | Crear cliente |
| PUT | `/clientes/:id` | Sí | admin | Actualizar cliente |
| DELETE | `/clientes/:id` | Sí | admin | Eliminar cliente |
| GET | `/productos` | Sí | cualquiera | Listar productos |
| POST | `/productos` | Sí | admin | Crear producto |
| PUT | `/productos/:id` | Sí | admin | Actualizar producto |
| DELETE | `/productos/:id` | Sí | admin | Eliminar producto |
| GET | `/ventas` | Sí | cualquiera | Listar ventas |
| POST | `/ventas` | Sí | cualquiera | Crear venta |
| GET | `/ventas/:id` | Sí | cualquiera | Detalle de venta |

### Autenticación

Incluir en peticiones protegidas:

```
Authorization: Bearer <token>
```

### Ejemplo de login

```http
POST /login
Content-Type: application/json

{
  "correo": "admin@example.com",
  "password": "secreto123"
}
```

### Ejemplo de venta

```http
POST /ventas
Authorization: Bearer <token>
Content-Type: application/json

{
  "cliente_id": 1,
  "productos": [
    { "producto_id": 1, "cantidad": 2 }
  ]
}
```

> El `total` se calcula en servidor usando `precio_venta`. El `usuario_id` se obtiene del JWT.

## Formato de respuestas

**Éxito:**

```json
{
  "exito": true,
  "mensaje": "Operación correcta",
  "datos": {}
}
```

**Error:**

```json
{
  "exito": false,
  "mensaje": "Descripción del error"
}
```

## Estructura del proyecto

```
api-usuarios/
├── database/
│   └── schema.sql
├── docs/
│   └── postman/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── docs/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   └── utils/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Pruebas con Postman

Importar la colección:

`docs/postman/VC-DistribuidorPro-api.postman_collection.json`

Ver casos de prueba detallados en:

`docs/postman/TEST_CASES.md`

## Despliegue (Render / Railway / VPS)

1. Configura las variables de entorno del `.env.example`
2. Ejecuta `database/schema.sql` en PostgreSQL
3. Usa `npm start` o despliega con Docker
4. Configura `CORS_ORIGIN` con tu dominio frontend
5. Usa un `JWT_SECRET` fuerte (32+ caracteres)

## Scripts npm

| Script | Descripción |
|---|---|
| `npm start` | Inicia en producción |
| `npm run dev` | Inicia con nodemon |
| `npm run docker:up` | Levanta stack Docker |
| `npm run docker:down` | Detiene stack Docker |
| `npm run docker:logs` | Logs del contenedor API |

## Licencia

ISC
