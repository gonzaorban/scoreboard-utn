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
import { readSubjectCookie } from "@/lib/subject-cookie";
import type { Subject } from "@/lib/database.types";

/**
 * Trae todas las materias (lectura pública, tabla chica) y resuelve cuál
 * mostrar.
 *
 * Precedencia: `?materia=` de la URL > materia recordada en la cookie >
 * default por año y cuatrimestre (ver `resolveSelectedSubject`).
 *
 * El link explícito manda siempre: si un profesor comparte la URL de otra
 * cursada, hay que ver ESA aunque haya otra recordada. Pero un `?materia=` que
 * ya no existe (materia borrada, link viejo) no debe pisar la preferencia del
 * alumno, así que lo validamos antes de quedarnos con él.
 */
export async function getSubjectsAndSelection(
  requestedId?: string,
): Promise<{ subjects: Subject[]; selected: Subject | null }> {
  const supabase = await createClient();
  const { data } = await supabase.from("subjects").select("*");

  const subjects = sortSubjects(data ?? []);

  const urlId = subjects.some((s) => s.id === requestedId)
    ? requestedId
    : undefined;
  // La cookie solo se consulta si la URL no trajo una materia válida.
  const preferredId = urlId ?? (await readSubjectCookie());

  // Un id de cookie inválido (materia borrada) no rompe: `resolveSelectedSubject`
  // cae al default de año/cuatrimestre igual que con un `?materia=` inválido.
  return { subjects, selected: resolveSelectedSubject(subjects, preferredId) };
}
