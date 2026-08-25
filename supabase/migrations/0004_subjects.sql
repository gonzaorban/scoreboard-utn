-- ============================================================================
-- 0004 · Materias (cursadas) + relación equipo → materia + filtro de historial
-- ============================================================================
-- Antes: el marcador servía a UNA sola materia; `teams` era una lista global
-- plana, sin dimensión de materia ni de año, y el nombre de la materia estaba
-- hardcodeado en la UI.
--
-- Ahora: una "materia" es una CURSADA única, identificada por la terna
-- (nombre, año, cuatrimestre). Cada equipo pertenece a exactamente una materia
-- y su año se DERIVA de ella (no hay columna `year` en `teams`, para no
-- duplicar el dato ni permitir que se contradigan).
--
-- El historial guarda un SNAPSHOT de la materia (id + nombre), igual que ya
-- hace con `team_name` y `changed_by_name`: si un equipo se reasigna a otra
-- cursada, sus movimientos pasados siguen perteneciendo a la cursada en la que
-- realmente ocurrieron. Un join por `teams.subject_id` los teletransportaría.
--
-- ORDEN CRÍTICO: la columna `teams.subject_id` se crea NULLABLE, se backfillea
-- y recién entonces se le pone NOT NULL. Invertir esos pasos aborta la
-- migración en cualquier base que ya tenga equipos.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Enum del cuatrimestre
-- ---------------------------------------------------------------------------
-- Enum real de Postgres (no un `check`): queda reflejado en
-- Database["public"]["Enums"] al regenerar los tipos. No existe
-- `create type if not exists`, de ahí la guarda: la migración debe poder
-- re-correrse, como las 0001–0003.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'subject_term') then
    create type public.subject_term as enum (
      'primer_cuatrimestre',
      'segundo_cuatrimestre',
      'anual'
    );
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 2) Tabla subjects
-- ---------------------------------------------------------------------------
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year integer not null,
  term public.subject_term not null,
  created_at timestamptz not null default now(),
  constraint subjects_name_not_blank check (btrim(name) <> ''),
  constraint subjects_year_range check (year between 2000 and 2100),
  constraint subjects_name_year_term_key unique (name, year, term)
);

-- Orden natural de listados y del fallback "materia más reciente".
create index if not exists subjects_year_term_idx
  on public.subjects (year desc, term, name);

-- ---------------------------------------------------------------------------
-- 3) RLS de subjects
-- ---------------------------------------------------------------------------
-- OJO: habilitar RLS sin políticas = denegar todo. La lectura DEBE ser pública
-- porque el selector de materia aparece en la home y en el historial, que se
-- ven sin login. Si faltara `subjects_select_public`, el filtro se renderiza
-- vacío en silencio para los visitantes (falla difícil de diagnosticar).
alter table public.subjects enable row level security;

drop policy if exists "subjects_select_public" on public.subjects;
create policy "subjects_select_public"
  on public.subjects for select
  to anon, authenticated
  using (true);

drop policy if exists "subjects_insert_teacher" on public.subjects;
create policy "subjects_insert_teacher"
  on public.subjects for insert
  to authenticated
  with check (public.is_teacher());

drop policy if exists "subjects_update_teacher" on public.subjects;
create policy "subjects_update_teacher"
  on public.subjects for update
  to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

drop policy if exists "subjects_delete_teacher" on public.subjects;
create policy "subjects_delete_teacher"
  on public.subjects for delete
  to authenticated
  using (public.is_teacher());

-- ---------------------------------------------------------------------------
-- 4) teams.subject_id — se agrega NULLABLE para poder backfillear
-- ---------------------------------------------------------------------------
alter table public.teams
  add column if not exists subject_id uuid;

-- ---------------------------------------------------------------------------
-- 5) Materia inicial + backfill de los equipos existentes
-- ---------------------------------------------------------------------------
insert into public.subjects (name, year, term)
values ('Ingeniería y Calidad de Software', 2026, 'primer_cuatrimestre')
on conflict (name, year, term) do nothing;

-- Todos los equipos que hoy existen pertenecen a esa cursada.
update public.teams t
set subject_id = s.id
from public.subjects s
where t.subject_id is null
  and s.name = 'Ingeniería y Calidad de Software'
  and s.year = 2026
  and s.term = 'primer_cuatrimestre';

-- Red de seguridad: si quedara algún equipo sin materia, abortamos ANTES del
-- NOT NULL, con un mensaje entendible en vez de un error de constraint.
do $$
declare
  v_orphans integer;
begin
  select count(*) into v_orphans from public.teams where subject_id is null;
  if v_orphans > 0 then
    raise exception
      'Backfill incompleto: % equipo(s) sin subject_id. Asignalos antes de continuar.',
      v_orphans;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 6) Recién ahora: NOT NULL + FK
-- ---------------------------------------------------------------------------
alter table public.teams
  alter column subject_id set not null;

-- ON DELETE RESTRICT (no CASCADE): borrar una materia con equipos debe fallar.
-- Un cascade borraría los equipos y, por la cascade ya existente de
-- score_changes.team_id (ver 0001), también todo su historial: pérdida masiva
-- de datos con un solo clic en el ABM.
alter table public.teams
  drop constraint if exists teams_subject_id_fkey;
alter table public.teams
  add constraint teams_subject_id_fkey
    foreign key (subject_id) references public.subjects (id) on delete restrict;

create index if not exists teams_subject_id_idx on public.teams (subject_id);

-- Dos equipos de la MISMA cursada no pueden llamarse igual; entre cursadas
-- distintas sí (es normal reusar nombres de equipo año a año).
-- Si esta migración falla acá, hay equipos homónimos preexistentes: renombralos
-- o comentá este bloque. Para detectarlos:
--   select name, count(*) from public.teams group by name having count(*) > 1;
alter table public.teams
  drop constraint if exists teams_subject_name_key;
alter table public.teams
  add constraint teams_subject_name_key unique (subject_id, name);

-- ---------------------------------------------------------------------------
-- 7) Snapshot de materia en el historial
-- ---------------------------------------------------------------------------
-- Igual que team_name/changed_by_name: guardamos el nombre para que sobreviva
-- al borrado de la materia, y el id para poder filtrar exacto por URL.
alter table public.score_changes
  add column if not exists subject_id uuid references public.subjects (id) on delete set null;

alter table public.score_changes
  add column if not exists subject_name text;

-- Backfill: la única fuente disponible para las filas históricas es la materia
-- actual del equipo.
update public.score_changes sc
set subject_id = t.subject_id,
    subject_name = s.name
from public.teams t
join public.subjects s on s.id = t.subject_id
where sc.team_id = t.id
  and sc.subject_id is null;

-- Se dejan NULLABLE a propósito: `on delete set null` puede vaciar subject_id
-- si se borra una materia, y el nombre snapshot igual conserva el dato.
create index if not exists score_changes_subject_id_idx
  on public.score_changes (subject_id);
create index if not exists score_changes_subject_created_at_idx
  on public.score_changes (subject_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 8) update_score(): estampar también la materia
-- ---------------------------------------------------------------------------
-- Misma firma, mismo lock `for update`, misma lógica de no-op que en 0001.
-- Lo único nuevo: lee la materia del equipo y la snapshotea en score_changes.
create or replace function public.update_score(
  p_team_id uuid,
  p_new_points integer,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old integer;
  v_team_name text;
  v_teacher_name text;
  v_subject_id uuid;
  v_subject_name text;
begin
  if not public.is_teacher() then
    raise exception 'No autorizado: solo los profesores pueden modificar puntajes.';
  end if;

  select t.points, t.name, t.subject_id
    into v_old, v_team_name, v_subject_id
  from public.teams t
  where t.id = p_team_id
  for update;

  if not found then
    raise exception 'El equipo indicado no existe.';
  end if;

  select s.name into v_subject_name
  from public.subjects s
  where s.id = v_subject_id;

  select full_name into v_teacher_name
  from public.teachers
  where id = auth.uid();

  -- Si no hay cambio real, no registramos historial.
  if v_old = p_new_points then
    return;
  end if;

  update public.teams
  set points = p_new_points,
      updated_at = now()
  where id = p_team_id;

  insert into public.score_changes (
    team_id, team_name, old_points, new_points, reason,
    changed_by, changed_by_name, subject_id, subject_name
  ) values (
    p_team_id, v_team_name, v_old, p_new_points, nullif(trim(p_reason), ''),
    auth.uid(), v_teacher_name, v_subject_id, v_subject_name
  );
end;
$$;

revoke all on function public.update_score(uuid, integer, text) from public;
grant execute on function public.update_score(uuid, integer, text) to authenticated;
