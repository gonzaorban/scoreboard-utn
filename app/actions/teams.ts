"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacher } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Códigos de error de Postgres que sabemos traducir a un mensaje útil. */
const UNIQUE_VIOLATION = "23505";

const DUPLICATE_MESSAGE =
  "Ya existe un equipo con ese nombre en la materia seleccionada.";

/** Convierte el textarea de integrantes (uno por línea) en un array limpio. */
function parseMembers(formData: FormData): string[] {
  const raw = String(formData.get("members") ?? "");
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Revalida todo lo que muestra equipos. */
function revalidateTeams() {
  revalidatePath("/");
  revalidatePath("/historial");
  revalidatePath("/admin");
  revalidatePath("/admin/equipos");
  revalidatePath("/admin/materias");
}

/** Crea un equipo nuevo (ABM). Solo profesores. */
export async function createTeam(formData: FormData): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const points = Number(formData.get("points") ?? 0);
  const subjectId = String(formData.get("subject_id") ?? "").trim();

  if (!name) return { ok: false, error: "El nombre del equipo es obligatorio." };
  if (!Number.isInteger(points)) {
    return { ok: false, error: "Los puntos iniciales deben ser un entero." };
  }
  if (!subjectId) {
    return { ok: false, error: "Tenés que elegir una materia para el equipo." };
  }

  const members = parseMembers(formData);

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .insert({ name, points, subject_id: subjectId, members });

  if (error) {
    return {
      ok: false,
      error:
        error.code === UNIQUE_VIOLATION
          ? DUPLICATE_MESSAGE
          : "No se pudo crear el equipo.",
    };
  }

  revalidateTeams();
  return { ok: true };
}

/**
 * Modifica nombre y materia de un equipo (ABM). No toca los puntos: para eso
 * está `updateScore` (que registra historial). Solo profesores.
 *
 * Reasignar la materia mueve al equipo de cursada a futuro, pero NO reescribe
 * su historial: `score_changes` guarda un snapshot de la materia en la que
 * cada movimiento ocurrió realmente (ver migración 0004).
 */
export async function updateTeam(
  teamId: string,
  formData: FormData,
): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const subjectId = String(formData.get("subject_id") ?? "").trim();

  if (!name) return { ok: false, error: "El nombre del equipo es obligatorio." };
  if (!subjectId) {
    return { ok: false, error: "Tenés que elegir una materia para el equipo." };
  }

  const members = parseMembers(formData);

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .update({
      name,
      subject_id: subjectId,
      members,
      updated_at: new Date().toISOString(),
    })
    .eq("id", teamId);

  if (error) {
    return {
      ok: false,
      error:
        error.code === UNIQUE_VIOLATION
          ? DUPLICATE_MESSAGE
          : "No se pudo actualizar el equipo.",
    };
  }

  revalidateTeams();
  return { ok: true };
}

/** Elimina un equipo (ABM). Su historial se borra en cascada. Solo profesores. */
export async function deleteTeam(teamId: string): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) return { ok: false, error: "No se pudo eliminar el equipo." };

  revalidateTeams();
  return { ok: true };
}
