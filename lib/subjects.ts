/**
 * Helpers de materias (cursadas). **Puros**: sin Supabase ni `next/headers`,
 * porque este módulo lo importa un componente cliente
 * ([components/subject-filter.tsx](components/subject-filter.tsx)).
 *
 * La consulta a la base vive aparte, en `lib/subjects-server.ts`.
 */

import type { Subject, SubjectTerm } from "@/lib/database.types";

/** Zona horaria de la facultad. Ya se usa en `components/history-table.tsx`. */
const TIME_ZONE = "America/Argentina/Buenos_Aires";

/** Etiquetas legibles del cuatrimestre, para la UI. */
export const TERM_LABELS: Record<SubjectTerm, string> = {
  primer_cuatrimestre: "1.º cuatrimestre",
  segundo_cuatrimestre: "2.º cuatrimestre",
  anual: "Anual",
};

/** Los tres valores del enum, para validar en las Server Actions y poblar selects. */
export const SUBJECT_TERMS: readonly SubjectTerm[] = [
  "primer_cuatrimestre",
  "segundo_cuatrimestre",
  "anual",
] as const;

/**
 * Orden dentro de un mismo año: primero lo más abarcativo/reciente.
 * Explícito a propósito: no depender del orden alfabético de los literales.
 */
const TERM_ORDER: Record<SubjectTerm, number> = {
  anual: 0,
  segundo_cuatrimestre: 1,
  primer_cuatrimestre: 2,
};

/** ¿El valor es uno de los tres cuatrimestres válidos? */
export function isSubjectTerm(value: unknown): value is SubjectTerm {
  return (
    typeof value === "string" && SUBJECT_TERMS.includes(value as SubjectTerm)
  );
}

/**
 * Año y mes "de acá", no del servidor. En Vercel `new Date()` es UTC, así que
 * el 1 de enero o el 1 de agosto podrían caer en el año/cuatrimestre
 * equivocado si lo leyéramos directo.
 */
function localYearMonth(now: Date): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);

  return { year, month };
}

/** Año de cursado en curso. */
export function currentYear(now: Date = new Date()): number {
  return localYearMonth(now).year;
}

/** Cuatrimestre en curso según el mes: enero–julio → 1.º, agosto–diciembre → 2.º. */
export function currentTerm(now: Date = new Date()): SubjectTerm {
  return localYearMonth(now).month <= 7
    ? "primer_cuatrimestre"
    : "segundo_cuatrimestre";
}

/** "Ingeniería y Calidad de Software · 2026 · 1.º cuatrimestre" */
export function subjectLabel(subject: Subject): string {
  return `${subject.name} · ${subject.year} · ${TERM_LABELS[subject.term]}`;
}

/** Orden canónico: año descendente, luego cuatrimestre, luego nombre. */
export function compareSubjects(a: Subject, b: Subject): number {
  if (a.year !== b.year) return b.year - a.year;
  if (a.term !== b.term) return TERM_ORDER[a.term] - TERM_ORDER[b.term];
  return a.name.localeCompare(b.name, "es");
}

/** Copia ordenada canónicamente (no muta el array recibido). */
export function sortSubjects(subjects: Subject[]): Subject[] {
  return [...subjects].sort(compareSubjects);
}

/**
 * Resuelve qué materia mostrar a partir del `?materia=` de la URL.
 *
 * Precedencia:
 *  1. El id pedido en la URL, si existe. Un id inválido o de una materia ya
 *     borrada NO rompe: cae al default (un link viejo debe seguir mostrando algo).
 *  2. Año actual + cuatrimestre en curso (el caso normal).
 *  3. Año actual + `anual` (una anual cuenta para el año en curso, pero pierde
 *     contra el cuatrimestre exacto).
 *  4. Cualquiera del año actual, en orden canónico.
 *  5. La más reciente que exista.
 *  6. `null` si no hay ninguna materia cargada.
 */
export function resolveSelectedSubject(
  subjects: Subject[],
  requestedId?: string,
): Subject | null {
  if (subjects.length === 0) return null;

  const ordered = sortSubjects(subjects);

  if (requestedId) {
    const requested = ordered.find((s) => s.id === requestedId);
    if (requested) return requested;
  }

  const year = currentYear();
  const term = currentTerm();

  return (
    ordered.find((s) => s.year === year && s.term === term) ??
    ordered.find((s) => s.year === year && s.term === "anual") ??
    ordered.find((s) => s.year === year) ??
    ordered[0]
  );
}

/**
 * Agrega `?materia=` a una ruta interna, conservando el filtro al navegar.
 * Sin materia seleccionada devuelve la ruta tal cual.
 */
export function withSubjectParam(
  path: string,
  subject: Subject | null,
): string {
  return subject ? `${path}?materia=${subject.id}` : path;
}
