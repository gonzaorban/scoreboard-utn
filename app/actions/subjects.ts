"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacher } from "@/lib/auth";
import { isSubjectTerm } from "@/lib/subjects";
import type { SubjectTerm } from "@/lib/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Códigos de error de Postgres que sabemos traducir a un mensaje útil. */
const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

const DUPLICATE_MESSAGE =
  "Ya existe una materia con ese nombre, año y cuatrimestre.";

/** Revalida todo lo que depende de las materias (filtros y textos incluidos). */
function revalidateSubjects() {
  revalidatePath("/");
  revalidatePath("/historial");
  revalidatePath("/admin");
  revalidatePath("/admin/equipos");
  revalidatePath("/admin/materias");
}

/**
 * Valida los campos comunes del formulario de materia. Devuelve el error para
 * que el llamador lo propague como `ActionResult`, o los datos ya limpios.
 */
function parseSubjectForm(
  formData: FormData,
):
  | { ok: true; name: string; year: number; term: SubjectTerm }
  | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const year = Number(formData.get("year"));
  const term = formData.get("term");

  if (!name) return { ok: false, error: "El nombre de la materia es obligatorio." };
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { ok: false, error: "El año debe ser un número entre 2000 y 2100." };
  }
  // Nunca pasamos el valor crudo a la base: el enum solo acepta tres literales.
  if (!isSubjectTerm(term)) {
    return { ok: false, error: "El cuatrimestre indicado no es válido." };
  }

  return { ok: true, name, year, term };
}

/** Crea una materia (ABM). Solo profesores. */
export async function createSubject(formData: FormData): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const parsed = parseSubjectForm(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").insert({
    name: parsed.name,
    year: parsed.year,
    term: parsed.term,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.code === UNIQUE_VIOLATION
          ? DUPLICATE_MESSAGE
          : "No se pudo crear la materia.",
    };
  }

  revalidateSubjects();
  return { ok: true };
}

/** Modifica nombre, año y cuatrimestre de una materia (ABM). Solo profesores. */
export async function updateSubject(
  subjectId: string,
  formData: FormData,
): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const parsed = parseSubjectForm(formData);
  if (!parsed.ok) return parsed;

  const supabase = await createClient();
  const { error } = await supabase
    .from("subjects")
    .update({ name: parsed.name, year: parsed.year, term: parsed.term })
    .eq("id", subjectId);

  if (error) {
    return {
      ok: false,
      error:
        error.code === UNIQUE_VIOLATION
          ? DUPLICATE_MESSAGE
          : "No se pudo actualizar la materia.",
    };
  }

  revalidateSubjects();
  return { ok: true };
}

/**
 * Elimina una materia (ABM). Solo profesores.
 *
 * La FK `teams.subject_id` es ON DELETE RESTRICT: si la materia tiene equipos,
 * Postgres rechaza el borrado (23503) y lo traducimos a un mensaje entendible.
 * Es a propósito: un cascade se llevaría también todo el historial de puntos.
 */
export async function deleteSubject(subjectId: string): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);

  if (error) {
    return {
      ok: false,
      error:
        error.code === FOREIGN_KEY_VIOLATION
          ? "No se puede eliminar: la materia tiene equipos. Eliminá o reasigná sus equipos primero."
          : "No se pudo eliminar la materia.",
    };
  }

  revalidateSubjects();
  return { ok: true };
}
