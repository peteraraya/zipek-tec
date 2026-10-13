<div align="center">
  <img src="./public/logo/logo_zipek-tecnologia.png" alt="Zipek Tecnología Logo" width="150" height="150" style="border-radius: 50%; margin-bottom: 20px;" />

  # Zipek Tecnología
  **Ideas que se convierten en soluciones**

  [![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.0-black?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

  [Visitar Sitio Web](https://zipek.cl) • [Reportar un Issue](https://github.com/peteraraya/zipek-tec/issues)
</div>

<br />

## 🚀 Sobre el Proyecto

Zipek Tecnología es una plataforma web moderna y de alto rendimiento diseñada para ofrecer soluciones de **Desarrollo de Software a Medida**, **E-commerce**, **Soluciones en la Nube** y **Landing Pages** enfocadas en la conversión. 

Este repositorio contiene el código fuente de la Landing Page principal y el sistema de Blog MDX integrado, construido con una arquitectura escalable orientada a Core Web Vitals, SEO Técnico y accesibilidad (A11y).

## ✨ Características Principales

- ⚡ **Rendimiento Extremo**: Construido con Next.js (App Router) y Turbopack para compilaciones ultrarrápidas y entregas estáticas (SSG).
- 🎨 **Diseño Moderno y UI Animada**: UI/UX fluida utilizando Tailwind CSS y Framer Motion (FadeIns, Parallax, Retro Grid).
- 📝 **Sistema de Blog Nativo (MDX)**: Blog pre-renderizado estáticamente a partir de archivos Markdown (`.md`), optimizado para velocidad y SEO.
- 🔍 **SEO Nivel Empresarial**: 
  - Tarjetas enriquecidas estáticas (`OpenGraph`, `Twitter Cards`).
  - Datos Estructurados `JSON-LD` (Schema.org) inyectados nativamente.
  - Generación automática de `sitemap.xml` y `robots.txt`.
  - RSS Feed autogenerado (`/feed.xml`).
- 📱 **Progressive Web App (PWA)**: Preparado para su instalación en dispositivos móviles gracias al manifiesto web y configuración de íconos de Next.js.
- ⚙️ **Feature Flags (Toggles)**: Arquitectura modular que permite activar/desactivar secciones enteras desde un único archivo de configuración (`src/config/site.ts`).
- 🔐 **Arquitectura Limpia (Route Groups)**: Separación lógica de rutas `(main)` y `(auth)` para layouts condicionales avanzados sin repetir código.

## 📂 Estructura del Proyecto

```text
zipek-landing/
├── public/                 # Assets estáticos y logos
├── src/
│   ├── app/                # App Router de Next.js
│   │   ├── (auth)/         # Layout aislado para Portal de Clientes / Login
│   │   └── (main)/         # Rutas públicas (Inicio, Casos de Éxito, Blog)
│   ├── components/         # Componentes React reutilizables (UI, Sections, Layout)
│   ├── config/             # Configuración global y Feature Flags (site.ts)
│   ├── content/blog/       # Artículos del blog en formato Markdown (.md)
│   └── lib/                # Utilidades y procesador MDX
└── package.json            # Dependencias y scripts
```

## 🛠️ Tecnologías Utilizadas

- **Core**: React 19, Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS v4, Lucide Icons
- **Animaciones**: Framer Motion
- **SEO & Analíticas**: Vercel Analytics, Next Sitemap
- **Markdown**: `gray-matter`, `react-markdown`

## 💻 Instalación y Desarrollo Local

### Requisitos

- Git
- Node.js 22.x y npm
- Credenciales de un proyecto Supabase para las funciones que consultan datos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/peteraraya/zipek-tec.git
   cd zipek-tec
   ```

2. **Configurar variables de entorno**
   ```powershell
   Copy-Item .env.example .env
   ```
   Reemplaza los valores de ejemplo en `.env` con `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` de tu proyecto. Configura
   `NEXT_PUBLIC_SITE_URL` para el dominio que estés usando.

3. **Instalar dependencias y arrancar**
   ```bash
   npm ci
   npm run dev
   ```
   El sitio estará disponible en [http://localhost:3000](http://localhost:3000).
   `.env` está excluido de Git; no lo compartas ni lo subas al repositorio.

### Desarrollo local con Docker Compose

**Requisitos:** Docker Desktop (Windows/macOS) o Docker Engine con el plugin
Docker Compose v2 (Linux).

1. Crea `.env` desde el ejemplo y configura las variables de Supabase:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Construye la imagen de desarrollo e inicia el servidor:
   ```bash
   docker compose up --build
   ```
3. Abre [http://localhost:3000](http://localhost:3000). El código se monta en
   el contenedor para reflejar los cambios; las dependencias y la caché de
   Next.js se conservan en volúmenes Docker.
4. Detén el servidor con `Ctrl+C` y luego:
   ```bash
   docker compose down
   ```

El puerto se publica solo en `127.0.0.1`. Para usar otro puerto local, define
`APP_PORT` en `.env` (por ejemplo, `APP_PORT=3001`). `RESEND_API_KEY` es
opcional para desarrollo; sin ella el formulario no envía correos reales.

### Construir y ejecutar la imagen de producción localmente

La imagen final usa la salida standalone de Next.js y ejecuta el proceso como
el usuario no privilegiado `node`. Las dos variables de Supabase deben estar
disponibles como argumentos de build porque `NEXT_PUBLIC_*` se incorporan al
JavaScript del navegador durante la compilación:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key \
  --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.example \
  --build-arg SITE_URL=https://your-domain.example \
  -t zipek-landing:local .
docker run --rm --env-file .env -p 3000:3000 zipek-landing:local
```

La clave anon/publishable de Supabase es pública por diseño; nunca uses una
clave `service_role` como argumento de build ni la incluyas en variables
`NEXT_PUBLIC_*`. Las variables `.env` no se copian a la imagen Docker.

## ⚙️ Configuración (Feature Flags)

Puedes personalizar y activar/desactivar módulos de la Landing Page modificando el archivo `src/config/site.ts`:

```typescript
export const features = {
  enablePortfolio: true,       // Muestra/Oculta la sección de Casos de Éxito
  enablePricing: true,         // Muestra/Oculta los Planes
  enableBlog: true,            // Activa el sistema de blog MDX
  enableClientPortal: true,    // Muestra acceso al Portal de clientes
  // ...
};
```

## 📝 Creación de Entradas de Blog

Para publicar un nuevo artículo, simplemente crea un archivo `.md` en la carpeta `src/content/blog/` con la siguiente estructura (Frontmatter):

```markdown
---
title: "Título de tu artículo"
date: "14 de Agosto, 2026"
readTime: "3 min"
excerpt: "Un breve resumen para la tarjeta y el SEO."
---

Contenido de tu post usando **Markdown**...
```

## Administración de servicios

La guía de arquitectura, esquema de datos, despliegue de Supabase y controles de acceso está en [docs/service-operations.md](./docs/service-operations.md).

## 🚀 Despliegue y CI/CD

El flujo de ramas, revisión, ambientes y recuperación de producción está en
[docs/branching-and-release.md](./docs/branching-and-release.md). El pipeline
de GitHub Actions vive en `.github/workflows/ci-cd.yml` y usa Vercel como
plataforma de despliegue:

- Pull requests hacia `develop` o `main`: lint, TypeScript y build de la imagen Docker; nunca despliega.
- Merge/push a `develop`: valida y luego publica un deployment Preview de Vercel.
- Merge/push a `main`: valida y luego publica a Production; puede requerir aprobación del environment `production`.
- Ejecución manual: la rama elegida decide el ambiente; `develop` publica Preview y `main` publica Production.

Configura los environments `staging` y `production` en **GitHub → Settings →
Environments**. En cada uno crea los secrets `VERCEL_TOKEN`,
`VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`. En Vercel, carga las variables de
aplicación en los entornos **Preview** y **Production**, según corresponda:
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`, `SITE_URL` y, para envío real de correo,
`RESEND_API_KEY`. Vercel CLI obtiene los valores durante `vercel pull`; no los
guardes en el repositorio. Habilita revisores requeridos para `production` y
desactiva despliegues automáticos duplicados desde la integración Git de
Vercel si Actions será el único responsable de publicar.

El build nativo de Vercel usa la salida normal de Next.js. La opción standalone
solo se activa en la etapa Docker mediante `NEXT_OUTPUT_STANDALONE=1`; esto
evita mezclar el empaquetado del contenedor con el adaptador nativo de Vercel.

Las imágenes Docker se construyen como validación y para ejecución externa;
la publicación del sitio sigue usando el build nativo de Vercel. `npm run build`
ejecuta `postbuild`, que genera el sitemap y `robots.txt`.

---

<div align="center">
  <p>Desarrollado con ♥ por el equipo de <strong>Zipek Tecnología</strong></p>
  <p>© 2026 Todos los derechos reservados.</p>
</div>
