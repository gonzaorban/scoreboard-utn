-- ============================================================================
-- Copa de las Casas · Integrantes por equipo
-- ============================================================================
-- Agrega `members` a `teams`: lista de integrantes, visible al pasar el mouse
-- sobre el equipo en el marcador. Editable solo por profesores (misma RLS que
-- el resto de la tabla `teams`, ver 0001_init.sql).
-- ============================================================================

alter table public.teams
  add column if not exists members text[] not null default '{}'::text[];
