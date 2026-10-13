<div align="center">
  <img src="./public/logo/logo_zipek-tecnologia.png" alt="Zipek Tecnología Logo" width="150" height="150" style="border-radius: 50%; margin-bottom: 20px;" />

  # Zipek Tecnología
  **Ideas que se convierten en soluciones**

  [![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.0-black?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

  [Visitar Sitio Web](https://zipek.com) • [Reportar un Issue](https://github.com/peteraraya)
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

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/peteraraya/zipek-landing.git
   cd zipek-landing
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar el entorno de desarrollo**
   ```bash
   npm run dev
   ```

   El sitio estará disponible en [http://localhost:3000](http://localhost:3000).

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

## 🚀 Despliegue

Este proyecto está optimizado para ser desplegado en [Vercel](https://vercel.com).
Los comandos estándar de construcción son:

```bash
npm run build
npm run start
```
*El script `postbuild` generará automáticamente el Sitemap del sitio.*

---

<div align="center">
  <p>Desarrollado con ♥ por el equipo de <strong>Zipek Tecnología</strong></p>
  <p>© 2026 Todos los derechos reservados.</p>
</div>
