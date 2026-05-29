"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacher } from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Crea un equipo nuevo (ABM). Solo profesores. */
export async function createTeam(formData: FormData): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const points = Number(formData.get("points") ?? 0);

  if (!name) return { ok: false, error: "El nombre del equipo es obligatorio." };
  if (!Number.isInteger(points)) {
    return { ok: false, error: "Los puntos iniciales deben ser un entero." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .insert({ name, points });

  if (error) return { ok: false, error: "No se pudo crear el equipo." };

  revalidatePath("/");
  revalidatePath("/admin/equipos");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Modifica nombre de un equipo (ABM). No toca los puntos: para eso
 * está `updateScore` (que registra historial). Solo profesores.
 */
export async function updateTeam(
  teamId: string,
  formData: FormData,
): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const name = String(formData.get("name") ?? "").trim();

  if (!name) return { ok: false, error: "El nombre del equipo es obligatorio." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("teams")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", teamId);

  if (error) return { ok: false, error: "No se pudo actualizar el equipo." };

  revalidatePath("/");
  revalidatePath("/admin/equipos");
  revalidatePath("/admin");
  return { ok: true };
}

/** Elimina un equipo (ABM). Su historial se borra en cascada. Solo profesores. */
export async function deleteTeam(teamId: string): Promise<ActionResult> {
  const teacher = await getCurrentTeacher();
  if (!teacher) return { ok: false, error: "No autorizado." };

  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) return { ok: false, error: "No se pudo eliminar el equipo." };

  revalidatePath("/");
  revalidatePath("/historial");
  revalidatePath("/admin/equipos");
  revalidatePath("/admin");
  return { ok: true };
}
