# Casos de prueba — SGCRD API

Colección Postman: `SGCRD-api-usuarios.postman_collection.json`

Variables recomendadas:
- `baseUrl`: `http://localhost:3000`
- `token`: se guarda automáticamente tras login exitoso

## 1. Sistema

| # | Caso | Método | Ruta | Auth | Resultado esperado |
|---|---|---|---|---|---|
| 1.1 | Health check | GET | `/health` | No | 200, `exito: true`, `database: connected` |
| 1.2 | Raíz API | GET | `/` | No | 200, texto de bienvenida |

## 2. Usuarios y autenticación

| # | Caso | Método | Ruta | Body / Notas | Resultado esperado |
|---|---|---|---|---|---|
| 2.1 | Registro válido | POST | `/usuarios` | nombre, correo, edad, password | 201 |
| 2.2 | Registro correo duplicado | POST | `/usuarios` | correo existente | 400 |
| 2.3 | Registro campos faltantes | POST | `/usuarios` | body vacío | 400 |
| 2.4 | Login correcto | POST | `/login` | credenciales válidas | 200 + token |
| 2.5 | Login incorrecto | POST | `/login` | password errónea | 401, "Credenciales inválidas" |
| 2.6 | Login usuario inexistente | POST | `/login` | correo no registrado | 401, mismo mensaje genérico |
| 2.7 | Listar usuarios sin token | GET | `/usuarios` | sin Authorization | 401 |
| 2.8 | Listar usuarios con token | GET | `/usuarios` | Bearer token | 200 |
| 2.9 | Perfil autenticado | GET | `/perfil` | Bearer token | 200, datos del JWT |
| 2.10 | Actualizar propio usuario | PUT | `/usuarios/:id` | id = usuario del token | 200 |
| 2.11 | Actualizar otro usuario | PUT | `/usuarios/:id` | id ajeno, rol usuario | 403 |
| 2.12 | Eliminar usuario sin admin | DELETE | `/usuarios/:id` | rol usuario | 403 |
| 2.13 | Eliminar usuario admin | DELETE | `/usuarios/:id` | rol admin | 200 |
| 2.14 | ID inválido | GET | `/usuarios/abc` | token válido | 400 |

## 3. Clientes

| # | Caso | Método | Ruta | Auth / Rol | Resultado esperado |
|---|---|---|---|---|---|
| 3.1 | Listar sin token | GET | `/clientes` | No | 401 |
| 3.2 | Listar autenticado | GET | `/clientes` | Sí | 200 |
| 3.3 | Crear cliente | POST | `/clientes` | usuario autenticado | 201 |
| 3.4 | Crear sin nombre | POST | `/clientes` | body inválido | 400 |
| 3.5 | Actualizar cliente admin | PUT | `/clientes/:id` | admin | 200 |
| 3.6 | Actualizar cliente usuario | PUT | `/clientes/:id` | usuario | 403 |
| 3.7 | Eliminar cliente admin | DELETE | `/clientes/:id` | admin | 200 |

## 4. Productos

| # | Caso | Método | Ruta | Auth / Rol | Resultado esperado |
|---|---|---|---|---|---|
| 4.1 | Listar productos | GET | `/productos` | autenticado | 200 |
| 4.2 | Crear producto admin | POST | `/productos` | admin | 201 |
| 4.3 | Crear producto usuario | POST | `/productos` | usuario | 403 |
| 4.4 | Crear producto inválido | POST | `/productos` | precio <= 0 | 400 |
| 4.5 | Actualizar producto | PUT | `/productos/:id` | admin | 200 |
| 4.6 | Eliminar producto | DELETE | `/productos/:id` | admin | 200 |

## 5. Ventas

| # | Caso | Método | Ruta | Body / Notas | Resultado esperado |
|---|---|---|---|---|---|
| 5.1 | Listar ventas | GET | `/ventas` | token válido | 200 |
| 5.2 | Crear venta válida | POST | `/ventas` | cliente_id + productos[] | 201, total calculado |
| 5.3 | Crear sin productos | POST | `/ventas` | productos: [] | 400 |
| 5.4 | Cliente inexistente | POST | `/ventas` | cliente_id inválido | 404 |
| 5.5 | Inventario insuficiente | POST | `/ventas` | cantidad > stock | 400 |
| 5.6 | Detalle venta | GET | `/ventas/:id` | id existente | 200 con detalle |
| 5.7 | Venta no encontrada | GET | `/ventas/99999` | — | 404 |

## 6. Seguridad

| # | Caso | Verificación |
|---|---|---|
| 6.1 | Token inválido | 401 en ruta protegida |
| 6.2 | Token expirado | 401 |
| 6.3 | Rate limit login | muchos POST `/login` → 429 |
| 6.4 | JSON malformado | 400 |

## Orden sugerido de ejecución

1. Health check
2. Registrar usuario
3. Login y guardar token
4. CRUD clientes (crear como usuario)
5. CRUD productos (como admin)
6. Crear venta
7. Consultar ventas
8. Probar casos de error

## Crear usuario administrador

Tras registrar un usuario, promoverlo en PostgreSQL:

```sql
UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
```
