# Flujo de trabajo, ramas y despliegues

## Objetivo

Separar el desarrollo, la validación y la publicación para que ningún cambio
llegue a producción sin pasar por revisión y CI. El proyecto usa Vercel como
runtime de producción y GitHub Actions como puerta de calidad y orquestador.

## Ramas

| Rama | Propósito | Destino |
| --- | --- | --- |
| `main` | Código aprobado que está en producción | Vercel Production |
| `develop` | Integración de trabajo terminado, validación de aceptación | Vercel Preview / staging |
| `feature/<tema>` | Funcionalidad nueva, creada desde `develop` | CI; sin despliegue automático |
| `fix/<tema>` | Corrección normal, creada desde `develop` | CI; sin despliegue automático |
| `hotfix/<tema>` | Incidente urgente, creada desde `main` | CI; sin despliegue automático |

Las ramas de trabajo son de corta vida. No se desarrollan funcionalidades
directamente en `main` ni en `develop`. Usa nombres descriptivos en kebab-case,
por ejemplo `feature/checkout-contacto` o `fix/mobile-menu-overflow`.

## Flujo habitual

1. Actualiza `develop` y crea una rama de trabajo:

   ```bash
   git switch develop
   git pull origin develop
   git switch -c feature/nombre-del-cambio
   ```

2. Trabaja en cambios pequeños y ejecuta las comprobaciones locales:

   ```bash
   npm ci
   npm run lint
   npx tsc --noEmit
   npm run build
   ```

3. Publica la rama y abre un pull request hacia `develop`:

   ```bash
   git push -u origin feature/nombre-del-cambio
   ```

   GitHub Actions ejecuta lint, chequeo de tipos y build Docker. Resuelve las
   observaciones y espera todos los checks requeridos antes de fusionar.

4. El merge a `develop` vuelve a ejecutar CI y, si pasa, publica un deployment
   Preview en Vercel. Revisa el enlace de deployment que aparece en el log de
   Actions y realiza pruebas funcionales con los datos de staging.

5. Cuando el cambio está aceptado, abre un pull request de `develop` hacia
   `main`. Incluye resumen, evidencia de pruebas y posibles riesgos. Tras la
   aprobación, el merge a `main` ejecuta CI y solicita el deployment de
   Production.

## Hotfixes

Para un incidente productivo, crea `hotfix/<tema>` desde `main`, aplica el
cambio mínimo y abre un pull request directo a `main`. Una vez publicado,
integra el mismo arreglo en `develop` mediante otro pull request para evitar
que la siguiente versión vuelva a introducir el problema.

## Qué hace GitHub Actions

`.github/workflows/ci-cd.yml` contiene tres fases:

1. **Validación:** `npm ci`, `npm run lint`, `npx tsc --noEmit` y build de la
   imagen Docker con credenciales ficticias no sensibles. Se ejecuta en los
   pull requests contra `main`/`develop` y en pushes a ramas de trabajo.
2. **Staging/Preview:** solo después de validar un push a `develop` o una
   ejecución manual seleccionando esa rama. Descarga el entorno Preview de
   Vercel, compila con `--target=preview` y publica una URL Preview.
3. **Producción:** solo después de validar un push a `main` o una ejecución
   manual seleccionando esa rama. Descarga el entorno Production y publica
   el build preconstruido con `--prod`.

Los despliegues tienen concurrencia separada: uno nuevo a staging puede
cancelar el anterior; producción nunca cancela un deployment en curso. Los
pull requests no reciben secrets y nunca publican a Vercel.

## Configuración de GitHub y Vercel

### GitHub Environments

Crea los environments `staging` y `production` en **Settings → Environments**.
En ambos agrega los environment secrets:

- `VERCEL_TOKEN`: token de CI con acceso solo al equipo/proyecto necesario.
- `VERCEL_ORG_ID`: ID de organización/equipo de Vercel.
- `VERCEL_PROJECT_ID`: ID del proyecto.

Añade revisores requeridos al environment `production` para separar la
aprobación del despliegue de quien hace el merge. Si se usan reglas de
aprobación, comprueba que el plan de GitHub de la organización las admita.

### Variables de aplicación

Configura en Vercel las variables adecuadas para cada environment:

- **Preview:** valores de prueba/staging de Supabase y `NEXT_PUBLIC_SITE_URL`
  correspondiente al dominio Preview o staging.
- **Production:** valores productivos y dominio canónico.
- `SITE_URL` debe apuntar al hostname correcto para que `next-sitemap` genere
  las URLs esperadas.
- `RESEND_API_KEY` solo se configura donde se autorice el envío de correo.

Las variables `NEXT_PUBLIC_*` son públicas en el bundle del navegador. Nunca
uses una clave `service_role` en ellas ni en argumentos Docker. No incluyas
credenciales en el YAML, `.env.example`, logs o artefactos.

### Protección de ramas

En **Settings → Rules → Rulesets** (o Branch protection rules), configura:

- `main`: exigir pull request, al menos una aprobación, resolución de
  conversaciones y el check `Validate application and Docker image`; bloquear
  force-push y borrado. Activar historial lineal si el equipo usa squash merge.
- `develop`: exigir pull request, el mismo check y bloquear force-push y
  borrado.
- Deshabilitar bypass de estas reglas salvo administradores de emergencia.
- Usar squash merge para mantener un historial legible.

El nombre del check debe coincidir con el job/status publicado por Actions. En
GitHub, espera a que el primer workflow complete al menos una vez antes de
seleccionarlo como requerido.

## Rollback y operación

1. Identifica en Vercel el deployment estable anterior y promuévelo/recupéralo
   desde el dashboard de Vercel si la publicación actual afecta a usuarios.
2. Reproduce el arreglo en un `hotfix/*`, valida por pull request y vuelve a
   desplegar por `main`; evita editar directamente en Vercel como solución
   permanente.
3. Revisa logs de GitHub Actions y Vercel. No repitas despliegues hasta
   confirmar que secrets, variables y proyecto Vercel coinciden con el
   environment.
4. Si hubo cambios de esquema en Supabase, coordina el rollback de aplicación
   con una migración compatible; revertir solamente el frontend no revierte
   cambios de datos.

## Primer uso

El repositorio debe tener `main` y `develop` publicados en GitHub. Para crear
`develop` desde la versión actual de `main` si aún no existe:

```bash
git switch main
git pull origin main
git switch -c develop
git push -u origin develop
```

Después crea los environments/secrets y activa las reglas de protección
descritas arriba. El deployment manual desde **Actions → CI/CD → Run workflow**
usa la rama seleccionada: `develop` para Preview y `main` para Production.
