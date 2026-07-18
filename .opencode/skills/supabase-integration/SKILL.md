---
name: supabase-integration
description: Guía completa de integración con Supabase para Next.js. Incluye autenticación, RLS, Storage, Edge Functions, TypeScript, y mejores prácticas de seguridad.
license: MIT
compatibility: opencode
metadata:
  stack: supabase
  version: "2024+"
  audience: backend, frontend
---

# Supabase + Next.js - Guía de Integración

## Instalación

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**CRÍTICO:** Usar `@supabase/ssr`, NO el deprecado `@supabase/auth-helpers-nextjs`.

## Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # NUNCA exponer al cliente
```

## Setup de Clientes

### Cliente Browser (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Cliente Server (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Llamado desde Server Component - no se pueden setear cookies
          }
        },
      },
    }
  )
}
```

### Cliente Admin (`lib/supabase/admin.ts`)

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
```

- Saltan TODAS las políticas RLS
- **NUNCA importar en archivos accesibles por componentes del cliente**
- Agregar `import 'server-only'` para prevenir imports accidentales

### Cliente Middleware (`lib/supabase/middleware.ts`)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: getUser() valida el JWT - NUNCA usar getSession() aquí
  const { data: { user } } = await supabase.auth.getUser()

  return supabaseResponse
}
```

### Reglas Arquitectónicas

| Regla | Por qué |
|-------|---------|
| Nunca crear clientes en scope de módulo | Cachean cookies del primer request |
| Siempre crear clientes dentro de la función | Cada request necesita cookies frescas |
| Usar `getUser()` no `getSession()` en servidor | `getUser()` valida JWT contra Supabase |
| Usar `getClaims()` como primera opción | Verifica JWT localmente (rápido) |

## Autenticación

### Email + Password (Server Actions)

```typescript
// app/auth/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: { full_name: formData.get('name') as string },
    },
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message }
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

### OAuth (Google, GitHub)

```typescript
export async function signInWithGitHub() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })
  if (error) return { error: error.message }
  if (data.url) redirect(data.url)
}
```

### Callback Handler

```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

**Seguridad:** Validar el parámetro `next` para prevenir open-redirects:
```typescript
const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'
```

### Middleware de Protección de Rutas

```typescript
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Row Level Security (RLS)

### Reglas Fundamentales

1. RLS está **deshabilitado por defecto** en tablas creadas vía SQL/migraciones
2. Sin RLS, cualquiera con la anon key puede leer/escribir todo
3. Habilitar RLS sin políticas = denegar todo acceso
4. **Probar políticas desde el SDK del cliente, NO del SQL Editor**

### Patrones Esenciales de RLS

#### Propiedad de Usuario (Más Común)

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuarios solo ven su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Usuarios actualizan su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);
```

**CRÍTICO:** Envolver `auth.uid()` en `(SELECT ...)` - esto causa que Postgres lo evalúe una vez por sentencia en lugar de una vez por fila.

#### Aislamiento Multi-Tenant (SaaS)

```sql
-- Función SECURITY DEFINER para evitar dependencia circular
CREATE OR REPLACE FUNCTION public.is_workspace_member(w_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = w_id AND user_id = (SELECT auth.uid())
  );
$$;

-- Políticas de tenant
CREATE POLICY "projects_select_member"
  ON public.projects FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));
```

#### Control de Acceso Basado en Roles (RBAC)

```sql
-- Guardar rol en JWT via Custom Access Token Hook (app_metadata)
CREATE POLICY "Admin sees all, users see themselves"
  ON sensitive_table FOR SELECT TO authenticated
  USING (
    (SELECT auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR user_id = (SELECT auth.uid())
  );
```

**NUNCA usar `raw_user_meta_data` para autorización** - los usuarios pueden modificarlo.

### Optimización de RLS

| Optimización | Impacto |
|--------------|---------|
| Envolver `auth.uid()` en `(SELECT ...)` | 100-1000x más rápido en tablas grandes |
| Indexar todas las columnas usadas en políticas | Previene sequential scans |
| Usar `TO authenticated` explícitamente | ~99.78% más rápido para usuarios anónimos |
| Funciones SECURITY DEFINER para checks complejos | Evita subqueries por fila |

## Diseño de Base de Datos

### Schema SaaS Core

```sql
-- Perfiles de usuario (extiende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizaciones/Workspaces (multi-tenant)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membresía de workspace
CREATE TABLE workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Indexar Todas las Foreign Keys

```sql
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
```

## Storage

### Patrón de Upload Seguro (Server Action)

```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const UploadSchema = z.object({
  fileName: z.string().max(255),
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp']),
  size: z.number().max(5 * 1024 * 1024), // 5MB
})

export async function uploadAvatar(file: File) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const filePath = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`

  const { error } = await supabaseAdmin.storage
    .from('avatars')
    .upload(filePath, file, { contentType: file.type, upsert: true })

  if (error) return { error: error.message }
  return { path: filePath }
}
```

### Storage RLS Policies

```sql
-- Usuarios leen sus propios archivos
CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (SELECT auth.uid())::text = (storage.foldername(name))[1]);

-- Usuarios suben a su propia carpeta
CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );
```

## TypeScript

### Generar Tipos

```bash
# Desde base de datos remota
npx supabase gen types typescript --project-id YOUR_REF > lib/database.types.ts

# Desde base de datos local
npx supabase gen types typescript --local > lib/database.types.ts
```

### Clientes Tipados

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Tipos Helper

```typescript
// types/index.ts
import type { Database } from './database.types'

export type Post = Database['public']['Tables']['posts']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']
```

### Validación con Zod

```typescript
import { z } from 'zod'

export const PostSchema = z.object({
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(5000),
  published: z.boolean().default(false),
})

export type PostInput = z.infer<typeof PostSchema>
```

## Checklist de Seguridad

### Crítico (Blockers de Deploy)

- [ ] No service role key en código del cliente o `NEXT_PUBLIC_`
- [ ] RLS habilitado en TODAS las tablas con datos de usuario
- [ ] Todas las políticas RLS validadas con test de acceso denegado
- [ ] No políticas usando `auth.jwt() -> 'user_metadata'` para autorización
- [ ] Buckets de storage privados verificados con test 403
- [ ] No secrets hardcodeados en archivos de migración
- [ ] `.env` confirmados ausentes del historial de git

### Alta Prioridad

- [ ] Funciones RPC con scope mínimo de roles
- [ ] Cada función `SECURITY DEFINER` incluye `SET search_path = ''`
- [ ] Edge functions validan Authorization header antes de procesar
- [ ] Políticas UPDATE incluyen ambas cláusulas USING y WITH CHECK
- [ ] Confirmación de email habilitada en Auth settings
- [ ] OTP expiry configurado a 3600 segundos o menor

## Checklist de Autenticación

- [ ] Email confirmation habilitado en producción
- [ ] OTP expiry a 3600 segundos o menor
- [ ] Todas las API routes llaman `getUser()` no `getSession()`
- [ ] `service_role` key nunca expuesta en código del cliente
- [ ] URLs de redirect limitadas a tus dominios en Supabase Dashboard
- [ ] Contraseña mínima de 8+ caracteres (preferible 12+)
- [ ] SMTP personalizado configurado para emails de producción

## Anti-Patrones Comunes

| Anti-Patrón | Consecuencia | Solución |
|-------------|--------------|----------|
| No RLS en tabla | Acceso público total | Habilitar RLS en TODAS las tablas |
| UPDATE sin SELECT policy | Retorna 0 rows silenciosamente | Siempre agregar SELECT policy |
| Sin WITH CHECK en INSERT/UPDATE | Usuarios pueden escribir filas que no pueden leer | Siempre emparejar USING + WITH CHECK |
| No index en columna de RLS | Degradación 100x+ | Indexar cada columna en USING |
| Probar en SQL Editor | RLS bypaseado (ejecuta como postgres) | Probar con SDK del cliente |
| Usar `user_metadata` para auth | Usuarios pueden auto-elevar privilegios | Usar solo `app_metadata` |
| No envolver `auth.uid()` en SELECT | 100x+ diferencia de rendimiento | Envolver en `(SELECT ...)` |
