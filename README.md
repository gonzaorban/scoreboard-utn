# 🪄 Copa de las Casas · Ingeniería y Calidad

Marcador de puntos para la materia **Ingeniería y Calidad**, con temática
**Harry Potter** (la "Copa de las Casas" de Hogwarts).

- **Profesores** (logueados) otorgan o restan puntos y administran los equipos.
- **Estudiantes / invitados** entran sin registrarse y ven, en solo lectura, la
  tabla de puntajes y el historial completo de cambios.

## Funcionalidades

- ✅ Tabla pública de equipos y puntajes (ranking con casas de Hogwarts).
- ✅ Historial público: quién (qué profesor), cuándo, de qué valor a qué valor y
  con qué motivo cambió cada puntaje.
- ✅ Botón **Guardar puntaje** que registra el cambio con fecha/hora de forma
  atómica (RPC `update_score`).
- ✅ ABM de equipos (crear, editar nombre/casa, eliminar) — solo profesores.
- ✅ Login de profesores con email + contraseña (Supabase Auth).
- ✅ Seguridad real con **RLS**: los invitados solo pueden leer.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Supabase](https://supabase.com) (Postgres + Auth + RLS) — free tier
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- Deploy en [Vercel](https://vercel.com)

No se usa ORM: las consultas van con `supabase-js` (query builder) y el tipado
sale de `lib/database.types.ts`.

---

## Puesta en marcha

### 1. Crear el proyecto Supabase

1. Crea un proyecto gratis en <https://supabase.com>.
2. En **Settings → API** copia la _Project URL_ y la _anon public key_.

### 2. Aplicar el esquema

Abre **SQL Editor** en el dashboard de Supabase y pega/ejecuta el contenido de
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). Esto
crea las tablas (`teachers`, `teams`, `score_changes`), las políticas RLS y las
funciones `is_teacher()` y `update_score()`.

> Si usas la Supabase CLI: `supabase db push` con el proyecto enlazado.

### 3. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
# SUPABASE_SERVICE_ROLE_KEY=...   # opcional, solo si automatizas alta de profesores
```

### 4. Instalar y correr

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

---

## Crear el primer profesor

No hay registro público de profesores (es intencional). Crea el primero a mano:

1. En Supabase, **Authentication → Users → Add user**: crea un usuario con
   email + contraseña (marca _Auto Confirm User_).
2. Copia su **UUID** (columna `id`).
3. En **SQL Editor**, registra a ese usuario como profesor:

   ```sql
   insert into public.teachers (id, full_name)
   values ('PEGA-AQUI-EL-UUID', 'Prof. Minerva McGonagall');
   ```

Ya puedes iniciar sesión en `/login` con ese email/contraseña.

> Para añadir más profesores, repite los pasos 1–3 con cada uno.

---

## Estructura

```
app/
  page.tsx              # Tabla pública de puntajes (/)
  historial/page.tsx    # Historial público (/historial)
  login/page.tsx        # Login de profesores
  admin/
    layout.tsx          # Guard: solo profesores
    page.tsx            # Otorgar/restar puntos (botón Guardar)
    equipos/page.tsx    # ABM de equipos
  actions/              # Server Actions (auth, scores, teams)
components/             # UI (tablas, editor, ABM) + shadcn/ui en components/ui
lib/
  supabase/             # clientes server/client/proxy
  auth.ts               # getCurrentTeacher()
  houses.ts             # metadatos de las casas de Hogwarts
  database.types.ts     # tipos del esquema
proxy.ts                # refresco de sesión (antes "middleware")
supabase/migrations/    # SQL del esquema + RLS
```

---

## Deploy en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel.
2. En **Settings → Environment Variables** carga `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (y `SUPABASE_SERVICE_ROLE_KEY` si la usas).
3. Deploy. Vercel detecta Next.js automáticamente.

---

## Notas de diseño

- **Sin tiempo real:** la tabla y el historial se actualizan al recargar (hay un
  botón "↻ Actualizar"). Suficiente para el alcance (~200 alumnos).
- **Atomicidad:** `update_score()` actualiza el puntaje e inserta el registro de
  historial en una sola transacción Postgres, evitando inconsistencias.
- **Seguridad:** aunque las Server Actions validan que el usuario sea profesor,
  la defensa real es **RLS** — la `anon key` solo permite `SELECT`.
