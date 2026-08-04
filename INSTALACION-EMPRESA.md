# Instalación VC DistribuidorPro — Guía para cualquier PC

## Opción 1: Instalador automático (recomendado)

Requisitos previos: **Node.js 18+**, **PostgreSQL**, **Git** (opcional).

```powershell
cd C:\Users\wilma\Desktop\SGCRD\api-usuarios
powershell -ExecutionPolicy Bypass -File scripts\instalar.ps1 -Destino "C:\VC-DistribuidorPro" -DbPassword "TU_CONTRASEÑA_POSTGRES"
```

Esto copia API + frontend, instala dependencias, crea la BD, aplica migraciones, compila la app y crea `Iniciar-DistribuidorPro.bat`.

**Uso diario:** doble clic en `C:\VC-DistribuidorPro\Iniciar-DistribuidorPro.bat` → http://localhost:3000

---

## Opción 2: USB / otra PC sin internet en origen

### En PC con internet

```powershell
cd C:\Users\wilma\Desktop\VC DistribuidorPro\api-usuarios
powershell -ExecutionPolicy Bypass -File scripts\crear-paquete-limpio.ps1
```

Copia también la carpeta `frontend\` (sin `node_modules` ni `dist`) al USB junto con el ZIP.

### En PC destino

1. Descomprime en `C:\VC DistribuidorPro\`
2. Ejecuta el instalador apuntando a esa carpeta:

```powershell
powershell -ExecutionPolicy Bypass -File C:\VC DistribuidorPro\api-usuarios\scripts\instalar.ps1 -Destino "C:\VC DistribuidorPro" -DbPassword "TU_CLAVE"
```

---

## Opción 3: Misma PC de desarrollo (mañana)

```powershell
cd C:\Users\wilma\Desktop\VC DistribuidorPro\api-usuarios
powershell -ExecutionPolicy Bypass -File scripts\preparar-empresa.ps1
```

Luego cada día: doble clic en `scripts\iniciar-sistema.bat`

---

## Primer arranque

1. Abrir http://localhost:3000
2. Si no hay usuarios: registrar el primero vía Swagger (solo desarrollo) o Postman
3. Promover a admin en PostgreSQL:

```sql
UPDATE usuarios SET rol = 'admin' WHERE correo = 'admin@empresa.com';
```

4. Login: `admin@empresa.com` / tu contraseña

---

## Respaldo diario

```powershell
cd C:\VC DistribuidorPro\api-usuarios
npm run backup
```

Archivos en `backups/`.

---

## Variables `.env` importantes

| Variable | Valor producción |
|----------|------------------|
| `NODE_ENV` | `production` |
| `DB_NAME` | `api_usuarios` |
| `JWT_SECRET` | Clave larga única (32+ chars) |
| `ALLOW_PUBLIC_REGISTER` | `false` |
| `CORS_ORIGIN` | `http://localhost:3000` |

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Pantalla en blanco | `npm run build:frontend` |
| Error de BD | Verificar PostgreSQL activo y `.env` |
| Puerto ocupado | Cambiar `PORT=3001` en `.env` |
| Sin permisos | Verificar rol del usuario en BD |
