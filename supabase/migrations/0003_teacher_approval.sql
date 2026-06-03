-- ============================================================================
-- 0003 · Auto-registro de profesores + aprobación (pendiente/aprobado)
-- ============================================================================
-- Antes: la mera existencia de una fila en `teachers` daba acceso de escritura.
-- Ahora: un profesor puede auto-registrarse (queda 'pending') y solo obtiene
-- permisos cuando un profesor ya aprobado lo aprueba (pasa a 'approved').
-- `is_teacher()` se endurece para exigir 'approved', de modo que TODAS las
-- políticas de escritura existentes (teams, score_changes) y update_score()
-- siguen funcionando y los pendientes no obtienen nada.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) Columna de estado
-- ---------------------------------------------------------------------------
alter table public.teachers
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved'));

-- Backfill: los profesores que YA existían quedan aprobados para no romper su
-- acceso. Se ejecuta UNA sola vez (no hay pendientes legítimos al aplicarla);
-- las filas nuevas nacen 'pending' por el default de arriba.
update public.teachers set status = 'approved';

create index if not exists teachers_status_idx on public.teachers (status);

-- ---------------------------------------------------------------------------
-- 2) Endurecer is_teacher(): solo cuenta como profesor el APROBADO
-- ---------------------------------------------------------------------------
-- security definer => no reevalúa las políticas RLS de `teachers` dentro de la
-- función, por lo que las políticas/RPCs que la invocan no entran en recursión.
create or replace function public.is_teacher()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.teachers t
    where t.id = auth.uid() and t.status = 'approved'
  );
$$;

-- ---------------------------------------------------------------------------
-- 3) RLS de teachers
-- ---------------------------------------------------------------------------
-- SELECT: ya es público (teachers_select_public, definido en 0001). Sirve para
-- mostrar nombres en el historial y para que los profesores aprobados vean la
-- lista de pendientes. No hace falta política nueva de select.
--
-- INSERT acotado: un usuario autenticado solo puede insertar SU PROPIA fila
-- (id = auth.uid()) y SOLO con status='pending'. Es el único camino de
-- escritura desde el cliente; aprobar/rechazar/dar de baja van por las RPCs
-- security definer de más abajo. Así un pendiente no puede nacer 'approved'.
drop policy if exists "teachers_insert_self_pending" on public.teachers;
create policy "teachers_insert_self_pending"
  on public.teachers for insert
  to authenticated
  with check (
    id = auth.uid()
    and status = 'pending'
  );

-- NO se crean políticas UPDATE ni DELETE para `teachers`: ningún cliente puede
-- cambiar el status ni borrar filas directamente. La única vía de escritura
-- administrativa son las RPCs definer (que validan is_teacher() internamente).

-- ---------------------------------------------------------------------------
-- 4) Audit log: permitir baja de profesores con historial
-- ---------------------------------------------------------------------------
-- score_changes.changed_by referenciaba teachers(id) sin ON DELETE (NO ACTION),
-- así que borrar un profesor con historial fallaría por la FK. Pasamos a
-- ON DELETE SET NULL y la hacemos nullable: el snapshot `changed_by_name`
-- conserva quién hizo el cambio aunque ya no exista la fila del profesor.
alter table public.score_changes
  alter column changed_by drop not null;

alter table public.score_changes
  drop constraint score_changes_changed_by_fkey,
  add constraint score_changes_changed_by_fkey
    foreign key (changed_by) references public.teachers (id) on delete set null;

-- ---------------------------------------------------------------------------
-- 5) RPCs administrativas (security definer + guard is_teacher())
-- ---------------------------------------------------------------------------

-- Aprobar una solicitud pendiente. Solo un profesor aprobado puede llamarla.
create or replace function public.approve_teacher(p_teacher_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    raise exception 'No autorizado: solo los profesores pueden aprobar solicitudes.';
  end if;

  update public.teachers
  set status = 'approved'
  where id = p_teacher_id and status = 'pending';

  if not found then
    raise exception 'La solicitud no existe o ya fue procesada.';
  end if;
end;
$$;

-- Rechazar una solicitud pendiente: borra la fila de teachers (NO borra el
-- auth.user; el usuario podría volver a solicitar). Solo profesor aprobado.
create or replace function public.reject_teacher(p_teacher_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    raise exception 'No autorizado: solo los profesores pueden rechazar solicitudes.';
  end if;

  delete from public.teachers
  where id = p_teacher_id and status = 'pending';

  if not found then
    raise exception 'La solicitud no existe o ya fue procesada.';
  end if;
end;
$$;

-- Dar de baja a un profesor aprobado (revoca su acceso). Solo profesor aprobado.
-- Evita que un profesor se dé de baja a sí mismo (no quedarse sin admins por
-- error). El historial conserva el snapshot del nombre (changed_by_name).
create or replace function public.remove_teacher(p_teacher_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_teacher() then
    raise exception 'No autorizado: solo los profesores pueden dar de baja.';
  end if;

  if p_teacher_id = auth.uid() then
    raise exception 'No puedes darte de baja a ti mismo.';
  end if;

  delete from public.teachers
  where id = p_teacher_id and status = 'approved';

  if not found then
    raise exception 'El profesor no existe o ya fue dado de baja.';
  end if;
end;
$$;

-- Permisos: revocar de public, conceder a authenticated (como update_score).
revoke all on function public.approve_teacher(uuid) from public;
revoke all on function public.reject_teacher(uuid) from public;
revoke all on function public.remove_teacher(uuid) from public;
grant execute on function public.approve_teacher(uuid) to authenticated;
grant execute on function public.reject_teacher(uuid) to authenticated;
grant execute on function public.remove_teacher(uuid) to authenticated;
