  -- ============================================================================
-- Copa de las Casas · Ingeniería y Calidad — Esquema inicial
-- ============================================================================
-- Tablas: teachers (profesores), teams (equipos/casas), score_changes (historial).
-- Seguridad: RLS. Lectura pública (invitados); escritura solo para profesores.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------

-- Perfil de profesor, 1:1 con auth.users. La existencia de la fila marca que
-- ese usuario autenticado es profesor (y por tanto puede editar).
create table if not exists public.teachers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- Equipos. El ABM opera sobre esta tabla. `house` es la casa de Hogwarts
-- asociada (gryffindor | slytherin | ravenclaw | hufflepuff) para temática/colores.
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  house text check (
    house in ('gryffindor', 'slytherin', 'ravenclaw', 'hufflepuff')
  ),
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Historial inmutable de cambios de puntaje (audit log). Guarda snapshots del
-- nombre de equipo y profesor por si luego se renombran o eliminan.
create table if not exists public.score_changes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  team_name text not null,
  old_points integer not null,
  new_points integer not null,
  reason text,
  changed_by uuid not null references public.teachers (id),
  changed_by_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists score_changes_created_at_idx
  on public.score_changes (created_at desc);
create index if not exists score_changes_team_id_idx
  on public.score_changes (team_id);

-- ---------------------------------------------------------------------------
-- Helper: ¿el usuario actual es profesor?
-- ---------------------------------------------------------------------------
create or replace function public.is_teacher()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.teachers t where t.id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.teachers enable row level security;
alter table public.teams enable row level security;
alter table public.score_changes enable row level security;

-- teachers: lectura pública (para mostrar nombres en el historial).
-- Sin escritura desde el cliente: el alta se hace server-side con service_role.
drop policy if exists "teachers_select_public" on public.teachers;
create policy "teachers_select_public"
  on public.teachers for select
  to anon, authenticated
  using (true);

-- teams: lectura pública; escritura solo para profesores.
drop policy if exists "teams_select_public" on public.teams;
create policy "teams_select_public"
  on public.teams for select
  to anon, authenticated
  using (true);

drop policy if exists "teams_insert_teacher" on public.teams;
create policy "teams_insert_teacher"
  on public.teams for insert
  to authenticated
  with check (public.is_teacher());

drop policy if exists "teams_update_teacher" on public.teams;
create policy "teams_update_teacher"
  on public.teams for update
  to authenticated
  using (public.is_teacher())
  with check (public.is_teacher());

drop policy if exists "teams_delete_teacher" on public.teams;
create policy "teams_delete_teacher"
  on public.teams for delete
  to authenticated
  using (public.is_teacher());

-- score_changes: lectura pública; inserción solo profesores; sin update/delete
-- (historial inmutable).
drop policy if exists "score_changes_select_public" on public.score_changes;
create policy "score_changes_select_public"
  on public.score_changes for select
  to anon, authenticated
  using (true);

drop policy if exists "score_changes_insert_teacher" on public.score_changes;
create policy "score_changes_insert_teacher"
  on public.score_changes for insert
  to authenticated
  with check (public.is_teacher());

-- ---------------------------------------------------------------------------
-- RPC atómica: actualizar puntaje + registrar en historial en una transacción
-- ---------------------------------------------------------------------------
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
begin
  if not public.is_teacher() then
    raise exception 'No autorizado: solo los profesores pueden modificar puntajes.';
  end if;

  select points, name into v_old, v_team_name
  from public.teams
  where id = p_team_id
  for update;

  if not found then
    raise exception 'El equipo indicado no existe.';
  end if;

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
    changed_by, changed_by_name
  ) values (
    p_team_id, v_team_name, v_old, p_new_points, nullif(trim(p_reason), ''),
    auth.uid(), v_teacher_name
  );
end;
$$;

revoke all on function public.update_score(uuid, integer, text) from public;
grant execute on function public.update_score(uuid, integer, text) to authenticated;
