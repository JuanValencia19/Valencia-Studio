---
name: nextjs-app-router
description: Guía completa de desarrollo con Next.js 14+ App Router. Incluye Server Components, layouts, data fetching, Server Actions, middleware, y mejores prácticas de arquitectura.
license: MIT
compatibility: opencode
metadata:
  stack: nextjs
  version: "14+"
  audience: frontend, backend
---

# Next.js App Router - Guía de Desarrollo

## Convenciones de Archivos

| Archivo | Propósito | Requerido |
|---------|-----------|-----------|
| `page.tsx` | UI de la ruta (hace la URL pública) | Sí (rutas públicas) |
| `layout.tsx` | Wrapper compartido, persiste entre navegaciones | Requerido en root |
| `loading.tsx` | Límite automático de Suspense mientras carga datos | No |
| `error.tsx` | Error boundary del segmento (debe ser Client Component) | No |
| `not-found.tsx` | UI 404 personalizada del segmento | No |
| `route.ts` | Endpoint API (sin UI) | No |
| `template.tsx` | Como layout pero se remonta en cada navegación | No |

## Estructura de Proyecto Recomendada

```
app/
  (marketing)/              # Route group - invisible en URL
    layout.tsx              # Shell de marketing (nav + footer)
    page.tsx                # /
    pricing/page.tsx        # /pricing
  (app)/                    # Route group - invisible en URL
    layout.tsx              # Shell autenticado (sidebar)
    dashboard/
      page.tsx              # /dashboard
      loading.tsx           # Streaming skeleton
      components/           # Componentes localizados del dashboard
      lib/                  # Utilidades localizadas
    settings/page.tsx       # /settings
  (auth)/
    layout.tsx              # Layout mínimo centrado
    login/page.tsx          # /login
  api/
    posts/route.ts          # /api/posts endpoint
  layout.tsx                # Root layout (requerido)
  page.tsx                  # Homepage /
  globals.css
```

**Reglas clave:**
- Carpetas sin `page.tsx` NO son rutas - solo organizan código
- Usar carpetas con prefijo `_` (`_components/`, `_lib/`) para código ignorado por el router
- Route groups `(groupName)` organizan sin afectar la URL
- Colocar todo lo relacionado con una ruta dentro de su carpeta

## Server Components vs Client Components

**Regla fundamental:** Cada componente en App Router es Server Component por defecto. Agregar `'use client'` SOLO cuando el componente realmente necesita características del navegador.

### Cuándo usar Server Components

| Caso de Uso | Ejemplo |
|-------------|---------|
| Data fetching de BD o API | `const posts = await db.post.findMany()` |
| Leer variables de entorno del servidor | API keys, database URLs |
| Renderizar contenido estático/SEO | Páginas de marketing, blog |
| Grandes dependencias | Parsers markdown, syntax highlighters |
| Acceder a recursos del backend | File system, bases de datos |
| Reducir bundle del cliente | UI no interactiva |

### Cuándo usar Client Components (los 6 triggers)

| Trigger | Ejemplo |
|---------|---------|
| State management | `useState`, `useReducer` |
| Effects | `useEffect`, `useLayoutEffect` |
| Refs (acceso al DOM) | `useRef` |
| Event handlers | `onClick`, `onChange`, `onSubmit` |
| APIs solo del navegador | `window`, `localStorage`, `IntersectionObserver` |
| Librerías de terceros que necesitan navegador | Framer Motion, algunas chart libraries |

### Patrón "Server Shell, Client Islands"

```tsx
// app/dashboard/page.tsx - Server Component (NO 'use client')
import { getMetrics } from "@/lib/metrics";
import { MetricCard } from "@/components/metric-card";       // Server Component
import { ExportButton } from "@/components/export-button";   // 'use client'
import { ChartWidget } from "@/components/chart-widget";     // 'use client'

export default async function DashboardPage() {
  const metrics = await getMetrics(); // Llamada directa a BD
  return (
    <div>
      <MetricCard data={metrics} />     {/* server rendered */}
      <ExportButton data={metrics} />   {/* client island */}
      <ChartWidget data={metrics} />    {/* client island */}
    </div>
  );
}
```

### Patrón de Context Providers

```tsx
// components/providers.tsx - 'use client'
'use client'
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}

// app/layout.tsx - Server Component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Reglas críticas:**
- `'use client'` es una declaración de límite, no un toggle por archivo
- Empujar `'use client'` lo más abajo posible en el árbol
- Props de Server a Client Components deben ser serializables
- Usar paquete `server-only` para prevenir imports accidentales del cliente

## Layouts y Rutas Anidadas

**Los layouts persisten entre navegaciones** - NO se re-renderizan al navegar entre páginas hermanas.

### Root Layout (Requerido)

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | Valencia Studio', default: 'Valencia Studio' },
  description: 'AI-powered landing page builder',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Route Groups para Layouts Diferentes

```tsx
// app/(marketing)/layout.tsx - shell público de marketing
export default function MarketingLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

// app/(app)/layout.tsx - shell autenticado
export default async function AppLayout({ children }) {
  const session = await auth();
  if (!session) redirect('/login');
  return (
    <div className="flex">
      <Sidebar user={session.user} />
      <main>{children}</main>
    </div>
  );
}
```

### Segmentos Dinámicos

| Patrón | Coincide | Ejemplo |
|--------|----------|---------|
| `[slug]` | Un segmento dinámico | `/blog/my-post` |
| `[...slug]` | Segmentos catch-all | `/docs/a/b/c` |
| `[[...slug]]` | Catch-all opcional | `/docs` y `/docs/a/b/c` |

## Loading y Error States

### loading.tsx - Límite Automático de Suspense

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-4" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-200 rounded" />
        ))}
      </div>
    </div>
  );
}
```

### error.tsx (DEBE ser Client Component)

```tsx
// app/dashboard/error.tsx
'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong loading the dashboard.</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## Data Fetching Patterns

### Server Component Direct Fetching (Preferido para reads)

```tsx
// app/posts/page.tsx - Server Component
import { db } from '@/lib/db'

export default async function PostsPage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  return <PostList posts={posts} />;
}
```

### Parallel Data Fetching (Prevenir Waterfalls)

```tsx
// MAL - Sequential waterfall
export default async function ProfilePage({ params }) {
  const user = await getUser(params.id);           // Esperar...
  const posts = await getUserPosts(params.id);     // Luego esperar...
  const followers = await getFollowers(params.id); // Luego esperar...
  // Total: SUMA de todas las duraciones
}

// BIEN - Parallel
export default async function ProfilePage({ params }) {
  const { id } = await params;
  const [user, posts, followers] = await Promise.all([
    getUser(id),
    getUserPosts(id),
    getFollowers(id),
  ]);
  // Total: MAX de las tres duraciones
}
```

### Server Actions (Preferido para mutations)

```tsx
// app/actions/posts.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';

const PostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
});

export async function createPost(prevState: any, formData: FormData) {
  const parsed = PostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db.post.create({ data: parsed.data });
  revalidatePath('/posts');
  return { success: true };
}
```

### Route Handlers (API Routes)

```tsx
// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const posts = await db.post.findMany();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const post = await db.post.create({ data: parsed.data });
  return NextResponse.json(post, { status: 201 });
}
```

### Caching Control para Fetch

| Estrategia | Código | Caso de Uso |
|------------|--------|-------------|
| Sin caché | `fetch(url, { cache: 'no-store' })` | Dashboard, datos de usuario |
| Revalidación por tiempo | `fetch(url, { next: { revalidate: 60 } })` | Contenido semi-dinámico |
| Revalidación por tag | `fetch(url, { next: { tags: ['posts'] } })` | Datos invalidados por mutations |
| Estático (por defecto) | `fetch(url)` | Contenido que rara vez cambia |

## Metadata y SEO

### Metadata Estática

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
  title: { template: '%s | Valencia Studio', default: 'Valencia Studio' },
  description: 'AI-powered landing page builder for local businesses',
}
```

### Metadata Dinámica con generateMetadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: 'Post Not Found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
    },
  }
}
```

## Middleware

```tsx
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/pricing', '/blog'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Verificación de sesión - solo cookies/JWT, NO llamadas a BD
  const session = request.cookies.get('session')?.value;
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
```

**Reglas de Middleware:**
- Mantener LEAN - solo verificación de sesión y redirects
- Middleware ejecuta en CADA request - lógica pesada agrega latencia
- NO hacer llamadas a BD en middleware
- Siempre excluir assets estáticos del matcher

## Anti-Patrones Comunes

| Anti-Patrón | Problema | Solución |
|-------------|----------|----------|
| Envolver todo en `'use client'` | Pierde beneficios de Server Components | Usar 'use client' solo en componentes hoja |
| Data fetching secuencial | Waterfalls lentos | Usar `Promise.all` |
| No awaits params en Next.js 15+ | params es Promise | `const { slug } = await params` |
| Context Provider sin `'use client'` | Error en Server Component | Extraer Provider a Client Component |
| `redirect()` dentro de try/catch | catch bloquea el redirect | Redirect después de try/catch |
| `error.tsx` sin `'use client'` | error.tsx DEBE ser Client Component | Agregar `'use client'` |
| Secrets en `NEXT_PUBLIC_` | Expostos al cliente | Sin prefijo, solo servidor |

## Checklist de Producción

- [ ] Server Components por defecto - auditar cada `'use client'`
- [ ] Suspense boundaries en cada dependencia de datos lenta
- [ ] `Promise.all` para todos los data fetches independientes
- [ ] Cada `fetch` tiene valor explícito de `revalidate` o cache tag
- [ ] `generateMetadata` en cada página dinámica
- [ ] `metadataBase` configurado en root layout
- [ ] Server Actions validan inputs con Zod
- [ ] Auth checks en middleware Y en cada Server Action/Route Handler
- [ ] `error.tsx` tiene `'use client'`
- [ ] No secrets en variables de entorno `NEXT_PUBLIC_`
- [ ] `redirect()` NO está dentro de try/catch

## Referencia Rápida: Cuándo Usar Qué

| Escenario | Solución |
|-----------|----------|
| Mostrar datos de BD | Server Component con `async/await` |
| Envío de formularios | Server Action con `useActionState` |
| API externa / webhook | Route Handler |
| Widget interactivo (dropdown, modal, form) | Client Component (`'use client'`) |
| Layout compartido de página | `layout.tsx` (persiste entre navegaciones) |
| Estado de carga para ruta | `loading.tsx` o `<Suspense>` |
| Error boundary | `error.tsx` (Client Component) |
| Página 404 | `not-found.tsx` o función `notFound()` |
| Metadata SEO | export `metadata` o `generateMetadata` |
| Protección de rutas | Middleware + Data Access Layer |
| Datos en tiempo real | Client Component con `useEffect` + WebSocket/SSE |
| Mutaciones desde UI | Server Action |
| Invalidación de caché | `revalidatePath()` o `revalidateTag()` |
