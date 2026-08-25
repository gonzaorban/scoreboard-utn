/**
 * Lectura de materias desde el servidor.
 *
 * Vive separado de [lib/subjects.ts](lib/subjects.ts) a propósito: aquel se
 * importa desde un componente cliente, y si la consulta a Supabase estuviera
 * ahí el bundle del navegador arrastraría `next/headers`.
 *
 * Solo debe importarse desde Server Components / Server Actions.
 */

import { createClient } from "@/lib/supabase/server";
import { resolveSelectedSubject, sortSubjects } from "@/lib/subjects";
import type { Subject } from "@/lib/database.types";

/**
 * Trae todas las materias (lectura pública, tabla chica) y resuelve cuál
 * mostrar según el `?materia=` de la URL. Ver `resolveSelectedSubject` para
 * la precedencia del default.
 */
export async function getSubjectsAndSelection(
  requestedId?: string,
): Promise<{ subjects: Subject[]; selected: Subject | null }> {
  const supabase = await createClient();
  const { data } = await supabase.from("subjects").select("*");

  const subjects = sortSubjects(data ?? []);

  return { subjects, selected: resolveSelectedSubject(subjects, requestedId) };
}
