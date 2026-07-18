---
name: deploy-vercel
description: Guía de deploy y configuración en Vercel para proyectos Next.js. Incluye setup, dominios, variables de entorno, preview deployments, monitoreo, y optimización de costos.
license: MIT
compatibility: opencode
metadata:
  stack: vercel,nextjs
  audience: devops, backend
---

# Vercel Deployment - Guía Completa

## Setup del Proyecto

### Inicialización

```bash
# Opción A: CLI
npm install -g vercel
vercel          # Desde raíz del proyecto, seguir prompts
vercel --prod   # Deploy a producción

# Opción B: Dashboard
# ir a vercel.com -> Import Project -> Seleccionar repo de GitHub -> Deploy
```

Vercel auto-detecta Next.js y configura build settings automáticamente.

### Configuración `next.config.ts` para Producción

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Redirect de URL de Vercel a dominio custom
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "your-project-xxx.vercel.app" }],
        destination: "https://yourdomain.com/:path*",
        permanent: true,
      },
    ];
  },

  // Headers de rendimiento
  async headers() {
    return [
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Optimización de imágenes
  images: {
    deviceSizes: [320, 640, 768, 1024, 1280, 1536, 1920],
  },
};

export default nextConfig;
```

## Variables de Entorno

### Tres Scopes para Cada Variable

```bash
# Vía CLI
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production

# Vía Dashboard: Project -> Settings -> Environment Variables
```

### Template Recomendado

```env
# Solo servidor (SIN prefijo NEXT_PUBLIC_)
DATABASE_URL=postgresql://user:pass@host/db
DIRECT_URL=postgresql://user:pass@host/db
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://yourdomain.com
ANTHROPIC_API_KEY=sk-ant-xxx

# Cliente (requiere prefijo NEXT_PUBLIC_)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### Reglas

- `NEXT_PUBLIC_` = expuesto al navegador. NUNCA secrets con este prefijo.
- Sin prefijo = solo servidor (no visible en browser).
- `.local` **NUNCA se deploya** a Vercel.
- Preview deployments usan env vars de Production por defecto.

## Dominios Custom

### Setup Paso a Paso

1. **Vercel Dashboard** -> Project -> Settings -> Domains -> Add Domain
2. Ingresar dominio (ej: `valenciastudio.com`)
3. Desmarcar "Redirect to www" - apex como canonical es estándar 2026
4. Click "Edit" -> "Manual setup" para ver DNS records requeridos
5. Agregar records en tu proveedor DNS

### DNS Records

| Record Type | Host | Value | Propósito |
|-------------|------|-------|-----------|
| A | @ | `76.76.21.21` | Root domain (apex) |
| CNAME | www | `cname.vercel-dns.com` | www subdomain |

### Cloudflare

- Mantener proxy **OFF** (gray cloud) - Cloudflare proxy intercepta HTTPS.
- Cloudflare Registrar ofrece pricing at-cost con WHOIS privacy gratis.

### CLI Commands

```bash
vercel domains ls                     # Listar dominios
vercel domains add example.com        # Agregar dominio
vercel domains inspect example.com    # Verificar DNS
vercel dns add example.com '@' A 76.76.21.21   # Agregar DNS record
vercel certs ls                       # Verificar SSL
```

## Preview Deployments

### Cómo Funciona

- Cada push a branch y cada Pull Request genera una URL de preview única:
  ```
  https://your-project-git-feature-branch-yourteam.vercel.app
  ```
- El bot de Vercel postea un comentario en el PR con la URL.
- Preview deployments usan env vars de Production por defecto.

### Flujo de Trabajo DPS (Develop, Preview, Ship)

1. **Develop** - Escribir código localmente con `npm run dev`
2. **Preview** - Push a branch; Vercel crea preview deployment; compartir URL
3. **Ship** - Merge PR a `main`; Vercel automáticamente crea production deployment

### Rollback

Si un production deployment falla:
1. Vercel Dashboard -> Deployments -> encontrar el último funcional
2. Click "..." -> "Promote to Production"
3. Rollback completa en <60 segundos con zero downtime

## Performance en Vercel

### Image Optimization (Automático)

```tsx
import Image from "next/image";

// Vercel sirve WebP/AVIF optimizado desde CDN global automáticamente
<Image src="/hero.png" alt="Hero" width={800} height={600} priority />
```

### Font Optimization (Automático)

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
```

### Estrategias de Caché

```ts
// API route con edge caching
export async function GET() {
  const data = await fetchPublicData();
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

### Incremental Static Regeneration (ISR)

```tsx
// Revalidar cada 10 segundos sin redeploy
export default async function Page() {
  const res = await fetch("https://api.example.com/blog", {
    next: { revalidate: 10 },
  });
  const data = await res.json();
  return <main>{JSON.stringify(data, null, 2)}</main>;
}
```

### Dynamic Imports (Code Splitting)

```tsx
import dynamic from "next/dynamic";
const HeavyChart = dynamic(() => import("./HeavyChart"), { 
  loading: () => <p>Loading...</p> 
});
```

### Monitoreo de Performance

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

## Edge Functions y Middleware

### Edge Runtime para API Routes

```ts
// src/app/api/fast-route/route.ts
export const runtime = "edge";

export async function GET() {
  return Response.json({ status: "ok" });
}
```

**Cuándo usar Edge:** Auth checks, A/B testing, geo-routing, rate limiting.
**Cuándo NO usar Edge:** Rutas que necesitan Node.js completo (Prisma, bcrypt, file system).

### Middleware

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session-token");
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

## CI/CD con GitHub

### Pipeline Recomendado

```
PR Opened  ->  Lint + Type Check + Tests  ->  Vercel Preview  ->  E2E Tests  ->  Ready for Review
PR Merged  ->  Vercel Production Deployment (automático)
```

### GitHub Actions (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
```

### Prácticas Clave

- Ejecutar E2E tests contra el **preview deployment de Vercel**, no un servidor local
- Usar **Vercel OIDC** para deploys token-less desde GitHub Actions
- Configurar **branch protection** en `main`: requerir que todos los checks pasen
- Sincronizar versión de Node.js entre local, CI y Vercel (usar `.nvmrc`)

## Errores Comunes de Deploy

| Error | Causa | Solución |
|-------|-------|---------|
| Build falla "Module not found" | Case-sensitivity (macOS vs Linux) | Corregir paths de import al casing exacto |
| Prisma client no generado | Falta `prisma generate` en build | Agregar `prisma generate &&` antes de `next build` |
| Env vars no disponibles | `.local` no deployado a Vercel | Setear env vars en Vercel Dashboard |
| `NEXT_PUBLIC_` en secrets | Vars del cliente expuestas en browser bundle | Remover prefijo `NEXT_PUBLIC_` de secrets |
| SSL/TLS errors en dominio | Cloudflare proxy ON (orange cloud) | Configurar Cloudflare a DNS-only (gray cloud) |
| ERR_TOO_MANY_REDIRECTS | Proxy Cloudflare + conflicto SSL Vercel | Deshabilitar proxy Cloudflare |

## Optimización de Costos

### Recursos Facturables

1. **Bandwidth** - $0.15/GB después de 1TB en Pro
2. **Serverless Function Executions** - Por GB-seconds + invocaciones
3. **Build Minutes** - Por minuto de build time
4. **Edge Function Requests** - $2/millón después del límite

### Estrategias de Optimización

**a) Maximizar SSG e ISR:**
- Las páginas estáticas son gratis de servir (cacheadas en edge)
- Usar ISR (`next: { revalidate: 60 }`) en lugar de SSR puro

**b) Optimizar Serverless Functions:**
- Setear `maxDuration` solo en rutas que lo necesiten
- Evitar payloads grandes en respuestas

**c) Reducir Bandwidth:**
- Comprimir imágenes con `next/image` (WebP/AVIF automático)
- Headers `Cache-Control` agresivos
- Minimizar bundle de JavaScript

**d) Controlar Build Minutes:**
- Cachear `node_modules` y build cache `.next`
- Skipping builds innecesarios en cambios de documentación

### Escenarios de Costo Realistas

| Escenario | Costo Mensual |
|-----------|---------------|
| Side project (bajo tráfico, Hobby) | $0 |
| Small SaaS (1k usuarios, Pro) | ~$20-30/mo |
| Medium SaaS (10k usuarios, Pro) | ~$50-150/mo |
| High-traffic app (100k+ usuarios) | $500+/mo |

**Nota:** El plan Hobby es estrictamente para proyectos **personales, no comerciales**. Cualquier uso comercial **requiere Pro** ($20/user/mo).

## Checklist Post-Deploy

```
[ ] Testear aplicación live end-to-end
[ ] Dominio custom configurado y verificado
[ ] SSL certificate provisionado (automático)
[ ] NEXTAUTH_URL actualizado a dominio de producción
[ ] Sentry error tracking configurado
[ ] Vercel Analytics + Speed Insights habilitados
[ ] Stripe webhook endpoint seteado a URL de producción
[ ] Database migrations ejecutándose en deploy
[ ] Variables de entorno seteadas para Production, Preview, Development
[ ] 301 redirect de Vercel subdomain a dominio custom
[ ] Branch protection rules en branch main
[ ] CI pipeline pasando (lint, type-check, tests)
[ ] Spend limits configurados en Vercel Dashboard
[ ] Monitoring/alerting configurado (email, Slack, PagerDuty)
[ ] Backup strategy para base de datos
```
