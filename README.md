# 🪄 Copa de las Casas · Marcador por equipos

> Marcador online de puntos por equipos para **varias materias**, ambientado en
> la **Copa de las Casas de Hogwarts** (Harry Potter).

Una aplicación web sencilla donde el profesorado otorga o resta puntos a los
equipos ("casas") y cualquier estudiante puede consultar, sin registrarse, la
tabla de posiciones y el historial completo de cambios.

Cada **materia** es una cursada `(nombre, año, cuatrimestre)` y cada equipo
pertenece a una de ellas. Un selector permite cambiar de materia; el marcador,
el historial y el panel de profesores se filtran por la cursada elegida.

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
- **Gestionar materias**: alta, baja y modificación de cursadas (nombre, año y
  cuatrimestre). Una materia con equipos no se puede eliminar.
- **Gestionar equipos**: crear, renombrar, reasignar de materia o eliminar.
- **Gestionar profesores**: en la sección **Profesores**, aprobar o rechazar las
  solicitudes de quienes se registran, y dar de baja a profesores con acceso.

Cualquiera puede **solicitar acceso** desde `/registro`, pero la solicitud queda
**pendiente**: hasta que un profesor ya aprobado la apruebe, ese usuario solo ve
el sitio público (no puede tocar puntos ni equipos). Así nadie ajeno altera el
marcador sin el visto bueno del profesorado.

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
- El **auto-registro** de profesores funciona con la clave pública + RLS: un
  usuario solo puede crear su **propia** solicitud en estado `pending` y nunca
  auto-aprobarse (no hay política de escritura del estado; aprobar/rechazar/dar
  de baja pasan por funciones `security definer` que exigen ser profesor
  aprobado). Por eso `SUPABASE_SERVICE_ROLE_KEY` **ya no es necesaria** para el
  alta de profesores.

### Cómo correrlo en local

1. **Crea un proyecto Supabase** (gratis) en <https://supabase.com>.
2. **Aplica el esquema**: en el **SQL Editor** del panel de Supabase, ejecuta en
   orden el contenido de las migraciones de
   [`supabase/migrations/`](supabase/migrations/):
   [`0001_init.sql`](supabase/migrations/0001_init.sql) (tablas, RLS, `is_teacher()`,
   `update_score()`), [`0002_drop_house.sql`](supabase/migrations/0002_drop_house.sql)
   [`0003_teacher_approval.sql`](supabase/migrations/0003_teacher_approval.sql)
   (auto-registro + aprobación: columna `status` en `teachers` y funciones
   `approve_teacher()` / `reject_teacher()` / `remove_teacher()`) y
   [`0004_subjects.sql`](supabase/migrations/0004_subjects.sql) (materias:
   tabla `subjects`, enum `subject_term`, `teams.subject_id` y snapshot de
   materia en el historial).

3. **Desactiva la confirmación de email**: en **Authentication → Providers →
   Email**, apaga _Confirm email_ (auto-confirm). El auto-registro necesita que
   el `signUp` deje la sesión activa de inmediato; con la confirmación activada,
   el registro no abriría sesión y el flujo de "pendiente" fallaría.
4. **Variables de entorno**: copia `.env.local.example` a `.env.local` y completa
   con los valores de tu proyecto (Settings → API):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<tu-project-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-clave-publishable-o-anon>
   # SUPABASE_SERVICE_ROLE_KEY=<opcional; no se usa para el alta de profesores>
   ```

5. **Instala y arranca**:

   ```bash
   npm install
   npm run dev
   ```

   Abre <http://localhost:3000>.

### Crear el primer profesor (bootstrap)

El **primer** profesor debe crearse a mano, porque hace falta alguien aprobado
para poder aprobar a los demás. A partir de ahí, el resto se **auto-registra**.

1. En Supabase, **Authentication → Users → Add user**: email + contraseña, marca
   _Auto Confirm User_.
2. Copia el **UUID** del usuario (columna `id`).
3. En el **SQL Editor**, regístralo como profesor **ya aprobado**:

   ```sql
   insert into public.teachers (id, full_name, status)
   values ('PEGA-AQUI-EL-UUID', 'Prof. Minerva McGonagall', 'approved');
   ```

Listo: ya puede iniciar sesión en `/login` y entrar al panel.

### Registrar a los demás profesores (desde la web)

1. Cada nuevo profesor se registra en `/registro` (nombre, email, contraseña).
   Su solicitud queda **pendiente** y se le muestra una pantalla de espera.
2. Un profesor ya aprobado entra a **Profesores** (`/admin/profesores`), ve la
   solicitud y la **aprueba** (o la **rechaza**). También puede **dar de baja** a
   profesores que ya no deban tener acceso (no puede darse de baja a sí mismo).
3. Una vez aprobado, el nuevo profesor inicia sesión y obtiene acceso completo.

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
  registro/page.tsx     # Auto-registro de profesores (solicitud pendiente)
  pendiente/page.tsx    # Pantalla de espera para solicitudes sin aprobar
  admin/
    layout.tsx          # Guard: solo profesores aprobados
    page.tsx            # Otorgar/restar puntos (botón Guardar)
    equipos/page.tsx    # ABM de equipos
    materias/page.tsx   # ABM de materias (cursadas)
    profesores/page.tsx # Aprobar/rechazar/dar de baja profesores
  actions/              # Server Actions (auth, scores, teams, subjects, teachers-admin)
components/             # UI (tablas, editor, ABM) + shadcn/ui en components/ui
lib/
  supabase/             # clientes server/client/proxy
  auth.ts               # getCurrentTeacher() + getCurrentUserStatus()
  subjects.ts           # helpers puros de materias (default, orden, etiquetas)
  subjects-server.ts    # lectura de materias + materia seleccionada
  database.types.ts     # tipos del esquema
proxy.ts                # refresco de sesión (reemplaza al "middleware")
supabase/migrations/    # SQL del esquema + RLS (0001 → 0004)
```

### Notas de diseño

- **Sin tiempo real:** la tabla y el historial se actualizan al recargar (botón
  “↻ Actualizar”). Suficiente para el alcance (~200 alumnos).
- **Atomicidad:** `update_score()` actualiza el puntaje e inserta el registro de
  historial en una sola transacción de PostgreSQL, evitando inconsistencias.
- **Sesión:** `proxy.ts` refresca el token de Supabase en cada request mediante
  `getClaims()` (compatible con el formato de claves `sb_publishable_*`).
