# Guía de Instalación VC DistribuidorPro API
## Sistema de Gestión — PC de la Empresa

**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Repositorio:** https://github.com/vladimircastro-stack/api-usuarios

---

## 1. ¿Qué es este sistema?

VC DistribuidorPro API es el programa de gestión para la empresa. Permite:

- Registrar usuarios e iniciar sesión
- Gestionar **clientes**
- Gestionar **productos** e inventario
- Registrar **ventas** (descuenta inventario automáticamente)

El sistema funciona en la PC de la empresa como un **servidor local**. Los usuarios acceden desde el navegador o Postman en la misma red.

---

## 2. Requisitos de la PC

| Software | Versión | Descarga |
|---|---|---|
| Windows | 10 u 11 | — |
| Node.js | 18 o superior (LTS) | https://nodejs.org |
| PostgreSQL | 14 o superior | https://www.postgresql.org/download/windows/ |
| Git (opcional) | Cualquiera | https://git-scm.com/download/win |

**Espacio en disco:** mínimo 500 MB  
**RAM:** mínimo 4 GB recomendado

---

## 3. Archivos que NO se copian

Al instalar, **nunca** copies estos archivos de otra PC:

| No copiar | Motivo |
|---|---|
| `node_modules/` | Se regenera con `npm install` |
| `.env` | Contiene contraseñas; se crea en cada PC |
| `.git/` | Solo si clonas desde GitHub |

---

## 4. Instalación paso a paso

### PASO 1 — Instalar Node.js

1. Descargar desde https://nodejs.org (botón **LTS**)
2. Ejecutar el instalador → **Next** en todo
3. Reiniciar la PC si lo pide
4. Verificar abriendo CMD o PowerShell:

```
node --version
npm --version
```

Debe mostrar números de versión (ejemplo: v20.x.x).

---

### PASO 2 — Instalar PostgreSQL

1. Descargar desde https://www.postgresql.org/download/windows/
2. Durante la instalación:
   - Puerto: **5432** (dejar por defecto)
   - **Anotar la contraseña** del usuario `postgres`
3. Al finalizar, dejar marcado **pgAdmin 4** si aparece la opción

---

### PASO 3 — Obtener el proyecto

**Opción A — Desde GitHub (con internet):**

Abrir PowerShell:

```
cd C:\
git clone https://github.com/vladimircastro-stack/api-usuarios.git
cd api-usuarios
```

**Opción B — Desde USB (sin internet):**

1. Copiar el archivo `api-usuarios-instalacion.zip` al USB
2. En la PC de la empresa, descomprimir en `C:\api-usuarios`
3. Abrir PowerShell:

```
cd C:\api-usuarios
```

---

### PASO 4 — Instalar dependencias

En PowerShell, dentro de la carpeta del proyecto:

```
npm install
```

Esperar a que termine (puede tardar 1-3 minutos).

---

### PASO 5 — Configurar variables de entorno

```
copy .env.example .env
notepad .env
```

Editar el archivo `.env` con estos valores:

```
PORT=3000
NODE_ENV=production

DB_USER=postgres
DB_HOST=localhost
DB_NAME=api_usuarios
DB_PASSWORD=TU_CONTRASEÑA_DE_POSTGRES
DB_PORT=5432

JWT_SECRET=clave_secreta_larga_minimo_32_caracteres_2026
CORS_ORIGIN=*
```

**Importante:** Cambiar `TU_CONTRASEÑA_DE_POSTGRES` por la contraseña que pusiste al instalar PostgreSQL.

Guardar y cerrar el Notepad.

---

### PASO 6 — Crear la base de datos

Abrir **pgAdmin 4** o **SQL Shell (psql)**.

Ejecutar:

```sql
CREATE DATABASE api_usuarios;
```

Luego, desde PowerShell en la carpeta del proyecto:

```
psql -U postgres -d api_usuarios -f database\schema.sql
```

Si `psql` no se reconoce, usar la ruta completa:

```
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d api_usuarios -f database\schema.sql
```

(Cambiar `16` por tu versión de PostgreSQL si es diferente.)

---

### PASO 7 — Iniciar el sistema

**Forma 1 — PowerShell:**

```
npm start
```

**Forma 2 — Doble clic:**

Abrir `scripts\iniciar-api.bat`

Debe aparecer:

```
Servidor ejecutándose en el puerto 3000
Documentación Swagger: http://localhost:3000/api-docs
```

**No cerrar esta ventana** mientras se use el sistema.

---

### PASO 8 — Verificar que funciona

Abrir el navegador en:

**http://localhost:3000/health**

Debe mostrar:

```json
{
  "exito": true,
  "mensaje": "API funcionando correctamente",
  "datos": {
    "status": "ok",
    "database": "connected"
  }
}
```

Si `database` dice `connected`, **la instalación fue exitosa**.

---

## 5. Crear el primer usuario administrador

### 5.1 Registrar usuario

Abrir: **http://localhost:3000/api-docs**

1. Ir a **POST /usuarios**
2. Clic en **Try it out**
3. Pegar:

```json
{
  "nombre": "Administrador",
  "correo": "admin@empresa.com",
  "edad": 30,
  "password": "secreto123"
}
```

4. Clic en **Execute** → debe responder **201**

### 5.2 Promover a administrador

En pgAdmin o SQL Shell, conectado a `api_usuarios`:

```sql
UPDATE usuarios SET rol = 'admin' WHERE correo = 'admin@empresa.com';
```

### 5.3 Iniciar sesión

En Swagger → **POST /login**:

```json
{
  "correo": "admin@empresa.com",
  "password": "secreto123"
}
```

Copiar el **token** de la respuesta.

Clic en **Authorize** (arriba a la derecha) → pegar:

```
Bearer EL_TOKEN_AQUI
```

---

## 6. Uso diario

Cada día, al encender la PC:

1. Abrir PowerShell
2. Ejecutar:

```
cd C:\api-usuarios
npm start
```

3. Abrir navegador: **http://localhost:3000/api-docs**
4. Hacer login y trabajar

Para **detener** el sistema: cerrar la ventana de PowerShell o presionar `Ctrl + C`.

---

## 7. Operaciones comunes

### Crear cliente
- Swagger → **POST /clientes** (requiere token)
- Campos: nombre, teléfono, correo, dirección

### Crear producto (solo admin)
- Swagger → **POST /productos**

### Registrar venta
- Swagger → **POST /ventas**

```json
{
  "cliente_id": 1,
  "productos": [
    { "producto_id": 1, "cantidad": 2 }
  ]
}
```

El total se calcula automáticamente.

---

## 8. Solución de problemas

| Problema | Solución |
|---|---|
| `npm no se reconoce` | Reinstalar Node.js y reiniciar PC |
| `Faltan variables de entorno` | Verificar que existe `.env` |
| `database: disconnected` | Abrir pgAdmin y verificar que PostgreSQL está corriendo |
| `EADDRINUSE puerto 3000` | Cambiar `PORT=3001` en `.env` |
| `Credenciales inválidas` | Verificar correo y contraseña |
| Token expirado | Volver a hacer login (token dura 24 horas) |

---

## 9. Contacto y soporte técnico

- **Repositorio GitHub:** https://github.com/vladimircastro-stack/api-usuarios
- **Documentación API:** http://localhost:3000/api-docs
- **Colección Postman:** `docs/postman/VC-DistribuidorPro-api.postman_collection.json`

---

## 10. Checklist de instalación

Marcar cada paso al completarlo:

- [ ] Node.js instalado
- [ ] PostgreSQL instalado
- [ ] Proyecto descargado/clonado
- [ ] `npm install` ejecutado
- [ ] Archivo `.env` configurado
- [ ] Base de datos `api_usuarios` creada
- [ ] `schema.sql` ejecutado
- [ ] `npm start` funciona
- [ ] `/health` responde OK
- [ ] Usuario admin creado
- [ ] Primera venta de prueba realizada

---

*VC DistribuidorPro — by VC Software*
