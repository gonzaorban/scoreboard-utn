# 🪄 Copa de las Casas · Ingeniería y Calidad

> Marcador online de puntos por equipos para la materia **Ingeniería y
> Calidad**, ambientado en la **Copa de las Casas de Hogwarts** (Harry Potter).

Una aplicación web sencilla donde el profesorado otorga o resta puntos a los
equipos ("casas") y cualquier estudiante puede consultar, sin registrarse, la
tabla de posiciones y el historial completo de cambios.

---

## 🧑‍🎓 ¿Qué es esto? (para estudiantes y visitantes)

Es el **tablero de puntos del torneo de la materia**. A lo largo de la cursada,
los equipos suman (o pierden) puntos según su desempeño, igual que las casas de
Hogwarts compiten por la Copa.

**Como estudiante o visitante puedes, sin crear ninguna cuenta:**

- 🏆 **Ver el marcador** — la tabla con cada equipo, su casa y sus puntos,
  ordenada de mayor a menor. (Página principal.)
- 📜 **Ver el historial** — el "Gran Libro" con cada cambio de puntos: qué
  equipo, de cuántos puntos a cuántos, qué profesor lo hizo, cuándo y por qué.
  (Sección **Historial**.)

No necesitas instalar nada: se abre desde cualquier navegador. La información es
de **solo lectura** para los estudiantes; únicamente el profesorado puede
modificar puntos.

> ¿No ves los últimos cambios? Usa el botón **“↻ Actualizar”** para recargar el
> marcador.

---

## 👩‍🏫 ¿Qué pueden hacer los profesores?

El profesorado inicia sesión con su email y contraseña y obtiene acceso a:

- **Otorgar / restar puntos** a cada equipo, con un motivo opcional. Cada cambio
  queda firmado automáticamente con su nombre y la fecha/hora en el historial.
- **Gestionar equipos**: crear, renombrar, asignar casa o eliminar.

El acceso de profesores es privado y se gestiona manualmente (no hay registro
abierto), de modo que nadie ajeno pueda alterar el marcador.

---

## ⚙️ Información técnica (para desarrolladores)

### Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions) + TypeScript
- [Supabase](https://supabase.com) (PostgreSQL + Auth + Row Level Security)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- Desplegado en [Vercel](https://vercel.com)

Sin ORM: las consultas usan el query builder de `supabase-js` y el tipado sale
de [`lib/database.types.ts`](lib/database.types.ts).

### 🔒 Seguridad (importante: este repositorio es público)

- **Este repo no contiene credenciales.** Las claves y la URL del proyecto viven
  solo en variables de entorno (en local: `.env.local`, ignorado por git; en
  producción: panel de Vercel). El archivo versionado es únicamente la plantilla
  [`.env.local.example`](.env.local.example), sin valores reales.
- **La defensa real es Row Level Security (RLS)** en la base de datos: la clave
  pública que llega al navegador solo permite **leer** equipos, historial y
  nombres de profesores. Crear o modificar puntos/equipos exige una sesión de
  profesor verificada. Por eso es seguro que el marcador sea público.
- **Nunca** publiques ni subas la clave secreta (`service_role` / `sb_secret_*`).
  Si alguna credencial se expusiera, **rótala** desde el panel de Supabase
  (Settings → API) y vuelve a desplegar.

### Cómo correrlo en local

1. **Crea un proyecto Supabase** (gratis) en <https://supabase.com>.
2. **Aplica el esquema**: en el **SQL Editor** del panel de Supabase, ejecuta el
   contenido de
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   Crea las tablas (`teachers`, `teams`, `score_changes`), las políticas RLS y
   las funciones `is_teacher()` y `update_score()`.
3. **Variables de entorno**: copia `.env.local.example` a `.env.local` y completa
   con los valores de tu proyecto (Settings → API):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<tu-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-clave-publishable-o-anon>
   # SUPABASE_SERVICE_ROLE_KEY=<solo si automatizas el alta de profesores>
   ```

4. **Instala y arranca**:

   ```bash
   npm install
   npm run dev
   ```

   Abre <http://localhost:3000>.

### Crear el primer profesor

No hay registro público de profesores (es intencional). Se da de alta a mano:

1. En Supabase, **Authentication → Users → Add user**: email + contraseña, marca
   _Auto Confirm User_.
2. Copia el **UUID** del usuario (columna `id`).
3. En el **SQL Editor**, regístralo como profesor:

   ```sql
   insert into public.teachers (id, full_name)
   values ('PEGA-AQUI-EL-UUID', 'Prof. Minerva McGonagall');
   ```

Listo: ya puede iniciar sesión en `/login`. Repite estos pasos por cada profesor.

### Desplegar en Vercel

1. Importa el repositorio de GitHub en Vercel (detecta Next.js solo).
2. En **Settings → Environment Variables** carga `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (y `SUPABASE_SERVICE_ROLE_KEY` si la usas).
   Asígnalas a los entornos **Production** y **Preview**.
3. Despliega. Cada `push` a `main` redesplegará automáticamente.

> **Nota:** las variables de entorno solo se aplican a deploys hechos **después**
> de agregarlas. Si las agregaste tras el primer deploy, haz un **Redeploy**.

### Estructura del proyecto

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
  database.types.ts     # tipos del esquema
proxy.ts                # refresco de sesión (reemplaza al "middleware")
supabase/migrations/    # SQL del esquema + RLS
```

### Notas de diseño

- **Sin tiempo real:** la tabla y el historial se actualizan al recargar (botón
  “↻ Actualizar”). Suficiente para el alcance (~200 alumnos).
- **Atomicidad:** `update_score()` actualiza el puntaje e inserta el registro de
  historial en una sola transacción de PostgreSQL, evitando inconsistencias.
- **Sesión:** `proxy.ts` refresca el token de Supabase en cada request mediante
  `getClaims()` (compatible con el formato de claves `sb_publishable_*`).
