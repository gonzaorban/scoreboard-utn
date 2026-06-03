@AGENTS.md

# Copa de las Casas · Ingeniería y Calidad

Marcador de puntos por equipos ("casas" de Hogwarts) para la materia Ingeniería y
Calidad. Los **profesores** logueados otorgan/restan puntos y hacen ABM de equipos
y profesores; **estudiantes/visitantes** ven la tabla y el historial sin login
(solo lectura). Repo público — sin credenciales versionadas.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack). Ojo: ver `@AGENTS.md` —
  esta versión tiene cambios incompatibles con lo que ya conocés. Lee
  `node_modules/next/dist/docs/` antes de escribir código de Next.
- **Supabase** (Postgres + Auth email/password + RLS). Sin ORM: consultas con el
  query builder de `supabase-js`, tipos en [lib/database.types.ts](lib/database.types.ts).
- **Tailwind v4** + **shadcn/ui** (base "nova", construido sobre **Base UI**).
- Deploy en **Vercel** vía GitHub Actions. UI en **español**.

## Particularidades de Next.js 16 en este repo

- El "middleware" se llama [proxy.ts](proxy.ts) (raíz) y exporta `proxy()`, no
  `middleware()`. Solo refresca la sesión; no redirige.
- `cookies()` es **async** → por eso [createClient()](lib/supabase/server.ts) es
  `async` y se hace `await createClient()` en cada uso.
- Páginas/params/searchParams pueden ser asíncronos. Confirmá las firmas en los
  docs locales antes de asumir.

## Convenciones del proyecto

- **Imports** con alias `@/*` (mapeado a la raíz en [tsconfig.json](tsconfig.json)).
- **Mutaciones** siempre como **Server Actions** en [app/actions/](app/actions/),
  con `"use server"`. Devuelven `ActionResult` (`{ ok: true } | { ok: false; error }`),
  no lanzan al cliente. Tras mutar: `revalidatePath()` de las rutas afectadas.
- **Clientes Supabase** ([lib/supabase/](lib/supabase/)):
  - `server.ts` → `createClient()` para Server Components / Actions (usa anon key + RLS).
  - `client.ts` → cliente de navegador.
  - `proxy.ts` → refresco de sesión en el proxy.
  - `createServiceClient()` (service_role, salta RLS) **solo en servidor** y para
    tareas administrativas puntuales. Nunca exponer al cliente.
- **Auth/roles** centralizados en [lib/auth.ts](lib/auth.ts): `getCurrentTeacher()`
  (devuelve solo profesores **approved**) y `getCurrentUserStatus()`
  (`anon` | `pending` | `approved`). Usá estos en vez de consultar `teachers` a mano.
- **Componentes shadcn/ui** ([components/ui/](components/ui/)) usan **Base UI**, no
  Radix. La prop para componer es `render`, **no `asChild`**. Estilos con `cva` +
  `cn()`. Iconos: `lucide-react`. Toasts: `sonner`.
- Sin tests, sin realtime: la UI se refresca al recargar (botón "↻ Actualizar").

## Modelo de seguridad (importante)

- La defensa real es **RLS en la base**: la anon key del navegador solo permite
  **leer** equipos/historial/nombres de profesores. Por eso el marcador es público.
- Validá el rol en la Server Action (con `getCurrentTeacher()`) **y** dejá que RLS
  lo refuerce. No confíes solo en la capa de app.
- Mutar puntaje va por la **RPC atómica `update_score`** (actualiza el puntaje e
  inserta en `score_changes` en una transacción). No actualices `teams.points`
  directamente.
- Aprobar/rechazar/dar de baja profesores pasa por funciones `security definer`;
  el auto-registro solo permite crear la **propia** solicitud en estado `pending`.
- El esquema vive en [supabase/migrations/](supabase/migrations/) (0001 → 0003);
  aplicalas en orden. Tras tocar el esquema, regenerá
  [lib/database.types.ts](lib/database.types.ts).

## Comandos

- `npm run dev` — desarrollo (Turbopack).
- `npm run build` / `npm start` — build de producción / servir.
- `npm run lint` — ESLint.

CI ([.github/workflows/](.github/workflows/)): `ci.yml` corre lint+build en cada
push/PR; `deploy.yml` despliega a Vercel. Las env vars de runtime
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) van en Vercel/Secrets,
nunca en el repo.
