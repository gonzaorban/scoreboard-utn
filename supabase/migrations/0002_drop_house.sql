-- ============================================================================
-- 0002 · Eliminar la columna `house` de `teams`
-- ============================================================================
-- La temática de "casas" (Hogwarts) se quitó de la UI y del código del ABM.
-- La columna ya no se lee ni se escribe, así que la eliminamos para alinear
-- el esquema con el código. Operación destructiva: se pierden los valores de
-- `house` de los equipos existentes (que ya no se mostraban).
-- ============================================================================

alter table public.teams
  drop column if exists house;
