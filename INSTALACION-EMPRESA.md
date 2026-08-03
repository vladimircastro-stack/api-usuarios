# Instalación en PC de la empresa (Windows)

Guía para dejar el sistema funcionando **hoy** y empezar a trabajar **mañana**.

## Lo que NO debes copiar entre PCs

Estas carpetas/archivos son locales y **no** van en GitHub ni en un ZIP de respaldo:

| Excluir | Motivo |
|---|---|
| `node_modules/` | Se regenera con `npm install` |
| `.env` | Contiene contraseñas secretas |
| `.git/` | Solo si copias manualmente; mejor clonar desde GitHub |

## Opción A — Instalar desde GitHub (recomendado)

### 1. Instalar software (una sola vez por PC)

1. **Node.js LTS** — https://nodejs.org/ (versión 18 o superior)
2. **PostgreSQL** — https://www.postgresql.org/download/windows/
   - Anota la contraseña del usuario `postgres` durante la instalación
3. **Git** — https://git-scm.com/download/win

### 2. Clonar el proyecto

Abre PowerShell o CMD:

```powershell
cd C:\
git clone https://github.com/vladimircastro-stack/api-usuarios.git
cd api-usuarios
```

### 3. Instalar dependencias

```powershell
npm install
```

### 4. Configurar variables de entorno

```powershell
copy .env.example .env
notepad .env
```

Edita `.env` con los datos de tu PostgreSQL:

```env
PORT=3000
NODE_ENV=production

DB_USER=postgres
DB_HOST=localhost
DB_NAME=sgcrd
DB_PASSWORD=TU_CONTRASEÑA_POSTGRES
DB_PORT=5432

JWT_SECRET=genera_una_clave_larga_y_secreta_de_al_menos_32_caracteres
```

### 5. Crear la base de datos

Abre **SQL Shell (psql)** o pgAdmin y ejecuta:

```sql
CREATE DATABASE sgcrd;
```

Luego, desde PowerShell en la carpeta del proyecto:

```powershell
psql -U postgres -d sgcrd -f database\schema.sql
```

(Si `psql` no está en el PATH, usa la ruta completa, por ejemplo:
`"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d sgcrd -f database\schema.sql`)

### 6. Iniciar la API

```powershell
npm start
```

Debe aparecer:

```
Servidor ejecutándose en el puerto 3000
Documentación Swagger: http://localhost:3000/api-docs
```

### 7. Verificar que funciona

Abre el navegador: http://localhost:3000/health

Debe responder JSON con `"database": "connected"`.

### 8. Crear el primer usuario y el administrador

**Con Postman** (importar `docs/postman/SGCRD-api-usuarios.postman_collection.json`):

1. `POST /usuarios` — registrar usuario
2. `POST /login` — obtener token

**Promover a administrador** en PostgreSQL:

```sql
UPDATE usuarios SET rol = 'admin' WHERE correo = 'tu@correo.com';
```

---

## Opción B — Copiar con USB (sin internet en la empresa)

En la PC con internet, genera un paquete limpio:

```powershell
cd C:\Users\wilma\Desktop\SGCRD\api-usuarios
powershell -ExecutionPolicy Bypass -File scripts\crear-paquete-limpio.ps1
```

Se crea `api-usuarios-instalacion.zip` **sin** `node_modules`, `.env` ni `.git`.

En la PC de la empresa:

1. Descomprime el ZIP
2. Sigue desde el paso 3 (npm install) de la Opción A

---

## Uso diario

```powershell
cd C:\api-usuarios
npm start
```

La API queda en http://localhost:3000

Para probar endpoints: Postman o Swagger en http://localhost:3000/api-docs

---

## Solución de problemas

| Problema | Solución |
|---|---|
| `Faltan variables de entorno` | Verifica que existe `.env` con todas las variables |
| `database: disconnected` | PostgreSQL no está corriendo o credenciales incorrectas |
| `EADDRINUSE puerto 3000` | Cambia `PORT=3001` en `.env` |
| `npm no se reconoce` | Reinstala Node.js y reinicia la PC |

---

## Contacto técnico

Repositorio: https://github.com/vladimircastro-stack/api-usuarios
