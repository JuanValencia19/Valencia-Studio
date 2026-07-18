---
name: tailwind-styling
description: Guía de mejores prácticas con Tailwind CSS v4. Incluye configuración CSS-first, design tokens, responsive design, dark mode, animaciones, y convenciones para proyectos enterprise.
license: MIT
compatibility: opencode
metadata:
  stack: tailwindcss
  version: "4+"
  audience: frontend, ui-designer
---

# Tailwind CSS v4 - Guía de Estilos

## Instalación y Setup

### Vite Plugin (Recomendado)

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
})
```

### Punto de Entrada CSS (Una Línea)

```css
@import "tailwindcss";
```

**Diferencias clave con v3:**
- NO más `@tailwind base; @tailwind components; @tailwind utilities;`
- NO más `tailwind.config.js` requerido - configuración CSS-first via `@theme`
- NO más array `content` - detección automática de contenido
- Usa Lightning CSS para vendor prefixing

## Configuración CSS-First (@theme)

### Definición Básica de Tema

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
  --color-brand-100: oklch(0.99 0 0);
  --color-brand-500: oklch(0.84 0.18 117.33);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

### Namespaces de Variables del Tema

| Namespace | Utilidades Generadas |
|-----------|---------------------|
| `--color-*` | `bg-*`, `text-*`, `fill-*`, `stroke-*` |
| `--font-*` | `font-sans`, `font-serif`, `font-mono` |
| `--text-*` | `text-xs`, `text-sm`, `text-base` |
| `--breakpoint-*` | `sm:`, `md:`, `lg:` responsive |
| `--spacing-*` | `px-4`, `mt-8`, `gap-6` |
| `--radius-*` | `rounded-sm`, `rounded-lg` |
| `--shadow-*` | `shadow-md`, `shadow-xl` |
| `--animate-*` | `animate-spin`, `animate-pulse` |

### Tema Completo Personalizado

```css
@theme {
  --*: initial;         /* Limpia TODOS los defaults */
  --spacing: 4px;
  --font-body: Inter, sans-serif;
  --color-lagoon: oklch(0.72 0.11 221.19);
  --color-coral: oklch(0.74 0.17 40.24);
}
```

### Definir Animaciones en @theme

```css
@theme {
  --animate-fade-in-scale: fade-in-scale 0.3s ease-out;

  @keyframes fade-in-scale {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
}
```

## Design System para Valencia Studio

### Tokens de Color

```css
@theme {
  /* Brand colors */
  --color-primary: var(--color-indigo-500);
  --color-primary-hover: var(--color-indigo-600);
  --color-primary-light: var(--color-indigo-100);

  /* Superficies semánticas */
  --color-surface: var(--color-white);
  --color-surface-elevated: var(--color-gray-50);
  --color-surface-overlay: var(--color-black/50);

  /* Texto semántico */
  --color-text: var(--color-gray-900);
  --color-text-muted: var(--color-gray-500);
  --color-text-inverse: var(--color-white);

  /* Bordes semánticos */
  --color-border-default: var(--color-gray-200);
  --color-border-strong: var(--color-gray-400);
}
```

### Tokens de Tipografía

```css
@theme {
  /* Display / Hero */
  --font-display: 'Inter', -apple-system, sans-serif;
  
  /* Body */
  --font-body: 'Inter', -apple-system, sans-serif;
  
  /* Mono */
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Escala de Espaciado

```
4px   -- xs
8px   -- sm
12px  -- md-sm
16px  -- md
24px  -- lg
32px  -- xl
48px  -- 2xl
64px  -- 3xl (entre secciones mayores)
96px  -- 4xl (padding de hero)
128px -- 5xl (quiebres de sección)
```

### Border Radius

```
0px   -- none (sharp, technical)
6px   -- small (cards, inputs)
8px   -- medium (buttons)
12px  -- large (modals, feature cards)
16px  -- xl (hero cards)
9999px -- pill (CTAs, badges)
```

### Sombras (Estilo 2026)

```css
/* Card shadow: inset hairline + stacked offsets */
.card {
  box-shadow: 
    inset 0 0 0 1px rgba(0,0,0,0.08),  /* Hairline border */
    0 2px 4px rgba(0,0,0,0.04),         /* Near shadow */
    0 8px 16px rgba(0,0,0,0.06);        /* Far shadow */
}
```

## Responsive Design

### Breakpoints por Defecto

| Prefijo | Min Width | Dispositivos |
|---------|-----------|--------------|
| `sm` | 40rem (640px) | Smartphones landscape |
| `md` | 48rem (768px) | Tablets |
| `lg` | 64rem (1024px) | Laptops |
| `xl` | 80rem (1280px) | Monitores |
| `2xl` | 96rem (1536px) | Monitores grandes |

### Patrón Mobile-First

```html
<!-- MAL: sm:text-center solo funciona en 640px+ -->
<div class="sm:text-center"></div>

<!-- BIEN: text-center para mobile, sm:text-left para mayores -->
<div class="text-center sm:text-left"></div>
```

### Container Queries (Primera Clase en v4)

```html
<!-- Padre se marca como contenedor -->
<div class="@container">
  <!-- Hijos responden al tamaño del contenedor -->
  <div class="flex flex-col @md:flex-row @lg:grid-cols-4">
    ...
  </div>
</div>
```

## Dark Mode

### Implementación con Clase

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

```html
<html class="dark">
  <body>
    <div class="bg-white dark:bg-black">...</div>
  </body>
</html>
```

### Tokens de Color para Dark Mode

```html
<div class="bg-surface text-text border border-border-default">
  ...
</div>
```

```css
.dark {
  --color-surface: var(--color-gray-900);
  --color-surface-elevated: var(--color-gray-800);
  --color-text: var(--color-gray-50);
  --color-text-muted: var(--color-gray-400);
  --color-border-default: var(--color-gray-700);
}
```

## Animaciones y Transiciones

### Utilidades de Transición

```html
<div class="transition-all duration-300 ease-in-out hover:scale-105">
  ...
</div>
```

### @starting-style para Enter/Exit (Nuevo en v4)

```html
<div popover class="transition-discrete starting:open:opacity-0">
  Contenido que aparece con fade
</div>
```

### Convenciones de Animación

- Definir curvas (ease-in, ease-out, spring) y duraciones. Usar consistentemente.
- NUNCA usar defaults del navegador para transiciones visibles.
- Solo `transform` y `opacity` para CSS animations (nunca `top`, `left`, `width`, `margin`).
- Elementos que animan entran desde una dirección lógica.
- Respetar `prefers-reduced-motion`.
- Reveals escalonados a 100-150ms de intervalo.
- Duración percibida <100ms para micro-interacciones.

## Componentes de Estilo

### Capa de Componentes

```css
@layer components {
  .card {
    background-color: var(--color-white);
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    box-shadow: var(--shadow-xl);
  }
}
```

### Utilidades Personalizadas

```css
@utility content-auto {
  content-visibility: auto;
}

@utility scrollbar-hidden {
  &::-webkit-scrollbar { display: none; }
}
```

## Orden de Utilidades (Convención)

Cuando se escriben listas largas de clases, seguir un orden consistente:

1. Layout: `flex`, `grid`, `block`, `container`
2. Posicionamiento: `relative`, `absolute`, `fixed`, `sticky`
3. Box model: `w-*`, `h-*`, `p-*`, `m-*`
4. Tipografía: `font-*`, `text-*`, `leading-*`
5. Visual: `bg-*`, `border-*`, `rounded-*`, `shadow-*`
6. Interactivo: `cursor-*`, `select-*`
7. Transiciones: `transition-*`, `duration-*`
8. Responsive: `sm:`, `md:`, `lg:`
9. Estados: `hover:`, `focus:`, `active:`, `dark:`

Ejemplo:
```html
<div class="
  flex flex-col items-center gap-4
  w-full max-w-md mx-auto p-6
  bg-white dark:bg-gray-900 rounded-xl shadow-lg
  transition-all duration-200
  md:flex-row md:items-start md:gap-8
  hover:shadow-xl
">
```

## Rendimiento

### Características de Rendimiento v4

| Métrica | v3.4 | v4 | Mejora |
|---------|------|-----|--------|
| Build completo | 378ms | 100ms | 3.78x |
| Incremental (nuevo CSS) | 44ms | 5ms | 8.8x |
| Incremental (sin nuevo CSS) | 35ms | 192 microseg | 182x |

### Mejores Prácticas

- Usar Vite plugin (`@tailwindcss/vite`) en lugar de PostCSS cuando sea posible.
- Evitar `@theme static` a menos que se necesiten todas las variables siempre.
- Usar `@source` con moderación y solo para librerías externas no auto-detectadas.
- Mantener CSS en un solo punto de entrada `app.css`.

## Compatibilidad con v3

```css
/* Cargar config JS legacy */
@config "../../tailwind.config.js";

/* Cargar plugin JS legacy */
@plugin "@tailwindcss/typography";
```

## Referencia: Variables del Tema por Defecto

- **Fuentes:** `--font-sans`, `--font-serif`, `--font-mono`
- **Espaciado:** `--spacing: 0.25rem`
- **Breakpoints:** `--breakpoint-sm: 40rem` hasta `--breakpoint-2xl: 96rem`
- **Tamaños de texto:** `--text-xs: 0.75rem` hasta `--text-9xl: 8rem`
- **Pesos de fuente:** `--font-weight-thin: 100` hasta `--font-weight-black: 900`
- **Border radius:** `--radius-xs: 0.125rem` hasta `--radius-4xl: 2rem`
- **Sombras:** `--shadow-2xs` hasta `--shadow-2xl`
- **Blur:** `--blur-xs: 4px` hasta `--blur-3xl: 64px`
- **Animaciones:** `--animate-spin`, `--animate-ping`, `--animate-pulse`, `--animate-bounce`
