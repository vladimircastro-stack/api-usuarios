# Guía operativa VC DistribuidorPro — Distribuidora de frutas

## Iniciar el sistema

1. Enciende la PC del servidor
2. Doble clic en **Iniciar-DistribuidorPro.bat** (o `scripts\iniciar-sistema.bat`)
3. Abre el navegador: **http://localhost:3000**
4. Inicia sesión con tu correo y contraseña

---

## Roles y quién hace qué

| Rol | Pantallas | Tareas del día |
|-----|-----------|----------------|
| **Administrador** | Todo + Configuración + Usuarios | Precios, empleados, supervisión |
| **Vendedor** | Pedidos, Cocinas, Cuentas, Reportes | Crear pedidos, registrar pagos |
| **Repartidor** | Entregas, Pedidos (ver) | Marcar entregas en ruta / entregadas |
| **Almacén** | Inventario, Productos | Ajustar stock, revisar bajo stock |

---

## Flujo diario típico

### 1. Crear un pedido (Vendedor)
**Pedidos** → **+ Nuevo pedido**
- Elige la cocina (cliente)
- Agrega productos, cantidad y **precio de la factura**
- **Contado** = ya pagó | **Crédito** = queda por cobrar (se suma solo en Cuentas)
- Si entregas canastos vacíos, indica la cantidad
- **Imprimir** genera comprobante para cocina o repartidor

### 2. Entregar (Repartidor)
**Entregas** → pedido → **En ruta** → **Entregada**
- Para anular: **Cancelar** (revierte inventario, crédito y canastos)

### Vista repartidor — Entregas de hoy
**Entregas** → pestaña **Hoy**
- Muestra pedidos pendientes/en ruta programados para hoy
- Dirección, teléfono, horario y enlace a **Ver mapa**
- **Imprimir** comprobante para llevar en la ruta

### 3. Canastos (Vendedor / Admin)
**Cocinas** → cliente → **Canastos**
- **Entregar**: cuántos canastos salieron (ej. 50)
- **Devolución**: cuántos regresaron (ej. 30 → debe 20 en rojo)

### 4. Cobrar crédito (Vendedor / Admin)
**Cuentas** → cliente → **Registrar pago**
- La deuda se crea sola al hacer pedidos a crédito
- **Administrador** define el **límite de crédito** por cocina en **Cocinas → Editar**
- Si un pedido a crédito supera el límite, el sistema lo bloquea

### 5. Inventario (Almacén)
**Inventario** → ajustar cantidades cuando entra o sale mercancía

---

## Administrador: configuración

**Configuración** (solo admin):
- Precio por canasto
- Precios de referencia de frutas
- Nuevos productos

**Usuarios** (solo admin):
- Crear empleados (vendedor, repartidor, almacén)
- Cambiar contraseñas y roles

**Cocinas** (admin):
- Límite de crédito por cliente (0 o vacío = sin límite)
- Buscar por nombre, dirección o teléfono

**Pedidos y Entregas**:
- Buscar pedidos por cocina o número
- **Imprimir** comprobante o **WhatsApp** para enviar resumen al cliente

**Reportes**:
- Generar reporte por fechas
- Exportar **CSV** (ventas por día, por cocina, productos más vendidos)

---

## Usuarios del equipo

Ver credenciales en **`USUARIOS-EMPRESA.md`** (entregar a cada empleado y cambiar contraseñas).

---

## Respaldo de datos

**Manual (cada día o al cerrar):**
```bat
cd api-usuarios
npm run backup
```
Los archivos quedan en `api-usuarios\backups\`.

**Automático (recomendado):**
```bat
cd api-usuarios
Instalar-Automatizacion.bat
```
(Clic derecho en el .bat → **Ejecutar como administrador**.)

O en PowerShell como administrador:
```bat
npm run instalar:automatizacion
```

Esto programa:
- Backup diario a las **8:00 PM**
- Inicio de VC DistribuidorPro al **encender la PC**

**Manual con Programador de tareas:**
1. Abrir **Programador de tareas** → Crear tarea básica
2. Nombre: `VC-DistribuidorPro-Backup-Diario`
3. Diariamente a las 8:00 PM
4. Acción: iniciar programa `powershell.exe`
5. Argumentos: `-ExecutionPolicy Bypass -File "RUTA\api-usuarios\scripts\backup-db.ps1"`

Copia la carpeta `backups` a USB semanalmente.

---

## Si algo falla

| Problema | Solución |
|----------|----------|
| No abre la página | Verificar que PostgreSQL esté encendido y ejecutar Iniciar-DistribuidorPro.bat |
| Sesión expirada | Volver a iniciar sesión |
| Error al guardar | Revisar conexión a internet local / reiniciar el .bat |
| Olvidé contraseña admin | Contactar quien instaló el sistema o restaurar desde backup |

---

## Contacto técnico

Sistema: **VC DistribuidorPro** — Gestión para distribuidoras  
Marca: **VC Software**  
Ubicación: PC servidor en la empresa (Neyba, RD)
