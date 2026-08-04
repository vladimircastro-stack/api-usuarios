# Respaldo automático diario — VC DistribuidorPro

Programa un respaldo de la base de datos todos los días a las 8:00 PM.

## Instalar (una sola vez)

Abre **PowerShell como Administrador** y ejecuta:

```powershell
cd C:\Users\wilma\Desktop\SGCRD\api-usuarios
powershell -ExecutionPolicy Bypass -File scripts\programar-backup.ps1
```

Si el sistema está instalado en otra ruta (ej. `C:\VC-DistribuidorPro\api-usuarios`), edita la ruta en el script o pásala:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\programar-backup.ps1 -ProjectRoot "C:\VC-DistribuidorPro\api-usuarios"
```

## Respaldo manual

```powershell
cd api-usuarios
npm run backup
```

Los archivos se guardan en `api-usuarios\backups\`.

## Verificar tarea programada

1. Abre **Programador de tareas** de Windows
2. Busca la tarea **VC-DistribuidorPro-Backup-Diario**
3. Debe ejecutarse diariamente

## Restaurar un respaldo

```powershell
psql -U postgres -d api_usuarios -f backups\backup-api_usuarios-FECHA.sql
```

(Reemplaza FECHA con el archivo que quieras restaurar.)
