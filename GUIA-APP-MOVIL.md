# VC DistribuidorPro — App móvil (Play Store / App Store)

La app móvil reutiliza la misma interfaz web empaquetada con **Capacitor**.
El celular se conecta al servidor de la oficina (PC con VC DistribuidorPro).

---

## Requisitos importantes

| Item | Detalle |
|------|---------|
| **Servidor** | El PC de la oficina debe estar encendido con VC DistribuidorPro corriendo |
| **Red** | Celular y PC en la misma Wi‑Fi, o servidor accesible por internet/VPN |
| **Android** | PC con Node.js + **Android Studio** para compilar el APK/AAB |
| **iPhone** | Se necesita una **Mac** con Xcode para publicar en App Store |
| **Cuenta Google Play** | ~US$25 (pago único) — [play.google.com/console](https://play.google.com/console) |
| **Cuenta Apple Developer** | US$99/año — [developer.apple.com](https://developer.apple.com) |

---

## 1. Preparar el proyecto móvil (una vez)

```powershell
cd C:\Users\wilma\Desktop\SGCRD\frontend
npm install
npm run build
npx cap add android
npm run android:sync
```

La primera vez abre Android Studio:

```powershell
npm run android
```

En Android Studio: **Build → Generate Signed Bundle / APK** para crear el archivo que sube a Play Store.

---

## 2. Red en el PC (para que el celular conecte)

1. En el PC: `ipconfig` → anote la **IPv4** (ej. `192.168.1.50`).
2. Permita el puerto **3000** en el Firewall de Windows (entrada TCP).
3. Mantenga VC DistribuidorPro abierto.

En la app móvil, al iniciar, configure:

```text
http://192.168.1.50:3000
```

(Pantalla **Conectar al servidor** en el login.)

---

## 3. Publicar en Google Play Store

1. Crear cuenta en [Google Play Console](https://play.google.com/console).
2. **Crear aplicación** → nombre: *VC DistribuidorPro*.
3. En Android Studio generar **AAB** (Android App Bundle) firmado:
   - Build → Generate Signed Bundle / APK → Android App Bundle
   - Crear keystore (guarde la contraseña en lugar seguro).
4. Play Console → **Producción** → Crear versión → subir el `.aab`.
5. Completar:
   - Icono 512×512 px
   - Capturas de pantalla del celular
   - Descripción corta y larga
   - Política de privacidad (URL o texto)
   - Clasificación de contenido
6. Enviar a revisión (1–7 días habitualmente).

### Iconos

Coloque una imagen cuadrada mínimo **1024×1024** en:

```text
frontend/resources/icon.png
```

Luego (opcional, con herramienta Capacitor):

```powershell
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```

---

## 4. Publicar en Apple App Store

Requiere **Mac + Xcode**:

```bash
cd frontend
npm run build:mobile
npx cap add ios   # solo en Mac
npx cap open ios
```

En Xcode:

1. Configurar **Team** (cuenta Apple Developer).
2. Product → Archive → Distribute App → App Store Connect.
3. En [App Store Connect](https://appstoreconnect.apple.com): crear app, subir metadatos y enviar a revisión.

---

## 5. Actualizar la app después de cambios

```powershell
cd C:\Users\wilma\Desktop\SGCRD\frontend
npm run build:mobile
```

En Android Studio: incrementar `versionCode` / `versionName` en `android/app/build.gradle` y generar nuevo AAB.

---

## 6. Uso diario (repartidor / vendedor)

1. PC de oficina encendido con VC DistribuidorPro.
2. Abrir app en el celular.
3. Si cambió la IP del PC, volver a configurar servidor en login.
4. Iniciar sesión con su usuario (ej. repartidor@ryvfrutas.com).

---

## Próximo paso recomendado (servidor en la nube)

Para usar la app **fuera de la Wi‑Fi de la oficina** sin depender del PC:

- Instalar el API en un VPS (DigitalOcean, AWS, etc.) con PostgreSQL.
- Usar HTTPS (Let's Encrypt).
- En la app móvil configurar: `https://api.su-dominio.com`

RYV puede seguir usando el PC en la oficina; los celulares apuntan al servidor en la nube.

---

## Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `npm run build:mobile` | Compila web + sincroniza con Android/iOS |
| `npm run android` | Abre proyecto en Android Studio |
| `npm run android:sync` | Solo sincroniza cambios web → nativo |
