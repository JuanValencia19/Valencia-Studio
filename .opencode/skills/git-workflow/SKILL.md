---
name: git-workflow
description: Guía de flujo de trabajo con Git para equipos de desarrollo. Incluye branching strategies, conventional commits, pull requests, code review, y automatización.
license: MIT
compatibility: opencode
metadata:
  stack: git
  audience: all
---

# Git Workflow - Guía para Equipos

## Branching Strategy

### GitHub Flow (Recomendado para Valencia Studio)

Flujo simple y directo para equipos pequeños:

```
main (producción)
  |
  +-- feature/landing-page-builder
  |
  +-- fix/mobile-responsive-hero
  |
  +-- chore/update-dependencies
```

**Reglas:**
1. `main` siempre está deployable
2. Todo el trabajo se hace en branches descriptivos
3. Los PRs son la unidad de revisión
4. Merge a `main` = deploy automático

### Nombres de Branch

```
feature/descripcion-corta
fix/descripcion-corta
chore/descripcion-corta
docs/descripcion-corta
refactor/descripcion-corta
```

**Ejemplos:**
```
feature/ai-landing-generator
fix/mobile-hero-overflow
chore/update-tailwind-v4
docs/api-documentation
refactor/auth-middleware
```

## Convenciones de Commit

### Formato: Conventional Commits

```
<tipo>(<alcance>): <descripción corta>

[cuerpo opcional con más detalles]

[footer opcional con referencias a issues]
```

### Tipos Permitidos

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add Google OAuth login` |
| `fix` | Corrección de bug | `fix(landing): correct mobile layout` |
| `refactor` | Refactorización sin cambio | `refactor(components): extract Button` |
| `style` | Cambios de estilo/formato | `style(ui): update color palette` |
| `docs` | Documentación | `docs: add API documentation` |
| `test` | Tests | `test(auth): add login unit tests` |
| `chore` | Tareas de mantenimiento | `chore: update dependencies` |
| `perf` | Mejoras de rendimiento | `perf(images): implement lazy loading` |
| `ci` | Integración continua | `ci: add GitHub Actions workflow` |
| `build` | Build system | `build: configure Vercel deployment` |

### Reglas de Commit

1. **Descripción en inglés**, concisa (máximo 50 caracteres)
2. **Usar imperativo** ("add feature" no "added feature")
3. **No terminar con punto**
4. **Alcance en minúsculas** entre paréntesis
5. **Referenciar issue** si existe: `Closes #123`

### Ejemplos Válidos

```
feat(editor): implement drag-and-drop landing builder

fix(auth): handle expired session tokens

refactor(projects): simplify project listing logic

style(dashboard): improve responsive breakpoints

chore: configure Supabase local development

perf(images): add Next.js Image optimization

docs(readme): add project setup instructions

test(api): add endpoint validation tests
```

### Template de Commit para Tareas

```
<tipo>(<area>): <descripción de la tarea completada>

- Qué se hizo
- Por qué se hizo
- Archivos principales afectados
```

## Pull Requests

### Título del PR

Seguir las mismas convenciones de commit:
```
feat(auth): implement Google OAuth login flow
```

### Template de PR Description

```markdown
## Descripción
Breve descripción de los cambios.

## Tipo de Cambio
- [ ] Nueva funcionalidad (feat)
- [ ] Corrección de bug (fix)
- [ ] Refactorización (refactor)
- [ ] Documentación (docs)
- [ ] Otro: ___

## Cambios
- Cambio 1
- Cambio 2
- Cambio 3

## Testing
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Testing manual realizado
- [ ] Probado en mobile

## Screenshots (si aplica)
[Add screenshots here]

## Checklist
- [ ] Código sigue convenciones del proyecto
- [ ] No hay código duplicado
- [ ] Funcionalidad es mantenible
- [ ] No hay secrets expuestos
- [ ] Documentación actualizada si es necesario
```

### Buenas Prácticas para PRs

1. **PRs pequeños** - Idealmente <400 líneas de diff
2. **Un feature por PR** - No mezclar funcionalidades
3. **Título descriptivo** - Que explique el "qué" y "por qué"
4. **Descripción completa** - Incluir contexto, testing, screenshots
5. **Branch actualizado** - Rebasar o merge antes de pedir review

## Code Review

### Checklist del Reviewer

**Funcionalidad:**
- [ ] El código hace lo que dice el PR
- [ ] Maneja casos borde correctamente
- [ ] Los tests cubren los escenarios principales

**Código:**
- [ ] Código es legible y mantenible
- [ ] No hay código duplicado
- [ ] Nombres descriptivos
- [ ] Funciones pequeñas y enfocadas
- [ ] Complejidad adecuada

**Seguridad:**
- [ ] No hay secrets expuestos
- [ ] Validación de inputs
- [ ] Autenticación/autorización correcta
- [ ] No hay vulnerabilidades obvias

**Performance:**
- [ ] No hay N+1 queries
- [ ] Imágenes optimizadas
- [ ] No hay memory leaks obvios
- [ ] Caching implementado donde es necesario

**Estilo:**
- [ ] Sigue convenciones del proyecto
- [ ] Formato consistente
- [ ] No hay console.logs innecesarios

### Comentarios de Review

**Hacer:**
- Ser específico y constructivo
- Explicar el "por qué" detrás del feedback
- Sugerir alternativas cuando sea posible
- Reconocer lo bueno

**Evitar:**
- Comentarios vagos ("esto se ve mal")
- Stilo personal como requerimiento
- Bloquear por preferencias menores
- Revisar solo el código, no la lógica

### Ejemplos de Buenos Comentarios

```
// MAL: "This is wrong"
// BIEN: "This could cause a race condition if two users submit at the same time. 
//        Consider using a database transaction or optimistic locking."

// MAL: "Change this"
// BIEN: "We could extract this into a reusable function to avoid duplication 
//        with the similar logic in UserProfile.tsx"
```

## Git Hooks y Automación

### Husky (Git Hooks)

```bash
npm install -D husky
npx husky init
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run lint
npm run typecheck
```

### Commit-msg Hook

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

### Commitlint Config

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 
      'perf', 'test', 'chore', 'ci', 'build'
    ]],
    'subject-max-length': [2, 'always', 50],
    'body-max-line-length': [1, 'always', 100],
  },
};
```

## Merge vs Rebase

### Regla General

- **Feature branches → main:** Merge (preserva historial)
- **Actualizar feature branch con main:** Rebase (historial limpio)

### Merge (Para integrar features)

```bash
git checkout main
git merge feature/landing-builder
git push origin main
```

### Rebase (Para mantener branch actualizado)

```bash
git checkout feature/landing-builder
git rebase main
# Resolver conflictos si los hay
git push origin feature/landing-builder --force-with-lease
```

### Cuando Usar Cada Uno

| Escenario | Comando | Por qué |
|-----------|---------|---------|
| Integrar feature a main | `merge` | Preserva contexto del feature |
| Actualizar feature con main | `rebase` | Historial lineal y limpio |
| Compartir WIP con equipo | `push` | Sin rebase/merge |
| Limpiar commits antes de merge | `rebase -i` | Squash commits relacionados |

### Squash Commits (Antes de Merge)

```bash
# Si un feature tiene muchos commits WIP
git rebase -i main

# En el editor, cambiar "pick" a "squash" para commits que quieres combinar
pick abc1234 feat: initial implementation
squash def5678 fix: typo in component
squash ghi9012 fix: another small fix

# Resultado: un solo commit limpio
```

## Flujo de Trabajo Diario

### Empezar el Día

```bash
# 1. Actualizar main
git checkout main
git pull origin main

# 2. Crear o actualizar feature branch
git checkout feature/my-feature
git rebase main

# 3. Iniciar servidor de desarrollo
npm run dev
```

### Durante el Desarrollo

```bash
# Hacer cambios frecuentes con commits pequeños
git add .
git commit -m "feat(dashboard): add metrics cards"

# Push regularmente
git push origin feature/my-feature
```

### Terminar una Tarea

```bash
# 1. Asegurar que todo está commiteado
git status

# 2. Actualizar con main
git rebase main

# 3. Push final
git push origin feature/my-feature

# 4. Crear PR en GitHub
# 5. Pedir review
# 6. Address feedback
# 7. Merge cuando esté aprobado
```

## Resolución de Conflictos

### Estrategia

1. **Entender ambos lados** - No acceptar ciegamente
2. **Comunicarse** - Si el conflicto es complejo, hablar con el autor
3. **Probar después** - Asegurar que todo funciona
4. **Commit limpio** - Un commit que resuelva el conflicto

### Comandos Útiles

```bash
# Ver conflictos
git status

# Editor de merge visual
git mergetool

# Continuar después de resolver
git add .
git rebase --continue  # o git merge --continue

# Abortar si es necesario
git rebase --abort
```

## Branch Protection en GitHub

### Configuración Recomendada

1. Ir a Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Configurar:
   - [x] Require a pull request before merging
   - [x] Require approvals (1 minimum)
   - [x] Require status checks to pass
   - [x] Require branches to be up to date
   - [ ] Require conversation resolution
   - [x] Require linear history (optional, enforce squash merge)

### Status Checks Recomendados

- `lint-and-test` (de GitHub Actions)
- `type-check`
- `build` (optional but recommended)

## Comandos Git Útiles

### Diarios

```bash
git status                    # Ver estado
git diff                      # Ver cambios sin staging
git diff --staged             # Ver cambios staged
git log --oneline -10         # Ver últimos 10 commits
git stash                     # Guardar cambios temporalmente
git stash pop                 # Recuperar cambios stash
```

### Útiles

```bash
git log --graph --oneline     # Ver historial gráfico
git blame archivo.ts          # Ver quién cambió qué línea
git bisect start              # Encontrar commit que causó bug
git cherry-pick <commit>      # Copiar commit específico a branch actual
```

### Recuperación

```bash
git reflog                    # Ver historial de acciones
git reset --soft HEAD~1       # Deshacer último commit (mantener cambios)
git reset --hard HEAD~1       # Deshacer último commit (descartar cambios)
git checkout -- archivo.ts    # Descargar cambios en archivo específico
```

## Checklist Pre-Merge

- [ ] Todos los tests pasando
- [ ] Lint sin errores
- [ ] Type check sin errores
- [ ] Build exitoso
- [ ] Changes probados manualmente
- [ ] No hay console.logs innecesarios
- [ ] No hay secrets hardcodeados
- [ ] Documentación actualizada (si aplica)
- [ ] PR description completa
- [ ] Review aprobado
- [ ] Branch actualizado con main
